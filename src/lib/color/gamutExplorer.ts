import type { CanonicalColor } from '../../types/color';
import { isInColorGamut } from './colorEngine';
import { GAMUTS, findMaxChromaForGamut } from './gamut';
import { getEditableOklchCoordinates } from './oklab';

const MINIMUM_CHROMA_EXTENT = 0.4;
const SCALE_HEADROOM = 1.1;

export interface GamutBoundaryValue {
  readonly id: (typeof GAMUTS)[number]['id'];
  readonly label: string;
  readonly maximumChroma: number;
  readonly difference: number;
  readonly isInGamut: boolean;
  readonly positionPercent: number;
}

export interface GamutBoundaryAnalysis {
  readonly lightness: number;
  readonly chroma: number;
  readonly hue: number;
  readonly scaleMaximum: number;
  readonly currentPositionPercent: number;
  readonly boundaries: readonly GamutBoundaryValue[];
}

export function analyzeGamutBoundaries(
  color: CanonicalColor,
): GamutBoundaryAnalysis {
  const [lightness, chroma, hue] = getEditableOklchCoordinates(color);
  const maxima = GAMUTS.map((gamut) => ({
    ...gamut,
    maximumChroma: findMaxChromaForGamut({
      lightness,
      hue,
      gamut: gamut.id,
    }),
  }));
  const scaleMaximum =
    Math.max(
      MINIMUM_CHROMA_EXTENT,
      chroma,
      ...maxima.map(({ maximumChroma }) => maximumChroma),
    ) * SCALE_HEADROOM;

  return {
    lightness,
    chroma,
    hue,
    scaleMaximum,
    currentPositionPercent: (chroma / scaleMaximum) * 100,
    boundaries: maxima.map(({ id, label, maximumChroma }) => ({
      id,
      label,
      maximumChroma,
      difference: maximumChroma - chroma,
      isInGamut: isInColorGamut(color, id),
      positionPercent: (maximumChroma / scaleMaximum) * 100,
    })),
  };
}

export function formatBoundaryDifference(difference: number): string {
  if (Math.abs(difference) < 0.000005) return 'At boundary';
  return difference > 0
    ? `${difference.toFixed(4)} remaining`
    : `${Math.abs(difference).toFixed(4)} outside boundary`;
}
