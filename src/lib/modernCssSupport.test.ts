import { describe, expect, it, vi } from 'vitest';
import {
  detectModernColorFeatures,
  getModernColorFeatureStatus,
} from './modernCssSupport';

describe('modern CSS color feature detection', () => {
  it('reports supported and unsupported results from the supplied browser API', () => {
    const supports = vi.fn(
      (_property: string, value: string) => !value.startsWith('contrast-color'),
    );
    const statuses = detectModernColorFeatures(supports);

    expect(statuses.find(({ id }) => id === 'relative-color')?.state).toBe(
      'supported',
    );
    expect(statuses.find(({ id }) => id === 'contrast-color')?.state).toBe(
      'unsupported',
    );
    expect(supports).toHaveBeenCalledWith('color', 'oklch(from red l c h)');
    expect(supports).toHaveBeenCalledWith('color', 'color(rec2020 1 0 0)');
  });

  it('keeps detection unavailable when CSS.supports cannot be used', () => {
    expect(
      detectModernColorFeatures(null).every(
        ({ state }) => state === 'unavailable',
      ),
    ).toBe(true);
    expect(getModernColorFeatureStatus('light-dark', null)).toBe('unavailable');
  });
});
