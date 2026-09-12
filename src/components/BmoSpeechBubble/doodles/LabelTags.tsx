import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  isActive: boolean;
  className?: string;
}

export const LabelTags: React.FC<Props> = ({ isActive, className = '' }) => {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const tags = containerRef.current.querySelectorAll('.label-tag');

    if (isActive) {
      gsap.fromTo(
        tags,
        { scale: 0.8, opacity: 0, y: 4 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, stagger: 0.08, ease: 'back.out(1.4)' }
      );
    } else {
      gsap.to(tags, { opacity: 0, duration: 0.15 });
    }
  }, [isActive]);

  return (
    <svg
      ref={containerRef}
      width="160"
      height="30"
      viewBox="0 0 160 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`bmo-manga-doodle bmo-doodle-tags ${className}`}
      aria-hidden="true"
    >
      <g className="label-tag">
        <rect x="2" y="4" width="34" height="20" rx="3" stroke="#2B2620" strokeWidth="1.2" fill="#F7F3EA" />
        <text x="19" y="18" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="600" fill="#2B2620">CODE</text>
      </g>
      <g className="label-tag">
        <rect x="40" y="4" width="42" height="20" rx="3" stroke="#2B2620" strokeWidth="1.2" fill="#F7F3EA" />
        <text x="61" y="18" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="600" fill="#2B2620">DESIGN</text>
      </g>
      <g className="label-tag">
        <rect x="86" y="4" width="28" height="20" rx="3" stroke="#2B2620" strokeWidth="1.2" fill="#F7F3EA" />
        <text x="100" y="18" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="600" fill="#2B2620">3D</text>
      </g>
      <g className="label-tag">
        <rect x="118" y="4" width="26" height="20" rx="3" stroke="#2B2620" strokeWidth="1.2" fill="#F7F3EA" />
        <text x="131" y="18" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="600" fill="#2B2620">AI</text>
      </g>
    </svg>
  );
};
