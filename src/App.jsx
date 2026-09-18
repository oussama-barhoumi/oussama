import { useState, useCallback, useEffect } from 'react'
import Hero from './components/sections/Hero'
import Home from './components/sections/Home'
import MeltReveal from './components/transition/MeltReveal'
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
  const [heroFinished, setHeroFinished] = useState(false)
  const [fireActive, setFireActive] = useState(false)
  const [transitionComplete, setTransitionComplete] = useState(false)
  const [homeReveal, setHomeReveal] = useState(false)

  const handlePreloaderComplete = useCallback(() => {
    setIsLoaded(true)
  }, [])

  /**
   * Called by Hero when BMO finishes its push-in zoom into black.
   * Hero has completed cleanly — now we unmount Hero and start MeltReveal on Home.
   */
  const handleBmoTransitionClimax = useCallback(() => {
    setHeroFinished(true)
    setFireActive(true)
  }, [])

  /**
   * Called by MeltReveal as the paint wave sweeps down across Home.
   * Triggers Home's entrance mask animation right as the face is uncovered.
   */
  const handleHalfway = useCallback(() => {
    setHomeReveal(true)
  }, [])

  /**
   * Called by MeltReveal when the paint fully finishes revealing Home.
   * At this moment it is safe to:
   *  - unmount MeltReveal
   *  - switch Home from fixed→relative layout for normal scrolling
   */
  const handleFireComplete = useCallback(() => {
    setFireActive(false)
    setTransitionComplete(true)
  }, [])

  // Skip handler — jumps straight to the Home reveal
  const handleSkip = useCallback(() => {
    if (transitionComplete || fireActive) return
    setHeroFinished(true)
    setFireActive(true)
  }, [transitionComplete, fireActive])

  // Dev shortcut: Press 'f' or 'F' to trigger the reveal transition directly for testing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === 'f' || e.key === 'F') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !fireActive
      ) {
        setHeroFinished(true)
        setFireActive(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fireActive])

  return (
    <>
      {/*
        ── HOME  (z: 1) ───────────────────────────────────────────────────────
        Pre-mounted as soon as the preloader completes.
        While Hero is active: position:fixed keeps it out of layout flow.
        When Hero finishes: MeltReveal sweeps downward from top to bottom over
        Home, progressively unveiling it.
        After transitionComplete: switches to position:relative for normal scrolling.
      */}
      {isLoaded && (
        <div
          style={{
            position: transitionComplete ? 'relative' : 'fixed',
            inset: 0,
            zIndex: 1,
            width: '100%',
            minHeight: '100vh',
          }}
        >
          <Home revealed={homeReveal} />
        </div>
      )}

      {/*
        ── HERO  (z: 10) ──────────────────────────────────────────────────────
        BMO Hero intro experience. Runs cleanly with its full 3D push-in and
        fade-to-black climax — without any MeltReveal cutting into it.
        Unmounts cleanly once its climax concludes (heroFinished=true).
      */}
      {isLoaded && !heroFinished && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10,
            width: '100%',
            height: '100dvh',
          }}
        >
          <Hero
            isPreloaderFinished={isLoaded}
            onTransitionClimax={handleBmoTransitionClimax}
          />
        </div>
      )}

      {/*
        ── MELT REVEAL TRANSITION  (z: 200) ────────────────────────────────────
        Runs exclusively on the Home section: starts fully covered in black and
        melts/sweeps DOWNWARD (top → bottom), revealing the Home section beneath.
      */}
      {fireActive && (
        <MeltReveal
          active={fireActive}
          onHalfway={handleHalfway}
          onComplete={handleFireComplete}
        />
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
