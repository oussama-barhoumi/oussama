/**
 * useBmoTransition
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the BMO → Home cinematic transition.
 *
 * TRIGGER: The transition is now fired manually by BmoTransitionInner when
 * the user clicks the red button for the SECOND time. The video-ended
 * auto-trigger has been removed.
 *
 * ⚠️  ISOLATED — remove this file + BmoTransitionInner + BmoTransitionOverlay
 *     to fully revert without touching any existing BMO code.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TUNEABLE VALUES — all collected here for easy adjustment
 */
export const TRANSITION_CONFIG = {
  /** Seconds to wait after the 2nd red-button click before push-in starts */
  cinematicPause: 0.4,

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

import { useRef, useState } from 'react'

/**
 * @returns {{
 *   triggerRef:      React.MutableRefObject<((opts: { onOverlayReveal: () => void }) => void) | null>,
 *   fireTransition:  () => void,
 *   overlayActive:   boolean,
 *   overlayVisible:  boolean,
 * }}
 *
 * `triggerRef.current`  – populated by BmoTransitionInner with its GSAP fn.
 * `fireTransition`      – called by BmoTransitionInner on the 2nd red-button click.
 */
export function useBmoTransition() {
  const [overlayActive, setOverlayActive] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [step, setStep] = useState('initial') // 'initial' | 'playing' | 'ended' | 'transitioning'

  /** BmoTransitionInner registers its GSAP animation fn here */
  const triggerRef = useRef(null)

  const hasTriggeredRef = useRef(false)
  const pauseTimerRef = useRef(null)

  /**
   * Called by BmoTransitionInner when the 2nd red-button click is detected.
   * Guards against double-fire.
   */
  const fireTransition = () => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    setStep('transitioning')

    // Mount the overlay (invisible) immediately
    setOverlayActive(true)

    pauseTimerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        triggerRef.current({
          onOverlayReveal: () => setOverlayVisible(true),
        })
      }
    }, TRANSITION_CONFIG.cinematicPause * 1000)
  }

  return { triggerRef, fireTransition, overlayActive, overlayVisible, step, setStep }
}
