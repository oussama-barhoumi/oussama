import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { BmoSpeechBubbleProps, SpeechBubblePosition, DialogueLine, WordTiming } from './BmoSpeechBubble.types';
import { DoodleRenderer } from './doodles/DoodleRenderer';
import { DEFAULT_DIALOGUE_LINES } from './dialogue.data';
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
        C 110 12, 280 17, 355 15
        C 370 15, 375 25, 375 45
        C 373 95, 377 145, 375 165
        C 375 180, 360 185, 330 185
        C 320 185, 325 198, 355 225
        C 325 210, 300 192, 295 185
        C 190 186, 90 184, 45 185
        C 25 185, 15 170, 15 145
        C 13 95, 17 45, 15 35
        C 15 20, 20 15, 25 15 Z
      `;
    case 'top':
      // Bubble above BMO, tail on bottom-center pointing down towards BMO
      return `
        M 25 15
        C 120 13, 270 17, 355 15
        C 370 15, 375 25, 375 45
        C 373 95, 377 145, 375 165
        C 375 180, 360 185, 215 185
        C 205 185, 195 202, 185 225
        C 180 205, 175 190, 170 185
        C 110 185, 50 184, 35 185
        C 20 185, 15 170, 15 145
        C 13 95, 17 45, 15 35
        C 15 20, 20 15, 25 15 Z
      `;
    case 'bottom':
      // Bubble below BMO, tail on top-center pointing up towards BMO
      return `
        M 25 25
        C 120 23, 170 25, 175 25
        C 180 20, 185 5, 190 -15
        C 195 5, 205 20, 210 25
        C 260 24, 340 27, 355 25
        C 370 25, 375 35, 375 55
        C 373 105, 377 155, 375 175
        C 375 190, 360 195, 330 195
        C 210 196, 90 194, 45 195
        C 25 195, 15 180, 15 155
        C 13 105, 17 55, 15 45
        C 15 30, 20 25, 25 25 Z
      `;
    case 'right':
    default:
      // Bubble on right, tail on bottom-left pointing down-left towards BMO
      return `
        M 25 15
        C 120 12, 270 17, 355 15
        C 370 15, 375 25, 375 45
        C 373 95, 377 145, 375 165
        C 375 180, 360 185, 330 185
        C 210 186, 130 184, 95 185
        C 90 185, 65 202, 35 225
        C 60 208, 65 192, 70 185
        C 40 185, 20 175, 15 145
        C 13 95, 17 45, 15 35
        C 15 20, 20 15, 25 15 Z
      `;
  }
};

/**
 * Deterministic pseudo-random rotation per word based on index and word string.
 */
const getWordRotation = (index: number, word: string): number => {
  const charCodeSum = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (index * 17 + charCodeSum * 13) % 100;
  return -1.4 + (seed / 99) * 2.8;
};

export const BmoSpeechBubble: React.FC<BmoSpeechBubbleProps> = ({
  videoRef,
  lines = DEFAULT_DIALOGUE_LINES,
  enabled = true,
  position = 'right',
  variant = 'manga',
  intensity = 'medium',
  showDoodles = true,
  className = '',
  step,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Initial active line is null so bubble does NOT show before video starts
  const [activeLine, setActiveLine] = useState<DialogueLine | null>(null);
  const [isDoodleActive, setIsDoodleActive] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [isGlitchDone, setIsGlitchDone] = useState<boolean>(false);

  // Cached DOM references & active line ID to prevent 60fps React re-renders
  const activeLineIdRef = useRef<string | null>(null);
  const hasStartedRef = useRef<boolean>(false);
  const isGlitchingRef = useRef<boolean>(false);
  const isGlitchDoneRef = useRef<boolean>(false);
  const lastActiveLineRef = useRef<DialogueLine | null>(null);

  const wordDomElsRef = useRef<{ el: HTMLSpanElement; timing?: WordTiming; lineStart: number; lineEnd: number }[]>([]);
  const breathingTweenRef = useRef<gsap.core.Tween | null>(null);

  const currentDisplayLine = activeLine || (isGlitching ? lastActiveLineRef.current : null);

  // Trigger cyber/manga glitch disappearance
  const triggerGlitchExit = useCallback(() => {
    if (!hasStartedRef.current || isGlitchingRef.current || isGlitchDoneRef.current) return;
    isGlitchingRef.current = true;
    setIsGlitching(true);

    setTimeout(() => {
      isGlitchDoneRef.current = true;
      setIsGlitchDone(true);
      setIsGlitching(false);
      setActiveLine(null);
      activeLineIdRef.current = null;
    }, 480);
  }, []);

  // Sync with optional step prop from Hero
  useEffect(() => {
    if (step === 'playing') {
      hasStartedRef.current = true;
      isGlitchingRef.current = false;
      isGlitchDoneRef.current = false;
      setHasStarted(true);
      setIsGlitching(false);
      setIsGlitchDone(false);
    } else if (
      (step === 'ended' || step === 'transitioning') &&
      hasStartedRef.current &&
      !isGlitchDoneRef.current &&
      !isGlitchingRef.current
    ) {
      triggerGlitchExit();
    }
  }, [step, triggerGlitchExit]);

  // Track video element events directly
  useEffect(() => {
    let attachedVideo: HTMLVideoElement | null = null;

    const onPlay = () => {
      hasStartedRef.current = true;
      isGlitchingRef.current = false;
      isGlitchDoneRef.current = false;
      setHasStarted(true);
      setIsGlitching(false);
      setIsGlitchDone(false);
    };

    const onEnded = () => {
      triggerGlitchExit();
    };

    const attach = (video: HTMLVideoElement) => {
      if (!video || attachedVideo === video) return;
      attachedVideo = video;
      video.addEventListener('play', onPlay);
      video.addEventListener('ended', onEnded);
    };

    const intervalId = setInterval(() => {
      if (videoRef?.current && videoRef.current !== attachedVideo) {
        attach(videoRef.current);
      }
    }, 100);

    if (videoRef?.current) {
      attach(videoRef.current);
    }

    return () => {
      clearInterval(intervalId);
      if (attachedVideo) {
        attachedVideo.removeEventListener('play', onPlay);
        attachedVideo.removeEventListener('ended', onEnded);
      }
    };
  }, [videoRef, triggerGlitchExit]);

  // Parse current text properties
  const lowerText = useMemo(() => (currentDisplayLine ? currentDisplayLine.text.trim().toLowerCase() : ''), [currentDisplayLine]);
  const isReadyText = useMemo(() => lowerText.includes('ready'), [lowerText]);
  const isLetsGoText = useMemo(() => lowerText.includes("let's go") || lowerText.includes('lets go'), [lowerText]);

  // Tokenize text into words / timings
  const wordTokens = useMemo(() => {
    if (!currentDisplayLine) return [];
    if (currentDisplayLine.words && currentDisplayLine.words.length > 0) {
      return currentDisplayLine.words;
    }
    // Fallback: split text evenly across start -> end
    const splitWords = currentDisplayLine.text.split(/\s+/).filter(Boolean);
    const lineDuration = currentDisplayLine.end - currentDisplayLine.start;
    const wordDur = lineDuration / Math.max(1, splitWords.length);

    return splitWords.map((word, idx) => ({
      word,
      start: currentDisplayLine.start + idx * wordDur,
      end: currentDisplayLine.start + (idx + 1) * wordDur,
    }));
  }, [currentDisplayLine]);

  // Callback ref for mounting word span elements
  const registerWordEl = useCallback((el: HTMLSpanElement | null, idx: number) => {
    if (!el || !currentDisplayLine) return;
    const timing = wordTokens[idx];
    wordDomElsRef.current[idx] = {
      el,
      timing,
      lineStart: currentDisplayLine.start,
      lineEnd: currentDisplayLine.end,
    };
  }, [currentDisplayLine, wordTokens]);

  // Line transition & paper entrance micro-nudge
  useEffect(() => {
    if (!activeLine || !paperRef.current) return;

    wordDomElsRef.current = wordDomElsRef.current.slice(0, wordTokens.length);

    // Paper entrance nudge
    gsap.fromTo(
      paperRef.current,
      {
        scale: 0.98,
        rotation: position === 'left' ? 0.5 : -0.5,
        opacity: 0.95,
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.28,
        ease: 'back.out(1.3)',
      }
    );
  }, [activeLine, wordTokens, position]);

  // Living paper breathing loop during speech
  useEffect(() => {
    if (!paperRef.current) return;

    if (isSpeaking && enabled) {
      breathingTweenRef.current = gsap.to(paperRef.current, {
        y: intensity === 'high' ? -3 : -2,
        rotation: position === 'left' ? 0.25 : -0.25,
        duration: 1.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    } else {
      if (breathingTweenRef.current) breathingTweenRef.current.kill();
      gsap.to(paperRef.current, { y: 0, rotation: 0, duration: 0.35, ease: 'power2.out' });
    }

    return () => {
      if (breathingTweenRef.current) breathingTweenRef.current.kill();
    };
  }, [isSpeaking, enabled, intensity, position]);

  // ---------------------------------------------------------------------------
  // MASTER CLOCK ENGINE: requestAnimationFrame loop driven by video.currentTime
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let animFrameId: number;

    const tick = () => {
      const video = videoRef.current;
      const time = video ? video.currentTime : 0;
      const isPlaying = !!video && !video.paused && !video.ended && video.readyState >= 2;

      setIsSpeaking(isPlaying);

      if (isPlaying && !hasStartedRef.current) {
        hasStartedRef.current = true;
        isGlitchingRef.current = false;
        isGlitchDoneRef.current = false;
        setHasStarted(true);
        setIsGlitching(false);
        setIsGlitchDone(false);
      }

      // If video has not started or glitch is done, no active line
      if (!hasStartedRef.current || isGlitchDoneRef.current) {
        if (activeLineIdRef.current !== null) {
          activeLineIdRef.current = null;
          setActiveLine(null);
        }
        animFrameId = requestAnimationFrame(tick);
        return;
      }

      // Check if video reached the end of all dialogue
      const lastLine = lines[lines.length - 1];
      const isVideoAtEnd = !!video && (video.ended || (lastLine && time >= lastLine.end));
      if (isVideoAtEnd && !isGlitchingRef.current && !isGlitchDoneRef.current) {
        triggerGlitchExit();
        animFrameId = requestAnimationFrame(tick);
        return;
      }

      if (isGlitchingRef.current) {
        animFrameId = requestAnimationFrame(tick);
        return;
      }

      // Determine active line from video.currentTime
      const currentLine = lines.find((l) => time >= l.start && time < l.end) || null;
      const currentLineId = currentLine ? currentLine.id : null;

      if (currentLine) {
        lastActiveLineRef.current = currentLine;
      }

      // Update React state ONLY when active line changes!
      if (activeLineIdRef.current !== currentLineId) {
        activeLineIdRef.current = currentLineId;
        setActiveLine(currentLine);
        setIsDoodleActive(false);
      }

      // Per-frame direct DOM SVG clip-path handwriting reveal
      if (currentLine && wordDomElsRef.current.length > 0) {
        let completedWords = 0;

        wordDomElsRef.current.forEach((item) => {
          if (!item || !item.el) return;
          const { el, timing, lineStart, lineEnd } = item;

          let progress = 0;
          if (timing) {
            const dur = timing.end - timing.start;
            progress = dur > 0 ? (time - timing.start) / dur : time >= timing.start ? 1 : 0;
          } else {
            const dur = lineEnd - lineStart;
            progress = dur > 0 ? (time - lineStart) / dur : time >= lineStart ? 1 : 0;
          }

          const clampedProgress = Math.max(0, Math.min(1, progress));

          // Direct DOM style update: reveal handwriting progressively left -> right
          el.style.clipPath = `polygon(0% 0%, ${clampedProgress * 100}% 0%, ${clampedProgress * 100}% 100%, 0% 100%)`;
          el.style.opacity = clampedProgress > 0.005 ? '1' : '0';

          if (clampedProgress >= 0.9) completedWords++;
        });

        // Activate manga doodle when text reveal is mostly finished
        const allWordsComplete = completedWords >= Math.max(1, wordDomElsRef.current.length - 1);
        if (allWordsComplete && currentLine.doodle) {
          setIsDoodleActive(true);
        }
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [videoRef, lines, enabled, triggerGlitchExit]);

  // Clean up GSAP on unmount
  useEffect(() => {
    return () => {
      if (breathingTweenRef.current) breathingTweenRef.current.kill();
    };
  }, []);

  const svgBubblePath = useMemo(() => getSvgPathForPosition(position), [position]);

  if (!enabled || !hasStarted || isGlitchDone || (!currentDisplayLine && !isGlitching)) {
    return (
      <div className="bmo-speech-bubble-root bmo-bubble-hidden" style={{ opacity: 0, pointerEvents: 'none' }}>
        <div aria-live="polite" className="sr-only" />
      </div>
    );
  }

  const rootClasses = [
    'bmo-speech-bubble-root',
    `bmo-bubble-pos-${position}`,
    `bmo-variant-${variant}`,
    `bmo-intensity-${intensity}`,
    isGlitching ? 'bmo-bubble-glitching' : '',
    isReadyText ? 'bmo-bubble-ready' : '',
    isLetsGoText ? 'bmo-bubble-letsgo' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={rootClasses}>
      {/* Accessible Screen Reader Announcement */}
      <div aria-live="polite" className="sr-only">
        {currentDisplayLine?.text}
      </div>

      {/* Visual Speech Bubble */}
      <div ref={paperRef} className="bmo-paper-card" aria-hidden="true">
        {/* SVG Paper Background & Integrated Speech Tail */}
        <svg
          className="bmo-bubble-svg-bg"
          viewBox="0 0 390 240"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="bmo-paper-path" d={svgBubblePath} />
        </svg>

        {/* Paper Grain Overlay */}
        <div className="bmo-paper-noise-overlay" />

        {/* Text Content */}
        <div className="bmo-bubble-content-wrap">
          <div ref={textRef} className="bmo-bubble-text">
            {wordTokens.map((item, i) => {
              const rot = getWordRotation(i, item.word);
              return (
                <span
                  key={`${item.word}-${i}`}
                  ref={(el) => registerWordEl(el, i)}
                  className="bmo-word-span"
                  style={{
                    transform: `rotate(${rot}deg)`,
                    clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                    opacity: 0,
                  }}
                >
                  {item.word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Dynamic Manga Doodle */}
        {showDoodles && currentDisplayLine?.doodle && (
          <div className="bmo-doodle-container">
            <DoodleRenderer
              doodle={currentDisplayLine.doodle}
              isActive={isDoodleActive}
              intensity={intensity}
            />
          </div>
        )}
      </div>
    </div>
  );
};
