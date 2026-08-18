import type { CanonicalColor, ColorCoordinates } from '../../types/color';
import { convertColor, createColor, serializeColor } from './colorEngine';
import { normalizeHue } from './hsl';

export interface RelativeOklchAdjustments {
  readonly lightness: number;
  readonly chroma: number;
  readonly hue: number;
}

export interface RelativeOklchResult {
  readonly base: CanonicalColor;
  readonly baseCoordinates: ColorCoordinates;
  readonly result: CanonicalColor;
}

function assertFiniteAdjustment(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} adjustment must be finite.`);
  }
}

function numericComponent(value: number | null): number {
  return value ?? 0;
}

/** Reproduce an OkLCh relative-color operation without clipping or mapping. */
export function deriveRelativeOklch(
  baseColor: CanonicalColor,
  adjustments: RelativeOklchAdjustments,
): RelativeOklchResult {
  assertFiniteAdjustment(adjustments.lightness, 'Lightness');
  assertFiniteAdjustment(adjustments.chroma, 'Chroma');
  assertFiniteAdjustment(adjustments.hue, 'Hue');

  const base = convertColor(baseColor, 'oklch');
  const [lightness, chroma, hue] = base.coordinates;
  const result = createColor(
    'oklch',
    [
      numericComponent(lightness) + adjustments.lightness,
      numericComponent(chroma) + adjustments.chroma,
      normalizeHue(numericComponent(hue) + adjustments.hue),
    ],
    base.alpha,
  );

  return { base, baseCoordinates: base.coordinates, result };
}

function formatCssNumber(value: number): string {
  const rounded = Number(value.toFixed(4));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function relativeComponent(channel: 'l' | 'c' | 'h', offset: number): string {
  if (offset === 0) {
    return channel;
  }

  const operator = offset < 0 ? '-' : '+';
  return `calc(${channel} ${operator} ${formatCssNumber(Math.abs(offset))})`;
}

export function serializeRelativeOklch(
  adjustments: RelativeOklchAdjustments,
  origin = 'var(--base)',
): string {
  return `oklch(from ${origin} ${relativeComponent('l', adjustments.lightness)} ${relativeComponent('c', adjustments.chroma)} ${relativeComponent('h', adjustments.hue)})`;
}

export function serializeRelativeOklchDeclarations(
  baseColor: CanonicalColor,
  adjustments: RelativeOklchAdjustments,
): string {
  return `--base: ${serializeColor(baseColor, { space: 'oklch' })};\n--derived: ${serializeRelativeOklch(adjustments)};`;
}

export type SimulatedColorScheme = 'light' | 'dark';

export function selectLightDarkColor(
  lightColor: CanonicalColor,
  darkColor: CanonicalColor,
  scheme: SimulatedColorScheme,
): CanonicalColor {
  return scheme === 'light' ? lightColor : darkColor;
}
