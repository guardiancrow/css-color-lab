import type { CanonicalColor, ColorCoordinates } from '../../types/color';
import { convertColor, createColor, getColorCoordinates } from './colorEngine';
import { normalizeHue } from './hsl';

export type OklabChannelIndex = 0 | 1 | 2;
export type OklchChannelIndex = 0 | 1 | 2;
export type EditableOklabCoordinates = readonly [number, number, number];
export type EditableOklchCoordinates = readonly [number, number, number];

/** CSS percentage reference ranges; these are teaching ranges, not limits. */
export const OKLAB_SLIDER_RANGE = {
  lightness: [0, 1],
  a: [-0.4, 0.4],
  b: [-0.4, 0.4],
} as const;

export const OKLCH_SLIDER_RANGE = {
  lightness: [0, 1],
  chroma: [0, 0.4],
  hue: [0, 360],
} as const;

export interface OklabPipeline {
  readonly xyzD65: ColorCoordinates;
  readonly oklab: ColorCoordinates;
}

function clampLightness(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function clampChroma(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function numericOrFallback(value: number | null, fallback = 0): number {
  return value === null || !Number.isFinite(value) ? fallback : value;
}

export function getOklabPipeline(color: CanonicalColor): OklabPipeline {
  const xyzD65 = convertColor(color, 'xyz-d65');
  const oklab = convertColor(xyzD65, 'oklab');

  return {
    xyzD65: xyzD65.coordinates,
    oklab: oklab.coordinates,
  };
}

export function getEditableOklabCoordinates(
  color: CanonicalColor,
): EditableOklabCoordinates {
  const [lightness, a, b] = getColorCoordinates(color, 'oklab');

  return [
    clampLightness(numericOrFallback(lightness)),
    numericOrFallback(a),
    numericOrFallback(b),
  ];
}

export function getEditableOklchCoordinates(
  color: CanonicalColor,
): EditableOklchCoordinates {
  const [lightness, chroma, hue] = getColorCoordinates(color, 'oklch');

  return [
    clampLightness(numericOrFallback(lightness)),
    clampChroma(numericOrFallback(chroma)),
    normalizeHue(numericOrFallback(hue)),
  ];
}

export function createOklabColor(
  coordinates: ColorCoordinates,
  alpha = 1,
): CanonicalColor {
  const [lightness, a, b] = coordinates;

  return createColor(
    'oklab',
    [lightness === null ? null : clampLightness(lightness), a, b],
    alpha,
  );
}

export function createOklchColor(
  coordinates: ColorCoordinates,
  alpha = 1,
): CanonicalColor {
  const [lightness, chroma, hue] = coordinates;

  return createColor(
    'oklch',
    [
      lightness === null ? null : clampLightness(lightness),
      chroma === null ? null : clampChroma(chroma),
      hue === null ? null : normalizeHue(hue),
    ],
    alpha,
  );
}

export function updateOklabChannel(
  color: CanonicalColor,
  channelIndex: OklabChannelIndex,
  value: number,
): CanonicalColor {
  const updated: [number, number, number] = [
    ...getEditableOklabCoordinates(color),
  ];
  updated[channelIndex] = channelIndex === 0 ? clampLightness(value) : value;

  return createOklabColor(updated, color.alpha);
}

export function updateOklchChannel(
  color: CanonicalColor,
  channelIndex: OklchChannelIndex,
  value: number,
): CanonicalColor {
  const updated: [number, number, number] = [
    ...getEditableOklchCoordinates(color),
  ];
  updated[channelIndex] =
    channelIndex === 0
      ? clampLightness(value)
      : channelIndex === 1
        ? clampChroma(value)
        : normalizeHue(value);

  return createOklchColor(updated, color.alpha);
}

export function parseOklabInput(
  value: string,
  channelIndex: OklabChannelIndex,
): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return channelIndex !== 0 || (parsed >= 0 && parsed <= 1) ? parsed : null;
}

export function parseOklchInput(
  value: string,
  channelIndex: OklchChannelIndex,
): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (channelIndex === 0) {
    return parsed >= 0 && parsed <= 1 ? parsed : null;
  }

  return channelIndex === 1 && parsed < 0 ? null : parsed;
}

export function commitOklabInput(
  value: string,
  fallback: number,
  channelIndex: OklabChannelIndex,
): number {
  const parsed = value.trim() === '' ? Number.NaN : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return channelIndex === 0 ? clampLightness(parsed) : parsed;
}

export function commitOklchInput(
  value: string,
  fallback: number,
  channelIndex: OklchChannelIndex,
): number {
  const parsed = value.trim() === '' ? Number.NaN : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return channelIndex === 0
    ? clampLightness(parsed)
    : channelIndex === 1
      ? clampChroma(parsed)
      : normalizeHue(parsed);
}
