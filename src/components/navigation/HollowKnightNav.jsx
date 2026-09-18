import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';

const NAV_ITEMS = [
  { id: 'home', label: 'HOME', href: '#' },
  { id: 'works', label: 'WORKS', href: '#works' },
  { id: 'about', label: 'ABOUT', href: '#about' },
  { id: 'services', label: 'SERVICES', href: '#services' },
  { id: 'contact', label: 'CONTACT', num: '05', href: '#contact' },
];

export default function HollowKnightNav({ isOpen, onMouseEnter, onMouseLeave }) {
  const containerRef = useRef(null);
  const navItemsRef = useRef([]);
  const canvasRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  // ── DUST PARTICLES SYSTEM ──
  const spawnDustFromElement = useCallback((element) => {
    if (!element || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const relX = rect.left - canvasRect.left;
    const relY = rect.top - canvasRect.top;
    const w = rect.width;
    const h = rect.height;

    // Spawn 22-30 dust/ash particle motes per word
    for (let i = 0; i < 28; i++) {
      const px = relX + Math.random() * w;
      const py = relY + Math.random() * h;
      const angle = Math.PI * (0.8 + Math.random() * 0.7); // drift left and slightly up
      const speed = 1.2 + Math.random() * 3.2;

      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (0.5 + Math.random() * 1.5),
        size: 0.8 + Math.random() * 2.2,
        alpha: 0.8 + Math.random() * 0.2,
        decay: 0.02 + Math.random() * 0.035,
        color: Math.random() > 0.4 ? '#ffffff' : Math.random() > 0.5 ? '#ff3b3b' : '#ff9999',
        blur: Math.random() > 0.5 ? 2 : 0,
      });
    }
  }, []);

  const runParticleLoop = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (particlesRef.current.length > 0) {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        if (p.blur > 0) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.blur * 3;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(runParticleLoop);
    }
  }, []);

  // Update canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = 450;
        canvasRef.current.height = 300;
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // ── GSAP ENTRANCE & DUST DISINTEGRATION ──
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.set(containerRef.current, { visibility: 'visible', pointerEvents: 'auto' });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Coalesce in from delicate dust/fog
        tl.fromTo(
          navItemsRef.current,
          {
            x: -18,
            y: -6,
            opacity: 0,
            filter: 'blur(10px)',
            scale: 0.92,
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            duration: 0.45,
            stagger: 0.05,
            ease: 'back.out(1.2)',
          }
        );
      } else {
        // Dissolve each word into dust
        navItemsRef.current.forEach((el, idx) => {
          if (el) {
            setTimeout(() => spawnDustFromElement(el), idx * 40);
          }
        });

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(runParticleLoop);

        const tl = gsap.timeline({
          defaults: { ease: 'power2.in' },
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });
            }
          },
        });

        // Dust dispersion disintegration animation
        tl.to(navItemsRef.current, {
          x: () => -25 - Math.random() * 20,
          y: () => -12 - Math.random() * 15,
          opacity: 0,
          filter: 'blur(14px)',
          scale: 1.15,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out',
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, spawnDustFromElement, runParticleLoop]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label="Navigation Menu"
      style={{
        position: 'absolute',
        top: 'clamp(28px, 5vh, 48px)',
        right: 'clamp(180px, 18vw, 245px)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '14px',
        visibility: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
        background: 'transparent',
      }}
    >
      {/* Dust Particle Overlay Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-50px',
          width: '20px',
          height: '30px',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* ── VERTICALLY STACKED NAVIGATION WORDS ── */}
      {NAV_ITEMS.map((item, index) => {
        const isHovered = hoveredIndex === index;
        const isActive = activeIndex === index;

        return (
          <a
            key={item.id}
            href={item.href}
            ref={(el) => (navItemsRef.current[index] = el)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={(e) => {
              e.preventDefault();
              setActiveIndex(index);
            }}
            style={{
              display: 'block',
              width: 'fit-content',
              textDecoration: 'none',
              fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: isHovered || isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
              transition: 'color 0.2s ease, transform 0.2s ease, text-shadow 0.2s ease',
              transform: isHovered ? 'translateX(-4px)' : 'translateX(0)',
              textShadow:
                isHovered || isActive
                  ? '0 0 14px rgba(255, 60, 60, 0.95), 0 0 24px rgba(230, 20, 20, 0.6)'
                  : 'none',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
