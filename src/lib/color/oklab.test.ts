import { describe, expect, it } from 'vitest';
import type { ColorCoordinates } from '../../types/color';
import {
  convertColor,
  createColor,
  getColorCoordinates,
  isInColorGamut,
} from './colorEngine';
import {
  createOklabColor,
  createOklchColor,
  getEditableOklchCoordinates,
  getOklabPipeline,
  updateOklabChannel,
  updateOklchChannel,
} from './oklab';

function expectCoordinatesCloseTo(
  actual: ColorCoordinates,
  expected: ColorCoordinates,
  precision = 7,
) {
  expected.forEach((value, index) => {
    if (value === null) {
      expect(actual[index]).toBeNull();
    } else {
      expect(actual[index]).toBeCloseTo(value, precision);
    }
  });
}

describe('known Oklab values', () => {
  // Independently calculated from the published Oklab matrices and equations.
  // https://www.w3.org/TR/css-color-4/#color-conversion-code
  // https://bottosson.github.io/posts/oklab/
  it.each([
    ['red', [1, 0, 0], [0.62795536, 0.22486307, 0.12584628]],
    ['green', [0, 1, 0], [0.86643962, -0.23388758, 0.17949845]],
    ['blue', [0, 0, 1], [0.45201372, -0.03245698, -0.31152817]],
    ['white', [1, 1, 1], [1, 0, 0]],
    ['black', [0, 0, 0], [0, 0, 0]],
    ['neutral gray', [0.5, 0.5, 0.5], [0.59818073, 0, 0]],
  ] as const)('converts sRGB %s to Oklab D65', (_name, srgb, oklab) => {
    expectCoordinatesCloseTo(
      getColorCoordinates(createColor('srgb', srgb), 'oklab'),
      oklab,
      7,
    );
  });
});

describe('Oklab conversion path', () => {
  it('uses XYZ D65 directly and round-trips to sRGB', () => {
    const source = createColor('srgb', [0.82, 0.31, 0.12]);
    const xyzD65 = convertColor(source, 'xyz-d65');
    const oklab = convertColor(xyzD65, 'oklab');
    const result = convertColor(oklab, 'srgb');
    const pipeline = getOklabPipeline(source);

    expect(pipeline.xyzD65).toEqual(xyzD65.coordinates);
    expect(pipeline.oklab).toEqual(oklab.coordinates);
    expectCoordinatesCloseTo(result.coordinates, source.coordinates, 10);
  });
});

describe('Oklab and OkLCh coordinates', () => {
  it.each([
    [
      [0.6, 0.2, 0],
      [0.6, 0.2, 0],
    ],
    [
      [0.6, 0, 0.2],
      [0.6, 0.2, 90],
    ],
    [
      [0.6, -0.2, 0],
      [0.6, 0.2, 180],
    ],
    [
      [0.6, 0, -0.2],
      [0.6, 0.2, 270],
    ],
  ] as const)('converts simple Oklab %j to OkLCh %j', (oklab, oklch) => {
    expectCoordinatesCloseTo(
      convertColor(createOklabColor(oklab), 'oklch').coordinates,
      oklch,
      10,
    );
  });

  it('round-trips Oklab through OkLCh', () => {
    const source = createOklabColor([0.62, 0.14, -0.11]);
    const result = convertColor(convertColor(source, 'oklch'), 'oklab');

    expectCoordinatesCloseTo(result.coordinates, source.coordinates, 10);
  });

  it.each([
    [360, 0],
    [-30, 330],
    [390, 30],
  ])('normalizes OkLCh Hue %s to %s', (input, expected) => {
    const result = updateOklchChannel(
      createOklchColor([0.6, 0.2, 0]),
      2,
      input,
    );

    expect(result.coordinates[2]).toBe(expected);
  });

  it('falls back missing powerless Hue to zero and retains explicit Hue', () => {
    const neutral = createOklabColor([0.6, 0, 0]);
    const hueEdited = updateOklchChannel(neutral, 2, 120);
    const alternateHue = createOklchColor([0.6, 0, 300]);

    expect(convertColor(neutral, 'oklch').coordinates[2]).toBeNull();
    expect(getEditableOklchCoordinates(neutral)).toEqual([0.6, 0, 0]);
    expect(hueEdited.coordinates).toEqual([0.6, 0, 120]);
    expectCoordinatesCloseTo(
      convertColor(hueEdited, 'srgb').coordinates,
      convertColor(alternateHue, 'srgb').coordinates,
      10,
    );
  });
});

describe('Oklab and OkLCh gamut policy', () => {
  it('keeps values beyond the teaching slider range', () => {
    const result = updateOklabChannel(createOklabColor([0.6, 0, 0]), 1, 0.55);

    expect(result.coordinates).toEqual([0.6, 0.55, 0]);
  });

  it('retains an out-of-sRGB color that remains inside Display P3', () => {
    const color = createOklchColor([0.7, 0.16, 270]);
    const rawSrgb = convertColor(color, 'srgb');

    expect(color.coordinates).toEqual([0.7, 0.16, 270]);
    expect(isInColorGamut(color, 'srgb')).toBe(false);
    expect(isInColorGamut(color, 'display-p3')).toBe(true);
    expect(
      rawSrgb.coordinates.some(
        (channel) => channel !== null && (channel < 0 || channel > 1),
      ),
    ).toBe(true);
  });
});
