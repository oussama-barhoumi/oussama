import React from 'react'

/**
 * BmoInteractionHint
 * ─────────────────────────────────────────────────────────────────────────────
 * Manga-styled instruction badge displayed at the bottom center of the screen.
 *
 * Uses the exact same font ('Klee One', 'Yomogi', 'Caveat') and color palette
 * (warm cream paper #F7F3EA and rich brown ink #2B2620) as the speech bubble.
 *
 * Requirements addressed:
 *   ✓ Same font as the manga bubble
 *   ✓ Removed red border
 *   ✓ Removed red button / dot icon
 *   ✓ Changed color scheme to brown & paper
 *
 * States:
 *   - 'initial': "Press the red button to start"
 *   - 'playing': hidden while BMO talks / video plays
 *   - 'ended':   "Press the red button to continue"
 *   - 'transitioning': hidden during push-in zoom
 *
 * ⚠️  ISOLATED — remove or modify without affecting BMO internals.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function BmoInteractionHint({ step = 'initial', isAssembled = true }) {
  // Only show when BMO is assembled and not in transition or playing
  const isVisible = isAssembled && (step === 'initial' || step === 'ended')

  const label =
    step === 'ended'
      ? 'Press the red button to continue'
      : 'Press the red button to start'

  return (
    <>
      <div
        className="bmo-hint-container"
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: `translateX(-50%) translateY(${isVisible ? '0' : '14px'})`,
          zIndex: 45,
          opacity: isVisible ? 1 : 0,
          pointerEvents: 'none',
          transition:
            'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none',
        }}
      >
        <div
          className="bmo-hint-card"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '7px 22px 7px 16px',
            borderRadius: '9999px',
            backgroundColor: '#F7F3EA',
            border: '1.8px solid #2B2620',
            boxShadow:
              '0 8px 24px rgba(43, 38, 32, 0.28), 0 2px 8px rgba(43, 38, 32, 0.14)',
          }}
        >
          {/* Character illustration at start of sentence */}
          <img
            src="/img/01-ba0708712464301157eb66c2596602b4-removebg-preview.png"
            alt="Moe"
            className="bmo-hint-img"
            style={{
              height: '30px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              flexShrink: 0,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          {/* Prompt Text matching BmoSpeechBubble typography and color */}
          <span
            style={{
              fontFamily: "'Klee One', 'Yomogi', 'Caveat', cursive, sans-serif",
              color: '#2B2620',
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            {label}
          </span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Klee+One:wght@400;600&family=Yomogi&display=swap');

        .bmo-hint-card {
          animation: bmoHintBob 3s ease-in-out infinite;
        }

        @keyframes bmoHintBob {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @media (max-width: 640px) {
          .bmo-hint-container {
            bottom: 24px !important;
          }
          .bmo-hint-card span {
            font-size: 15px !important;
          }
          .bmo-hint-img {
            height: 24px !important;
          }
        }
      `}</style>
    </>
  )
}
