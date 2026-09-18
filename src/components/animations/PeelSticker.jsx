import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

/**
 * PeelSticker — Interactive sticker peeling animation on hover
 * Clean peel effect:
 *  - No drop shadows or box shadows
 *  - No white backing or glaze overlays
 *  - Keeps only the pure image
 */
export default function PeelSticker({
  src = '/img/doctor.png',
  alt = 'Sticker',
  className = '',
  style = {},
}) {
  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const frontRef = useRef(null)
  const backRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const sticky = stickyRef.current
    const front = frontRef.current
    const back = backRef.current

    if (!container || !sticky || !front || !back) return

    // Initialize clean states
    gsap.set(sticky, {
      rotation: 0,
      scale: 1,
      transformOrigin: 'top left',
    })

    gsap.set(front, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    })

    gsap.set(back, {
      clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
      rotateX: 0,
      rotateZ: 0,
      y: 0,
      opacity: 0,
      transformOrigin: '50% 70%',
    })

    // GSAP Peel Timeline
    const tl = gsap.timeline({
      paused: true,
      defaults: {
        ease: 'power1.inOut',
        duration: 0.75,
      },
    })

    tl
      // 1) Slight physical tilt of the sticker body as it peels
      .to(
        sticky,
        {
          rotation: 8,
          scale: 1.02,
          duration: 0.75,
        },
        0
      )
      // 2) Unpeeled front face clips along the fold
      .to(
        front,
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 62%, 0% 76%)',
          duration: 0.75,
        },
        0
      )
      // 3) Back flap lifts and folds over in 3D
      .to(
        back,
        {
          opacity: 1,
          clipPath: 'polygon(0% 76%, 100% 62%, 100% 100%, 0% 100%)',
          rotateX: 172,
          rotateZ: -5,
          y: -14,
          duration: 0.75,
        },
        0
      )

    timelineRef.current = tl

    const handleMouseEnter = () => tl.play()
    const handleMouseLeave = () => tl.reverse()

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      tl.kill()
    }
  }, [])

  return (
    <div
      id="Awesome"
      ref={containerRef}
      className={`peel-sticker-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        userSelect: 'none',
        background: 'transparent',
        ...style,
      }}
    >
      <div
        ref={stickyRef}
        className="sticky"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          background: 'transparent',
        }}
      >
        {/* Front Unpeeled Face — Just the image, no shadow, no white */}
        <div
          ref={frontRef}
          className="front"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
            background: 'transparent',
            willChange: 'clip-path',
          }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Peeled Flap — Just the image, no shadow, no white */}
        <div
          ref={backRef}
          className="back"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3,
            background: 'transparent',
            transformStyle: 'preserve-3d',
            willChange: 'transform, clip-path, opacity',
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'brightness(0.9)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}
