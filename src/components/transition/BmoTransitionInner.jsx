/**
 * BmoTransitionInner
 * ─────────────────────────────────────────────────────────────────────────────
 * Placed INSIDE the existing R3F <Canvas> in Hero.jsx.
 * Registers its animation callback on `triggerRef` so useBmoTransition can
 * call it after the cinematic pause.
 *
 * Animation strategy (no BMO refs required — zero BMO code touched):
 *   1. Camera.position.z rushes toward BMO → feels like entering the scene
 *   2. Camera.fov collapses → telephoto compression, dramatic zoom feel
 *   3. Canvas CSS transform: scale + slight Z-translate for extra push
 *   4. Canvas CSS blur ramps up → motion blur / speed feeling
 *   5. onOverlayReveal fires at the correct moment → overlay covers screen
 *
 * ⚠️  ISOLATED — does NOT import or reference any BMO internals.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { TRANSITION_CONFIG as C } from '../../hooks/useBmoTransition'

/**
 * @param {{
 *   triggerRef: React.MutableRefObject<Function|null>,
 * }} props
 */
export default function BmoTransitionInner({ triggerRef }) {
  const { camera, gl } = useThree()
  const tlRef = useRef(null)

  // Store original camera state so cleanup can restore it
  const origCameraRef = useRef({
    z: camera.position.z,
    fov: camera.fov,
  })

  useEffect(() => {
    /**
     * Animation trigger — called by useBmoTransition after cinematicPause.
     * @param {{ onOverlayReveal: () => void }} opts
     */
    triggerRef.current = ({ onOverlayReveal }) => {
      if (tlRef.current) tlRef.current.kill()

      const canvas = gl.domElement

      // Plain-object proxies that GSAP can tween
      const camProxy = {
        z: camera.position.z,
        fov: camera.fov,
      }

      const blurProxy = { value: 0 }

      // CSS scale on canvas for extra viewport-filling push
      const scaleProxy = { value: 1 }

      const tl = gsap.timeline()

      // ── 1. Camera rushes forward ──────────────────────────────────────────
      tl.to(
        camProxy,
        {
          z: C.cameraZEnd,
          fov: C.fovEnd,
          duration: C.pushInDuration,
          ease: C.pushInEase,
          onUpdate: () => {
            camera.position.z = camProxy.z
            camera.fov = camProxy.fov
            camera.updateProjectionMatrix()
          },
        },
        0
      )

      // ── 2. Canvas CSS scale (makes BMO fill viewport at climax) ──────────
      tl.to(
        scaleProxy,
        {
          value: 2.4,
          duration: C.pushInDuration,
          ease: C.pushInEase,
          onUpdate: () => {
            canvas.style.transform = `scale(${scaleProxy.value.toFixed(4)})`
            canvas.style.transformOrigin = 'center center'
          },
        },
        0
      )

      // ── 3. Motion blur ramp ───────────────────────────────────────────────
      tl.to(
        blurProxy,
        {
          value: C.canvasBlurPeak,
          duration: C.blurDuration,
          ease: 'power2.in',
          onUpdate: () => {
            canvas.style.filter = `blur(${blurProxy.value.toFixed(2)}px)`
          },
        },
        C.blurStartDelay
      )

      // ── 4. Overlay reveal at climax ───────────────────────────────────────
      tl.call(onOverlayReveal, null, C.overlayFadeDelay)

      tlRef.current = tl
    }

    return () => {
      if (triggerRef.current) triggerRef.current = null
      if (tlRef.current) {
        tlRef.current.kill()
        tlRef.current = null
      }
      // Restore camera
      camera.position.z = origCameraRef.current.z
      camera.fov = origCameraRef.current.fov
      camera.updateProjectionMatrix()
      // Restore canvas styles
      const canvas = gl.domElement
      if (canvas) {
        canvas.style.filter = ''
        canvas.style.transform = ''
        canvas.style.transformOrigin = ''
      }
    }
  }, [triggerRef, camera, gl])

  // Pure logic — renders nothing
  return null
}
