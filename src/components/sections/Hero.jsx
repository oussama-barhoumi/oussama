import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import BMO from '../3d/BMO'
import { BmoSpeechBubble, DEFAULT_DIALOGUE_LINES } from '../BmoSpeechBubble'
// ── BMO → Home transition (isolated — safe to remove) ──
import { useBmoTransition } from '../../hooks/useBmoTransition'
import BmoTransitionInner from '../transition/BmoTransitionInner'
import BmoTransitionOverlay from '../transition/BmoTransitionOverlay'
import BmoInteractionHint from '../transition/BmoInteractionHint'

export default function Hero({ isPreloaderFinished = true }) {
  const containerRef = useRef()
  const videoRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isAssembled, setIsAssembled] = useState(false)

  // ── BMO → Home transition ──────────────────────────────────────────────────
  const { triggerRef, fireTransition, overlayActive, overlayVisible, step, setStep } = useBmoTransition(videoRef)
  // ──────────────────────────────────────────────────────────────────────────

  const handleMouseMove = useCallback((e) => {
    // Normalise mouse to -1…1 range
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    setMousePosition({ x, y })
  }, [])

  const handleAssemblyComplete = useCallback(() => {
    setIsAssembled(true)
  }, [])

  useEffect(() => {
    if (!isPreloaderFinished) return
    // Fallback: reveal hint smoothly even if assembly event timing varies
    const timer = setTimeout(() => setIsAssembled(true), 5500)
    return () => clearTimeout(timer)
  }, [isPreloaderFinished])

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
            videoRef={videoRef}
            mousePosition={mousePosition}
            onAssemblyComplete={handleAssemblyComplete}
            startAnimation={isPreloaderFinished}
          />
        </Suspense>

        {/* BMO → Home transition — isolated, safe to remove */}
        <BmoTransitionInner
          triggerRef={triggerRef}
          fireTransition={fireTransition}
          videoRef={videoRef}
          setStep={setStep}
        />
      </Canvas>

      {/* Video-Synchronized BMO Manga Speech Bubble Overlay */}
      <div
        className="bmo-bubble-overlay"
        style={{
          position: 'absolute',
          top: '20%',
          left: 'calc(50% + 120px)',
          zIndex: 40,
        }}
      >
        <BmoSpeechBubble
          videoRef={videoRef}
          lines={DEFAULT_DIALOGUE_LINES}
          enabled={true}
          position="right"
          variant="manga"
          intensity="medium"
          showDoodles={true}
          step={step}
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

      {/* Bottom hint banner: guides the user to press the red button */}
      <BmoInteractionHint step={step} isAssembled={isAssembled} />

      {/* BMO → Home transition overlay — isolated, safe to remove */}
      <BmoTransitionOverlay active={overlayActive} visible={overlayVisible} />
    </section>
  )
}
