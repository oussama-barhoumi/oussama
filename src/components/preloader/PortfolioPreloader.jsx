import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'


export default function PortfolioPreloader({ onComplete }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const contentRef = useRef(null)
  const [progress, setProgress] = useState(1)
  const [statusText, setStatusText] = useState('INITIALIZING BMO')
  const [isSystemReady, setIsSystemReady] = useState(false)


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)


    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const BUG_COUNT = window.innerWidth < 768 ? 5 : 8

    class Bug {
      constructor() {
        this.reset(true)
      }

      reset(initial = false) {

        if (initial) {
          this.x = Math.random() * width
          this.y = Math.random() * height
        } else {

          const edge = Math.floor(Math.random() * 4)
          if (edge === 0) {
            this.x = Math.random() * width
            this.y = -20
          } else if (edge === 1) {
            this.x = width + 20
            this.y = Math.random() * height
          } else if (edge === 2) {
            this.x = Math.random() * width
            this.y = height + 20
          } else {
            this.x = -20
            this.y = Math.random() * height
          }
        }

        this.angle = Math.random() * Math.PI * 2
        this.targetAngle = this.angle
        this.speed = 0.35 + Math.random() * 0.75
        this.baseSpeed = this.speed
        this.turnSpeed = 0.03 + Math.random() * 0.04

        this.size = 5.5 + Math.random() * 3.5
        this.width = this.size * 0.45
        this.legs = 6
        this.stepCycle = Math.random() * Math.PI * 2


        this.state = 'crawling'
        this.stateTimer = 60 + Math.random() * 140


        this.baseOpacity = 0.08 + Math.random() * 0.09
        this.opacity = this.baseOpacity
        this.fadePhase = Math.random() * Math.PI
      }

      update() {
        if (prefersReducedMotion) return

        this.stateTimer--
        if (this.stateTimer <= 0) {
          const r = Math.random()
          if (r < 0.3) {
            this.state = 'pausing'
            this.stateTimer = 30 + Math.random() * 60
          } else if (r < 0.5) {
            this.state = 'scurrying'
            this.stateTimer = 40 + Math.random() * 60
            this.speed = this.baseSpeed * 1.8
          } else {
            this.state = 'crawling'
            this.stateTimer = 90 + Math.random() * 150
            this.speed = this.baseSpeed
          }
          this.targetAngle += (Math.random() - 0.5) * 1.8
        }


        const centerX = width / 2
        const centerY = height / 2
        const distFromCenter = Math.hypot(this.x - centerX, this.y - centerY)
        if (distFromCenter < 220) {
          const repelAngle = Math.atan2(this.y - centerY, this.x - centerX)
          this.targetAngle = repelAngle + (Math.random() - 0.5) * 0.6
        }


        let diff = this.targetAngle - this.angle
        while (diff < -Math.PI) diff += Math.PI * 2
        while (diff > Math.PI) diff -= Math.PI * 2
        this.angle += diff * this.turnSpeed

        if (this.state !== 'pausing') {
          this.x += Math.cos(this.angle) * this.speed
          this.y += Math.sin(this.angle) * this.speed
          this.stepCycle += this.speed * 0.35
        } else {
          // Subtle antenna twitch when pausing
          this.stepCycle += 0.04
        }

        // Natural fading into darkness
        this.fadePhase += 0.015
        const breathing = 0.8 + 0.2 * Math.sin(this.fadePhase)
        this.opacity = this.baseOpacity * breathing

        // Boundary wrap with margin
        const margin = 40
        if (this.x < -margin) this.x = width + margin
        if (this.x > width + margin) this.x = -margin
        if (this.y < -margin) this.y = height + margin
        if (this.y > height + margin) this.y = -margin
      }

      draw(c) {
        c.save()
        c.translate(this.x, this.y)
        c.rotate(this.angle + Math.PI / 2)

        const strokeColor = `rgba(185, 205, 195, ${this.opacity})`
        const fillColor = `rgba(160, 185, 175, ${this.opacity * 0.9})`

        c.strokeStyle = strokeColor
        c.fillStyle = fillColor
        c.lineWidth = 0.85
        c.lineCap = 'round'

        // 1. Jointed Legs (3 pairs)
        for (let i = 0; i < 3; i++) {
          const legY = (i - 1) * (this.size * 0.42)
          const legPhase = this.stepCycle + i * 1.6
          const wave = Math.sin(legPhase) * 2.2

          // Left leg
          c.beginPath()
          c.moveTo(-this.width * 0.6, legY)
          const midXLeft = -this.width * 1.5 - 2
          const midYLeft = legY + wave * 0.6
          const endXLeft = -this.width * 2.5 - 3
          const endYLeft = legY + (i === 0 ? -2 : i === 2 ? 3 : 0) + wave
          c.lineTo(midXLeft, midYLeft)
          c.lineTo(endXLeft, endYLeft)
          c.stroke()

          // Right leg
          c.beginPath()
          c.moveTo(this.width * 0.6, legY)
          const midXRight = this.width * 1.5 + 2
          const midYRight = legY - wave * 0.6
          const endXRight = this.width * 2.5 + 3
          const endYRight = legY + (i === 0 ? -2 : i === 2 ? 3 : 0) - wave
          c.lineTo(midXRight, midYRight)
          c.lineTo(endXRight, endYRight)
          c.stroke()
        }

        // 2. Body (Abdomen + Thorax segments)
        // Abdomen
        c.beginPath()
        c.ellipse(
          0,
          this.size * 0.28,
          this.width * 0.72,
          this.size * 0.48,
          0,
          0,
          Math.PI * 2
        )
        c.fill()

        // Thorax
        c.beginPath()
        c.ellipse(
          0,
          -this.size * 0.18,
          this.width * 0.6,
          this.size * 0.28,
          0,
          0,
          Math.PI * 2
        )
        c.fill()

        // 3. Head
        c.beginPath()
        c.arc(0, -this.size * 0.55, this.width * 0.42, 0, Math.PI * 2)
        c.fill()

        // 4. Subtle Antennae with micro-twitch
        const twitch = Math.sin(this.stepCycle * 1.5) * 0.18
        c.beginPath()
        c.moveTo(-this.width * 0.25, -this.size * 0.65)
        c.quadraticCurveTo(
          -this.width * 1.2,
          -this.size * 1.1 + twitch * 2,
          -this.width * 1.5,
          -this.size * 1.5 + twitch * 4
        )
        c.stroke()

        c.beginPath()
        c.moveTo(this.width * 0.25, -this.size * 0.65)
        c.quadraticCurveTo(
          this.width * 1.2,
          -this.size * 1.1 - twitch * 2,
          this.width * 1.5,
          -this.size * 1.5 - twitch * 4
        )
        c.stroke()

        c.restore()
      }
    }

    const bugs = Array.from({ length: BUG_COUNT }, () => new Bug())

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      for (const bug of bugs) {
        bug.update()
        bug.draw(ctx)
      }
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Progress Counter, Telemetry & Exit Choreography (GSAP)
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Prevent document scrolling during preloader
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      // Entrance animation for typography
      gsap.fromTo(
        '.preloader-fade-item',
        { opacity: 0, y: 14, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.14,
          ease: 'power3.out',
        }
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
          y: -12,
          filter: 'blur(6px)',
          duration: 0.6,
          ease: 'power2.in',
        })

        exitTl.to(
          canvasRef.current,
          {
            opacity: 0,
            scale: 1.06,
            duration: 0.75,
            ease: 'power2.inOut',
          },
          '-=0.45'
        )

        exitTl.to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.85,
            ease: 'power3.inOut',
          },
          '-=0.65'
        )
      }

      // Smooth, sequential 1% to 100% progress counter (strictly one by one)
      let currentVal = 1
      setProgress(1)

      const STEP_DURATION = 60 // 60ms per percentage => ~6s total smooth progression

      const progressTimer = setInterval(() => {
        currentVal += 1
        if (currentVal >= 100) {
          currentVal = 100
          setProgress(100)
          clearInterval(progressTimer)

          setIsSystemReady(true)
          setStatusText('SYSTEM READY')

          gsap.delayedCall(0.4, () => {
            triggerExitTransition()
          })
        } else {
          setProgress(currentVal)
        }
      }, STEP_DURATION)

      return () => {
        clearInterval(progressTimer)
      }
    }, containerRef)

    return () => {
      document.body.style.overflow = prevOverflow
      ctx.revert()
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="portfolio-preloader-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#060607',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* ── Background Bugs Canvas ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Subtle Vignette & Screen Noise Mask ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background:
            'radial-gradient(ellipse at center, rgba(6,6,7,0.2) 0%, rgba(6,6,7,0.85) 75%, #060607 100%)',
        }}
      />

      {/* ── Center Typography & Telemetry Container ── */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '90vw',
          padding: '0 20px',
        }}
      >
        {/* Japanese manga/digital accent */}
        <div
          className="preloader-fade-item"
          style={{
            fontFamily: "'Klee One', 'Space Grotesk', system-ui, sans-serif",
            fontSize: '11px',
            letterSpacing: '0.35em',
            color: '#6E6B65',
            marginBottom: '14px',
            textTransform: 'uppercase',
          }}
        >
          [ デジタル・ワールド ]
        </div>

        {/* Main Title: OUSSAMA on top, BARHOUMI below in Adventure Time font */}
        <h1
          className="preloader-fade-item"
          style={{
            fontFamily: "'Adventure Time Logo', cursive, sans-serif",
            fontSize: 'clamp(36px, 6.2vw, 62px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            color: '#F4F1EA',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
            lineHeight: 0.96,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            textShadow: '0 0 24px rgba(244, 241, 234, 0.2)',
          }}
        >
          <span>OUSSAMA</span>
          <span>BARHOUMI</span>
        </h1>

        {/* Subtitle: DIGITAL WORLD */}
        <div
          className="preloader-fade-item"
          style={{
            fontFamily:
              "'Space Grotesk', 'Syne', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 'clamp(11px, 1.8vw, 14px)',
            fontWeight: 500,
            letterSpacing: '0.42em',
            color: '#9C988F',
            textTransform: 'uppercase',
            marginBottom: '30px',
          }}
        >
          Digital World
        </div>

        {/* Adventure Time Demon Blood Sword Progress Meter */}
        <div
          className="preloader-fade-item"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Sword Gauge Container */}
          <div
            style={{
              position: 'relative',
              width: 'min(580px, 90vw)',
              height: '170px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '2px 0 6px 0',
            }}
          >
            {/* Active Filled Sword (Revealed with progress from 1% to 100%) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                clipPath: `inset(0 ${100 - progress}% 0 0)`,
                transition: 'clip-path 0.03s linear',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <img
                src="/img/sowerd.png"
                alt="Sword Progress"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'scaleX(-1)',
                  filter: isSystemReady
                    ? 'brightness(1.2) drop-shadow(0 0 14px rgba(255, 77, 77, 0.8))'
                    : 'brightness(1.05)',
                  transition: 'filter 0.35s ease',
                  userSelect: 'none',
                }}
              />
            </div>
          </div>

          {/* Status Text & Dynamic Percentage */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 'min(580px, 90vw)',
              fontFamily:
                "'Space Grotesk', 'Courier New', Courier, monospace",
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: isSystemReady ? '#64E3A8' : '#8A8780',
              transition: 'color 0.3s ease',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: isSystemReady ? '#64E3A8' : '#E87A5D',
                  boxShadow: isSystemReady ? '0 0 6px #64E3A8' : '0 0 6px #E87A5D',
                  animation: 'bmoPulse 1.2s ease-in-out infinite',
                }}
              />
              {statusText}
            </span>
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: isSystemReady ? '#64E3A8' : '#E5E2DA',
                fontWeight: 600,
              }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Subtitle and Pulse Animation Keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        @font-face {
          font-family: 'Adventure Time Logo';
          src: url('/fonts/AdventureTimeLogo.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @keyframes bmoPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.7);
          }
        }
      `}</style>
    </div>
  )
}
