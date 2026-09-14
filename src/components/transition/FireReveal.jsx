import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * FireReveal
 * ─────────────────────────────────────────────────────────────────────────────
 * A high-end cinematic fire reveal transition.
 *
 * It renders a fullscreen dark layer that catches fire at the BOTTOM EDGE of
 * the viewport. An organic, turbulent fire boundary burns upward progressively,
 * peeling away the dark sheet to reveal the Home page underneath.
 *
 * Implementation:
 *  - High-performance Canvas 2D procedural rendering (zero WebGL context conflicts)
 *  - Irregular, ever-changing organic flame boundary with multi-octave turbulence
 *  - Dominant dark crimson / deep wine burgundy (#200408, #5a0a12, #94151e)
 *  - Restrained warm incandescent core at the active burning seam (#e04812, #ffcf8a)
 *  - 65 buoyant glowing ember particles that rise with thermal updrafts and flicker
 *  - Soft light spill and heat shimmer ripples immediately ahead of the flames
 *  - Completely unmounts upon completion, leaving zero ongoing overhead
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Simple, fast pseudo-noise for organic flame turbulence
function pseudoNoise(x, t) {
  return (
    Math.sin(x * 0.012 + t * 2.8) * 0.45 +
    Math.sin(x * 0.028 - t * 4.2) * 0.28 +
    Math.sin(x * 0.065 + t * 6.5) * 0.17 +
    Math.sin(x * 0.13 - t * 9.1) * 0.10
  )
}

function tongueNoise(x, t) {
  // Sharp licking flame tongues
  const n = Math.sin(x * 0.035 + t * 3.5) * Math.cos(x * 0.018 - t * 2.2)
  return Math.max(0, n * n * n)
}

export default function FireReveal({ active, onComplete }) {
  const canvasRef = useRef(null)
  const animFrameIdRef = useRef(null)
  const progressRef = useRef({ value: 0 })
  const tweenRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // ── Ember Particles ─────────────────────────────────────────────────────
    const embers = []
    const MAX_EMBERS = 65

    const spawnEmber = (burnFrontY) => {
      embers.push({
        x: Math.random() * width,
        y: burnFrontY + (Math.random() * 40 - 15),
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(Math.random() * 2.8 + 1.8), // rising thermal updraft
        size: 1.2 + Math.random() * 2.6,
        life: 0,
        maxLife: 45 + Math.random() * 55,
        wobbleSpeed: 0.06 + Math.random() * 0.07,
        wobblePhase: Math.random() * Math.PI * 2,
        isHot: Math.random() > 0.35,
      })
    }

    // ── Start GSAP Progress Sweep ───────────────────────────────────────────
    progressRef.current.value = 0.0
    const startTime = performance.now()

    tweenRef.current = gsap.to(progressRef.current, {
      value: 1.16,
      duration: 3.9,
      ease: 'power2.inOut',
      onComplete: () => {
        // Allow remaining airborne embers to dissipate naturally
        setTimeout(() => {
          if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
          onComplete?.()
        }, 800)
      },
    })

    // ── Render Loop ─────────────────────────────────────────────────────────
    const render = (now) => {
      const elapsed = (now - startTime) * 0.001
      const prog = progressRef.current.value

      ctx.clearRect(0, 0, width, height)

      // Calculate the burning boundary points across the viewport width
      // Sample every 3px for high fidelity and 60 FPS smoothness
      const step = 3
      const numPoints = Math.ceil(width / step) + 1
      const points = new Float32Array(numPoints)

      // Total burn height: sweeps from slightly below viewport (height + 60) to past top (-120)
      const baseBurnY = height - prog * (height + 200) + 40

      let avgBurnY = 0

      for (let i = 0; i < numPoints; i++) {
        const x = i * step

        // Macroscopic slow wave
        const macro =
          Math.sin(x * 0.003 + elapsed * 0.9) * 28 +
          Math.cos(x * 0.007 - elapsed * 1.3) * 18 +
          Math.sin(x * 0.015 + elapsed * 2.1) * 10

        // Medium turbulence
        const turb = pseudoNoise(x, elapsed) * 32

        // Sharp leaping flame tongues
        const tongues = tongueNoise(x, elapsed) * 55

        // Resulting Y coordinate of this column's flame tip
        const y = baseBurnY + macro - turb - tongues
        points[i] = y
        avgBurnY += y
      }
      avgBurnY /= numPoints

      // ── 1. The Unburned Black Sheet (Above Burn Line) ─────────────────────
      // Completely conceals the Home page until burned away
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width, 0)
      ctx.lineTo(width, points[numPoints - 1])

      for (let i = numPoints - 1; i >= 0; i--) {
        ctx.lineTo(i * step, points[i])
      }
      ctx.closePath()
      ctx.fillStyle = '#000000'
      ctx.fill()
      ctx.restore()

      // ── 2. Layered Organic Flame Bands ────────────────────────────────────
      // Drawn along the active burning boundary

      // Band A: Outer Deep Wine Burgundy Glow (Large atmospheric halo)
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < numPoints; i++) {
        const x = i * step
        const y = points[i] + 4
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineWidth = 42
      ctx.strokeStyle = 'rgba(70, 8, 14, 0.55)'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()

      // Band B: Dark Crimson Flame Body
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < numPoints; i++) {
        const x = i * step
        const y = points[i] + 8
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineWidth = 22
      ctx.strokeStyle = 'rgba(155, 20, 26, 0.85)'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()

      // Band C: Core Fiery Heat (Restrained warm orange / deep red)
      const coreFlicker = 0.85 + Math.sin(elapsed * 24) * 0.15
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < numPoints; i++) {
        const x = i * step
        const y = points[i] + 12
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineWidth = 10
      ctx.strokeStyle = `rgba(235, 82, 18, ${0.92 * coreFlicker})`
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()

      // Band D: Incandescent Burning Char Seam (Bright hot edge of the sheet)
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < numPoints; i++) {
        const x = i * step
        const y = points[i] + 14
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineWidth = 2.5
      ctx.strokeStyle = `rgba(255, 218, 145, ${0.95 * coreFlicker})`
      ctx.stroke()
      ctx.restore()

      // Band E: Soft Warm Light Spill below the burning edge (Ambient glow on revealed page)
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < numPoints; i++) {
        const x = i * step
        const y = points[i] + 24
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineWidth = 32
      ctx.strokeStyle = 'rgba(180, 40, 20, 0.18)'
      ctx.stroke()
      ctx.restore()

      // ── 3. Rising Glowing Embers ──────────────────────────────────────────
      // Spawn new embers along active flame front
      if (embers.length < MAX_EMBERS && prog < 1.05 && avgBurnY > -100) {
        spawnEmber(avgBurnY)
        if (Math.random() > 0.4) spawnEmber(avgBurnY)
      }

      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]
        e.life++
        e.x += e.vx + Math.sin(e.life * e.wobbleSpeed + e.wobblePhase) * 0.75
        e.y += e.vy
        e.vy *= 0.993 // aerodynamic drag

        const lifeNorm = e.life / e.maxLife
        if (lifeNorm >= 1.0 || e.y < -30) {
          embers.splice(i, 1)
          continue
        }

        const alpha =
          lifeNorm < 0.12
            ? lifeNorm / 0.12
            : Math.pow(1.0 - lifeNorm, 1.35)

        let r, g, b
        if (e.isHot) {
          r = 255
          g = Math.floor(145 + (1.0 - lifeNorm) * 75)
          b = Math.floor(45 + (1.0 - lifeNorm) * 45)
        } else {
          r = Math.floor(205 + (1.0 - lifeNorm) * 35)
          g = Math.floor(40 + (1.0 - lifeNorm) * 20)
          b = 15
        }

        const sz = e.size * (1.0 - lifeNorm * 0.35)

        // Outer glow
        ctx.beginPath()
        ctx.arc(e.x, e.y, sz * 2.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.32})`
        ctx.fill()

        // Bright kernel
        ctx.beginPath()
        ctx.arc(e.x, e.y, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.9})`
        ctx.fill()
      }
      ctx.restore()

      animFrameIdRef.current = requestAnimationFrame(render)
    }

    animFrameIdRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
      if (tweenRef.current) tweenRef.current.kill()
      window.removeEventListener('resize', handleResize)
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 101, // Sits above the Home page and black overlay
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
