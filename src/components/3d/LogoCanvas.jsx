import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

/**
 * Spinning plane mesh that holds the logo texture and rotates around the Y axis.
 */
function LogoMesh() {
  const meshRef = useRef();
  const texture = useTexture('/img/logopro.png');

  // Continuously rotate around Y axis
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.2; // ~1.2 rad/s — adjust to taste
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, Math.PI / 4, 0]}>
      <planeGeometry args={[3, 5]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * LogoCanvas – renders the spinning logo inside a Three.js Canvas.
 * Designed to be placed in the top-right corner of the Home page.
 */
export default function LogoCanvas({ style }) {
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        right: '1570px',
        width: '160px',
        height: '160px',
        zIndex: 10,
        background: 'transparent',
        pointerEvents: 'none',
        ...style,
      }}
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ alpha: true }}
    >
      <LogoMesh />
    </Canvas>
  );
}
