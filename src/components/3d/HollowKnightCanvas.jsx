import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/hollow_knight.glb';

function HollowKnightModel({ hovered, globalMouseRef, isNavOpen }) {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef();
  const slashAnimRef = useRef(0);

  // Normalize model bounds: auto-center & fix materials for crisp, rich colors
  const model = useMemo(() => {
    const clone = scene.clone(true);

    // Compute precise bounding box before transformation
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    // Scale model to 2.75 units in Three.js viewport
    const scale = 2.75 / maxDim;

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material = child.material.clone();
          const matName = (child.material.name || '').toLowerCase();

          if (matName.includes('line')) {
            // Crisp toon outline
            child.material.color = new THREE.Color('#0c0c10');
            child.material.roughness = 1.0;
            child.material.metalness = 0;
            child.material.transparent = false;
            child.material.depthWrite = true;
          } else {
            // Main character material: fix alpha/sorting and enhance porcelain white + dark cloak
            child.material.transparent = false;
            child.material.depthWrite = true;
            child.material.depthTest = true;
            child.material.roughness = 0.45;
            child.material.metalness = 0.08;
            child.material.side = THREE.DoubleSide;
          }
          child.material.needsUpdate = true;
        }
      }
    });

    // Center pivot point exactly at origin
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    clone.scale.setScalar(scale);

    return clone;
  }, [scene]);

  // Trigger brief slash flourish on nav toggle
  useEffect(() => {
    slashAnimRef.current = 1.0;
  }, [isNavOpen]);

  // Continuous global mouse gaze tracking + slash flourish
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const { x, y } = globalMouseRef.current;

    // Decay slash flourish
    slashAnimRef.current = THREE.MathUtils.damp(slashAnimRef.current, 0, 8, delta);

    // Knight sits on top-right of screen (x ~ 0.7, y ~ -0.7 in NDC).
    // Gaze angle targets relative to knight's position:
    const targetY = (x - 0.7) * 0.85 + (isNavOpen ? -0.2 : 0) + (slashAnimRef.current * 0.4);
    const targetX = -(y + 0.3) * 0.55 - (slashAnimRef.current * 0.15);
    const targetZ = (x - 0.7) * 0.15 + (slashAnimRef.current * 0.3);

    // Fast, organic lerp damping so head follows mouse smoothly
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      5.5,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetX,
      5.5,
      delta
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetZ,
      5.5,
      delta
    );

    // Subtle scale feedback when hovered or active
    const targetScale = hovered ? 1.08 : isNavOpen ? 1.04 : 1.0;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta)
    );
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

export default function HollowKnightCanvas({ style, isNavOpen = false, onHoverStart, onHoverEnd }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const clickTimerRef = useRef(null);

  // Global mouse position ref (-1 to +1 across the entire window)
  const globalMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      globalMouseRef.current = { x, y };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const handleMouseEnter = () => {
    setHovered(true);
    if (onHoverStart) onHoverStart();
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (onHoverEnd) onHoverEnd();
  };

  const handleClick = () => {
    setClicked(true);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClicked(false), 500);
  };

  return (
    <div
      className="hollow-knight-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 'clamp(14px, 2.2vh, 28px)',
        right: 'clamp(24px, 3.5vw, 48px)',
        width: 'clamp(160px, 15vw, 210px)',
        height: 'clamp(160px, 15vw, 210px)',
        zIndex: 30,
        cursor: 'pointer',
        pointerEvents: 'auto',
        willChange: 'transform',
        ...style,
      }}
      title={isNavOpen ? 'Click to Sheathe Nail & Close Menu' : 'Click to Draw Nail & Open Navigation'}
    >
      <div
        className="hollow-knight-interactive"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: clicked ? 'scale(1.12) rotate(5deg)' : hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Subtle crimson aura glow behind canvas */}
        <div
          style={{
            position: 'absolute',
            inset: '12%',
            borderRadius: '50%',
            background: isNavOpen
              ? 'radial-gradient(circle, rgba(255, 40, 40, 0.55) 0%, rgba(180, 10, 10, 0.25) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(240, 30, 30, 0.38) 0%, rgba(140, 10, 10, 0.15) 50%, transparent 75%)',
            filter: 'blur(22px)',
            opacity: hovered || isNavOpen ? 1 : 0.6,
            transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.4s ease',
            transform: hovered || isNavOpen ? 'scale(1.25)' : 'scale(1)',
            pointerEvents: 'none',
          }}
        />

        {/* Three.js Canvas */}
        <Canvas
          camera={{ position: [0, 0.1, 4.5], fov: 42 }}
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
          }}
        >
          {/* Pure studio ambient light to preserve true white & slate tones */}
          <ambientLight intensity={1.1} color="#ffffff" />

          {/* Primary key light directly onto mask and horns */}
          <directionalLight position={[4, 5, 5]} intensity={2.2} color="#ffffff" />

          {/* Secondary soft cool fill light from side */}
          <directionalLight position={[-4, 3, 3]} intensity={1.1} color="#e6f0ff" />

          {/* Back rim light to pop edges from dark background */}
          <directionalLight position={[0, 4, -4]} intensity={1.4} color="#ffffff" />

          {/* Subtle ground reflection */}
          <directionalLight position={[0, -3, 2]} intensity={0.45} color="#d0d0d8" />

          <Suspense fallback={null}>
            <Float
              speed={2.2}
              rotationIntensity={0.15}
              floatIntensity={0.3}
              floatingRange={[-0.05, 0.05]}
            >
              <HollowKnightModel
                hovered={hovered}
                globalMouseRef={globalMouseRef}
                isNavOpen={isNavOpen}
              />
            </Float>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
