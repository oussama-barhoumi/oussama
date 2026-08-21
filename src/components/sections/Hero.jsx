import { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import BMO from '../3d/BMO'

export default function Hero() {
  const containerRef = useRef()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    // Normalise mouse to -1…1 range
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    setMousePosition({ x, y })
  }, [])

  const handleAssemblyComplete = useCallback(() => {
    // Assembly & eye-lock sequence complete
  }, [])

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#070707',
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 35,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Subtle dark ambient light */}
        <ambientLight intensity={0.25} color="#e6dfd5" />

        {/* Dramatic key light — warm highlight from top-right */}
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.3}
          color="#ffefe0"
          castShadow={false}
        />

        {/* Crisp rim light — cold metallic accent from behind-left */}
        <directionalLight
          position={[-4, 3, -4]}
          intensity={0.8}
          color="#b0cced"
        />

        {/* Low shadow fill — subtle ambient reflection from below */}
        <directionalLight
          position={[0, -4, 2]}
          intensity={0.2}
          color="#dfd6cd"
        />

        {/* Piercing spotlight focusing directly on the character center */}
        <spotLight
          position={[0, 4, 4]}
          target-position={[0, 0, 0]}
          intensity={0.7}
          angle={0.4}
          penumbra={0.8}
          color="#fff8f0"
        />

        <Suspense fallback={null}>
          <BMO
            mousePosition={mousePosition}
            onAssemblyComplete={handleAssemblyComplete}
          />
        </Suspense>
      </Canvas>

      {/* Deep cinematic vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </section>
  )
}
