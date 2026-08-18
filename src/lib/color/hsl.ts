import type { CanonicalColor, ColorCoordinates } from '../../types/color';
import { createColor, getColorCoordinates } from './colorEngine';

export type HslChannelIndex = 0 | 1 | 2;
export type EditableHslCoordinates = readonly [number, number, number];

export function normalizeHue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const normalized = value % 360;
  return Object.is(normalized, -0)
    ? 0
    : normalized < 0
      ? normalized + 360
      : normalized;
}

export function clampHslPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export function getEditableHslCoordinates(
  color: CanonicalColor,
): EditableHslCoordinates {
  const [hue, saturation, lightness] = getColorCoordinates(color, 'hsl');

  return [
    normalizeHue(hue ?? 0),
    clampHslPercentage(saturation ?? 0),
    clampHslPercentage(lightness ?? 0),
  ];
}

export function createHslColor(
  coordinates: ColorCoordinates,
  alpha = 1,
): CanonicalColor {
  const hue = coordinates[0];
  const saturation = coordinates[1];
  const lightness = coordinates[2];

  return createColor(
    'hsl',
    [
      hue === null ? null : normalizeHue(hue),
      saturation === null ? null : clampHslPercentage(saturation),
      lightness === null ? null : clampHslPercentage(lightness),
    ],
    alpha,
  );
}

export function updateHslChannel(
  color: CanonicalColor,
  channelIndex: HslChannelIndex,
  value: number,
): CanonicalColor {
  const current = getEditableHslCoordinates(color);
  const updated: [number, number, number] = [...current];
  updated[channelIndex] =
    channelIndex === 0 ? normalizeHue(value) : clampHslPercentage(value);

  return createHslColor(updated, color.alpha);
}

export function parseHslInput(
  value: string,
  channelIndex: HslChannelIndex,
): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return channelIndex === 0 || (parsed >= 0 && parsed <= 100) ? parsed : null;
}

export function commitHslInput(
  value: string,
  fallback: number,
  channelIndex: HslChannelIndex,
): number {
  if (value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return channelIndex === 0 ? normalizeHue(parsed) : clampHslPercentage(parsed);
}
