import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MangaSpeedLinesProps {
  isActive: boolean;
  className?: string;
}

export const MangaSpeedLines: React.FC<MangaSpeedLinesProps> = ({
  isActive,
  className = '',
}) => {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lines = containerRef.current.querySelectorAll('.speed-line');

    if (isActive) {
      gsap.fromTo(
        lines,
        { strokeDasharray: 90, strokeDashoffset: 90, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 0.85,
          duration: 0.35,
          stagger: 0.05,
          ease: 'power3.out',
        }
      );
    } else {
      gsap.to(lines, { opacity: 0, duration: 0.15 });
    }
  }, [isActive]);

  return (
    <svg
      ref={containerRef}
      width="90"
      height="40"
      viewBox="0 0 90 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-speedlines ${className}`}
      aria-hidden="true"
    >
      <path className="speed-line" d="M2 6 C 25 5, 60 7, 88 5" stroke="#2B2620" strokeWidth="1.6" strokeLinecap="round" />
      <path className="speed-line" d="M12 14 C 35 13, 65 15, 84 14" stroke="#2B2620" strokeWidth="2.0" strokeLinecap="round" />
      <path className="speed-line" d="M5 22 C 30 21, 55 23, 86 22" stroke="#2B2620" strokeWidth="1.4" strokeLinecap="round" />
      <path className="speed-line" d="M18 30 C 40 29, 68 31, 82 30" stroke="#2B2620" strokeWidth="1.8" strokeLinecap="round" />
      <path className="speed-line" d="M8 37 C 28 36, 52 38, 75 37" stroke="#2B2620" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};
