import { useState, useCallback, useEffect } from 'react'
import Hero from './components/sections/Hero'
import Home from './components/sections/Home'
import FireReveal from './components/transition/FireReveal'
import PortfolioPreloader from './components/preloader/PortfolioPreloader'

/* ── Bubble Skip Button ────────────────────────────────────────────────────── */
function SkipButton({ onClick }) {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)

  // Fade in after a short delay so it doesn't clash with the preloader
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @keyframes skipPulse {
          0%   { transform: scale(1);   opacity: 0.55; }
          70%  { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes skipFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        id="skip-intro-btn"
        aria-label="Skip intro"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'fixed',
          bottom: '36px',
          right: '36px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 22px',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: hovered
            ? 'rgba(197, 83, 71, 0.55)'
            : 'rgba(15, 8, 10, 0.55)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          color: hovered ? '#fff' : 'rgba(255,255,255,0.72)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: hovered
            ? '0 0 28px rgba(197, 83, 71, 0.45)'
            : '0 4px 20px rgba(0,0,0,0.45)',
          transition:
            'background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          opacity: visible ? 1 : 0,
          animation: visible ? 'skipFadeIn 0.5s ease forwards' : 'none',
          outline: 'none',
          userSelect: 'none',
        }}
      >
        {/* Pulse ring */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '999px',
            border: '1px solid rgba(197,83,71,0.6)',
            animation: 'skipPulse 2s ease-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Arrow icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        Skip
      </button>
    </>
  )
}
/* ─────────────────────────────────────────────────────────────────────────── */

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showHome, setShowHome] = useState(false)
  const [fireActive, setFireActive] = useState(false)
  const [transitionComplete, setTransitionComplete] = useState(false)

  const handlePreloaderComplete = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleBmoTransitionClimax = useCallback(() => {
    setShowHome(true)
    setFireActive(true)
  }, [])

  const handleFireComplete = useCallback(() => {
    setFireActive(false)
    setTransitionComplete(true)
  }, [])

  // Skip handler — jumps straight to the fire reveal
  const handleSkip = useCallback(() => {
    if (transitionComplete || fireActive) return
    setShowHome(true)
    setFireActive(true)
  }, [transitionComplete, fireActive])

  // Dev shortcut: Press 'f' or 'F' to trigger the Fire Reveal transition directly for testing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === 'f' || e.key === 'F') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !fireActive
      ) {
        setShowHome(true)
        setFireActive(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fireActive])

  return (
    <>
      {/* Existing BMO Hero experience mounts underneath until Home transition completes */}
      {!transitionComplete && (
        <Hero
          isPreloaderFinished={isLoaded}
          onTransitionClimax={handleBmoTransitionClimax}
        />
      )}

      {/* Home page mounts behind the fire reveal */}
      {showHome && (
        <div
          style={{
            position: transitionComplete ? 'relative' : 'fixed',
            inset: 0,
            zIndex: 10,
            width: '100%',
            minHeight: '100vh',
          }}
        >
          <Home />
        </div>
      )}

      {/* Cinematic fire reveal transition: Burns bottom -> top */}
      {fireActive && (
        <FireReveal active={fireActive} onComplete={handleFireComplete} />
      )}

      {/* Bubble skip button — visible only during the BMO intro */}
      {isLoaded && !transitionComplete && !fireActive && (
        <SkipButton onClick={handleSkip} />
      )}

      {/* Cinematic preloader overlay — only active on initial load */}
      {!isLoaded && (
        <PortfolioPreloader onComplete={handlePreloaderComplete} />
      )}
    </>
  )
}

export default App
