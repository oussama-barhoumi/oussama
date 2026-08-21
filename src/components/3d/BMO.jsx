import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

const MODEL_PATH = '/models/oussama3.glb'

/**
 * Filter and collect component groups from scene.
 * Excludes floor plane (Plane.003_42 / material Piso).
 */
function getBMOComponentGroups(scene) {
  let sceneRoot = scene
  scene.traverse((child) => {
    if (child.name === 'GLTF_SceneRootNode') {
      sceneRoot = child
    }
  })

  const groups = []
  sceneRoot.children.forEach((child) => {
    const nameLower = child.name.toLowerCase()

    let isFloor = nameLower.includes('plane') || nameLower.includes('piso') || nameLower.includes('floor')
    child.traverse((c) => {
      if (c.isMesh && c.material) {
        const matName = (c.material.name || '').toLowerCase()
        if (matName.includes('piso') || matName.includes('floor')) {
          isFloor = true
        }
      }
    })

    if (isFloor) {
      child.visible = false
      return
    }

    groups.push(child)
  })

  return groups
}

/**
 * Disassembled initial 3D scatter offset.
 */
function getScatterOffset(index, total) {
  const goldenRatio = 1.61803398875
  const angle1 = index * goldenRatio * Math.PI * 2
  const angle2 = (index / total) * Math.PI

  const radius = 2.8 + (index % 4) * 0.8

  return {
    position: new THREE.Vector3(
      Math.cos(angle1) * radius * 1.3,
      Math.sin(angle2) * radius * 1.0 + ((index % 3) - 1) * 0.6,
      Math.sin(angle1) * radius * 0.9 + 0.8
    ),
    rotation: new THREE.Euler(
      ((index % 5) - 2) * 0.5,
      ((index % 7) - 3) * 0.6,
      ((index % 4) - 1.5) * 0.5
    ),
  }
}

/**
 * Component assembly categories for staggered timing.
 */
function getComponentCategory(name) {
  const n = name.toLowerCase()
  if (n.includes('cube.005') || n.includes('cube.007') || n.includes('cylinder.026')) return 'core'
  if (n.includes('speaker')) return 'speaker'
  if (n.includes('cube')) return 'body'
  if (n.includes('heart') || n.includes('text') || n.includes('cylinder.024')) return 'detail'
  return 'accent'
}

const CATEGORY_TIMING = {
  core: { start: 0.2, duration: 2.2 },
  speaker: { start: 0.5, duration: 2.0 },
  body: { start: 0.8, duration: 2.0 },
  accent: { start: 1.2, duration: 1.8 },
  detail: { start: 1.8, duration: 1.5 },
}

export default function BMO({ mousePosition, onAssemblyComplete }) {
  const REST_Y = -2.8  // vertical resting position — change this to move the model up/down
  const { scene } = useGLTF(MODEL_PATH)
  const groupRef = useRef()
  const innerRef = useRef()
  const timelineRef = useRef(null)

  // Animation state flags
  const isEyeLockedRef = useRef(false)
  const idleClockRef = useRef(0)
  const blendRef = useRef(0) // 0 = fully GSAP, 1 = fully idle float
  const mouseSmoothRef = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  // Stores computed { comp, targetPos, origRot, category, scatter } per component
  // so the click handler can replay the assembly without recomputing geometry.
  const targetsRef = useRef([])
  const playReturnToOriginalRef = useRef(null) // forward-ref so playAssembly can call it

  // Responsive scale based on viewport size
  const modelScale = useMemo(() => {
    const aspect = viewport.width / viewport.height
    if (aspect < 0.65) return 0.24 // Mobile portrait
    if (aspect < 1.0) return 0.30 // Tablet portrait
    if (aspect < 1.4) return 0.38 // Laptop
    return 0.45 // Desktop
  }, [viewport.width, viewport.height])

  /**
   * Builds and plays the piece-by-piece assembly timeline.
   * `timing` controls stagger speed; `withHeadRaise` controls whether the
   * downcast -> eye-contact head turn (phases 3 & 4) plays afterward.
   */
  const playAssembly = useCallback(
    (timing, withHeadRaise) => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }

      isEyeLockedRef.current = false
      blendRef.current = 0

      const targets = targetsRef.current
      if (!targets.length) return

      // Reset every component back to its scattered starting pose
      targets.forEach(({ comp, startPos, startRot }) => {
        comp.position.copy(startPos)
        comp.rotation.copy(startRot)
      })

      const bodyProxy = {
        rx: -0.22,
        ry: 0.15,
        rz: 0.0,
        py: REST_Y,
        scaleMult: 1.0,
      }

      if (groupRef.current) {
        groupRef.current.rotation.set(bodyProxy.rx, bodyProxy.ry, bodyProxy.rz)
        groupRef.current.position.y = bodyProxy.py
      }

      const tl = gsap.timeline({
        delay: withHeadRaise ? 0.2 : 0,
        onComplete: () => {
          isEyeLockedRef.current = true
          if (onAssemblyComplete) onAssemblyComplete()
          // Go straight into the return-to-original pose, no pause
          if (playReturnToOriginalRef.current) playReturnToOriginalRef.current()
        },
      })

      targets.forEach(({ comp, targetPos, origRot, category, animProxy }, idx) => {
        const t = timing[category] || timing.accent
        const stagger = (idx % 4) * 0.1

        // Reset proxy to the scattered start before animating back in
        animProxy.px = comp.position.x
        animProxy.py = comp.position.y
        animProxy.pz = comp.position.z
        animProxy.rx = comp.rotation.x
        animProxy.ry = comp.rotation.y
        animProxy.rz = comp.rotation.z

        tl.to(
          animProxy,
          {
            px: targetPos.x,
            py: targetPos.y,
            pz: targetPos.z,
            rx: origRot.x,
            ry: origRot.y,
            rz: origRot.z,
            duration: t.duration,
            ease: 'power3.inOut',
            onUpdate: () => {
              comp.position.set(animProxy.px, animProxy.py, animProxy.pz)
              comp.rotation.set(animProxy.rx, animProxy.ry, animProxy.rz)
            },
          },
          t.start + stagger
        )
      })

      const mergeSnapAt = withHeadRaise ? 3.5 : Math.max(...Object.values(timing).map((t) => t.start + t.duration)) + 0.1

      tl.to(
        bodyProxy,
        {
          scaleMult: 1.03,
          duration: 0.12,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onUpdate: () => {
            if (groupRef.current) {
              const s = modelScale * bodyProxy.scaleMult
              groupRef.current.scale.set(s, s, s)
            }
          },
        },
        mergeSnapAt
      )

      if (withHeadRaise) {
        tl.to(
          bodyProxy,
          {
            rx: 0.0,
            ry: 0.0,
            rz: 0.0,
            py: REST_Y,
            duration: 1.8,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (groupRef.current) {
                groupRef.current.rotation.set(bodyProxy.rx, bodyProxy.ry, bodyProxy.rz)
                groupRef.current.position.y = bodyProxy.py
              }
            },
          },
          4.4
        )
      } else {
        tl.to(
          bodyProxy,
          {
            rx: 0.0,
            ry: 0.0,
            rz: 0.0,
            py: -0.8,
            duration: 0.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (groupRef.current) {
                groupRef.current.rotation.set(bodyProxy.rx, bodyProxy.ry, bodyProxy.rz)
                groupRef.current.position.y = bodyProxy.py
              }
            },
          },
          mergeSnapAt + 0.15
        )
      }

      timelineRef.current = tl
    },
    [modelScale, onAssemblyComplete]
  )

  /**
   * After the eye-lock stare, smoothly return every piece to its true GLB
   * original position (origPos / origRot). groupRef is NOT touched — it stays
   * exactly where the assembly animation left it (REST_Y).
   */
  const playReturnToOriginal = useCallback(() => {
    const targets = targetsRef.current
    if (!targets.length) return

    // Stop eye-lock immediately so the idle float no longer fights the animation
    isEyeLockedRef.current = false
    blendRef.current = 0

    const tl = gsap.timeline()

    // Return every component to its exact GLB-defined origPos / origRot.
    // groupRef.current is intentionally never touched here.
    targets.forEach(({ comp, origPos, origRot, animProxy }, idx) => {
      const stagger = (idx % 4) * 0.05
      animProxy.px = comp.position.x
      animProxy.py = comp.position.y
      animProxy.pz = comp.position.z
      animProxy.rx = comp.rotation.x
      animProxy.ry = comp.rotation.y
      animProxy.rz = comp.rotation.z

      tl.to(
        animProxy,
        {
          px: origPos.x,
          py: origPos.y,
          pz: origPos.z,
          rx: origRot.x,
          ry: origRot.y,
          rz: origRot.z,
          duration: 0.8,
          ease: 'power2.inOut',
          onUpdate: () => {
            comp.position.set(animProxy.px, animProxy.py, animProxy.pz)
            comp.rotation.set(animProxy.rx, animProxy.ry, animProxy.rz)
          },
        },
        stagger
      )
    })
  }, [])

  // Keep the ref in sync so playAssembly can call this without a forward-reference
  playReturnToOriginalRef.current = playReturnToOriginal

  useEffect(() => {
    if (!scene) return

    const components = getBMOComponentGroups(scene)

    // Find main body casing to align all floating parts
    const bodyGroup =
      components.find(
        (c) => c.name.toLowerCase().includes('cube.005') || c.name.toLowerCase().includes('cube.007')
      ) || components[0]

    const bodyBox = new THREE.Box3().setFromObject(bodyGroup)
    const bodyCenter = bodyBox.getCenter(new THREE.Vector3())

    // Calculate assembled target positions & initial scattered positions
    const targets = components.map((comp, index) => {
      const origPos = comp.position.clone()
      const origRot = comp.rotation.clone()

      const compBox = new THREE.Box3().setFromObject(comp)
      const compCenter = compBox.getCenter(new THREE.Vector3())

      const assembleVector = new THREE.Vector3(
        (bodyCenter.x - compCenter.x) * 0.9,
        (bodyCenter.y - compCenter.y) * 0.95,
        (bodyCenter.z - compCenter.z) * 0.85
      )

      const targetPos = origPos.clone().add(assembleVector)
      const scatter = getScatterOffset(index, components.length)
      const category = getComponentCategory(comp.name)

      const startPos = targetPos.clone().add(scatter.position)
      const startRot = new THREE.Euler(
        origRot.x + scatter.rotation.x,
        origRot.y + scatter.rotation.y,
        origRot.z + scatter.rotation.z
      )

      comp.position.copy(startPos)
      comp.rotation.copy(startRot)

      const animProxy = {
        px: startPos.x,
        py: startPos.y,
        pz: startPos.z,
        rx: startRot.x,
        ry: startRot.y,
        rz: startRot.z,
      }

      return { comp, targetPos, origPos, origRot, category, animProxy, startPos, startRot }
    })

    targetsRef.current = targets

    // Initial auto-assembly on load, unchanged from original behavior
    playAssembly(CATEGORY_TIMING, true)

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [scene, playAssembly])

  // Animation frame loop for breathing float & eye-contact cursor tracking
  useFrame((_, delta) => {
    if (!groupRef.current) return

    mouseSmoothRef.current.x += (mousePosition.x - mouseSmoothRef.current.x) * 0.04
    mouseSmoothRef.current.y += (mousePosition.y - mouseSmoothRef.current.y) * 0.04

    const mouseX = mouseSmoothRef.current.x
    const mouseY = mouseSmoothRef.current.y

    if (isEyeLockedRef.current) {
      blendRef.current = Math.min(1, blendRef.current + delta * 0.65)
      const blend = blendRef.current

      idleClockRef.current += delta

      const floatY = REST_Y + Math.sin(idleClockRef.current * 0.7) * 0.08
      const floatX = Math.cos(idleClockRef.current * 0.35) * 0.03

      groupRef.current.position.y += (floatY - groupRef.current.position.y) * Math.min(1, blend * 0.08 + 0.01)
      groupRef.current.position.x += (floatX - groupRef.current.position.x) * Math.min(1, blend * 0.06 + 0.01)

      const targetRotY = mouseX * 0.22 * blend
      const targetRotX = -mouseY * 0.12 * blend
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05
    }
  })

  return (
    <group ref={groupRef} scale={modelScale} position={[0.2, -2.8, 1]}>
      <group ref={innerRef} rotation={[0, 0, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_PATH)