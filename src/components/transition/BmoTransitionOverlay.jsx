/**
 * BmoTransitionOverlay
 * ─────────────────────────────────────────────────────────────────────────────
 * A pure-CSS full-screen overlay that reveals itself at the climax of the
 * BMO push-in. It sits in the DOM below the 3-D Canvas but above nothing —
 * once visible it covers everything, preparing a clean slate for the
 * future Home section.
 *
 * States:
 *  active=false  → not in DOM flow (display:none equivalent via pointer-events)
 *  active=true   → in DOM, opacity 0 (invisible but mounted)
 *  visible=true  → transitions to opacity 1 via CSS (cinematic reveal)
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
      {/* ---------- Overlay layer ---------- */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          // Black matches the BMO screen/face area at fill-in
          background: '#000000',
          opacity: visible ? 1 : 0,
          // CSS transition driven by the `visible` prop
          transition: `opacity ${C.overlayFadeDuration}s cubic-bezier(0.4, 0, 1, 1)`,
          pointerEvents: visible ? 'all' : 'none',
        }}
      />

      {/*
        ── Vignette ring that pulses into view just before the cover ──
        Creates a subtle "lens" feel as BMO fills the viewport.
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
