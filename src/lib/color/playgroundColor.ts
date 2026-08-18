import type { CanonicalColor, ColorSpaceId } from '../../types/color';
import { createColor, isInColorGamut, serializeColor } from './colorEngine';
import { GAMUT_PRESETS } from './gamut';
import { initialColor } from './initialColor';

export interface PlaygroundSyntaxValue {
  readonly id: 'rgb' | 'hsl' | 'lab' | 'lch' | 'oklab' | 'oklch';
  readonly label: string;
  readonly value: string;
}

export interface PlaygroundColorView {
  readonly originalPreviewCss: string;
  readonly mappedPreviewCss: string;
  readonly hex: string;
  readonly isInSrgbGamut: boolean;
  readonly syntaxes: readonly PlaygroundSyntaxValue[];
}

const syntaxSpaces = [
  { id: 'rgb', label: 'CSS rgb()', space: 'srgb' },
  { id: 'hsl', label: 'CSS hsl()', space: 'hsl' },
  { id: 'lab', label: 'CSS lab()', space: 'lab' },
  { id: 'lch', label: 'CSS lch()', space: 'lch' },
  { id: 'oklab', label: 'CSS oklab()', space: 'oklab' },
  { id: 'oklch', label: 'CSS oklch()', space: 'oklch' },
] as const satisfies readonly {
  readonly id: PlaygroundSyntaxValue['id'];
  readonly label: string;
  readonly space: ColorSpaceId;
}[];

const srgbMapping = { target: 'srgb', method: 'css' } as const;

export function formatPlaygroundColor(
  color: CanonicalColor,
): PlaygroundColorView {
  const isInSrgbGamut = isInColorGamut(color, 'srgb');

  return {
    originalPreviewCss: serializeColor(color),
    mappedPreviewCss: serializeColor(color, {
      space: 'srgb',
      gamutMapping: srgbMapping,
    }),
    hex: serializeColor(color, {
      space: 'srgb',
      format: 'hex',
      gamutMapping: srgbMapping,
    }).toUpperCase(),
    isInSrgbGamut,
    syntaxes: syntaxSpaces.map(({ id, label, space }) => ({
      id,
      label,
      value: serializeColor(color, { space }),
    })),
  };
}

export interface PlaygroundPreset {
  readonly id: string;
  readonly label: string;
  readonly color: CanonicalColor;
  readonly description?: string;
}

const wideGamutPreset = GAMUT_PRESETS.find(({ id }) => id === 'p3');

if (!wideGamutPreset) {
  throw new Error('The verified Display P3 gamut preset is missing.');
}

export const PLAYGROUND_PRESETS: readonly PlaygroundPreset[] = [
  { id: 'default', label: 'Default', color: initialColor },
  { id: 'red', label: 'Red', color: createColor('srgb', [1, 0, 0]) },
  { id: 'green', label: 'Green', color: createColor('srgb', [0, 1, 0]) },
  { id: 'blue', label: 'Blue', color: createColor('srgb', [0, 0, 1]) },
  {
    id: 'gray',
    label: 'Neutral gray',
    color: createColor('srgb', [0.5, 0.5, 0.5]),
  },
  {
    id: 'wide-gamut',
    label: 'Wide gamut',
    color: createColor('oklch', wideGamutPreset.coordinates),
    description: wideGamutPreset.label,
  },
];

export function updateColorAlpha(
  color: CanonicalColor,
  alpha: number,
): CanonicalColor {
  const safeAlpha = Number.isFinite(alpha)
    ? Math.min(1, Math.max(0, alpha))
    : color.alpha;

  return createColor(color.space, color.coordinates, safeAlpha);
}
