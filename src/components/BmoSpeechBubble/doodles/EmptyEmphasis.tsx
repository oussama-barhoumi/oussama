import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  isActive: boolean;
  className?: string;
}

export const EmptyEmphasis: React.FC<Props> = ({ isActive, className = '' }) => {
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;
    if (isActive) {
      gsap.fromTo(
        lineRef.current,
        { strokeDasharray: 90, strokeDashoffset: 90, opacity: 0 },
        { strokeDashoffset: 0, opacity: 0.9, duration: 0.5, ease: 'sine.out' }
      );
    } else {
      gsap.to(lineRef.current, { opacity: 0, duration: 0.15 });
    }
  }, [isActive]);

  return (
    <svg
      width="80"
      height="16"
      viewBox="0 0 80 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-emphasis ${className}`}
      aria-hidden="true"
    >
      <path
        ref={lineRef}
        d="M 4 8 C 24 6, 56 10, 76 8"
        stroke="#C84B31"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
