import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MaskReveal.css';
gsap.registerPlugin(ScrollTrigger);
const ABOUT_MASK_RISE_Y = '-27vh';
const REPLAY_EVENT = 'mask-reveal:replay';
export default function MaskReveal({ revealed = false }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const leftMaskRef = useRef(null);
  const rightMaskRef = useRef(null);
  // Reset mask to its clean initial state.
  const resetMask = useCallback(() => {
    if (!stageRef.current || !leftMaskRef.current || !rightMaskRef.current) return;
    gsap.killTweensOf([
      stageRef.current,
      leftMaskRef.current,
      rightMaskRef.current,
    ]);
    gsap.set(stageRef.current, {
      y: 0,
    });
    gsap.set(leftMaskRef.current, {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 1,
      opacity: 1,
      transformOrigin: 'right center',
    });
    gsap.set(rightMaskRef.current, {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 1,
      opacity: 1,
      transformOrigin: 'left center',
    });
  }, []);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      resetMask();
    }, rootRef);
    return () => {
      ctx.revert();
      gsap.killTweensOf([
        stageRef.current,
        leftMaskRef.current,
        rightMaskRef.current,
      ]);
    };
  }, [resetMask]);
  /*
   * Replay/reset event.
   *
   * IMPORTANT:
   * This no longer plays an entrance animation.
   * It simply restores the clean starting state.
   */
  useEffect(() => {
    const replay = () => {
      resetMask();
      // Refresh ScrollTrigger so the scroll-driven animation
      // immediately starts from the correct position.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };
    const handleKeyDown = (event) => {
      if (
        (event.key === 'm' || event.key === 'M') &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        replay();
      }
    };
    window.addEventListener(REPLAY_EVENT, replay);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener(REPLAY_EVENT, replay);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetMask]);
  /*
   * MAIN SCROLL ANIMATION
   *
   * 1. Mask starts at the bottom.
   * 2. Mask rises toward the center.
   * 3. Both halves begin a subtle 3D rotation.
   * 4. Left half opens left.
   * 5. Right half opens right.
   *
   * NO vibration.
   * NO random x movement.
   * NO opacity flickering.
   * NO glitch transform.
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const getMaskOpenDistance = () => {
        return window.innerWidth < 768
          ? window.innerWidth * 0.35
          : window.innerWidth * 0.40;
      };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#new-section',
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      /*
       * PHASE 1
       * Bottom → Center
       */
      timeline.to(
        stageRef.current,
        {
          y: ABOUT_MASK_RISE_Y,
          duration: 0.42,
          ease: 'power2.inOut',
        },
        0
      );
      /*
       * PHASE 2
       * Small 3D rotation before splitting.
       */
      timeline.to(
        leftMaskRef.current,
        {
          rotationY: -10,
          rotationZ: -1.5,
          rotationX: 1,
          duration: 0.16,
          ease: 'power2.inOut',
        },
        0.40
      );
      timeline.to(
        rightMaskRef.current,
        {
          rotationY: 10,
          rotationZ: 1.5,
          rotationX: -1,
          duration: 0.16,
          ease: 'power2.inOut',
        },
        0.40
      );
      /*
       * PHASE 3
       * The two halves physically open.
       */
      timeline.to(
        leftMaskRef.current,
        {
          x: () => -getMaskOpenDistance(),
          rotationY: -38,
          rotationZ: -6,
          rotationX: 3,
          duration: 0.48,
          ease: 'power3.inOut',
        },
        0.52
      );
      timeline.to(
        rightMaskRef.current,
        {
          x: () => getMaskOpenDistance(),
          rotationY: 38,
          rotationZ: 6,
          rotationX: -3,
          duration: 0.48,
          ease: 'power3.inOut',
        },
        0.52
      );
    }, rootRef);
    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * DISAPPEAR ANIMATION
   *
   * A completely separate ScrollTrigger.
   * Triggers near the END of #new-section (≈ last 12% of its 700% scroll).
   * Makes the entire mask wrapper fade out and drop away.
   *
   * ⚠️  Nothing above is touched.
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const disappearTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#new-section',
          // 88% through 700% = 616 → round to -616%
          // 99% through 700% = 693 → round to -693%
          start: 'top -616%',
          end: 'top -693%',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // Phase A — mask starts to sink and dim
      disappearTimeline.to(
        rootRef.current,
        {
          opacity: 0,
          y: '18vh',
          scale: 0.88,
          duration: 1,
          ease: 'power2.inOut',
        },
        0
      );
    });

    return () => ctx.revert();
  }, []);
  return (
    <div
      ref={rootRef}
      className="masks-position-wrapper mask-reveal__position"
    >
      <div
        ref={stageRef}
        className="masks-stage mask-reveal__stage"
      >
        <div className="masks-container mask-reveal__container">
          <div className="masks-layer mask-reveal__layer">
            <div
              ref={leftMaskRef}
              className="mask-reveal__left"
            >
              <img
                src="/img/face.masek1.png"
                alt="face mask left"
              />
            </div>
            <div
              ref={rightMaskRef}
              className="mask-reveal__right"
            >
              <img
                src="/img/face.masek.png"
                alt="face mask right"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export { REPLAY_EVENT };