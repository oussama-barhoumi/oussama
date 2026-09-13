
export const TRANSITION_CONFIG = {

  cinematicPause: 0.9,


  pushInDuration: 2.4,

  pushInEase: 'power3.in',


  cameraZStart: 8,
  cameraZEnd: 0.8,

  fovStart: 35,
  fovEnd: 8,


  canvasScalePeak: 2.4,


  overlayFadeDelay: 1.6,


  overlayFadeDuration: 0.8,

  canvasBlurPeak: 6,


  blurStartDelay: 0.8,


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

  const triggerRef = useRef(null)

  const hasTriggeredRef = useRef(false)
  const pauseTimerRef = useRef(null)
  const pollRef = useRef(null)

  const handleVideoEnded = useCallback(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true


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


    const tryAttach = () => {
      if (videoRef?.current && videoRef.current !== video) {
        if (video) video.removeEventListener('ended', handleVideoEnded)
        video = videoRef.current
        video.addEventListener('ended', handleVideoEnded)
      }
    }

    tryAttach()

    pollRef.current = setInterval(() => {
      if (videoRef?.current) {
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
