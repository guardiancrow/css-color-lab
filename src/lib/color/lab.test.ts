import { describe, expect, it } from 'vitest';
import type { ColorCoordinates } from '../../types/color';
import {
  convertColor,
  createColor,
  getColorCoordinates,
  isInColorGamut,
} from './colorEngine';
import {
  createLabColor,
  createLchColor,
  getEditableLchCoordinates,
  getLabPipeline,
  updateLabChannel,
  updateLchChannel,
} from './lab';

function expectCoordinatesCloseTo(
  actual: ColorCoordinates,
  expected: ColorCoordinates,
  precision = 5,
) {
  expected.forEach((value, index) => {
    if (value === null) {
      expect(actual[index]).toBeNull();
    } else {
      expect(actual[index]).toBeCloseTo(value, precision);
    }
  });
}

describe('known CIE Lab values', () => {
  // Expected values are based on CSS Color 4 sRGB/XYZ matrices, D65→D50
  // Bradford adaptation, and the CIE Lab equations.
  // https://www.w3.org/TR/css-color-4/#color-conversion-code
  it.each([
    ['red', [1, 0, 0], [54.29054, 80.80493, 69.89096]],
    ['green', [0, 1, 0], [87.81853, -79.27106, 80.99458]],
    ['blue', [0, 0, 1], [29.5683, 68.28736, -112.02971]],
    ['white', [1, 1, 1], [100, 0, 0]],
    ['black', [0, 0, 0], [0, 0, 0]],
    ['neutral gray', [0.5, 0.5, 0.5], [53.38896, 0, 0]],
  ] as const)('converts sRGB %s to Lab D50', (_name, srgb, lab) => {
    expectCoordinatesCloseTo(
      getColorCoordinates(createColor('srgb', srgb), 'lab'),
      lab,
      4,
    );
  });
});

describe('Lab conversion path', () => {
  it('chromatically adapts known sRGB red from XYZ D65 to D50', () => {
    const pipeline = getLabPipeline(createColor('srgb', [1, 0, 0]));

    expectCoordinatesCloseTo(
      pipeline.xyzD65,
      [0.4123907993, 0.2126390059, 0.0193308187],
      8,
    );
    expectCoordinatesCloseTo(
      pipeline.xyzD50,
      [0.4360657469, 0.2224931771, 0.0139239215],
      8,
    );
    expect(pipeline.xyzD50).not.toEqual(pipeline.xyzD65);
  });

  it('round-trips through XYZ D65, XYZ D50, and Lab', () => {
    const source = createColor('srgb', [0.82, 0.31, 0.12]);
    const xyzD65 = convertColor(source, 'xyz-d65');
    const xyzD50 = convertColor(xyzD65, 'xyz-d50');
    const lab = convertColor(xyzD50, 'lab');
    const result = convertColor(lab, 'srgb');

    expectCoordinatesCloseTo(result.coordinates, source.coordinates, 10);
  });
});

describe('Lab and LCh coordinates', () => {
  it.each([
    [
      [50, 40, 0],
      [50, 40, 0],
    ],
    [
      [50, 0, 40],
      [50, 40, 90],
    ],
    [
      [50, -40, 0],
      [50, 40, 180],
    ],
    [
      [50, 0, -40],
      [50, 40, 270],
    ],
  ] as const)('converts simple Lab %j to LCh %j', (lab, lch) => {
    expectCoordinatesCloseTo(
      convertColor(createLabColor(lab), 'lch').coordinates,
      lch,
      10,
    );
  });

  it('round-trips Lab through LCh', () => {
    const source = createLabColor([62, 44, -31]);
    const result = convertColor(convertColor(source, 'lch'), 'lab');

    expectCoordinatesCloseTo(result.coordinates, source.coordinates, 10);
  });

  it.each([
    [360, 0],
    [-30, 330],
    [390, 30],
  ])('normalizes LCh Hue %s to %s', (input, expected) => {
    const result = updateLchChannel(createLchColor([50, 40, 0]), 2, input);

    expect(result.coordinates[2]).toBe(expected);
  });

  it('uses 0 degrees as the converted powerless Hue fallback', () => {
    const neutral = createLabColor([50, 0, 0]);

    expect(convertColor(neutral, 'lch').coordinates[2]).toBeNull();
    expect(getEditableLchCoordinates(neutral)).toEqual([50, 0, 0]);
  });

  it('retains an explicitly edited Hue while C is zero', () => {
    const neutral = createLabColor([50, 0, 0]);
    const hueEdited = updateLchChannel(neutral, 2, 120);
    const alternateHue = createLchColor([50, 0, 300]);

    expect(hueEdited.coordinates).toEqual([50, 0, 120]);
    expectCoordinatesCloseTo(
      convertColor(hueEdited, 'lab').coordinates,
      convertColor(alternateHue, 'lab').coordinates,
      10,
    );
  });
});

describe('Lab and LCh gamut policy', () => {
  it('keeps values beyond the teaching slider range', () => {
    const result = updateLabChannel(createLabColor([60, 0, 0]), 1, 180);

    expect(result.coordinates).toEqual([60, 180, 0]);
  });

  it('retains an out-of-sRGB LCh color without clipping', () => {
    const color = createLchColor([65, 100, 40]);
    const rawSrgb = convertColor(color, 'srgb');

    expect(color.coordinates).toEqual([65, 100, 40]);
    expect(isInColorGamut(color, 'srgb')).toBe(false);
    expect(
      rawSrgb.coordinates.some(
        (channel) => channel !== null && (channel < 0 || channel > 1),
      ),
    ).toBe(true);
  });
});
