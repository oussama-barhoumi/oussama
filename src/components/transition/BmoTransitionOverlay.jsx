/**
 * BmoTransitionOverlay
 * ─────────────────────────────────────────────────────────────────────────────
 * A cinematic vignette + overlay layer shown during the BMO push-in animation.
 *
 * ARCHITECTURE CHANGE:
 * The solid-black overlay phase has been disabled. Previously it faded to
 * opacity:1 at the climax to cover the Hero before MeltReveal started.
 * This caused a black flash because MeltReveal mounted AFTER the black fill.
 *
 * Now the MeltReveal paint handles full-screen coverage (sweeping top→bottom),
 * so this overlay's black layer stays at opacity:0 at all times.
 *
 * The vignette radial-gradient still provides the cinematic "lens" feel during
 * the BMO push-in zoom. It fades out naturally when overlayVisible=true (just
 * before the paint starts), so the paint begins over the blurred/vignette-less
 * BMO — a seamless handoff.
 *
 * States:
 *  active=false  → nothing rendered
 *  active=true   → vignette fades in (darkens edges during zoom)
 *  visible=true  → vignette fades out (paint is about to start)
 *
 * ⚠️  ISOLATED — no dependency on BMO internals.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { TRANSITION_CONFIG as C } from '../../hooks/useBmoTransition'

/**
 * @param {{ active: boolean, visible: boolean }} props
 */
export default function BmoTransitionOverlay({ active, visible }) {
  if (!active) return null

  return (
    <>
      {/*
        ── Black overlay layer ──────────────────────────────────────────────
        Fades to solid black at the climax of BMO's push-in zoom,
        allowing BMO's 3D animation to conclude cleanly into black.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: '#000000',
          opacity: visible ? 1 : 0,
          transition: `opacity ${C.overlayFadeDuration}s cubic-bezier(0.4, 0, 1, 1)`,
          pointerEvents: visible ? 'all' : 'none',
        }}
      />

      {/*
        ── Vignette ring ────────────────────────────────────────────────────
        Pulses in during the BMO push-in to create a cinematic "lens" feel.
        Fades out once overlayVisible=true (just before paint starts).
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.95) 100%)',
          opacity: visible ? 0 : active ? 0.7 : 0,
          transition: `opacity ${C.overlayFadeDuration * 0.6}s ease-in`,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
