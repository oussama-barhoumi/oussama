import React from 'react';
import LogoCanvas from '../3d/LogoCanvas';
import MarqueeText from './MarqueeText';

export default function Home() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#9b2a2aff',
        background: 'linear-gradient(50deg,rgba(0, 0, 0, 1) 0%, rgba(210, 0, 0, 1) 50%, rgba(220, 7, 7, 1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* logo.png — spinning on the Y axis via React Three Fiber, top-right */}
      <LogoCanvas />

      {/* Infinite horizontal marquee — vertically centred */}
      <MarqueeText />
    </div>
  );
}
