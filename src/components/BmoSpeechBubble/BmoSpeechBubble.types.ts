import React from 'react';

export type SpeechBubblePosition = 'left' | 'right' | 'top' | 'bottom';
export type SpeechBubbleVariant = 'manga' | 'minimal';
export type SpeechBubbleIntensity = 'low' | 'medium' | 'high';

export type DoodleType =
  | 'star-burst'
  | 'excitement-mark'
  | 'confused-scribble'
  | 'path-arrow'
  | 'rough-circle'
  | 'label-tags'
  | 'off-page-arrow'
  | 'empty-emphasis'
  | 'speed-lines';

export interface WordTiming {
  word: string;
  start: number; // seconds from video start
  end: number;   // seconds from video start
}

export interface DialogueLine {
  id: string;
  text: string;
  start: number; // seconds from video start
  end: number;   // seconds from video start
  words?: WordTiming[];
  doodle?: DoodleType;
}

export interface BmoSpeechBubbleProps {
  /** Ref to the HTMLVideoElement serving as master clock */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Array of video-synchronized dialogue lines */
  lines: DialogueLine[];
  /** Master toggle to enable/disable dialogue speech bubble. Default: true */
  enabled?: boolean;
  /** Position of bubble relative to BMO. Default: 'right' */
  position?: SpeechBubblePosition;
  /** Visual variant. Default: 'manga' */
  variant?: SpeechBubbleVariant;
  /** Motion intensity. Default: 'medium' */
  intensity?: SpeechBubbleIntensity;
  /** Whether to show manga doodles. Default: true */
  showDoodles?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Current interaction step (e.g. 'initial' | 'playing' | 'ended' | 'transitioning') */
  step?: string;
}
