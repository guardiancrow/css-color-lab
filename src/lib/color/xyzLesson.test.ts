import { describe, expect, it } from 'vitest';
import type { ColorCoordinates } from '../../types/color';
import { convertColor, createColor, getColorCoordinates } from './colorEngine';
import { decodeSrgbChannel } from './srgbTransfer';
import { getSrgbToXyzPipeline } from './xyzLesson';

function expectCoordinatesCloseTo(
  actual: ColorCoordinates,
  expected: ColorCoordinates,
  precision = 9,
) {
  expected.forEach((value, index) => {
    expect(actual[index]).toBeCloseTo(value ?? 0, precision);
  });
}

describe('XYZ lesson conversions', () => {
  // CSS Color 4 linear sRGB to XYZ D65 matrix columns.
  // https://www.w3.org/TR/css-color-4/#color-conversion-code
  it.each([
    ['red', [1, 0, 0], [0.4123907993, 0.2126390059, 0.0193308187]],
    ['green', [0, 1, 0], [0.3575843394, 0.7151686788, 0.1191947798]],
    ['blue', [0, 0, 1], [0.1804807884, 0.0721923154, 0.9505321522]],
  ] as const)(
    'converts linear sRGB %s with the known matrix',
    (_name, linear, xyz) => {
      expectCoordinatesCloseTo(
        getColorCoordinates(createColor('srgb-linear', linear), 'xyz-d65'),
        xyz,
      );
    },
  );

  it('round-trips through the explicit encoded, linear, and XYZ stages', () => {
    const source = createColor('srgb', [0.82, 0.31, 0.12]);
    const linear = convertColor(source, 'srgb-linear');
    const xyz = convertColor(linear, 'xyz-d65');
    const result = convertColor(xyz, 'srgb');

    expectCoordinatesCloseTo(result.coordinates, source.coordinates, 10);
  });

  it('produces different XYZ values for the same sRGB and Display P3 coordinates', () => {
    const srgbXyz = getColorCoordinates(
      createColor('srgb', [1, 0.5, 0]),
      'xyz-d65',
    );
    const p3Xyz = getColorCoordinates(
      createColor('display-p3', [1, 0.5, 0]),
      'xyz-d65',
    );

    expectCoordinatesCloseTo(
      srgbXyz,
      [0.4889285591, 0.3657145255, 0.0448434053],
    );
    expectCoordinatesCloseTo(p3Xyz, [0.5434347647, 0.3770350662, 0.0096561197]);
    expect(p3Xyz).not.toEqual(srgbXyz);
  });

  it('matches neutral gray linear light with XYZ Y', () => {
    const pipeline = getSrgbToXyzPipeline(
      createColor('srgb', [128 / 255, 128 / 255, 128 / 255]),
    );

    expect(pipeline.linearSrgb[0]).toBeCloseTo(
      decodeSrgbChannel(128 / 255),
      12,
    );
    expect(pipeline.xyzD65[1]).toBeCloseTo(0.2158605001, 9);
  });
});
