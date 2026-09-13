import { useState, useCallback } from 'react'
import Hero from './components/sections/Hero'
import PortfolioPreloader from './components/preloader/PortfolioPreloader'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  const handlePreloaderComplete = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      {/* Existing BMO Hero experience mounts underneath */}
      <Hero isPreloaderFinished={isLoaded} />

      {/* Cinematic preloader overlay — only active on initial load */}
      {!isLoaded && (
        <PortfolioPreloader onComplete={handlePreloaderComplete} />
      )}
    </>
  )
}

export default App

