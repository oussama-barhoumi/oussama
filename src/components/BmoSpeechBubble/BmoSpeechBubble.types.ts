export type SpeechBubblePosition = 'left' | 'right' | 'top' | 'bottom';
export type SpeechBubbleVariant = 'manga' | 'minimal';
export type SpeechBubbleIntensity = 'low' | 'medium' | 'high';

export interface BmoSpeechBubbleProps {
  /** The text dialogue string spoken by BMO */
  text: string;
  /** Whether BMO is actively speaking */
  isSpeaking: boolean;
  /** Position of the bubble relative to BMO's head/mouth. Controls tail orientation. Default: 'right' */
  position?: SpeechBubblePosition;
  /** Visual theme variant: 'manga' (hand-drawn paper + ink) or 'minimal' (clean editorial). Default: 'manga' */
  variant?: SpeechBubbleVariant;
  /** Motion and doodle reaction intensity: 'low' | 'medium' | 'high'. Default: 'medium' */
  intensity?: SpeechBubbleIntensity;
  /** Whether to render SVG manga reaction doodles. Default: true */
  showDoodles?: boolean;
  /** Extra CSS classes applied to the outer wrapper */
  className?: string;
}
