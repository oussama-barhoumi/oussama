import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MangaArrowProps {
  isActive: boolean;
  className?: string;
}

export const MangaArrow: React.FC<MangaArrowProps> = ({
  isActive,
  className = '',
}) => {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const shaft = containerRef.current.querySelector('.arrow-shaft');
    const head = containerRef.current.querySelector('.arrow-head');

    if (isActive) {
      const tl = gsap.timeline();
      tl.fromTo(
        shaft,
        { strokeDasharray: 60, strokeDashoffset: 60, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      ).fromTo(
        head,
        { strokeDasharray: 30, strokeDashoffset: 30, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' },
        '-=0.1'
      );
    } else {
      gsap.to([shaft, head], { opacity: 0, duration: 0.15 });
    }
  }, [isActive]);

  return (
    <svg
      ref={containerRef}
      width="54"
      height="28"
      viewBox="0 0 54 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-arrow ${className}`}
      aria-hidden="true"
    >
      <path
        className="arrow-shaft"
        d="M 4 20 C 18 6, 36 8, 48 14"
        stroke="#2B2620"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        className="arrow-head"
        d="M 38 10 L 48 14 L 42 22"
        stroke="#2B2620"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
