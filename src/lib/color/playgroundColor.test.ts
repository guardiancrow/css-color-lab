import { describe, expect, it } from 'vitest';
import { getGamutStatuses } from './gamut';
import {
  formatPlaygroundColor,
  PLAYGROUND_PRESETS,
  updateColorAlpha,
} from './playgroundColor';

function getPreset(id: string) {
  const preset = PLAYGROUND_PRESETS.find((candidate) => candidate.id === id);
  if (!preset) throw new Error(`Missing test preset: ${id}`);
  return preset;
}

describe('Playground color presentation', () => {
  it('reuses the verified outside-sRGB / inside-P3 preset', () => {
    const preset = getPreset('wide-gamut');
    const statuses = getGamutStatuses(preset.color);
    expect(statuses.map(({ isInGamut }) => isInGamut)).toEqual([
      false,
      true,
      true,
    ]);
  });

  it('formats six CSS syntaxes and explicitly maps out-of-gamut Hex', () => {
    const preset = getPreset('wide-gamut');
    const view = formatPlaygroundColor(preset.color);

    expect(view.isInSrgbGamut).toBe(false);
    expect(view.hex).toMatch(/^#[0-9A-F]{6}$/);
    expect(view.syntaxes.map(({ id }) => id)).toEqual([
      'rgb',
      'hsl',
      'lab',
      'lch',
      'oklab',
      'oklch',
    ]);
    expect(view.syntaxes.find(({ id }) => id === 'oklch')?.value).toContain(
      '70%',
    );
  });

  it('changes only alpha and keeps the source space and coordinates', () => {
    const original = getPreset('default').color;
    const updated = updateColorAlpha(original, 0.4);

    expect(updated.alpha).toBe(0.4);
    expect(updated.space).toBe(original.space);
    expect(updated.coordinates).toEqual(original.coordinates);
  });
});
