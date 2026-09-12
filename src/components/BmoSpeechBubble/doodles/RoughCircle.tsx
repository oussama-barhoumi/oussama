import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  isActive: boolean;
  className?: string;
}

export const RoughCircle: React.FC<Props> = ({ isActive, className = '' }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    if (isActive) {
      gsap.fromTo(
        pathRef.current,
        { strokeDasharray: 140, strokeDashoffset: 140, opacity: 0 },
        { strokeDashoffset: 0, opacity: 0.9, duration: 0.45, ease: 'power2.out' }
      );
    } else {
      gsap.to(pathRef.current, { opacity: 0, duration: 0.15 });
    }
  }, [isActive]);

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-circle ${className}`}
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d="M 22 6 C 32 5, 40 13, 39 23 C 38 33, 29 40, 19 39 C 9 38, 4 28, 6 18 C 7 10, 15 5, 25 6"
        stroke="#2B2620"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
