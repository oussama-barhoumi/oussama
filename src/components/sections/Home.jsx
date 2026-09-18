import React, { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import gsap from 'gsap';
import LogoCanvas from '../3d/LogoCanvas';
import HollowKnightCanvas from '../3d/HollowKnightCanvas';
import HollowKnightNav from '../navigation/HollowKnightNav';
import MarqueeText from './MarqueeText';
import ScrambleTextCursorEffect from '../animations/ScrambleTextCursorEffect';

/**
 * Home
 *
 * ARCHITECTURE CHANGE:
 * Home is now pre-mounted under the Hero from the start of the portfolio
 * experience (once the preloader finishes). It accepts a `revealed` prop
 * that controls when its entrance mask animation plays.
 *
 * - `revealed=false` (default): masks are hidden via GSAP.set; no animation fires.
 * - `revealed=true`: playMaskAnimation() fires — same animation as before,
 *   synchronized with the moment MeltReveal's paint finishes covering the Hero.
 *
 * This ensures Home is never "cold mounted" mid-transition. It already exists
 * underneath the Hero and is simply unveiled by the paint.
 */
export default function Home({ revealed = false }) {
  const leftMaskRef = useRef(null);
  const rightMaskRef = useRef(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navTimerRef = useRef(null);

  const handleOpenNav = useCallback(() => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    setIsNavOpen(true);
  }, []);

  const handleCloseNav = useCallback(() => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      setIsNavOpen(false);
    }, 200);
  }, []);

  const playMaskAnimation = useCallback(() => {
    if (!leftMaskRef.current || !rightMaskRef.current) return;

    const leftEl = leftMaskRef.current;
    const rightEl = rightMaskRef.current;

    // Clear any active tweens
    gsap.killTweensOf([leftEl, rightEl]);

    // Initial state: off-screen on the left/right with 3D rotation Y
    const offscreenDistance = Math.max(window.innerWidth * 0.95, 1200);

    gsap.set(leftEl, {
      x: -offscreenDistance,
      rotationY: -180,
      opacity: 0,
      scale: 1.12,
      transformOrigin: 'right center',
    });

    gsap.set(rightEl, {
      x: offscreenDistance,
      rotationY: 180,
      opacity: 0,
      scale: 1.12,
      transformOrigin: 'left center',
    });

    const tl = gsap.timeline({
      delay: 0.35,
    });

    tl.to(
      leftEl,
      {
        x: 0,
        rotationY: 0,
        opacity: 1,
        scale: 1,
        duration: 1.6,
        ease: 'power3.out',
      },
      0
    );

    tl.to(
      rightEl,
      {
        x: 0,
        rotationY: 0,
        opacity: 1,
        scale: 1,
        duration: 1.6,
        ease: 'power3.out',
      },
      0
    );
  }, []);

  // ── Hide masks synchronously before the first paint ───────────────────────
  // Ensures the mask elements are invisible while Home sits under the Hero.
  // useLayoutEffect fires before the browser paints — no flash of visible masks.
  useLayoutEffect(() => {
    if (leftMaskRef.current && rightMaskRef.current) {
      gsap.set([leftMaskRef.current, rightMaskRef.current], { opacity: 0 });
    }
  }, []);

  // ── Fire entrance animation once the paint reveal completes ───────────────
  useEffect(() => {
    if (revealed) {
      playMaskAnimation();
    }
  }, [revealed, playMaskAnimation]);

  // Dev shortcut: Press 'm' or 'M' to replay the mask animation anytime
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey) {
        playMaskAnimation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playMaskAnimation]);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#040001',
        backgroundImage:
          'radial-gradient(ellipse at 65% 45%, rgba(225, 10, 10, 0.92) 0%, rgba(160, 5, 5, 0.7) 35%, rgba(60, 2, 2, 0.4) 65%, #040001 85%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes maskSubtleGlow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(225, 20, 20, 0.75)) drop-shadow(0 0 22px rgba(255, 30, 30, 0.45)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.95));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(255, 40, 40, 0.95)) drop-shadow(0 0 32px rgba(230, 20, 20, 0.65)) drop-shadow(0 4px 18px rgba(0, 0, 0, 1));
          }
        }
        .home-role-item:hover {
          color: #ffffff !important;
          transform: translateX(-4px);
          text-shadow: 0 0 14px rgba(255, 60, 60, 0.7);
        }
      `}</style>

      {/* Ambient rim light behind the right shoulder to match photo lighting */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          right: '28%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255, 30, 30, 0.5) 0%, rgba(200, 10, 10, 0.25) 50%, transparent 75%)',
          filter: 'blur(70px)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Top-left: Logo + ScrambleText Cursor Effect underneath */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(16px, 2.5vh, 32px)',
          left: 'clamp(28px, 3.8vw, 52px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          maxWidth: 'clamp(340px, 38vw, 600px)',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '150px',
            height: '150px',
            position: 'relative',
            marginLeft: '-15px',
            marginTop: '-10px',
          }}
        >
          <LogoCanvas
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              right: 'auto',
            }}
          />
        </div>

        <ScrambleTextCursorEffect
          text="I help brands and businesses turn ideas into modern digital experiences. From UI/UX design and high-performance websites to 3D experiences and AI-powered solutions, I combine design, code, and technology to build products that look great, feel unique, and actually solve problems."
        />
      </div>

      {/* Top Navigation: Hollow Knight Pure Nail Links with Dust Dissolve */}
      <HollowKnightNav
        isOpen={isNavOpen}
        onMouseEnter={handleOpenNav}
        onMouseLeave={handleCloseNav}
      />

      {/* Top-right: 3D Interactive Hollow Knight */}
      <HollowKnightCanvas
        isNavOpen={isNavOpen}
        onHoverStart={handleOpenNav}
        onHoverEnd={handleCloseNav}
      />

      {/* Infinite horizontal marquee — vertically centred */}
      <MarqueeText />

      {/* Subject.png + Face Masks container */}
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 6,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onClick={playMaskAnimation}
        title="Click to replay mask animation"
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            lineHeight: 0,
          }}
        >
          {/* Subject portrait */}
          <img
            src="/img/Subject.png"
            alt="Subject"
            style={{
              height: '88vh',
              maxHeight: '92vh',
              maxWidth: '90vw',
              objectFit: 'contain',
              display: 'block',
              opacity: 1,
              clipPath: 'inset(2px 0 150px 0)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0px, transparent 5px, rgba(0,0,0,1) 48px, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 98%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0px, transparent 8px, rgba(0,0,0,1) 48px, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 98%)',
              filter: 'drop-shadow(0 20px 45px rgba(0, 0, 0, 0.8))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          {/* 3D Perspective Container for Converging Face Masks (Massive Hero Scale) */}
          <div
            style={{
              position: 'absolute',
              top: '3%',
              left: '42%',
              transform: 'translateX(-50%)',
              width: '118%',
              height: '88%',
              pointerEvents: 'none',
              perspective: '1400px',
              transformStyle: 'preserve-3d',
              zIndex: 7,
            }}
          >
            {/* Left mask: face.masek1.png (duplicated & mirrored opposite direction) */}
            <div
              ref={leftMaskRef}
              style={{
                position: 'absolute',
                top: 0,
                right: '20%',
                width: '65%',
                height: '100%',
                transformOrigin: '100% center',
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src="/img/face.masek1.png"
                alt="face masek 1"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'right center',
                  animation: 'maskSubtleGlow 3s ease-in-out infinite',
                  userSelect: 'none',
                }}
              />
            </div>

            {/* Right mask: face.masek.png */}
            <div
              ref={rightMaskRef}
              style={{
                position: 'absolute',
                top: 0,
                left: '35%',
                width: '65%',
                height: '100%',
                transformOrigin: '8% center',
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src="/img/face.masek.png"
                alt="face masek"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  animation: 'maskSubtleGlow 3s ease-in-out infinite',
                  userSelect: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-right: Storyteller, UI/UX Designer, Fullstack Developer, AI & LLM Focus */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(80px, 15vh, 200px)',
          right: 'clamp(28px, 4.2vw, 56px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 'clamp(14px, 1vh, 20px)',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {[
          'Storyteller',
          'UI/UX Designer',
          'Fullstack Developer',
          'AI & LLM Focus',
        ].map((role) => (
          <div
            key={role}
            className="home-role-item"
            style={{
              fontFamily:
                "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.72)',
              cursor: 'default',
              textAlign: 'right',
              transition:
                'color 0.25s ease, transform 0.25s ease, text-shadow 0.25s ease',
            }}
          >
            {role}
          </div>
        ))}
      </div>
    </div>
  );
}
