import React, { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  window.gsap = gsap;
}
gsap.registerPlugin(ScrollTrigger);
import LogoCanvas from '../3d/LogoCanvas';
import HollowKnightCanvas from '../3d/HollowKnightCanvas';
import HollowKnightNav from '../navigation/HollowKnightNav';
import MarqueeText from './MarqueeText';
import ScrambleTextCursorEffect from '../animations/ScrambleTextCursorEffect';
import MaskReveal, { REPLAY_EVENT } from '../MaskReveal/MaskReveal';

// ── Configurable About Me composition constants ──────────────────────────
// 3D Hollow Knight model (hollow_knight.glb) transition to About Me
export const ABOUT_KNIGHT_Y = '34vh';   // Centers 3D model vertically in About Me
export const ABOUT_KNIGHT_SCALE = 1;    // Preserve the Home size during the About transition

/**
 * Home
 *
 * ARCHITECTURE CHANGE:
 * Home is now pre-mounted under the Hero from the start of the portfolio
 * experience (once the preloader finishes). Its `revealed` prop is passed to
 * MaskReveal, which controls the entrance mask animation.
 *
 * - `revealed=false` (default): masks are hidden via GSAP.set; no animation fires.
 * - `revealed=true`: MaskReveal plays the same entrance animation as before,
 *   synchronized with the moment MeltReveal's paint finishes covering the Hero.
 *
 * This ensures Home is never "cold mounted" mid-transition. It already exists
 * underneath the Hero and is simply unveiled by the paint.
 */
export default function Home({ revealed = false }) {
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

  // ── Master ScrollTrigger Timeline: Home → About Me ───────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#new-section',
          start: 'top top',
          end: '+=140%',
          scrub: 1,
          pin: '.about-sticky-viewport',
          invalidateOnRefresh: true,
        },
      });
      // ── LAYER A: 3D Hollow Knight Model (hollow_knight.glb) Movement ──
      // Smoothly glides from Home top-right corner to intentional About Me hero position.
      // The 3D model remains visible throughout the transition and in About Me!
      masterTl.to(
        '.hollow-knight-interactive',
        {
          y: ABOUT_KNIGHT_Y,
          scale: ABOUT_KNIGHT_SCALE,
          ease: 'power1.inOut',
          duration: 0.85,
        },
        0
      );

      // ── LAYER C: Clean Typography Reveal ──────────────────────────────
      // Progressive, sharp reveal: "ABOUT ME" tag -> "OUSsAMA" -> "BARHOUMI" -> statement
      masterTl.to(
        '.about-tag',
        { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' },
        0.35
      );

      masterTl.to(
        '.about-name-first',
        { opacity: 1, y: 0, duration: 0.20, ease: 'power2.out' },
        0.45
      );

      masterTl.to(
        '.about-name-last',
        { opacity: 1, y: 0, duration: 0.20, ease: 'power2.out' },
        0.58
      );

      masterTl.to(
        '.about-statement',
        { opacity: 1, y: 0, duration: 0.20, ease: 'power2.out' },
        0.70
      );

      // ── LAYER D: Home Elements Clean Exit ─────────────────────────────
      masterTl.to(
        ['.home-marquee-wrap', '.home-roles-list', '.home-intro-left'],
        { opacity: 0, y: -24, duration: 0.30, ease: 'power1.out' },
        0.05
      );
    });
    return () => ctx.revert();
  }, []);

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
      }}
    >
      <style>{`
        .home-role-item:hover {
          font-family: 'Comico', sans-serif !important;
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
        className="home-intro-left"
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
          willChange: 'transform, opacity',
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
      <div className="home-marquee-wrap" style={{ width: '100%', willChange: 'transform, opacity' }}>
        <MarqueeText />
      </div>

      {/* Subject.png portrait (stays in Home) */}
      <div
        className="subject-container"
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
        onClick={() => window.dispatchEvent(new Event(REPLAY_EVENT))}
        title="Click to replay mask animation"
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            lineHeight: 0,
          }}
        >
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
        </div>
      </div>

      <MaskReveal revealed={revealed} />

      {/* Bottom-right: Storyteller, UI/UX Designer, Fullstack Developer, AI & LLM Focus */}
      <div
        className="home-roles-list"
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
