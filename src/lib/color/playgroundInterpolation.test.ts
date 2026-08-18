import { describe, expect, it } from 'vitest';
import { createColor, isInColorGamut } from './colorEngine';
import {
  createColorMixValues,
  createGradientComparisons,
  createSelectedInterpolationResults,
  INITIAL_INTERPOLATION_PRESET,
  INTERPOLATION_SAMPLE_COUNT,
} from './playgroundInterpolation';

describe('Playground interpolation presentation', () => {
  it('builds four 25-sample Engine gradients', () => {
    const comparisons = createGradientComparisons(
      INITIAL_INTERPOLATION_PRESET.start,
      INITIAL_INTERPOLATION_PRESET.end,
      'shorter',
    );

    expect(comparisons.map(({ space }) => space)).toEqual([
      'srgb',
      'srgb-linear',
      'oklab',
      'oklch',
    ]);
    comparisons.forEach((comparison) => {
      expect(comparison.samples).toHaveLength(INTERPOLATION_SAMPLE_COUNT);
      expect(comparison.gradientCss).toContain('linear-gradient');
    });
  });

  it('keeps raw selected colors and maps only their previews', () => {
    const start = createColor('oklch', [0.72, 0.34, 20]);
    const end = createColor('oklch', [0.72, 0.34, 80]);
    const results = createSelectedInterpolationResults(
      start,
      end,
      0.5,
      'shorter',
    );
    const oklch = results.find(({ space }) => space === 'oklch');
    if (!oklch) throw new Error('Missing OkLCh result.');

    expect(oklch.color.space).toBe('oklch');
    expect(oklch.color.coordinates[1]).toBeCloseTo(0.34);
    expect(isInColorGamut(oklch.color, 'srgb')).toBe(false);
    expect(oklch.previewIsMapped).toBe(true);
    expect(oklch.previewCss).toBeTruthy();
  });

  it('generates all CSS color-mix spaces with endpoint percentages', () => {
    const values = createColorMixValues(
      INITIAL_INTERPOLATION_PRESET.start,
      INITIAL_INTERPOLATION_PRESET.end,
      0.25,
      'longer',
    );

    expect(values).toHaveLength(4);
    expect(values.every(({ value }) => value.includes('75%'))).toBe(true);
    expect(values.every(({ value }) => value.includes('25%'))).toBe(true);
    expect(values.find(({ space }) => space === 'oklch')?.value).toContain(
      'in oklch longer hue',
    );
  });

  it('preserves premultiplied alpha in all selected results', () => {
    const start = createColor('srgb', [1, 0, 0], 0);
    const end = createColor('srgb', [0, 0, 1], 1);
    const results = createSelectedInterpolationResults(
      start,
      end,
      0.5,
      'shorter',
    );

    results.forEach(({ color }) => {
      expect(color.alpha).toBeCloseTo(0.5);
    });
  });
});
