import { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
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
    // hook for future use (e.g. reveal text, enable scroll)
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
        background: '#0a0a0a',
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
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Cinematic lighting */}
        <ambientLight intensity={0.3} color="#f5e6d3" />

        {/* Key light — warm, from upper-right */}
        <directionalLight
          position={[4, 5, 3]}
          intensity={1.2}
          color="#ffe8d0"
          castShadow={false}
        />

        {/* Rim light — cool accent, from behind-left */}
        <directionalLight
          position={[-3, 2, -4]}
          intensity={0.6}
          color="#c8d8e8"
        />

        {/* Fill light — subtle, from below */}
        <directionalLight
          position={[0, -3, 2]}
          intensity={0.25}
          color="#e8ddd0"
        />

        {/* Subtle point light to bring out face details */}
        <pointLight
          position={[0, 0.5, 3]}
          intensity={0.4}
          color="#fff5eb"
          distance={8}
          decay={2}
        />

        <Suspense fallback={null}>
          <BMO
            mousePosition={mousePosition}
            onAssemblyComplete={handleAssemblyComplete}
          />
        </Suspense>
      </Canvas>

      {/* Subtle vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </section>
  )
}
