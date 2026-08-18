import { describe, expect, it } from 'vitest';
import {
  clipColorToGamut,
  convertColor,
  isInColorGamut,
  mapColorToGamut,
} from './colorEngine';
import {
  GAMUT_PRESETS,
  compareSrgbClippingAndMapping,
  findMaxChromaForGamut,
  getGamutStatuses,
} from './gamut';
import { createOklchColor } from './oklab';

const knownCases = [
  {
    id: 'srgb',
    coordinates: [0.7, 0.12, 20],
    expected: [true, true, true],
  },
  {
    id: 'p3',
    coordinates: [0.7, 0.22, 20],
    expected: [false, true, true],
  },
  {
    id: 'rec2020',
    coordinates: [0.7, 0.29, 20],
    expected: [false, false, true],
  },
  {
    id: 'outside',
    coordinates: [0.7, 0.4, 20],
    expected: [false, false, false],
  },
] as const;

describe('known gamut states and presets', () => {
  it.each(knownCases)(
    'classifies the independently selected $id example',
    ({ coordinates, expected }) => {
      const statuses = getGamutStatuses(createOklchColor(coordinates));

      expect(statuses.map((status) => status.isInGamut)).toEqual(expected);
    },
  );

  it('keeps lesson presets aligned with the independently asserted cases', () => {
    expect(
      GAMUT_PRESETS.map(({ id, coordinates, expected }) => ({
        id,
        coordinates,
        expected,
      })),
    ).toEqual(knownCases);
  });

  it('places an ordinary sRGB color inside all three compared gamuts', () => {
    const color = createOklchColor([0.6, 0.05, 120]);

    expect(isInColorGamut(color, 'srgb')).toBe(true);
    expect(isInColorGamut(color, 'display-p3')).toBe(true);
    expect(isInColorGamut(color, 'rec2020')).toBe(true);
  });

  it('crosses successive gamut boundaries as Chroma increases', () => {
    expect(
      [0.12, 0.22, 0.29, 0.4].map((chroma) =>
        getGamutStatuses(createOklchColor([0.7, chroma, 20])).map(
          (status) => status.isInGamut,
        ),
      ),
    ).toEqual([
      [true, true, true],
      [false, true, true],
      [false, false, true],
      [false, false, false],
    ]);
  });
});

describe('maximum OkLCh Chroma search', () => {
  it.each(['srgb', 'display-p3', 'rec2020'] as const)(
    'returns an in-%s lower bound next to an out-of-gamut value',
    (gamut) => {
      const maximum = findMaxChromaForGamut({
        lightness: 0.7,
        hue: 20,
        gamut,
        tolerance: 0.00001,
      });

      expect(isInColorGamut(createOklchColor([0.7, maximum, 20]), gamut)).toBe(
        true,
      );
      expect(
        isInColorGamut(createOklchColor([0.7, maximum + 0.00002, 20]), gamut),
      ).toBe(false);
    },
  );

  it('is deterministic within the declared tolerance', () => {
    const options = {
      lightness: 0.7,
      hue: 20,
      gamut: 'display-p3',
      tolerance: 0.00001,
    } as const;

    expect(findMaxChromaForGamut(options)).toBe(findMaxChromaForGamut(options));
  });
});

describe('explicit clipping and gamut mapping', () => {
  it('clips raw sRGB channels without mutating the original', () => {
    const original = createOklchColor([0.7, 0.29, 20]);
    const originalCoordinates = [...original.coordinates];
    const raw = convertColor(original, 'srgb');
    const clipped = clipColorToGamut(original, 'srgb');

    expect(
      raw.coordinates.some(
        (channel) => channel !== null && (channel < 0 || channel > 1),
      ),
    ).toBe(true);
    expect(
      clipped.coordinates.every(
        (channel) => channel !== null && channel >= 0 && channel <= 1,
      ),
    ).toBe(true);
    expect(original.coordinates).toEqual(originalCoordinates);
  });

  it('maps into sRGB without mutating the original', () => {
    const original = createOklchColor([0.7, 0.29, 20]);
    const originalCoordinates = [...original.coordinates];
    const mapped = mapColorToGamut(original, 'srgb', 'css');

    expect(isInColorGamut(mapped, 'srgb')).toBe(true);
    expect(original.coordinates).toEqual(originalCoordinates);
  });

  it('produces different clipping and CSS mapping results', () => {
    const result = compareSrgbClippingAndMapping(
      createOklchColor([0.7, 0.29, 20]),
    );

    expect(result.clipped.coordinates).not.toEqual(result.mapped.coordinates);
    expect(result.clippedOklch).not.toEqual(result.mappedOklch);
    expect(result.clippedDelta).not.toEqual(result.mappedDelta);
  });
});
