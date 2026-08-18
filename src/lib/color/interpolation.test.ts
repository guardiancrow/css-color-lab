import { describe, expect, it } from 'vitest';
import { createColor, interpolateRgbColors } from './colorEngine';
import { getSrgb8BitChannels } from './srgb8Bit';

describe('RGB interpolation', () => {
  const black = createColor('srgb', [0, 0, 0]);
  const white = createColor('srgb', [1, 1, 1]);

  it('makes the numeric midpoint in encoded sRGB', () => {
    const midpoint = interpolateRgbColors(black, white, 0.5, 'srgb');

    expect(midpoint.space).toBe('srgb');
    expect(midpoint.coordinates).toEqual([0.5, 0.5, 0.5]);
    expect(getSrgb8BitChannels(midpoint)).toEqual([128, 128, 128]);
  });

  it('makes the light midpoint in Linear sRGB', () => {
    const midpoint = interpolateRgbColors(black, white, 0.5, 'srgb-linear');

    expect(midpoint.space).toBe('srgb-linear');
    expect(midpoint.coordinates).toEqual([0.5, 0.5, 0.5]);
    expect(getSrgb8BitChannels(midpoint)).toEqual([188, 188, 188]);
  });

  it('rejects an amount outside the interpolation interval', () => {
    expect(() => interpolateRgbColors(black, white, 1.01, 'srgb')).toThrow(
      RangeError,
    );
  });
});
