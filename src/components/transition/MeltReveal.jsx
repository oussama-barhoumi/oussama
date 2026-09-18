import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const CONFIG = {
  numPoints: 14,
  delayPointsMax: 180, // ms
  duration: 2.2,       // seconds for the reveal sweep
  color: '#000000',
}

function cubicInOut(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 0.5 * Math.pow(2 * t - 2, 3) + 1
}

function randomDelays() {
  const maxNormalizedDelay = CONFIG.delayPointsMax / 2200
  return Array.from(
    { length: CONFIG.numPoints },
    () => Math.random() * maxNormalizedDelay
  )
}

/**
 * Builds the SVG path for the Home reveal:
 * - At p=0: Wave points are at Y=0, path covers Y: 0 -> 100 (full screen black).
 * - As p increases: Wave points move downward (Y: 0 -> 100).
 * - Area ABOVE the wave (0 -> wave) is transparent, revealing Home.
 * - Area BELOW the wave (wave -> 100) is filled with black paint.
 * - At p=1: Wave points are at Y=100, path covers 0 height (Home 100% visible).
 */
function buildRevealPath(delays, p) {
  const n = CONFIG.numPoints
  const points = []
  const maxDelay = CONFIG.delayPointsMax / 2200
  const availableDuration = 1 - maxDelay

  for (let i = 0; i < n; i++) {
    const rawT = (p - delays[i]) / availableDuration
    const t = Math.min(Math.max(rawT, 0), 1)
    points[i] = cubicInOut(t) * 100
  }

  let d = `M 0 ${points[0]} `
  for (let i = 0; i < n - 1; i++) {
    const x1 = (i / (n - 1)) * 100
    const x2 = ((i + 1) / (n - 1)) * 100
    const center = (x1 + x2) / 2
    d += `C ${center} ${points[i]} ${center} ${points[i + 1]} ${x2} ${points[i + 1]} `
  }
  // Fill everything BELOW the wave down to the bottom of the viewport
  d += `V 100 H 0 Z`
  return d
}

export default function MeltReveal({ active, onHalfway, onComplete }) {
  const pathRef = useRef(null)
  const halfwayRef = useRef(false)
  const tweenRef = useRef(null)

  useEffect(() => {
    if (!active) return

    halfwayRef.current = false
    const delays = randomDelays()
    const path = pathRef.current
    if (!path) return

    // Initial state: 100% of viewport covered in solid black
    path.setAttribute('d', buildRevealPath(delays, 0))

    const proxy = { p: 0 }

    tweenRef.current = gsap.to(proxy, {
      p: 1,
      duration: CONFIG.duration,
      ease: 'power2.inOut',
      onUpdate() {
        const p = proxy.p
        if (!pathRef.current) return

        pathRef.current.setAttribute('d', buildRevealPath(delays, p))

        // Trigger Home entrance mask animation at ~40% as wave reaches upper-center
        if (p >= 0.4 && !halfwayRef.current) {
          halfwayRef.current = true
          if (typeof onHalfway === 'function') {
            onHalfway()
          }
        }
      },
      onComplete() {
        if (typeof onComplete === 'function') {
          onComplete()
        }
      },
    })

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill()
      }
    }
  }, [active, onHalfway, onComplete])

  if (!active) return null

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 200,
        pointerEvents: 'none',
        display: 'block',
      }}
    >
      <path ref={pathRef} fill={CONFIG.color} d="" />
    </svg>
  )
}