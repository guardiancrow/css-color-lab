import type { CanonicalColor } from '../../types/color';
import {
  createColor,
  getColorCoordinates,
  serializeColor,
} from './colorEngine';

export type SrgbChannelIndex = 0 | 1 | 2;
export type Srgb8BitChannels = readonly [number, number, number];

export function normalizeSrgbByte(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(255, Math.max(0, Math.round(value)));
}

export function parseSrgbByteInput(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 255
    ? parsed
    : null;
}

export function commitSrgbByteInput(value: string, fallback: number): number {
  if (value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? normalizeSrgbByte(parsed) : fallback;
}

export function getSrgb8BitChannels(color: CanonicalColor): Srgb8BitChannels {
  const coordinates = getColorCoordinates(color, 'srgb');
  const toByte = (coordinate: number | null) =>
    normalizeSrgbByte((coordinate ?? 0) * 255);

  return [
    toByte(coordinates[0]),
    toByte(coordinates[1]),
    toByte(coordinates[2]),
  ];
}

export function createSrgbColorFrom8Bit(
  channels: Srgb8BitChannels,
  alpha = 1,
): CanonicalColor {
  return createColor(
    'srgb',
    channels.map((channel) => normalizeSrgbByte(channel) / 255) as [
      number,
      number,
      number,
    ],
    alpha,
  );
}

export function updateSrgb8BitChannel(
  color: CanonicalColor,
  channelIndex: SrgbChannelIndex,
  value: number,
): CanonicalColor {
  const current = getSrgb8BitChannels(color);
  const updated: [number, number, number] = [...current];
  updated[channelIndex] = normalizeSrgbByte(value);

  return createSrgbColorFrom8Bit(updated, color.alpha);
}

export function formatSrgb8BitCss(channels: Srgb8BitChannels): string {
  return `rgb(${channels.join(' ')})`;
}

export function formatSrgb8BitHex(
  channels: Srgb8BitChannels,
  alpha = 1,
): string {
  return serializeColor(createSrgbColorFrom8Bit(channels, alpha), {
    space: 'srgb',
    format: 'hex',
  }).toUpperCase();
}
