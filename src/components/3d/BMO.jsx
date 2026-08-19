import { useRef, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

const MODEL_PATH = '/models/bmo-disassembled.glb'

/**
 * Collect component groups from scene, hiding floor plane (Plane.003_42 / material Piso).
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
 * Natural 3D scatter offset for initial disassembled state.
 */
function getScatterOffset(index, total) {
  const goldenRatio = 1.61803398875
  const angle1 = index * goldenRatio * Math.PI * 2
  const angle2 = (index / total) * Math.PI

  const radius = 2.4 + (index % 4) * 0.6

  return {
    position: new THREE.Vector3(
      Math.cos(angle1) * radius * 1.2,
      Math.sin(angle2) * radius * 0.9 + ((index % 3) - 1) * 0.5,
      Math.sin(angle1) * radius * 0.8 + 0.6
    ),
    rotation: new THREE.Euler(
      ((index % 5) - 2) * 0.4,
      ((index % 7) - 3) * 0.5,
      ((index % 4) - 1.5) * 0.4
    ),
  }
}

/**
 * Assembly sequence categories.
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
  core:    { start: 0.2, duration: 2.2 },
  speaker: { start: 0.5, duration: 2.0 },
  body:    { start: 0.8, duration: 2.0 },
  accent:  { start: 1.2, duration: 1.8 },
  detail:  { start: 1.8, duration: 1.5 },
}

export default function BMO({ mousePosition, onAssemblyComplete }) {
  const { scene } = useGLTF(MODEL_PATH)
  const groupRef = useRef()
  const innerRef = useRef()
  const timelineRef = useRef(null)
  const isAssembledRef = useRef(false)
  const idleClockRef = useRef(0)
  const mouseSmoothRef = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  // Responsive scale based on viewport size (smaller & sleeker framing)
  const modelScale = useMemo(() => {
    const aspect = viewport.width / viewport.height
    if (aspect < 0.65) return 0.16  // Mobile portrait
    if (aspect < 1.0) return 0.20   // Tablet portrait
    if (aspect < 1.4) return 0.25   // Laptop
    return 0.30                     // Desktop
  }, [viewport.width, viewport.height])

  useEffect(() => {
    if (!scene) return

    const components = getBMOComponentGroups(scene)

    // Capture target GLB transforms and apply initial scatter
    const targets = components.map((comp, index) => {
      const origPos = comp.position.clone()
      const origRot = comp.rotation.clone()
      const scatter = getScatterOffset(index, components.length)
      const category = getComponentCategory(comp.name)

      comp.position.copy(origPos).add(scatter.position)
      comp.rotation.set(
        origRot.x + scatter.rotation.x,
        origRot.y + scatter.rotation.y,
        origRot.z + scatter.rotation.z
      )

      return {
        comp,
        origPos,
        origRot,
        category,
      }
    })

    // GSAP Assembly Timeline
    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        isAssembledRef.current = true
        if (onAssemblyComplete) onAssemblyComplete()
      },
    })

    targets.forEach(({ comp, origPos, origRot, category }, idx) => {
      const timing = CATEGORY_TIMING[category] || CATEGORY_TIMING.accent
      const stagger = (idx % 4) * 0.1

      tl.to(
        comp.position,
        {
          x: origPos.x,
          y: origPos.y,
          z: origPos.z,
          duration: timing.duration,
          ease: 'power3.inOut',
        },
        timing.start + stagger
      )

      tl.to(
        comp.rotation,
        {
          x: origRot.x,
          y: origRot.y,
          z: origRot.z,
          duration: timing.duration,
          ease: 'power3.inOut',
        },
        timing.start + stagger
      )
    })

    // Settle animation at end of assembly (3.4s -> 4.0s)
    if (groupRef.current) {
      tl.to(
        groupRef.current.position,
        {
          y: '+=0.08',
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        3.4
      )
    }

    timelineRef.current = tl

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [scene, onAssemblyComplete])

  // Animation frame loop for idle float & mouse tracking
  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Smooth mouse lerp
    mouseSmoothRef.current.x += (mousePosition.x - mouseSmoothRef.current.x) * 0.04
    mouseSmoothRef.current.y += (mousePosition.y - mouseSmoothRef.current.y) * 0.04

    const mouseX = mouseSmoothRef.current.x
    const mouseY = mouseSmoothRef.current.y

    if (isAssembledRef.current) {
      idleClockRef.current += delta

      // Gentle vertical floating (breathing effect)
      const floatY = 0.80 + Math.sin(idleClockRef.current * 0.7) * 0.08
      const floatX = Math.cos(idleClockRef.current * 0.35) * 0.03
      groupRef.current.position.y = floatY
      groupRef.current.position.x = floatX

      // Subtle mouse tilt
      const targetRotY = mouseX * 0.2
      const targetRotX = -mouseY * 0.1
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05
    } else {
      groupRef.current.position.y = 0.80
      // Parallax while assembling
      const targetRotY = mouseX * 0.08
      const targetRotX = -mouseY * 0.05
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.03
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.03
    }
  })

  return (
    <group ref={groupRef} scale={modelScale} position={[0, 0.80, 0]}>
      <group ref={innerRef} rotation={[Math.PI, 0, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
