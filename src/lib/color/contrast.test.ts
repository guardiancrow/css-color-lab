import { describe, expect, it } from 'vitest';
import { createColor } from './colorEngine';
import { analyzeBlackWhiteContrast, calculateContrastRatio } from './contrast';

describe('contrast ratio', () => {
  const black = createColor('srgb', [0, 0, 0]);
  const white = createColor('srgb', [1, 1, 1]);

  it('returns 21:1 for black and white', () => {
    expect(calculateContrastRatio(black, white)).toBeCloseTo(21, 10);
  });

  it('selects black for a middle encoded gray with the larger displayed ratio', () => {
    const result = analyzeBlackWhiteContrast(
      createColor('srgb', [0.5, 0.5, 0.5]),
    );

    expect(result.blackRatio).toBeCloseTo(5.2808, 3);
    expect(result.whiteRatio).toBeCloseTo(3.9767, 3);
    expect(result.selected).toBe('black');
  });

  it('selects white on an exact tie', () => {
    const tieLuminance = Math.sqrt(0.0525) - 0.05;
    const result = analyzeBlackWhiteContrast(
      createColor('xyz-d65', [tieLuminance, tieLuminance, tieLuminance]),
    );

    expect(result.blackRatio).toBeCloseTo(result.whiteRatio, 10);
    expect(result.selected).toBe('white');
  });
});
