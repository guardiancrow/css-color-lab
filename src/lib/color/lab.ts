import type { CanonicalColor, ColorCoordinates } from '../../types/color';
import { convertColor, createColor, getColorCoordinates } from './colorEngine';
import { normalizeHue } from './hsl';

export type LabChannelIndex = 0 | 1 | 2;
export type LchChannelIndex = 0 | 1 | 2;
export type EditableLabCoordinates = readonly [number, number, number];
export type EditableLchCoordinates = readonly [number, number, number];

export const LAB_SLIDER_RANGE = {
  lightness: [0, 100],
  a: [-125, 125],
  b: [-125, 125],
} as const;

export const LCH_SLIDER_RANGE = {
  lightness: [0, 100],
  chroma: [0, 150],
  hue: [0, 360],
} as const;

export interface LabPipeline {
  readonly xyzD65: ColorCoordinates;
  readonly xyzD50: ColorCoordinates;
  readonly lab: ColorCoordinates;
}

function clampLightness(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
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

export function getLabPipeline(color: CanonicalColor): LabPipeline {
  const xyzD65 = convertColor(color, 'xyz-d65');
  const xyzD50 = convertColor(xyzD65, 'xyz-d50');
  const lab = convertColor(xyzD50, 'lab');

  return {
    xyzD65: xyzD65.coordinates,
    xyzD50: xyzD50.coordinates,
    lab: lab.coordinates,
  };
}

export function getEditableLabCoordinates(
  color: CanonicalColor,
): EditableLabCoordinates {
  const [lightness, a, b] = getColorCoordinates(color, 'lab');

  return [
    clampLightness(numericOrFallback(lightness)),
    numericOrFallback(a),
    numericOrFallback(b),
  ];
}

export function getEditableLchCoordinates(
  color: CanonicalColor,
): EditableLchCoordinates {
  const [lightness, chroma, hue] = getColorCoordinates(color, 'lch');

  return [
    clampLightness(numericOrFallback(lightness)),
    clampChroma(numericOrFallback(chroma)),
    normalizeHue(numericOrFallback(hue)),
  ];
}

export function createLabColor(
  coordinates: ColorCoordinates,
  alpha = 1,
): CanonicalColor {
  const [lightness, a, b] = coordinates;

  return createColor(
    'lab',
    [lightness === null ? null : clampLightness(lightness), a, b],
    alpha,
  );
}

export function createLchColor(
  coordinates: ColorCoordinates,
  alpha = 1,
): CanonicalColor {
  const [lightness, chroma, hue] = coordinates;

  return createColor(
    'lch',
    [
      lightness === null ? null : clampLightness(lightness),
      chroma === null ? null : clampChroma(chroma),
      hue === null ? null : normalizeHue(hue),
    ],
    alpha,
  );
}

export function updateLabChannel(
  color: CanonicalColor,
  channelIndex: LabChannelIndex,
  value: number,
): CanonicalColor {
  const updated: [number, number, number] = [
    ...getEditableLabCoordinates(color),
  ];
  updated[channelIndex] = channelIndex === 0 ? clampLightness(value) : value;

  return createLabColor(updated, color.alpha);
}

export function updateLchChannel(
  color: CanonicalColor,
  channelIndex: LchChannelIndex,
  value: number,
): CanonicalColor {
  const updated: [number, number, number] = [
    ...getEditableLchCoordinates(color),
  ];
  updated[channelIndex] =
    channelIndex === 0
      ? clampLightness(value)
      : channelIndex === 1
        ? clampChroma(value)
        : normalizeHue(value);

  return createLchColor(updated, color.alpha);
}

export function parseLabInput(
  value: string,
  channelIndex: LabChannelIndex,
): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return channelIndex !== 0 || (parsed >= 0 && parsed <= 100) ? parsed : null;
}

export function parseLchInput(
  value: string,
  channelIndex: LchChannelIndex,
): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (channelIndex === 0) {
    return parsed >= 0 && parsed <= 100 ? parsed : null;
  }

  return channelIndex === 1 && parsed < 0 ? null : parsed;
}

export function commitLabInput(
  value: string,
  fallback: number,
  channelIndex: LabChannelIndex,
): number {
  const parsed = value.trim() === '' ? Number.NaN : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return channelIndex === 0 ? clampLightness(parsed) : parsed;
}

export function commitLchInput(
  value: string,
  fallback: number,
  channelIndex: LchChannelIndex,
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
