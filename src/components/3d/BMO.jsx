import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

const MODEL_PATH = '/models/oussama3.glb'
const VIDEO_PATH = '/videos/bmo-intro.mp4'

const DEBUG_LOG_CLICKED_MESH = true

const FACE_MESH_NAME = 'Object_44'
const RED_BUTTON_NAME = 'Object_33'

/**
 * Filter and collect component groups from scene.
 * Excludes floor plane / Piso / Floor.
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

    let isFloor =
      nameLower.includes('plane') ||
      nameLower.includes('piso') ||
      nameLower.includes('floor')

    child.traverse((c) => {
      if (c.isMesh && c.material) {
        const materials = Array.isArray(c.material)
          ? c.material
          : [c.material]

        materials.forEach((mat) => {
          const matName = (mat?.name || '').toLowerCase()

          if (
            matName.includes('piso') ||
            matName.includes('floor')
          ) {
            isFloor = true
          }
        })
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
  const angle2 = (index / Math.max(total, 1)) * Math.PI

  const radius = 2.8 + (index % 4) * 0.8

  return {
    position: new THREE.Vector3(
      Math.cos(angle1) * radius * 1.3,
      Math.sin(angle2) * radius * 1.0 +
      ((index % 3) - 1) * 0.6,
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
 * Component assembly categories.
 */
function getComponentCategory(name) {
  const n = name.toLowerCase()

  if (
    n.includes('cube.005') ||
    n.includes('cube.007') ||
    n.includes('cylinder.026')
  ) {
    return 'core'
  }

  if (n.includes('speaker')) {
    return 'speaker'
  }

  if (n.includes('cube')) {
    return 'body'
  }

  if (
    n.includes('heart') ||
    n.includes('text') ||
    n.includes('cylinder.024')
  ) {
    return 'detail'
  }

  return 'accent'
}

const CATEGORY_TIMING = {
  core: {
    start: 0.2,
    duration: 2.2,
  },

  speaker: {
    start: 0.5,
    duration: 2.0,
  },

  body: {
    start: 0.8,
    duration: 2.0,
  },

  accent: {
    start: 1.2,
    duration: 1.8,
  },

  detail: {
    start: 1.8,
    duration: 1.5,
  },
}

export default function BMO({
  mousePosition = { x: 0, y: 0 },
  onAssemblyComplete,
}) {
  const REST_Y = -2.8

  const { scene } = useGLTF(MODEL_PATH)

  const groupRef = useRef()
  const innerRef = useRef()

  const timelineRef = useRef(null)

  const isEyeLockedRef = useRef(false)

  const idleClockRef = useRef(0)

  const blendRef = useRef(0)

  const mouseSmoothRef = useRef({
    x: 0,
    y: 0,
  })

  const targetsRef = useRef([])

  const playReturnToOriginalRef = useRef(null)

  // ============================================================
  // VIDEO REFS
  // ============================================================

  const videoRef = useRef(null)
  const videoTextureRef = useRef(null)

  const { viewport, camera, gl } = useThree()

  // ============================================================
  // RESPONSIVE MODEL SCALE
  // ============================================================

  const modelScale = useMemo(() => {
    const aspect = viewport.width / viewport.height

    if (aspect < 0.65) return 0.24

    if (aspect < 1.0) return 0.30

    if (aspect < 1.4) return 0.38

    return 0.45
  }, [viewport.width, viewport.height])

  // ============================================================
  // ASSEMBLY ANIMATION
  // ============================================================

  const playAssembly = useCallback(
    (timing, withHeadRaise) => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }

      isEyeLockedRef.current = false
      blendRef.current = 0

      const targets = targetsRef.current

      if (!targets.length) {
        console.warn('[BMO] No targets found.')
        return
      }

      // Reset components to scattered positions
      targets.forEach(
        ({ comp, startPos, startRot, animProxy }) => {
          comp.position.copy(startPos)
          comp.rotation.copy(startRot)

          animProxy.px = startPos.x
          animProxy.py = startPos.y
          animProxy.pz = startPos.z

          animProxy.rx = startRot.x
          animProxy.ry = startRot.y
          animProxy.rz = startRot.z
        }
      )

      const bodyProxy = {
        rx: -0.22,
        ry: 0.15,
        rz: 0,

        py: REST_Y,

        scaleMult: 1,
      }

      if (groupRef.current) {
        groupRef.current.rotation.set(
          bodyProxy.rx,
          bodyProxy.ry,
          bodyProxy.rz
        )

        groupRef.current.position.y = bodyProxy.py

        groupRef.current.scale.set(
          modelScale,
          modelScale,
          modelScale
        )
      }

      const tl = gsap.timeline({
        delay: withHeadRaise ? 0.2 : 0,

        onComplete: () => {
          isEyeLockedRef.current = true

          if (onAssemblyComplete) {
            onAssemblyComplete()
          }

          if (playReturnToOriginalRef.current) {
            playReturnToOriginalRef.current()
          }
        },
      })

      targets.forEach(
        (
          {
            comp,
            targetPos,
            origRot,
            category,
            animProxy,
          },
          idx
        ) => {
          const t =
            timing[category] ||
            timing.accent

          const stagger = (idx % 4) * 0.1

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
                comp.position.set(
                  animProxy.px,
                  animProxy.py,
                  animProxy.pz
                )

                comp.rotation.set(
                  animProxy.rx,
                  animProxy.ry,
                  animProxy.rz
                )
              },
            },
            t.start + stagger
          )
        }
      )

      const mergeSnapAt = withHeadRaise
        ? 3.5
        : Math.max(
          ...Object.values(timing).map(
            (t) => t.start + t.duration
          )
        ) + 0.1

      // Small merge scale snap
      tl.to(
        bodyProxy,
        {
          scaleMult: 1.03,

          duration: 0.12,

          ease: 'power2.out',

          yoyo: true,

          repeat: 1,

          onUpdate: () => {
            if (!groupRef.current) return

            const scale =
              modelScale * bodyProxy.scaleMult

            groupRef.current.scale.set(
              scale,
              scale,
              scale
            )
          },
        },
        mergeSnapAt
      )

      // Head raise
      if (withHeadRaise) {
        tl.to(
          bodyProxy,
          {
            rx: 0,
            ry: 0,
            rz: 0,

            py: REST_Y,

            duration: 1.8,

            ease: 'power2.inOut',

            onUpdate: () => {
              if (!groupRef.current) return

              groupRef.current.rotation.set(
                bodyProxy.rx,
                bodyProxy.ry,
                bodyProxy.rz
              )

              groupRef.current.position.y =
                bodyProxy.py
            },
          },
          4.4
        )
      } else {
        tl.to(
          bodyProxy,
          {
            rx: 0,
            ry: 0,
            rz: 0,

            py: -0.8,

            duration: 0.5,

            ease: 'power2.inOut',

            onUpdate: () => {
              if (!groupRef.current) return

              groupRef.current.rotation.set(
                bodyProxy.rx,
                bodyProxy.ry,
                bodyProxy.rz
              )

              groupRef.current.position.y =
                bodyProxy.py
            },
          },
          mergeSnapAt + 0.15
        )
      }

      timelineRef.current = tl
    },
    [modelScale, onAssemblyComplete]
  )

  // ============================================================
  // RETURN TO ORIGINAL GLB POSE
  // ============================================================

  const playReturnToOriginal = useCallback(() => {
    const targets = targetsRef.current

    if (!targets.length) {
      console.warn(
        '[BMO] Cannot return to original: no targets.'
      )

      return
    }

    isEyeLockedRef.current = false
    blendRef.current = 0

    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    const tl = gsap.timeline()

    targets.forEach(
      (
        {
          comp,
          origPos,
          origRot,
          animProxy,
        },
        idx
      ) => {
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
              comp.position.set(
                animProxy.px,
                animProxy.py,
                animProxy.pz
              )

              comp.rotation.set(
                animProxy.rx,
                animProxy.ry,
                animProxy.rz
              )
            },
          },
          stagger
        )
      }
    )

    timelineRef.current = tl
  }, [])

  // ============================================================
  // ALLOW ASSEMBLY TO TRIGGER RETURN
  // ============================================================

  useEffect(() => {
    playReturnToOriginalRef.current =
      playReturnToOriginal

    return () => {
      playReturnToOriginalRef.current = null
    }
  }, [playReturnToOriginal])

  // ============================================================
  // PREPARE BMO COMPONENTS
  // ============================================================

  useEffect(() => {
    if (!scene) return

    const components =
      getBMOComponentGroups(scene)

    console.log(
      '[BMO] components:',
      components.map((c) => c.name)
    )

    if (!components.length) {
      console.warn(
        '[BMO] No components found in GLB.'
      )

      return
    }

    // Find main body
    const bodyGroup =
      components.find((c) => {
        const name =
          c.name.toLowerCase()

        return (
          name.includes('cube.005') ||
          name.includes('cube.007')
        )
      }) || components[0]

    const bodyBox =
      new THREE.Box3().setFromObject(
        bodyGroup
      )

    const bodyCenter =
      bodyBox.getCenter(
        new THREE.Vector3()
      )

    // Calculate animation targets
    const targets = components.map(
      (comp, index) => {
        // Save exact original GLB transforms
        const origPos =
          comp.position.clone()

        const origRot =
          comp.rotation.clone()

        const compBox =
          new THREE.Box3().setFromObject(
            comp
          )

        const compCenter =
          compBox.getCenter(
            new THREE.Vector3()
          )

        const assembleVector =
          new THREE.Vector3(
            (bodyCenter.x -
              compCenter.x) *
            0.9,

            (bodyCenter.y -
              compCenter.y) *
            0.95,

            (bodyCenter.z -
              compCenter.z) *
            0.85
          )

        const targetPos =
          origPos
            .clone()
            .add(assembleVector)

        const scatter =
          getScatterOffset(
            index,
            components.length
          )

        const category =
          getComponentCategory(
            comp.name
          )

        const startPos =
          targetPos
            .clone()
            .add(scatter.position)

        const startRot =
          new THREE.Euler(
            origRot.x +
            scatter.rotation.x,

            origRot.y +
            scatter.rotation.y,

            origRot.z +
            scatter.rotation.z
          )

        // Set initial scattered pose
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

        return {
          comp,

          targetPos,

          origPos,

          origRot,

          category,

          animProxy,

          startPos,

          startRot,
        }
      }
    )

    targetsRef.current = targets

    // Initial automatic assembly
    playAssembly(
      CATEGORY_TIMING,
      true
    )

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
    }
  }, [scene, playAssembly])

  // ============================================================
  // VIDEO TEXTURE → Object_44
  // ============================================================

  useEffect(() => {
    if (!scene) return

    const faceMesh =
      scene.getObjectByName(
        FACE_MESH_NAME
      )

    if (!faceMesh) {
      console.warn(
        `[BMO] ${FACE_MESH_NAME} not found in scene.`
      )

      return
    }

    if (!faceMesh.isMesh) {
      console.warn(
        `[BMO] ${FACE_MESH_NAME} exists but is not a Mesh.`,
        faceMesh
      )

      return
    }

    console.log(
      `[BMO] Face mesh found: ${FACE_MESH_NAME}`,
      faceMesh
    )

    // Compute geometry bounding box and face aspect ratio for Object_44
    const geometry = faceMesh.geometry
    geometry.computeBoundingBox()
    const size = geometry.boundingBox.getSize(
      new THREE.Vector3()
    )
    const faceAspect = size.x / Math.max(size.y, 0.0001)

    console.log(
      `[BMO] Face mesh aspect ratio (${FACE_MESH_NAME}):`,
      faceAspect,
      size
    )

    // ----------------------------------------------------------
    // CREATE VIDEO
    // ----------------------------------------------------------

    const video =
      document.createElement('video')

    video.src = VIDEO_PATH

    video.crossOrigin = 'anonymous'

    video.playsInline = true

    video.preload = 'auto'

    video.loop = false

    video.muted = false

    videoRef.current = video

    // ----------------------------------------------------------
    // CREATE VIDEO TEXTURE
    // ----------------------------------------------------------

    const videoTexture =
      new THREE.VideoTexture(video)

    videoTexture.colorSpace =
      THREE.SRGBColorSpace

    videoTexture.minFilter =
      THREE.LinearFilter

    videoTexture.magFilter =
      THREE.LinearFilter

    videoTexture.generateMipmaps = false

    videoTexture.needsUpdate = true

    videoTextureRef.current =
      videoTexture

    // ----------------------------------------------------------
    // APPLY VIDEO TO ALL FACE MATERIALS
    // ----------------------------------------------------------

    const materials =
      Array.isArray(faceMesh.material)
        ? faceMesh.material
        : [faceMesh.material]

    materials.forEach((material) => {
      if (!material) return

      material.map =
        videoTexture

      material.needsUpdate = true
    })

    console.log(
      `[BMO] VideoTexture applied to ${FACE_MESH_NAME}`
    )

    // ----------------------------------------------------------
    // VIDEO EVENTS
    // ----------------------------------------------------------

    const handleLoadedMetadata = () => {
      console.log(
        '[BMO] Video metadata loaded'
      )

      // Ensure full 1:1 UV mapping with no black gaps or borders around face
      videoTexture.offset.set(0, 0)
      videoTexture.repeat.set(1, 1)
      videoTexture.needsUpdate = true

      try {
        video.currentTime = 0
      } catch (error) {
        console.warn(
          '[BMO] Could not reset video time:',
          error
        )
      }
    }

    const handleLoadedData = () => {
      console.log(
        '[BMO] Video first frame loaded'
      )

      try {
        video.currentTime = 0
      } catch (error) {
        console.warn(
          '[BMO] Could not set first frame:',
          error
        )
      }

      videoTexture.needsUpdate = true
    }

    const handleCanPlay = () => {
      console.log(
        '[BMO] Video can play'
      )
    }

    const handleEnded = () => {
      console.log(
        '[BMO] Video finished'
      )

      video.pause()

      try {
        video.currentTime = 0
      } catch (error) {
        console.warn(
          '[BMO] Could not reset after ending:',
          error
        )
      }
    }

    const handleError = (event) => {
      console.error(
        '[BMO] Video loading error:',
        event,
        video.error
      )
    }

    video.addEventListener(
      'loadedmetadata',
      handleLoadedMetadata
    )

    video.addEventListener(
      'loadeddata',
      handleLoadedData
    )

    video.addEventListener(
      'canplay',
      handleCanPlay
    )

    video.addEventListener(
      'ended',
      handleEnded
    )

    video.addEventListener(
      'error',
      handleError
    )

    // Start loading
    video.load()

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {
      video.removeEventListener(
        'loadedmetadata',
        handleLoadedMetadata
      )

      video.removeEventListener(
        'loadeddata',
        handleLoadedData
      )

      video.removeEventListener(
        'canplay',
        handleCanPlay
      )

      video.removeEventListener(
        'ended',
        handleEnded
      )

      video.removeEventListener(
        'error',
        handleError
      )

      video.pause()

      video.removeAttribute('src')

      video.load()

      videoTexture.dispose()

      videoRef.current = null

      videoTextureRef.current = null

      console.log(
        '[BMO] Video cleaned up'
      )
    }
  }, [scene])

  // ============================================================
  // DEBUG CLICK + RED BUTTON VIDEO TRIGGER
  // ============================================================

  useEffect(() => {
    if (!DEBUG_LOG_CLICKED_MESH) {
      return
    }

    if (!gl?.domElement) {
      console.warn(
        '[BMO DEBUG] Canvas not available.'
      )

      return
    }

    if (!scene) {
      console.warn(
        '[BMO DEBUG] Scene not available.'
      )

      return
    }

    const canvas = gl.domElement

    const raycaster =
      new THREE.Raycaster()

    const pointer =
      new THREE.Vector2()

    console.log(
      '[BMO DEBUG] Mesh debug listener attached.'
    )

    const onPointerDown = (event) => {
      const rect =
        canvas.getBoundingClientRect()

      // Convert mouse position to NDC
      pointer.x =
        ((event.clientX - rect.left) /
          rect.width) *
        2 -
        1

      pointer.y =
        -(
          ((event.clientY - rect.top) /
            rect.height) *
          2 -
          1
        )

      // Raycast
      raycaster.setFromCamera(
        pointer,
        camera
      )

      const intersects =
        raycaster.intersectObject(
          scene,
          true
        )

      if (!intersects.length) {
        console.log(
          '[mesh click] nothing hit'
        )

        return
      }

      // Closest mesh
      const hit =
        intersects[0].object

      const worldPos =
        new THREE.Vector3()

      hit.getWorldPosition(
        worldPos
      )

      const materialName =
        Array.isArray(hit.material)
          ? hit.material
            .map(
              (m) =>
                m?.name ||
                '(unnamed)'
            )
            .join(', ')
          : hit.material?.name ||
          '(none)'

      // --------------------------------------------------------
      // DEBUG LOG
      // --------------------------------------------------------

      console.log(
        '========================================'
      )

      console.log(
        '[mesh click] HIT'
      )

      console.log(
        '[mesh click] name:',
        hit.name
      )

      console.log(
        '[mesh click] type:',
        hit.type
      )

      console.log(
        '[mesh click] material:',
        materialName
      )

      console.log(
        '[mesh click] parent:',
        hit.parent?.name ||
        '(none)'
      )

      console.log(
        '[mesh click] worldPos:',
        {
          x: Number(
            worldPos.x.toFixed(3)
          ),

          y: Number(
            worldPos.y.toFixed(3)
          ),

          z: Number(
            worldPos.z.toFixed(3)
          ),
        }
      )

      console.log(
        '[mesh click] object:',
        hit
      )

      console.log(
        '========================================'
      )

      // --------------------------------------------------------
      // RED BUTTON → PLAY FACE VIDEO
      // --------------------------------------------------------

      if (
        hit.name ===
        RED_BUTTON_NAME
      ) {
        console.log(
          '[BMO] RED BUTTON CLICKED'
        )

        const video =
          videoRef.current

        if (!video) {
          console.warn(
            '[BMO] Video element is not ready yet.'
          )

          return
        }

        console.log(
          '[BMO] Resetting video to 0...'
        )

        video.pause()

        try {
          video.currentTime = 0
        } catch (error) {
          console.warn(
            '[BMO] Could not reset video:',
            error
          )
        }

        video.muted = false

        console.log(
          '[BMO] Starting bmo-intro.mp4...'
        )

        const playPromise =
          video.play()

        if (
          playPromise !== undefined
        ) {
          playPromise
            .then(() => {
              console.log(
                '[BMO] VIDEO PLAYING ON FACE'
              )
            })
            .catch((error) => {
              console.error(
                '[BMO] Video play failed:',
                error
              )
            })
        }
      }
    }

    canvas.addEventListener(
      'pointerdown',
      onPointerDown
    )

    return () => {
      canvas.removeEventListener(
        'pointerdown',
        onPointerDown
      )

      console.log(
        '[BMO DEBUG] Mesh debug listener removed.'
      )
    }
  }, [camera, gl, scene])

  // ============================================================
  // FRAME LOOP
  // ============================================================

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    // ----------------------------------------------------------
    // Smooth mouse
    // ----------------------------------------------------------

    const targetMouseX =
      mousePosition?.x || 0

    const targetMouseY =
      mousePosition?.y || 0

    mouseSmoothRef.current.x +=
      (targetMouseX -
        mouseSmoothRef.current.x) *
      0.04

    mouseSmoothRef.current.y +=
      (targetMouseY -
        mouseSmoothRef.current.y) *
      0.04

    const mouseX =
      mouseSmoothRef.current.x

    const mouseY =
      mouseSmoothRef.current.y

    // ----------------------------------------------------------
    // Eye-lock idle animation
    // ----------------------------------------------------------

    if (isEyeLockedRef.current) {
      blendRef.current =
        Math.min(
          1,
          blendRef.current +
          delta * 0.65
        )

      const blend =
        blendRef.current

      idleClockRef.current += delta

      const floatY =
        REST_Y +
        Math.sin(
          idleClockRef.current *
          0.7
        ) *
        0.08

      const floatX =
        Math.cos(
          idleClockRef.current *
          0.35
        ) *
        0.03

      groupRef.current.position.y +=
        (floatY -
          groupRef.current.position.y) *
        Math.min(
          1,
          blend * 0.08 + 0.01
        )

      groupRef.current.position.x +=
        (floatX -
          groupRef.current.position.x) *
        Math.min(
          1,
          blend * 0.06 + 0.01
        )

      const targetRotY =
        mouseX *
        0.22 *
        blend

      const targetRotX =
        -mouseY *
        0.12 *
        blend

      groupRef.current.rotation.y +=
        (targetRotY -
          groupRef.current.rotation.y) *
        0.05

      groupRef.current.rotation.x +=
        (targetRotX -
          groupRef.current.rotation.x) *
        0.05
    }
  })


  return (
    <group
      ref={groupRef}
      scale={modelScale}
      position={[0.2, -2.8, 1]}
    >
      <group
        ref={innerRef}
        rotation={[0, 0, 0]}
      >
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_PATH)