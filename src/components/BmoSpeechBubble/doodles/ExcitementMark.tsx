import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  isActive: boolean;
  className?: string;
}

export const ExcitementMark: React.FC<Props> = ({ isActive, className = '' }) => {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const shaft = containerRef.current.querySelector('.ex-shaft');
    const dot = containerRef.current.querySelector('.ex-dot');

    if (isActive) {
      const tl = gsap.timeline();
      tl.fromTo(
        shaft,
        { strokeDasharray: 40, strokeDashoffset: 40, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
      ).fromTo(
        dot,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.15, ease: 'back.out(2)' },
        '-=0.08'
      );
    } else {
      gsap.to([shaft, dot], { opacity: 0, duration: 0.15 });
    }
  }, [isActive]);

  return (
    <svg
      ref={containerRef}
      width="28"
      height="44"
      viewBox="0 0 28 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-excitement ${className}`}
      aria-hidden="true"
    >
      <path
        className="ex-shaft"
        d="M 14 4 C 13.5 12, 14.5 20, 14 28"
        stroke="#2B2620"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle className="ex-dot" cx="14" cy="38" r="2.5" fill="#2B2620" />
    </svg>
  );
};
