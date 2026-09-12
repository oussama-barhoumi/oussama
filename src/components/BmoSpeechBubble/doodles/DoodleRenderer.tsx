import React from 'react';
import { DoodleType } from '../BmoSpeechBubble.types';
import { MangaBurst } from './MangaBurst';
import { ExcitementMark } from './ExcitementMark';
import { MangaScribble } from './MangaScribble';
import { MangaArrow } from './MangaArrow';
import { RoughCircle } from './RoughCircle';
import { LabelTags } from './LabelTags';
import { OffPageArrow } from './OffPageArrow';
import { EmptyEmphasis } from './EmptyEmphasis';
import { MangaSpeedLines } from './MangaSpeedLines';

interface DoodleRendererProps {
  doodle?: DoodleType;
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const DoodleRenderer: React.FC<DoodleRendererProps> = ({
  doodle,
  isActive,
  intensity = 'medium',
  className = '',
}) => {
  if (!doodle) return null;

  switch (doodle) {
    case 'star-burst':
      return (
        <MangaBurst
          isActive={isActive}
          intensity={intensity}
          className={`bmo-doodle-pos-top-right ${className}`}
        />
      );
    case 'excitement-mark':
      return (
        <ExcitementMark
          isActive={isActive}
          className={`bmo-doodle-pos-top-right ${className}`}
        />
      );
    case 'confused-scribble':
      return (
        <MangaScribble
          isActive={isActive}
          className={`bmo-doodle-pos-top-left ${className}`}
        />
      );
    case 'path-arrow':
      return (
        <MangaArrow
          isActive={isActive}
          className={`bmo-doodle-pos-bottom-left ${className}`}
        />
      );
    case 'rough-circle':
      return (
        <RoughCircle
          isActive={isActive}
          className={`bmo-doodle-pos-top-left ${className}`}
        />
      );
    case 'label-tags':
      return (
        <LabelTags
          isActive={isActive}
          className={`bmo-doodle-pos-bottom-right ${className}`}
        />
      );
    case 'off-page-arrow':
      return (
        <OffPageArrow
          isActive={isActive}
          className={`bmo-doodle-pos-bottom-right ${className}`}
        />
      );
    case 'empty-emphasis':
      return (
        <EmptyEmphasis
          isActive={isActive}
          className={`bmo-doodle-pos-bottom-center ${className}`}
        />
      );
    case 'speed-lines':
      return (
        <MangaSpeedLines
          isActive={isActive}
          className={`bmo-doodle-pos-bottom-right ${className}`}
        />
      );
    default:
      return null;
  }
};
