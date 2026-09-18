import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

// ─────────────────────────────────────────────────────────────────────────
// Palette — flat red field, hand-drawn black linework (matches reference)
// ─────────────────────────────────────────────────────────────────────────
const COLOR_RED = '#660f05ff'
const COLOR_INK = '#151210'
const COLOR_INK_SOFT = 'rgba(21, 18, 16, 0.55)'

// Grain overlay as an inline SVG noise filter — cheap, no canvas needed
const GRAIN_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"

export default function PortfolioPreloader({ onComplete }) {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const clockRef = useRef(null)

  // 1% → 100% maps onto the clock sweeping 11:11 ("make a wish") to 00:00 ("start work")
  const START_TOTAL_MIN = 11 * 60 + 11 // 671
  const END_TOTAL_MIN = 12 * 60 // 720 -> displays 00:00
  const SWEEP_MIN = END_TOTAL_MIN - START_TOTAL_MIN // 49

  const angleFor = (totalMin) => ({
    hourAngle: ((totalMin % 720) / 720) * 360,
    minuteAngle: ((totalMin % 60) / 60) * 360,
  })

  const startAngles = angleFor(START_TOTAL_MIN)

  const [progress, setProgress] = useState(1)
  const [hourAngle, setHourAngle] = useState(startAngles.hourAngle)
  const [minuteAngle, setMinuteAngle] = useState(startAngles.minuteAngle)
  const [statusText, setStatusText] = useState('MAKE A WISH')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.preloader-fade-item',
        { opacity: 0, y: 12, filter: 'blur(3px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        }
      )

      gsap.fromTo(
        clockRef.current,
        { opacity: 0, scale: 0.9, rotate: -2 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1, ease: 'power3.out', delay: 0.1 }
      )

      function triggerExitTransition() {
        const exitTl = gsap.timeline({
          onComplete: () => {
            document.body.style.overflow = prevOverflow
            if (onComplete) onComplete()
          },
        })

        exitTl.to(contentRef.current, {
          opacity: 0,
          scale: 0.96,
          y: -10,
          filter: 'blur(5px)',
          duration: 0.55,
          ease: 'power2.in',
        })

        exitTl.to(
          containerRef.current,
          { opacity: 0, duration: 0.8, ease: 'power3.inOut' },
          '-=0.4'
        )
      }

      let currentVal = 1
      setProgress(1)
      const STEP_DURATION = 60 // 60ms/percent ≈ 6s total, same cadence as before

      const applyProgress = (val) => {
        const totalMin = START_TOTAL_MIN + (SWEEP_MIN * (val - 1)) / 99
        const { hourAngle: h, minuteAngle: m } = angleFor(totalMin)
        setHourAngle(h)
        setMinuteAngle(m)
        setProgress(val)
      }

      const progressTimer = setInterval(() => {
        currentVal += 1
        if (currentVal >= 100) {
          currentVal = 100
          applyProgress(100)
          clearInterval(progressTimer)
          setIsReady(true)
          setStatusText('START WORK')
          gsap.delayedCall(0.4, triggerExitTransition)
        } else {
          applyProgress(currentVal)
        }
      }, STEP_DURATION)

      return () => clearInterval(progressTimer)
    }, containerRef)

    return () => {
      document.body.style.overflow = prevOverflow
      ctx.revert()
    }
  }, [onComplete])

  const ticks = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div
      ref={containerRef}
      className="portfolio-preloader-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: COLOR_RED,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* ── Film grain over the flat red field ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage: `url("${GRAIN_DATA_URI}")`,
          opacity: 0.16,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* ── Sketchy wall clock ── */}
        <div
          ref={clockRef}
          style={{
            position: 'relative',
            width: 'min(1000px, 140vw)',
            height: 'min(1000px, 140vw)',
          }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <defs>
              {/* Hand-drawn wobble: displaces straight geometry into shaky ink lines */}
              <filter id="sketchy" x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
              </filter>
              <filter id="sketchyBold" x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
              </filter>
            </defs>

            <g filter="url(#sketchy)">
              {/* Outer circle */}
              <circle cx="100" cy="100" r="88" fill="none" stroke={COLOR_INK} strokeWidth="1.6" />

              {/* Hour ticks */}
              {ticks.map((i) => {
                const angle = (i / 12) * 360
                const rad = (angle * Math.PI) / 180
                const r1 = 78
                const r2 = 86
                const x1 = 100 + r1 * Math.sin(rad)
                const y1 = 100 - r1 * Math.cos(rad)
                const x2 = 100 + r2 * Math.sin(rad)
                const y2 = 100 - r2 * Math.cos(rad)
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={COLOR_INK}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                )
              })}
            </g>

            {/* Minute hand — long, hooked tip */}
            <g
              transform={`rotate(${minuteAngle} 100 100)`}
              filter="url(#sketchyBold)"
            >
              <path
                d="M100,100 L100,26 Q97,20 91,23"
                fill="none"
                stroke={COLOR_INK}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>

            {/* Hour hand — shorter, diagonal, hooked tip */}
            <g
              transform={`rotate(${hourAngle} 100 100)`}
              filter="url(#sketchyBold)"
            >
              <path
                d="M100,100 L100,52 Q98,46 92,49"
                fill="none"
                stroke={COLOR_INK_SOFT}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {/* Percentage readout, centered on the clock */}
          <div
            className="preloader-fade-item"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Permanent Marker', cursive",
              fontSize: 'clamp(40px, 7vw, 64px)',
              color: COLOR_INK,
              fontVariantNumeric: 'tabular-nums',
              pointerEvents: 'none',
            }}
          >
            {progress}%
          </div>
        </div>

        {/* Status line */}
        <div
          className="preloader-fade-item"
          style={{
            marginTop: '26px',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: '12px',
            letterSpacing: '0.32em',
            color: COLOR_INK,
            opacity: isReady ? 1 : 0.72,
            textTransform: 'uppercase',
            transition: 'opacity 0.4s ease',
          }}
        >
          {statusText}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Space+Grotesk:wght@400;500;600&display=swap');

        @media (prefers-reduced-motion: reduce) {
          .portfolio-preloader-root * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}