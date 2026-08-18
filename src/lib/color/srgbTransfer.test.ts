import { describe, expect, it } from 'vitest';
import { getSrgb8BitChannels } from './srgb8Bit';
import {
  createNeutralLinearSrgbColor,
  decodeSrgbChannel,
  encodeLinearSrgbChannel,
} from './srgbTransfer';

describe('sRGB transfer functions', () => {
  // Reference: CSS Color 4 sample conversion code.
  // https://www.w3.org/TR/css-color-4/#color-conversion-code
  it('decodes the endpoints and 8-bit midpoint to linear light', () => {
    expect(decodeSrgbChannel(0)).toBe(0);
    expect(decodeSrgbChannel(1)).toBe(1);
    expect(decodeSrgbChannel(128 / 255)).toBeCloseTo(0.21586050011389926, 12);
  });

  it('encodes 50% linear light near 188 in 8-bit sRGB', () => {
    expect(encodeLinearSrgbChannel(0)).toBe(0);
    expect(encodeLinearSrgbChannel(1)).toBeCloseTo(1, 12);
    expect(encodeLinearSrgbChannel(0.5)).toBeCloseTo(0.7353569830524495, 12);
    expect(getSrgb8BitChannels(createNeutralLinearSrgbColor(0.5))).toEqual([
      188, 188, 188,
    ]);
  });

  it.each([0, 0.02, 128 / 255, 0.75, 1])(
    'round-trips encoded channel %s without display rounding',
    (encoded) => {
      expect(encodeLinearSrgbChannel(decodeSrgbChannel(encoded))).toBeCloseTo(
        encoded,
        12,
      );
    },
  );
});
