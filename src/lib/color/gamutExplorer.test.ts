import { describe, expect, it } from 'vitest';
import { isInColorGamut } from './colorEngine';
import { GAMUTS, compareClippingAndMapping } from './gamut';
import {
  analyzeGamutBoundaries,
  formatBoundaryDifference,
} from './gamutExplorer';
import { createOklchColor } from './oklab';

describe('Playground gamut boundary analysis', () => {
  it('calculates ordered representative boundaries from real gamut checks', () => {
    const analysis = analyzeGamutBoundaries(createOklchColor([0.7, 0.22, 20]));
    const [srgb, displayP3, rec2020] = analysis.boundaries;
    if (!srgb || !displayP3 || !rec2020) {
      throw new Error('Expected all three gamut boundaries.');
    }

    expect(srgb.maximumChroma).toBeLessThan(displayP3.maximumChroma);
    expect(displayP3.maximumChroma).toBeLessThan(rec2020.maximumChroma);
    analysis.boundaries.forEach(({ id, maximumChroma }) => {
      expect(
        isInColorGamut(createOklchColor([0.7, maximumChroma, 20]), id),
      ).toBe(true);
    });
    expect(analysis.currentPositionPercent).toBeGreaterThan(0);
    expect(analysis.currentPositionPercent).toBeLessThan(100);
  });

  it('reports remaining and outside-boundary distances', () => {
    expect(formatBoundaryDifference(0.01234)).toBe('0.0123 remaining');
    expect(formatBoundaryDifference(-0.029)).toBe('0.0290 outside boundary');
    expect(formatBoundaryDifference(0)).toBe('At boundary');
  });
});

describe('target gamut clipping and mapping', () => {
  it.each(GAMUTS)(
    'derives in-$label results without mutating Original',
    ({ id }) => {
      const original = createOklchColor([0.7, 0.4, 20]);
      const originalCoordinates = [...original.coordinates];
      const comparison = compareClippingAndMapping(original, id);

      expect(isInColorGamut(comparison.clipped, id)).toBe(true);
      expect(isInColorGamut(comparison.mapped, id)).toBe(true);
      expect(original.coordinates).toEqual(originalCoordinates);
      expect(comparison.original).toBe(original);
      expect(comparison.rawTarget.space).toBe(id);
    },
  );
});
