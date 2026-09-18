import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

if (typeof window !== 'undefined') {
  window.gsap = gsap;
}

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export default function ScrambleTextCursorEffect({
  text = `I help brands and businesses turn ideas into modern digital experiences. From UI/UX design and high-performance websites to 3D experiences and AI-powered solutions, I combine design, code, and technology to build products that look great, feel unique, and actually solve problems.`,

  className = '',
  style = {},

  // =========================
  // POSITION CONTROLS
  // =========================
  top = 0,
  left = 0,
  width = '100%',
  maxWidth = '700px',

  // =========================
  // EFFECT CONTROLS
  // =========================
  radius = 90,
  chars = '.:',
  speed = 0.5,
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;

    const st = SplitText.create(textRef.current, {
      type: 'chars,words',
      charsClass: 'scramble-char',
      wordsClass: 'scramble-word',
    });

    // Save original character content
    st.chars.forEach((char) => {
      const original = char.textContent || '';
      char.dataset.original = original;
    });

    const textBlock = containerRef.current;

    if (!textBlock) return;

    const onPointerMove = (e) => {
      st.chars.forEach((char) => {
        const original = char.dataset.original || '';

        // Ignore spaces
        if (!original.trim()) return;

        const rect = char.getBoundingClientRect();

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
          const intensity = 1 - distance / radius;

          gsap.to(char, {
            duration: 0.2 + intensity * 0.4,
            overwrite: true,

            scrambleText: {
              text: original,
              chars,
              speed,
            },

            ease: 'none',
          });
        }
      });
    };

    const onPointerLeave = () => {
      st.chars.forEach((char) => {
        const original = char.dataset.original || '';

        if (!original.trim()) return;

        gsap.to(char, {
          duration: 0.4,
          overwrite: true,

          scrambleText: {
            text: original,
            chars,
            speed,
          },

          ease: 'none',
        });
      });
    };

    textBlock.addEventListener('pointermove', onPointerMove);
    textBlock.addEventListener('pointerleave', onPointerLeave);

    return () => {
      textBlock.removeEventListener('pointermove', onPointerMove);
      textBlock.removeEventListener('pointerleave', onPointerLeave);

      gsap.killTweensOf(st.chars);

      st.revert();
    };
  }, [text, radius, chars, speed]);

  return (
    <>
      <div
        ref={containerRef}
        className={`scramble-text-container ${className}`}
        style={{
          // =================================
          // POSITION
          // =================================
          position: 'relative',

          top: top,
          left: left,

          width: width,
          maxWidth: maxWidth,

          // =================================
          // TEXT
          // =================================
          fontFamily: "'Panchang', sans-serif",
          fontWeight: 400,
          fontStyle: 'normal',

          fontSize: 'clamp(11px, 0.88vw, 13.5px)',
          lineHeight: 1.7,
          letterSpacing: '0.01em',

          color: 'rgba(255, 255, 255, 0.82)',

          // =================================
          // BEHAVIOR
          // =================================
          cursor: 'crosshair',
          userSelect: 'none',

          ...style,
        }}
      >
        <p
          ref={textRef}
          style={{
            margin: '0px',
            marginTop: '70px',
            padding: '0px',

            // Important:
            // keeps the text layout stable
            position: 'relative',

          }}
        >
          {text}
        </p>
      </div>

      <style>{`
        .scramble-word {
          position: relative !important;
          display: inline-block !important;
        
        }

        .scramble-word::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.42);
          border-radius: 1px;
          pointer-events: none;
        }

        .scramble-char {
          display: inline;
          white-space: pre;
        }

        .scramble-text-container {
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
}