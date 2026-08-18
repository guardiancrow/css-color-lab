import type { CanonicalColor, ColorSpaceId } from '../../types/color';
import {
  adjustHueEndpoints,
  convertColor,
  createColor,
  interpolateColors,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from './colorEngine';
import type { HueInterpolationMethod, InterpolationSpace } from './colorEngine';

export interface InterpolationPreset {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly start: CanonicalColor;
  readonly end: CanonicalColor;
}

export const INTERPOLATION_SPACES = [
  { id: 'srgb', label: 'sRGB' },
  { id: 'srgb-linear', label: 'Linear sRGB' },
  { id: 'oklab', label: 'Oklab' },
  { id: 'oklch', label: 'OkLCh' },
] as const satisfies readonly {
  readonly id: InterpolationSpace;
  readonly label: string;
}[];

export const HUE_METHODS = [
  { id: 'shorter', label: 'shorter', description: '短い経路' },
  { id: 'longer', label: 'longer', description: '長い経路' },
  { id: 'increasing', label: 'increasing', description: '角度が増える方向' },
  { id: 'decreasing', label: 'decreasing', description: '角度が減る方向' },
] as const satisfies readonly {
  readonly id: HueInterpolationMethod;
  readonly label: string;
  readonly description: string;
}[];

export const INTERPOLATION_PRESETS = [
  {
    id: 'blue-yellow',
    label: 'Blue → Yellow',
    description: 'RGB補間の明るさと、知覚的な色空間の経路を比べます。',
    start: createColor('srgb', [0.08, 0.22, 0.95]),
    end: createColor('srgb', [1, 0.82, 0.02]),
  },
  {
    id: 'magenta-green',
    label: 'Magenta → Green',
    description: '色相が大きく離れた2色の途中を比べます。',
    start: createColor('oklch', [0.64, 0.28, 330]),
    end: createColor('oklch', [0.72, 0.25, 145]),
  },
  {
    id: 'transparent',
    label: 'Transparent red → Blue',
    description: 'alpha premultiplicationが透明な端点の色漏れを防ぎます。',
    start: createColor('srgb', [1, 0, 0], 0),
    end: createColor('srgb', [0.05, 0.3, 1]),
  },
] as const satisfies readonly InterpolationPreset[];

export function sampleInterpolation(
  start: CanonicalColor,
  end: CanonicalColor,
  space: InterpolationSpace,
  hueMethod: HueInterpolationMethod = 'shorter',
  sampleCount = 25,
): readonly CanonicalColor[] {
  if (!Number.isInteger(sampleCount) || sampleCount < 2) {
    throw new RangeError('Sample count must be an integer of at least 2.');
  }

  return Array.from({ length: sampleCount }, (_, index) =>
    interpolateColors(start, end, index / (sampleCount - 1), {
      space,
      hueMethod,
    }),
  );
}

/** Serialize Engine samples after explicit sRGB mapping, solely for display. */
export function createPreviewGradient(
  samples: readonly CanonicalColor[],
): string {
  return `linear-gradient(to right, ${samples
    .map((color, index) => {
      const displayColor = isInColorGamut(color, 'srgb')
        ? convertColor(color, 'srgb')
        : mapColorToGamut(color, 'srgb');
      const stop = (index / (samples.length - 1)) * 100;
      return `${serializeColor(displayColor)} ${String(Number(stop.toFixed(2)))}%`;
    })
    .join(', ')})`;
}

function percentage(value: number): string {
  return String(Number((value * 100).toFixed(2)));
}

export function serializeColorMix(
  start: CanonicalColor,
  end: CanonicalColor,
  amount: number,
  space: InterpolationSpace,
  hueMethod: HueInterpolationMethod = 'shorter',
): string {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) {
    throw new RangeError('Mix amount must be from 0 to 1.');
  }

  const hueClause = space === 'oklch' ? ` ${hueMethod} hue` : '';
  return `color-mix(in ${space}${hueClause}, ${serializeColor(start)} ${percentage(1 - amount)}%, ${serializeColor(end)} ${percentage(amount)}%)`;
}

export function getHuePath(
  startHue: number | null,
  endHue: number | null,
  method: HueInterpolationMethod,
): readonly [number | null, number | null, number | null] {
  const [start, end] = adjustHueEndpoints(startHue, endHue, method);
  const midpoint =
    start === null || end === null ? null : ((start + end) / 2) % 360;
  return [start, midpoint === null ? null : (midpoint + 360) % 360, end];
}

export function formatInterpolationCoordinates(
  color: CanonicalColor,
  space: ColorSpaceId,
): string {
  return convertColor(color, space)
    .coordinates.map((value) =>
      value === null ? 'none' : String(Number(value.toFixed(4))),
    )
    .join('  ');
}
