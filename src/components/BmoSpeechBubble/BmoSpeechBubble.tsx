import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { BmoSpeechBubbleProps, SpeechBubblePosition } from './BmoSpeechBubble.types';
import { MangaBurst } from './doodles/MangaBurst';
import { MangaSpeedLines } from './doodles/MangaSpeedLines';
import { MangaScribble } from './doodles/MangaScribble';
import { MangaArrow } from './doodles/MangaArrow';
import './BmoSpeechBubble.css';

/**
 * Returns a stable SVG path string forming the paper bubble contour
 * and integrated speech tail pointing towards BMO's mouth/head.
 */
const getSvgPathForPosition = (pos: SpeechBubblePosition): string => {
  switch (pos) {
    case 'left':
      // Bubble on left, tail on bottom-right pointing down-right towards BMO
      return `
        M 25 15
        C 100 12, 260 17, 335 15
        C 350 15, 355 25, 355 45
        C 353 85, 357 125, 355 145
        C 355 160, 340 165, 310 165
        C 300 165, 305 178, 335 205
        C 305 190, 280 172, 275 165
        C 180 166, 90 164, 45 165
        C 25 165, 15 150, 15 125
        C 13 85, 17 45, 15 35
        C 15 20, 20 15, 25 15 Z
      `;
    case 'top':
      // Bubble above BMO, tail on bottom-center pointing down towards BMO
      return `
        M 25 15
        C 110 13, 250 17, 335 15
        C 350 15, 355 25, 355 45
        C 353 85, 357 125, 355 145
        C 355 160, 340 165, 205 165
        C 195 165, 185 182, 175 205
        C 170 185, 165 170, 160 165
        C 110 165, 50 164, 35 165
        C 20 165, 15 150, 15 125
        C 13 85, 17 45, 15 35
        C 15 20, 20 15, 25 15 Z
      `;
    case 'bottom':
      // Bubble below BMO, tail on top-center pointing up towards BMO
      return `
        M 25 25
        C 110 23, 160 25, 165 25
        C 170 20, 175 5, 180 -15
        C 185 5, 195 20, 200 25
        C 250 24, 320 27, 335 25
        C 350 25, 355 35, 355 55
        C 353 95, 357 135, 355 155
        C 355 170, 340 175, 310 175
        C 200 176, 90 174, 45 175
        C 25 175, 15 160, 15 135
        C 13 95, 17 55, 15 45
        C 15 30, 20 25, 25 25 Z
      `;
    case 'right':
    default:
      // Bubble on right, tail on bottom-left pointing down-left towards BMO
      return `
        M 25 15
        C 110 12, 250 17, 335 15
        C 350 15, 355 25, 355 45
        C 353 85, 357 125, 355 145
        C 355 160, 340 165, 310 165
        C 200 166, 120 164, 85 165
        C 80 165, 55 182, 25 205
        C 50 188, 55 172, 60 165
        C 40 165, 20 155, 15 125
        C 13 85, 17 45, 15 35
        C 15 20, 20 15, 25 15 Z
      `;
  }
};

/**
 * Deterministic pseudo-random rotation per word based on word index and text length.
 * Keeps rotation fixed across re-renders for the same text.
 */
const getWordRotation = (index: number, word: string): number => {
  const charCodeSum = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoSeed = (index * 17 + charCodeSum * 13) % 100;
  // Map 0..99 to -1.4deg .. +1.4deg
  return -1.4 + (pseudoSeed / 99) * 2.8;
};

export const BmoSpeechBubble: React.FC<BmoSpeechBubbleProps> = ({
  text,
  isSpeaking,
  position = 'right',
  variant = 'manga',
  intensity = 'medium',
  showDoodles = true,
  className = '',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const inkDotRef = useRef<HTMLDivElement>(null);
  const mainTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const breathingTweenRef = useRef<gsap.core.Tween | null>(null);

  // Track previous text and speaking state to prevent unwanted re-animations
  const prevTextRef = useRef<string>('');
  const prevSpeakingRef = useRef<boolean>(false);

  // Special text detection
  const lowerText = useMemo(() => text.trim().toLowerCase(), [text]);
  const isReadyText = useMemo(() => lowerText.includes('ready'), [lowerText]);
  const isLetsGoText = useMemo(() => lowerText.includes("let's go") || lowerText.includes('lets go'), [lowerText]);

  // Split text into word tokens
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  // Contextual doodle flags
  const showBurstDoodle = useMemo(() => {
    if (!showDoodles) return false;
    return (
      intensity === 'high' ||
      isLetsGoText ||
      isReadyText ||
      text.includes('!') ||
      lowerText.includes('bmo') ||
      lowerText.includes('hey')
    );
  }, [showDoodles, intensity, isLetsGoText, isReadyText, text, lowerText]);

  const showSpeedLinesDoodle = useMemo(() => {
    if (!showDoodles) return false;
    return isLetsGoText || (intensity === 'high' && isSpeaking);
  }, [showDoodles, isLetsGoText, intensity, isSpeaking]);

  const showScribbleDoodle = useMemo(() => {
    if (!showDoodles) return false;
    return lowerText.includes('uh') || lowerText.includes('...') || lowerText.includes('hmm') || lowerText.includes('?');
  }, [showDoodles, lowerText]);

  const showArrowDoodle = useMemo(() => {
    if (!showDoodles) return false;
    return lowerText.includes('way') || lowerText.includes('go') || lowerText.includes('here') || lowerText.includes('→');
  }, [showDoodles, lowerText]);

  // Main animation effect triggered ONLY when `text` or `isSpeaking` actually changes
  useEffect(() => {
    const textChanged = prevTextRef.current !== text;
    const speakingChanged = prevSpeakingRef.current !== isSpeaking;

    if (!textChanged && !speakingChanged) return;

    prevTextRef.current = text;
    prevSpeakingRef.current = isSpeaking;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Kill existing timelines
    if (mainTimelineRef.current) {
      mainTimelineRef.current.kill();
      mainTimelineRef.current = null;
    }

    if (breathingTweenRef.current) {
      breathingTweenRef.current.kill();
      breathingTweenRef.current = null;
    }

    if (!paperRef.current || !textRef.current) return;

    const wordElements = textRef.current.querySelectorAll('.bmo-word-span');

    if (prefersReducedMotion) {
      // Instant reveal for reduced motion preference
      gsap.set(paperRef.current, { scale: 1, rotation: 0, opacity: 1 });
      gsap.set(wordElements, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', opacity: 1 });
      return;
    }

    // Build GSAP animation timeline
    const tl = gsap.timeline();
    mainTimelineRef.current = tl;

    if (textChanged || speakingChanged) {
      // Step 1: Paper entry micro-nudge
      tl.fromTo(
        paperRef.current,
        {
          scale: 0.975,
          rotation: position === 'left' ? 0.6 : -0.6,
          opacity: 0.92,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'back.out(1.4)',
        }
      );

      // Step 2: Ink dot micro-reveal
      if (inkDotRef.current) {
        tl.fromTo(
          inkDotRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1.4, opacity: 0.8, duration: 0.12, ease: 'power2.out' },
          '-=0.2'
        ).to(inkDotRef.current, { scale: 0, opacity: 0, duration: 0.15 });
      }

      // Step 3: Progressive handwriting reveal
      if (wordElements.length > 0) {
        tl.fromTo(
          wordElements,
          {
            clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
            opacity: 0,
            y: 2,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            opacity: 1,
            y: 0,
            duration: isReadyText ? 0.35 : 0.22,
            stagger: isReadyText ? 0.12 : 0.05,
            ease: 'power2.out',
          },
          '-=0.1'
        );
      }
    }

    // Step 4: Living paper breathing during speech
    if (isSpeaking) {
      breathingTweenRef.current = gsap.to(paperRef.current, {
        y: intensity === 'high' ? -3 : intensity === 'low' ? -1 : -2,
        rotation: position === 'left' ? 0.3 : -0.3,
        duration: intensity === 'low' ? 1.6 : 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    } else {
      gsap.to(paperRef.current, { y: 0, rotation: 0, duration: 0.4, ease: 'power2.out' });
    }

    return () => {
      if (mainTimelineRef.current) {
        mainTimelineRef.current.kill();
      }
      if (breathingTweenRef.current) {
        breathingTweenRef.current.kill();
      }
    };
  }, [text, isSpeaking, position, intensity, isReadyText]);

  // Clean up GSAP timelines on unmount
  useEffect(() => {
    return () => {
      if (mainTimelineRef.current) mainTimelineRef.current.kill();
      if (breathingTweenRef.current) breathingTweenRef.current.kill();
    };
  }, []);

  const svgBubblePath = useMemo(() => getSvgPathForPosition(position), [position]);

  const rootClasses = [
    'bmo-speech-bubble-root',
    `bmo-bubble-pos-${position}`,
    `bmo-variant-${variant}`,
    `bmo-intensity-${intensity}`,
    isReadyText ? 'bmo-bubble-ready' : '',
    isLetsGoText ? 'bmo-bubble-letsgo' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={rootClasses}>
      {/* Screen Reader Accessibility Announcement */}
      <div aria-live="polite" className="sr-only">
        {text}
      </div>

      {/* Visual Speech Bubble (Hidden from Screen Readers to avoid duplication) */}
      <div ref={paperRef} className="bmo-paper-card" aria-hidden="true">
        {/* SVG Paper Background & Integrated Speech Tail */}
        <svg
          className="bmo-bubble-svg-bg"
          viewBox="0 0 370 220"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="bmo-paper-path" d={svgBubblePath} />
        </svg>

        {/* Paper Grain Overlay */}
        <div className="bmo-paper-noise-overlay" />

        {/* Ink Dot Animation Anchor */}
        <div ref={inkDotRef} className="bmo-ink-dot" style={{ top: '18px', left: '22px' }} />

        {/* Text Content */}
        <div className="bmo-bubble-content-wrap">
          <div ref={textRef} className="bmo-bubble-text">
            {words.map((word, i) => {
              const rot = getWordRotation(i, word);
              return (
                <span
                  key={`${word}-${i}`}
                  className="bmo-word-span"
                  style={{ transform: `rotate(${rot}deg)` }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Manga Reaction Doodles */}
        {showDoodles && (
          <div className="bmo-doodle-container">
            <MangaBurst
              isActive={showBurstDoodle}
              intensity={intensity}
              className="bmo-doodle-pos-top-right"
            />
            <MangaSpeedLines
              isActive={showSpeedLinesDoodle}
              className="bmo-doodle-pos-bottom-right"
            />
            <MangaScribble
              isActive={showScribbleDoodle}
              className="bmo-doodle-pos-top-left"
            />
            <MangaArrow
              isActive={showArrowDoodle}
              className="bmo-doodle-pos-bottom-left"
            />
          </div>
        )}
      </div>
    </div>
  );
};
