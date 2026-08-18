import type { CanonicalColor } from '../../types/color';
import { createColor, getColorCoordinates } from './colorEngine';

function requireChannel(value: number | null): number {
  if (value === null) {
    throw new TypeError('A numeric sRGB channel was expected.');
  }

  return value;
}

export function decodeSrgbChannel(encoded: number): number {
  const linear = getColorCoordinates(
    createColor('srgb', [encoded, encoded, encoded]),
    'srgb-linear',
  );

  return requireChannel(linear[0]);
}

export function encodeLinearSrgbChannel(linear: number): number {
  const encoded = getColorCoordinates(
    createColor('srgb-linear', [linear, linear, linear]),
    'srgb',
  );

  return requireChannel(encoded[0]);
}

export function createNeutralSrgbColor(
  encoded: number,
  alpha = 1,
): CanonicalColor {
  return createColor('srgb', [encoded, encoded, encoded], alpha);
}

export function createNeutralLinearSrgbColor(
  linear: number,
  alpha = 1,
): CanonicalColor {
  return createColor('srgb-linear', [linear, linear, linear], alpha);
}
