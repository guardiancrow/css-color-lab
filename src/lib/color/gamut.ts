import type {
  CanonicalColor,
  ColorCoordinates,
  GamutSpaceId,
} from '../../types/color';
import {
  clipColorToGamut,
  convertColor,
  isInColorGamut,
  mapColorToGamut,
} from './colorEngine';
import { createOklchColor } from './oklab';

export const GAMUTS = [
  { id: 'srgb', label: 'sRGB' },
  { id: 'display-p3', label: 'Display P3' },
  { id: 'rec2020', label: 'Rec.2020' },
] as const satisfies readonly {
  readonly id: GamutSpaceId;
  readonly label: string;
}[];

export interface GamutStatus {
  readonly gamut: GamutSpaceId;
  readonly label: string;
  readonly isInGamut: boolean;
}

export interface GamutPreset {
  readonly id: 'srgb' | 'p3' | 'rec2020' | 'outside';
  readonly label: string;
  readonly coordinates: readonly [number, number, number];
  readonly expected: readonly [boolean, boolean, boolean];
}

/** Fixed examples around one L/h so only Chroma changes. */
export const GAMUT_PRESETS: readonly GamutPreset[] = [
  {
    id: 'srgb',
    label: 'In sRGB',
    coordinates: [0.7, 0.12, 20],
    expected: [true, true, true],
  },
  {
    id: 'p3',
    label: 'Outside sRGB / Inside Display P3',
    coordinates: [0.7, 0.22, 20],
    expected: [false, true, true],
  },
  {
    id: 'rec2020',
    label: 'Outside Display P3 / Inside Rec.2020',
    coordinates: [0.7, 0.29, 20],
    expected: [false, false, true],
  },
  {
    id: 'outside',
    label: 'Outside Rec.2020',
    coordinates: [0.7, 0.4, 20],
    expected: [false, false, false],
  },
] as const;

export function getGamutStatuses(
  color: CanonicalColor,
): readonly GamutStatus[] {
  return GAMUTS.map(({ id, label }) => ({
    gamut: id,
    label,
    isInGamut: isInColorGamut(color, id),
  }));
}

export interface FindMaxChromaOptions {
  readonly lightness: number;
  readonly hue: number;
  readonly gamut: GamutSpaceId;
  readonly tolerance?: number;
}

/**
 * Find the largest in-gamut OkLCh Chroma on one L/h ray.
 * It never clips or maps. The returned lower bound is in gamut and is within
 * `tolerance` of the first known out-of-gamut upper bound.
 */
export function findMaxChromaForGamut({
  lightness,
  hue,
  gamut,
  tolerance = 0.00001,
}: FindMaxChromaOptions): number {
  if (!Number.isFinite(lightness) || lightness < 0 || lightness > 1) {
    throw new RangeError('Lightness must be from 0 to 1.');
  }

  if (!Number.isFinite(hue)) {
    throw new TypeError('Hue must be finite.');
  }

  if (!Number.isFinite(tolerance) || tolerance <= 0) {
    throw new RangeError('Tolerance must be a positive finite number.');
  }

  const isInGamut = (chroma: number) =>
    isInColorGamut(createOklchColor([lightness, chroma, hue]), gamut);

  if (!isInGamut(0)) {
    return 0;
  }

  let lower = 0;
  let upper = 0.4;
  while (isInGamut(upper) && upper < 4) {
    lower = upper;
    upper *= 2;
  }

  if (upper >= 4 && isInGamut(upper)) {
    throw new RangeError('Could not bracket the gamut boundary below C = 4.');
  }

  while (upper - lower > tolerance) {
    const midpoint = (lower + upper) / 2;
    if (isInGamut(midpoint)) {
      lower = midpoint;
    } else {
      upper = midpoint;
    }
  }

  return lower;
}

export interface GamutComparisonResult {
  readonly original: CanonicalColor;
  readonly rawSrgb: CanonicalColor;
  readonly clipped: CanonicalColor;
  readonly mapped: CanonicalColor;
  readonly originalOklch: ColorCoordinates;
  readonly clippedOklch: ColorCoordinates;
  readonly mappedOklch: ColorCoordinates;
  readonly clippedDelta: ColorCoordinates;
  readonly mappedDelta: ColorCoordinates;
}

export interface TargetGamutComparisonResult {
  readonly target: GamutSpaceId;
  readonly original: CanonicalColor;
  readonly rawTarget: CanonicalColor;
  readonly clipped: CanonicalColor;
  readonly mapped: CanonicalColor;
  readonly originalOklch: ColorCoordinates;
  readonly clippedOklch: ColorCoordinates;
  readonly mappedOklch: ColorCoordinates;
  readonly clippedDelta: ColorCoordinates;
  readonly mappedDelta: ColorCoordinates;
}

function numericDelta(
  result: ColorCoordinates,
  original: ColorCoordinates,
): ColorCoordinates {
  return result.map((value, index) => {
    const source = original[index] ?? null;
    if (value === null || source === null) {
      return null;
    }

    if (index !== 2) {
      return value - source;
    }

    return ((value - source + 540) % 360) - 180;
  }) as [number | null, number | null, number | null];
}

export function compareSrgbClippingAndMapping(
  original: CanonicalColor,
): GamutComparisonResult {
  const comparison = compareClippingAndMapping(original, 'srgb');

  return {
    original: comparison.original,
    rawSrgb: comparison.rawTarget,
    clipped: comparison.clipped,
    mapped: comparison.mapped,
    originalOklch: comparison.originalOklch,
    clippedOklch: comparison.clippedOklch,
    mappedOklch: comparison.mappedOklch,
    clippedDelta: comparison.clippedDelta,
    mappedDelta: comparison.mappedDelta,
  };
}

export function compareClippingAndMapping(
  original: CanonicalColor,
  target: GamutSpaceId,
): TargetGamutComparisonResult {
  const rawTarget = convertColor(original, target);
  const clipped = clipColorToGamut(original, target);
  const mapped = mapColorToGamut(original, target, 'css');
  const originalOklch = convertColor(original, 'oklch').coordinates;
  const clippedOklch = convertColor(clipped, 'oklch').coordinates;
  const mappedOklch = convertColor(mapped, 'oklch').coordinates;

  return {
    target,
    original,
    rawTarget,
    clipped,
    mapped,
    originalOklch,
    clippedOklch,
    mappedOklch,
    clippedDelta: numericDelta(clippedOklch, originalOklch),
    mappedDelta: numericDelta(mappedOklch, originalOklch),
  };
}
