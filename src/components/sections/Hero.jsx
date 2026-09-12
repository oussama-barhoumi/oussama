import { useRef, useState, useCallback, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import BMO from '../3d/BMO'
import { BmoSpeechBubble } from '../BmoSpeechBubble'

const DIALOGUE_LINES = [
  { text: "Hey! I'm BMO!", intensity: "high", position: "right" },
  { text: "Welcome to my portfolio!", intensity: "medium", position: "right" },
  { text: "I build cool 3D web experiences.", intensity: "medium", position: "right" },
  { text: "Ready?", intensity: "high", position: "right" },
  { text: "Let's go!", intensity: "high", position: "right" },
]

export default function Hero() {
  const containerRef = useRef()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [lineIndex, setLineIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(true)

  const handleMouseMove = useCallback((e) => {
    // Normalise mouse to -1…1 range
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    setMousePosition({ x, y })
  }, [])

  const handleAssemblyComplete = useCallback(() => {
    // Assembly & eye-lock sequence complete
    setIsSpeaking(true)
  }, [])

  // Auto-advance dialogue lines every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % DIALOGUE_LINES.length)
      setIsSpeaking(true)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const currentDialogue = DIALOGUE_LINES[lineIndex]

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

      {/* BMO Manga Speech Bubble UI Overlay */}
      <div
        onClick={() => {
          setLineIndex((prev) => (prev + 1) % DIALOGUE_LINES.length)
          setIsSpeaking(true)
        }}
        className="bmo-bubble-overlay"
        style={{
          position: 'absolute',
          top: '20%',
          left: 'calc(50% + 120px)',
          zIndex: 40,
          cursor: 'pointer',
        }}
      >
        <BmoSpeechBubble
          text={currentDialogue.text}
          isSpeaking={isSpeaking}
          position={currentDialogue.position}
          variant="manga"
          intensity={currentDialogue.intensity}
          showDoodles={true}
        />
      </div>

      {/* Responsive stylesheet for overlay placement */}
      <style>{`
        @media (max-width: 768px) {
          .bmo-bubble-overlay {
            top: 14% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>

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
