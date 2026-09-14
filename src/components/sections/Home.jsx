/**
 * Home Section
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows the mavi.png image centered on the page, revealed by the FireReveal
 * transition.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function Home() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#030001',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/img/mavi.png"
        alt="Mavi"
        style={{
          maxWidth: '80vw',
          maxHeight: '80vh',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}
