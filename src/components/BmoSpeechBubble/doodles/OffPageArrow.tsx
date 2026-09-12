import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  isActive: boolean;
  className?: string;
}

export const OffPageArrow: React.FC<Props> = ({ isActive, className = '' }) => {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const shaft = containerRef.current.querySelector('.off-shaft');
    const head = containerRef.current.querySelector('.off-head');

    if (isActive) {
      const tl = gsap.timeline();
      tl.fromTo(
        shaft,
        { strokeDasharray: 80, strokeDashoffset: 80, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      ).fromTo(
        head,
        { strokeDasharray: 25, strokeDashoffset: 25, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.2, ease: 'back.out(1.5)' },
        '-=0.1'
      );
    } else {
      gsap.to([shaft, head], { opacity: 0, duration: 0.15 });
    }
  }, [isActive]);

  return (
    <svg
      ref={containerRef}
      width="64"
      height="36"
      viewBox="0 0 64 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-offpage ${className}`}
      aria-hidden="true"
    >
      <path
        className="off-shaft"
        d="M 4 28 C 22 10, 42 12, 58 20"
        stroke="#2B2620"
        strokeWidth="2.0"
        strokeLinecap="round"
      />
      <path
        className="off-head"
        d="M 48 14 L 58 20 L 50 28"
        stroke="#2B2620"
        strokeWidth="2.0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
