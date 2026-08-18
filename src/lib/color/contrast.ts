import type { CanonicalColor } from '../../types/color';
import { createColor, getRelativeLuminance } from './colorEngine';

export interface BlackWhiteContrastAnalysis {
  readonly blackRatio: number;
  readonly whiteRatio: number;
  readonly selected: 'black' | 'white';
  readonly selectedColor: CanonicalColor;
}

export function calculateContrastRatio(
  first: CanonicalColor,
  second: CanonicalColor,
): number {
  const firstLuminance = getRelativeLuminance(first);
  const secondLuminance = getRelativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function analyzeBlackWhiteContrast(
  background: CanonicalColor,
): BlackWhiteContrastAnalysis {
  const black = createColor('srgb', [0, 0, 0]);
  const white = createColor('srgb', [1, 1, 1]);
  const blackRatio = calculateContrastRatio(background, black);
  const whiteRatio = calculateContrastRatio(background, white);
  const selected = whiteRatio >= blackRatio ? 'white' : 'black';

  return {
    blackRatio,
    whiteRatio,
    selected,
    selectedColor: selected === 'white' ? white : black,
  };
}
