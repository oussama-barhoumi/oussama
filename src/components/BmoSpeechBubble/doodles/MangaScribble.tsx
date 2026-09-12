import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MangaScribbleProps {
  isActive: boolean;
  className?: string;
}

export const MangaScribble: React.FC<MangaScribbleProps> = ({
  isActive,
  className = '',
}) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    if (isActive) {
      gsap.fromTo(
        pathRef.current,
        { strokeDasharray: 120, strokeDashoffset: 120, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 0.9,
          duration: 0.5,
          ease: 'power2.inOut',
        }
      );
    } else {
      gsap.to(pathRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [isActive]);

  return (
    <svg
      width="48"
      height="24"
      viewBox="0 0 48 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-scribble ${className}`}
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d="M 4 12 Q 10 4, 16 12 T 28 12 T 40 12 Q 44 18, 40 20 T 32 16"
        stroke="#2B2620"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
