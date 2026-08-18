import { describe, expect, it } from 'vitest';
import type { ColorCoordinates } from '../../types/color';
import {
  convertColor,
  createColor,
  getColorCoordinates,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from './colorEngine';

function expectCoordinatesCloseTo(
  actual: ColorCoordinates,
  expected: ColorCoordinates,
  precision = 8,
) {
  expected.forEach((value, index) => {
    if (value === null) {
      expect(actual[index]).toBeNull();
    } else {
      expect(actual[index]).toBeCloseTo(value, precision);
    }
  });
}

describe('Color Engine known values', () => {
  // Reference: CSS Color 4 sample conversion matrices and D65 white point.
  // https://www.w3.org/TR/css-color-4/#color-conversion-code
  const xyzD65Cases = [
    { name: 'black', srgb: [0, 0, 0], xyz: [0, 0, 0] },
    {
      name: 'white',
      srgb: [1, 1, 1],
      xyz: [0.9504559271, 1, 1.0890577508],
    },
    {
      name: 'red',
      srgb: [1, 0, 0],
      xyz: [0.4123907993, 0.2126390059, 0.0193308187],
    },
    {
      name: 'green',
      srgb: [0, 1, 0],
      xyz: [0.3575843394, 0.7151686788, 0.1191947798],
    },
    {
      name: 'blue',
      srgb: [0, 0, 1],
      xyz: [0.1804807884, 0.0721923154, 0.9505321522],
    },
    {
      name: 'neutral gray',
      srgb: [0.5, 0.5, 0.5],
      xyz: [0.2034366706, 0.2140411405, 0.233103163],
    },
  ] as const;

  it.each(xyzD65Cases)(
    'converts $name from sRGB to XYZ D65',
    ({ srgb, xyz }) => {
      const color = createColor('srgb', srgb);

      expectCoordinatesCloseTo(getColorCoordinates(color, 'xyz-d65'), xyz);
    },
  );

  it('represents neutral gray in HSL with a powerless hue', () => {
    const hsl = getColorCoordinates(
      createColor('srgb', [0.5, 0.5, 0.5]),
      'hsl',
    );

    expect(hsl[0]).toBeNull();
    expect(hsl[1]).toBeCloseTo(0, 12);
    expect(hsl[2]).toBeCloseTo(50, 12);
  });
});

describe('Color Engine conversions', () => {
  const source = createColor('srgb', [0.82, 0.31, 0.12], 0.42);

  it.each(['xyz-d65', 'oklab'] as const)(
    'round-trips sRGB through %s without losing precision',
    (intermediateSpace) => {
      const roundTripped = convertColor(
        convertColor(source, intermediateSpace),
        'srgb',
      );

      expectCoordinatesCloseTo(
        roundTripped.coordinates,
        source.coordinates,
        10,
      );
      expect(roundTripped.alpha).toBe(source.alpha);
    },
  );

  it('converts Oklab to cylindrical OkLCh and back', () => {
    const oklab = createColor('oklab', [0.6, 0.3, 0.4]);
    const oklch = convertColor(oklab, 'oklch');

    expectCoordinatesCloseTo(oklch.coordinates, [0.6, 0.5, 53.1301023542], 9);
    expectCoordinatesCloseTo(
      convertColor(oklch, 'oklab').coordinates,
      oklab.coordinates,
      10,
    );
  });

  it('preserves alpha through every conversion', () => {
    const converted = convertColor(
      convertColor(createColor('display-p3', [0.2, 0.8, 0.4], 0.25), 'lab'),
      'oklch',
    );

    expect(converted.alpha).toBe(0.25);
  });
});

describe('Color Engine gamut behavior', () => {
  it('recognizes an ordinary sRGB color as in gamut', () => {
    expect(isInColorGamut(createColor('srgb', [0.25, 0.5, 0.75]), 'srgb')).toBe(
      true,
    );
  });

  it('keeps Display P3 green outside sRGB instead of clipping it', () => {
    const p3Green = createColor('display-p3', [0, 1, 0]);
    const rawSrgb = convertColor(p3Green, 'srgb');

    expect(isInColorGamut(p3Green, 'display-p3')).toBe(true);
    expect(isInColorGamut(p3Green, 'srgb')).toBe(false);
    expect(
      rawSrgb.coordinates.some(
        (channel) => channel !== null && (channel < 0 || channel > 1),
      ),
    ).toBe(true);
    expect(() =>
      serializeColor(p3Green, { space: 'srgb', format: 'hex' }),
    ).toThrow(/explicit gamut mapping/i);
  });

  it('maps only when the explicit gamut-mapping API is called', () => {
    const mapped = mapColorToGamut(
      createColor('display-p3', [0, 1, 0]),
      'srgb',
    );

    expect(mapped.space).toBe('srgb');
    expect(isInColorGamut(mapped, 'srgb')).toBe(true);
    expect(serializeColor(mapped, { format: 'hex' })).toMatch(
      /^#[0-9a-f]{6}$/i,
    );
  });
});

describe('Color Engine input validation', () => {
  it('accepts out-of-range coordinates but rejects invalid alpha', () => {
    expect(createColor('srgb', [1.2, -0.1, 0.5]).coordinates).toEqual([
      1.2, -0.1, 0.5,
    ]);
    expect(() => createColor('srgb', [0, 0, 0], 1.1)).toThrow(RangeError);
  });
});
