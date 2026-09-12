import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MangaBurstProps {
  isActive: boolean;
  size?: number;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const MangaBurst: React.FC<MangaBurstProps> = ({
  isActive,
  size = 36,
  className = '',
  intensity = 'medium',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const paths = svgRef.current.querySelectorAll('.burst-path');

    if (isActive) {
      gsap.fromTo(
        paths,
        { strokeDasharray: 40, strokeDashoffset: 40, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: intensity === 'high' ? 0.3 : 0.45,
          stagger: 0.04,
          ease: 'power2.out',
        }
      );
    } else {
      gsap.to(paths, { opacity: 0, duration: 0.2 });
    }
  }, [isActive, intensity]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-burst ${className}`}
      aria-hidden="true"
    >
      {/* 8-point hand-drawn star burst rays */}
      <path className="burst-path" d="M20 4 L20 36" stroke="#2B2620" strokeWidth="1.8" strokeLinecap="round" />
      <path className="burst-path" d="M4 20 L36 20" stroke="#2B2620" strokeWidth="1.8" strokeLinecap="round" />
      <path className="burst-path" d="M8.7 8.7 L31.3 31.3" stroke="#2B2620" strokeWidth="1.5" strokeLinecap="round" />
      <path className="burst-path" d="M31.3 8.7 L8.7 31.3" stroke="#2B2620" strokeWidth="1.5" strokeLinecap="round" />
      {/* Small accent diamond */}
      <polygon points="20,14 23,20 20,26 17,20" stroke="#2B2620" strokeWidth="1.2" fill="none" className="burst-path" />
    </svg>
  );
};
