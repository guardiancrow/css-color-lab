import { describe, expect, it } from 'vitest';
import type { ColorCoordinates } from '../../types/color';
import { convertColor, createColor, getRelativeLuminance } from './colorEngine';
import {
  clampHslPercentage,
  createHslColor,
  getEditableHslCoordinates,
  normalizeHue,
  updateHslChannel,
} from './hsl';

function expectCoordinatesCloseTo(
  actual: ColorCoordinates,
  expected: ColorCoordinates,
  precision = 10,
) {
  expected.forEach((value, index) => {
    if (value === null) {
      expect(actual[index]).toBeNull();
    } else {
      expect(actual[index]).toBeCloseTo(value, precision);
    }
  });
}

describe('HSL known values', () => {
  // Pure sRGB primary and secondary colors, not CSS named-color "green".
  it.each([
    ['red', [1, 0, 0], [0, 100, 50]],
    ['yellow', [1, 1, 0], [60, 100, 50]],
    ['green', [0, 1, 0], [120, 100, 50]],
    ['cyan', [0, 1, 1], [180, 100, 50]],
    ['blue', [0, 0, 1], [240, 100, 50]],
    ['magenta', [1, 0, 1], [300, 100, 50]],
  ] as const)('converts pure sRGB %s to HSL', (_name, srgb, expected) => {
    expectCoordinatesCloseTo(
      convertColor(createColor('srgb', srgb), 'hsl').coordinates,
      expected,
    );
  });

  it.each([
    ['black', [0, 0, 0], [null, 0, 0]],
    ['white', [1, 1, 1], [null, 0, 100]],
    ['neutral gray', [0.5, 0.5, 0.5], [null, 0, 50]],
  ] as const)('marks %s hue as powerless', (_name, srgb, expected) => {
    expectCoordinatesCloseTo(
      convertColor(createColor('srgb', srgb), 'hsl').coordinates,
      expected,
    );
  });
});

describe('HSL editing helpers', () => {
  it.each([
    [0, 0],
    [360, 0],
    [-30, 330],
    [390, 30],
    [720, 0],
  ])('normalizes hue %s to %s', (input, expected) => {
    expect(normalizeHue(input)).toBe(expected);
  });

  it('clamps Saturation and Lightness percentages', () => {
    expect(clampHslPercentage(-1)).toBe(0);
    expect(clampHslPercentage(50)).toBe(50);
    expect(clampHslPercentage(101)).toBe(100);
  });

  it('uses 0 degrees as the editable fallback for converted gray', () => {
    const gray = createColor('srgb', [0.5, 0.5, 0.5]);

    expect(getEditableHslCoordinates(gray)).toEqual([0, 0, 50]);
  });

  it('stores an explicitly edited powerless hue in canonical HSL coordinates', () => {
    const gray = createColor('srgb', [0.5, 0.5, 0.5]);
    const hueEdited = updateHslChannel(gray, 0, 120);
    const saturated = updateHslChannel(hueEdited, 1, 100);

    expect(hueEdited.coordinates).toEqual([120, 0, 50]);
    expectCoordinatesCloseTo(
      convertColor(hueEdited, 'srgb').coordinates,
      [0.5, 0.5, 0.5],
    );
    expect(saturated.coordinates).toEqual([120, 100, 50]);
  });

  it('round-trips representative sRGB through HSL', () => {
    const source = createColor('srgb', [0.82, 0.31, 0.12]);
    const result = convertColor(convertColor(source, 'hsl'), 'srgb');

    expectCoordinatesCloseTo(result.coordinates, source.coordinates);
  });
});

describe('HSL Lightness and relative luminance', () => {
  it('keeps HSL Lightness equal while yellow and blue luminance differ', () => {
    const yellow = createHslColor([60, 100, 50]);
    const blue = createHslColor([240, 100, 50]);

    expect(yellow.coordinates[2]).toBe(50);
    expect(blue.coordinates[2]).toBe(50);
    expect(getRelativeLuminance(yellow)).toBeCloseTo(0.9278076846, 9);
    expect(getRelativeLuminance(blue)).toBeCloseTo(0.0721923154, 9);
  });
});
