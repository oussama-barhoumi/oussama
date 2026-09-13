/**
 * BmoTransitionInner
 * ─────────────────────────────────────────────────────────────────────────────
 * Placed INSIDE the existing R3F <Canvas> in Hero.jsx.
 *
 * Two responsibilities:
 *   1. Register the GSAP animation callback on `triggerRef` (same as before).
 *   2. NEW — own raycaster that counts clicks on the red button (Object_33).
 *      On the 2nd click it calls `fireTransition()`.
 *      The 1st click is handled entirely by BMO.jsx (untouched).
 *
 * Animation layers (unchanged from original):
 *   • Camera Z rushes forward
 *   • Camera FOV collapses (telephoto compression)
 *   • Canvas CSS scale pushes BMO to fill viewport
 *   • Canvas CSS blur ramps up (motion feel)
 *   • onOverlayReveal fires at climax
 *
 * ⚠️  ISOLATED — does NOT import or reference any BMO internals.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { TRANSITION_CONFIG as C } from '../../hooks/useBmoTransition'

/** The mesh name BMO.jsx uses for the red button — kept in sync here */
const RED_BUTTON_MESH = 'Object_33'

/**
 * @param {{
 *   triggerRef:     React.MutableRefObject<Function|null>,
 *   fireTransition: () => void,
 * }} props
 */
export default function BmoTransitionInner({ triggerRef, fireTransition, videoRef, setStep }) {
  const { camera, gl, scene } = useThree()
  const tlRef = useRef(null)

  // Store original camera state so cleanup can restore it
  const origCameraRef = useRef({
    z: camera.position.z,
    fov: camera.fov,
  })

  // State flags for video & click tracking
  const firstClickDoneRef = useRef(false)
  const videoEndedRef = useRef(false)
  const transitionStartedRef = useRef(false)

  // ── Track video playback state via videoRef ───────────────────────────────
  useEffect(() => {
    let attachedVideo = null

    const handlePlay = () => {
      firstClickDoneRef.current = true
      videoEndedRef.current = false
      if (setStep) setStep('playing')
    }

    const handleEnded = () => {
      videoEndedRef.current = true
      if (setStep) setStep('ended')
    }

    const handleTimeUpdate = () => {
      const v = attachedVideo
      if (v && v.duration > 0 && v.currentTime >= v.duration - 0.25) {
        videoEndedRef.current = true
        if (setStep) setStep('ended')
      }
    }

    const attachListeners = (video) => {
      if (!video || attachedVideo === video) return
      attachedVideo = video
      video.addEventListener('play', handlePlay)
      video.addEventListener('ended', handleEnded)
      video.addEventListener('timeupdate', handleTimeUpdate)
      if (video.ended) {
        videoEndedRef.current = true
      }
    }

    const intervalId = setInterval(() => {
      if (videoRef?.current && videoRef.current !== attachedVideo) {
        attachListeners(videoRef.current)
      }
    }, 100)

    if (videoRef?.current) {
      attachListeners(videoRef.current)
    }

    return () => {
      clearInterval(intervalId)
      if (attachedVideo) {
        attachedVideo.removeEventListener('play', handlePlay)
        attachedVideo.removeEventListener('ended', handleEnded)
        attachedVideo.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [videoRef])

  // ── Register the GSAP animation callback ──────────────────────────────────
  useEffect(() => {
    /**
     * Called by useBmoTransition.fireTransition → setTimeout → here.
     * @param {{ onOverlayReveal: () => void }} opts
     */
    triggerRef.current = ({ onOverlayReveal }) => {
      if (tlRef.current) tlRef.current.kill()

      const canvas = gl.domElement

      // Plain-object proxies that GSAP can tween
      const camProxy = { z: camera.position.z, fov: camera.fov }
      const blurProxy = { value: 0 }
      const scaleProxy = { value: 1 }

      const tl = gsap.timeline()

      // ── 1. Camera rushes forward ─────────────────────────────────────────
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

      // ── 2. Canvas CSS scale (BMO fills viewport at climax) ───────────────
      tl.to(
        scaleProxy,
        {
          value: C.canvasScalePeak,
          duration: C.pushInDuration,
          ease: C.pushInEase,
          onUpdate: () => {
            canvas.style.transform = `scale(${scaleProxy.value.toFixed(4)})`
            canvas.style.transformOrigin = 'center center'
          },
        },
        0
      )

      // ── 3. Motion blur ramp ──────────────────────────────────────────────
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

      // ── 4. Overlay reveal at climax ──────────────────────────────────────
      tl.call(onOverlayReveal, null, C.overlayFadeDelay)

      tlRef.current = tl
    }

    return () => {
      if (triggerRef.current) triggerRef.current = null
      if (tlRef.current) { tlRef.current.kill(); tlRef.current = null }
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

  // ── Red-button click handler ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement
    if (!canvas || !scene) return

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const onPointerDown = (event) => {
      // Once transition has triggered, block further interactions
      if (transitionStartedRef.current) {
        event.stopImmediatePropagation()
        return
      }

      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(scene, true)

      if (!hits.length) return

      const hitName = hits[0].object.name
      if (hitName !== RED_BUTTON_MESH) return

      // Red button was clicked
      const video = videoRef?.current
      const isVideoEnded =
        videoEndedRef.current ||
        (video && video.ended) ||
        (video && video.duration > 0 && video.currentTime >= video.duration - 0.25)

      if (firstClickDoneRef.current && isVideoEnded) {
        // Second click AFTER video finished playing → fire the cinematic transition
        transitionStartedRef.current = true
        event.stopImmediatePropagation()

        if (video) {
          video.pause()
        }

        fireTransition()
      } else {
        // First click (or clicked while video is still playing).
        // Mark first click done so video can play (handled naturally by BMO.jsx).
        firstClickDoneRef.current = true
        videoEndedRef.current = false
      }
    }

    // Capture phase allows intercepting the 2nd click before BMO's listener replays the video
    canvas.addEventListener('pointerdown', onPointerDown, { capture: true })
    return () => canvas.removeEventListener('pointerdown', onPointerDown, { capture: true })
  }, [camera, gl, scene, fireTransition, videoRef, setStep])

  // Pure logic — renders nothing
  return null
}
