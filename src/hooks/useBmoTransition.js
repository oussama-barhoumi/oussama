/**
 * useBmoTransition
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the BMO → Home cinematic transition.
 *
 * Because the video element inside videoRef.current is created asynchronously
 * by BMO's useEffect (after this hook mounts), we poll until the video element
 * appears and then attach the 'ended' listener.
 *
 * ⚠️  ISOLATED — remove this file + BmoTransitionInner + BmoTransitionOverlay
 *     to fully revert without touching any existing BMO code.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TUNEABLE VALUES — all collected here for easy adjustment
 */
export const TRANSITION_CONFIG = {
  /** Seconds to wait after video "ended" before push-in starts */
  cinematicPause: 0.9,

  /** GSAP duration for the push-in move (seconds) */
  pushInDuration: 2.4,

  /** GSAP ease string — power3.in gives cinematic acceleration */
  pushInEase: 'power3.in',

  /** Camera Z: start (current scene value) → end (almost inside BMO) */
  cameraZStart: 8,
  cameraZEnd: 0.8,

  /** Camera FOV: start → end (narrowing creates telephoto zoom feel) */
  fovStart: 35,
  fovEnd: 8,

  /** Canvas CSS scale at peak (makes BMO fill the viewport) */
  canvasScalePeak: 2.4,

  /** Seconds into the push-in when the dark overlay starts fading in */
  overlayFadeDelay: 1.6,

  /** How long the overlay fade covers the screen (seconds) */
  overlayFadeDuration: 0.8,

  /** CSS blur peak on the <canvas> element (px) */
  canvasBlurPeak: 6,

  /** Seconds into push-in when blur starts ramping */
  blurStartDelay: 0.8,

  /** Duration of blur ramp (seconds) */
  blurDuration: 1.6,
}

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * @param {React.RefObject<HTMLVideoElement | null>} videoRef
 * @returns {{
 *   triggerRef: React.MutableRefObject<((opts: { onOverlayReveal: () => void }) => void) | null>,
 *   overlayActive: boolean,
 *   overlayVisible: boolean,
 * }}
 */
export function useBmoTransition(videoRef) {
  const [overlayActive, setOverlayActive] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)

  /** BmoTransitionInner populates this with its GSAP animation fn */
  const triggerRef = useRef(null)

  const hasTriggeredRef = useRef(false)
  const pauseTimerRef = useRef(null)
  const pollRef = useRef(null)

  const handleVideoEnded = useCallback(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    // Mount overlay (invisible) immediately
    setOverlayActive(true)

    pauseTimerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        triggerRef.current({
          onOverlayReveal: () => setOverlayVisible(true),
        })
      }
    }, TRANSITION_CONFIG.cinematicPause * 1000)
  }, [])

  useEffect(() => {
    let video = null

    /**
     * Poll until BMO populates videoRef.current, then attach the 'ended' listener.
     * BMO creates the video element inside its own useEffect (async).
     */
    const tryAttach = () => {
      if (videoRef.current && videoRef.current !== video) {
        // New video element found — attach listener
        if (video) video.removeEventListener('ended', handleVideoEnded)
        video = videoRef.current
        video.addEventListener('ended', handleVideoEnded)
      }
    }

    // Try immediately (in case video already exists)
    tryAttach()

    // Keep polling every 200 ms until we have the video
    pollRef.current = setInterval(() => {
      if (videoRef.current) {
        tryAttach()
        clearInterval(pollRef.current)
      }
    }, 200)

    return () => {
      clearInterval(pollRef.current)
      clearTimeout(pauseTimerRef.current)
      if (video) video.removeEventListener('ended', handleVideoEnded)
    }
  }, [videoRef, handleVideoEnded])

  return { triggerRef, overlayActive, overlayVisible }
}
