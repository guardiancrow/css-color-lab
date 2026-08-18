import { describe, expect, it } from 'vitest';
import { createColor, isInColorGamut } from './colorEngine';
import {
  deriveRelativeOklch,
  selectLightDarkColor,
  serializeRelativeOklch,
  serializeRelativeOklchDeclarations,
} from './modernCss';

describe('relative OkLCh operations', () => {
  it('adjusts L, C, and h in Engine coordinates', () => {
    const derived = deriveRelativeOklch(createColor('oklch', [0.6, 0.1, 350]), {
      lightness: 0.1,
      chroma: 0.05,
      hue: 20,
    }).result;

    expect(derived.coordinates[0]).toBeCloseTo(0.7);
    expect(derived.coordinates[1]).toBeCloseTo(0.15);
    expect(derived.coordinates[2]).toBeCloseTo(10);
  });

  it('normalizes a negative hue offset across 0 degrees', () => {
    const derived = deriveRelativeOklch(createColor('oklch', [0.6, 0.1, 10]), {
      lightness: 0,
      chroma: 0,
      hue: -30,
    }).result;

    expect(derived.coordinates[2]).toBeCloseTo(340);
  });

  it('retains an out-of-sRGB raw Chroma result', () => {
    const base = createColor('oklch', [0.7, 0.2, 20]);
    const result = deriveRelativeOklch(base, {
      lightness: 0,
      chroma: 0.2,
      hue: 0,
    }).result;

    expect(result.coordinates).toEqual([0.7, 0.4, 20]);
    expect(isInColorGamut(result, 'srgb')).toBe(false);
    expect(base.coordinates).toEqual([0.7, 0.2, 20]);
  });

  it('serializes number-scale channel calculations', () => {
    const adjustments = { lightness: 0.08, chroma: -0.02, hue: 20 };

    expect(serializeRelativeOklch(adjustments)).toBe(
      'oklch(from var(--base) calc(l + 0.08) calc(c - 0.02) calc(h + 20))',
    );
    expect(
      serializeRelativeOklchDeclarations(
        createColor('oklch', [0.65, 0.15, 40]),
        adjustments,
      ),
    ).toContain('--derived: oklch(from var(--base)');
  });
});

describe('light-dark simulation', () => {
  const light = createColor('srgb', [1, 1, 1]);
  const dark = createColor('srgb', [0, 0, 0]);

  it('selects the first value for light and second for dark', () => {
    expect(selectLightDarkColor(light, dark, 'light')).toBe(light);
    expect(selectLightDarkColor(light, dark, 'dark')).toBe(dark);
  });
});
