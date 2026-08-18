import { describe, expect, it } from 'vitest';
import {
  adjustHueEndpoints,
  createColor,
  interpolateColors,
  interpolateRgbColors,
  isInColorGamut,
  mapColorToGamut,
} from './colorEngine';
import {
  getHuePath,
  sampleInterpolation,
  serializeColorMix,
} from './interpolation';
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

describe('general color interpolation', () => {
  it('interpolates raw Oklab coordinates', () => {
    const midpoint = interpolateColors(
      createColor('oklab', [0.6, 0.2, 0.1]),
      createColor('oklab', [0.8, -0.2, 0.3]),
      0.5,
      { space: 'oklab' },
    );

    expect(midpoint.coordinates[0]).toBeCloseTo(0.7);
    expect(midpoint.coordinates[1]).toBeCloseTo(0);
    expect(midpoint.coordinates[2]).toBeCloseTo(0.2);
  });

  it('interpolates OkLCh L, C, and the selected hue path', () => {
    const midpoint = interpolateColors(
      createColor('oklch', [0.5, 0.1, 40]),
      createColor('oklch', [0.9, 0.3, 100]),
      0.5,
      { space: 'oklch', hueMethod: 'shorter' },
    );

    expect(midpoint.coordinates[0]).toBeCloseTo(0.7);
    expect(midpoint.coordinates[1]).toBeCloseTo(0.2);
    expect(midpoint.coordinates[2]).toBeCloseTo(70);
  });

  it('takes each of the four CSS hue paths across the 0 degree boundary', () => {
    const start = createColor('oklch', [0.7, 0.15, 20]);
    const end = createColor('oklch', [0.7, 0.15, 300]);
    const midpointHue = (method: Parameters<typeof getHuePath>[2]) =>
      interpolateColors(start, end, 0.5, {
        space: 'oklch',
        hueMethod: method,
      }).coordinates[2];

    expect(midpointHue('shorter')).toBeCloseTo(340);
    expect(midpointHue('longer')).toBeCloseTo(160);
    expect(midpointHue('increasing')).toBeCloseTo(160);
    expect(midpointHue('decreasing')).toBeCloseTo(340);
    expect(getHuePath(350, 10, 'shorter')[1]).toBeCloseTo(0);
  });

  it('carries the chromatic endpoint hue into a powerless endpoint', () => {
    const midpoint = interpolateColors(
      createColor('oklch', [0.6, 0, 20]),
      createColor('oklch', [0.6, 0.2, 240]),
      0.5,
      { space: 'oklch', hueMethod: 'shorter' },
    );

    expect(midpoint.coordinates[2]).toBeCloseTo(240);
    expect(adjustHueEndpoints(null, 240, 'shorter')).toEqual([240, 240]);
  });

  it('keeps hue missing when both endpoint hues are powerless', () => {
    const midpoint = interpolateColors(
      createColor('oklch', [0.4, 0, 20]),
      createColor('oklch', [0.8, 0, 240]),
      0.5,
      { space: 'oklch' },
    );

    expect(midpoint.coordinates[2]).toBeNull();
  });

  it('premultiplies rectangular coordinates by alpha', () => {
    const midpoint = interpolateColors(
      createColor('srgb', [1, 0, 0], 0.4),
      createColor('srgb', [0, 1, 0], 0.6),
      0.5,
      { space: 'srgb' },
    );

    expect(midpoint.alpha).toBeCloseTo(0.5);
    expect(midpoint.coordinates[0]).toBeCloseTo(0.4);
    expect(midpoint.coordinates[1]).toBeCloseTo(0.6);
  });

  it('does not leak RGB coordinates from a fully transparent endpoint', () => {
    const midpoint = interpolateColors(
      createColor('srgb', [1, 0, 0], 0),
      createColor('srgb', [0, 0, 1], 1),
      0.5,
      { space: 'srgb' },
    );

    expect(midpoint.alpha).toBeCloseTo(0.5);
    expect(midpoint.coordinates).toEqual([0, 0, 1]);
  });

  it('keeps raw out-of-gamut intermediates until mapping is requested', () => {
    const midpoint = interpolateColors(
      createColor('oklch', [0.72, 0.34, 20]),
      createColor('oklch', [0.72, 0.34, 80]),
      0.5,
      { space: 'oklch' },
    );

    expect(isInColorGamut(midpoint, 'srgb')).toBe(false);
    expect(midpoint.space).toBe('oklch');
    expect(midpoint.coordinates[1]).toBeCloseTo(0.34);
    expect(isInColorGamut(mapColorToGamut(midpoint, 'srgb'), 'srgb')).toBe(
      true,
    );
  });

  it('samples endpoints and serializes an explicit CSS color-mix', () => {
    const start = createColor('srgb', [1, 0, 0]);
    const end = createColor('srgb', [0, 0, 1]);

    expect(sampleInterpolation(start, end, 'oklab', 'shorter', 3)).toHaveLength(
      3,
    );
    expect(serializeColorMix(start, end, 0.25, 'oklch', 'longer')).toContain(
      'color-mix(in oklch longer hue',
    );
    expect(serializeColorMix(start, end, 0.25, 'oklch', 'longer')).toContain(
      '75%',
    );
  });
});
