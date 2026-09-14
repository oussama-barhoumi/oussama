import { useState, useCallback, useEffect } from 'react'
import Hero from './components/sections/Hero'
import Home from './components/sections/Home'
import FireReveal from './components/transition/FireReveal'
import PortfolioPreloader from './components/preloader/PortfolioPreloader'

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

      {/* Cinematic preloader overlay — only active on initial load */}
      {!isLoaded && (
        <PortfolioPreloader onComplete={handlePreloaderComplete} />
      )}
    </>
  )
}

export default App
