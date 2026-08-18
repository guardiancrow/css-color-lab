import type { CanonicalColor, ColorChannel } from '../../types/color';
import {
  getColorCoordinates,
  isInColorGamut,
  serializeColor,
} from './colorEngine';

function formatNumber(value: ColorChannel, fractionDigits: number): string {
  if (value === null) {
    return 'none';
  }

  const rounded = Number(value.toFixed(fractionDigits));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function formatColorCoordinates(
  coordinates: readonly ColorChannel[],
  fractionDigits: number,
): string {
  return coordinates
    .map((value) => formatNumber(value, fractionDigits))
    .join(' ');
}

export interface InspectorColorView {
  readonly hex: string;
  readonly previewCss: string;
  readonly isInSrgbGamut: boolean;
  readonly srgb: string;
  readonly hsl: string;
  readonly xyzD65: string;
  readonly oklab: string;
  readonly oklch: string;
  readonly alpha: string;
}

export function formatColorForInspector(
  color: CanonicalColor,
): InspectorColorView {
  const isInSrgbGamut = isInColorGamut(color, 'srgb');
  const mappedOptions = {
    target: 'srgb',
    method: 'css',
  } as const;
  const srgb = getColorCoordinates(color, 'srgb');
  const hsl = getColorCoordinates(color, 'hsl');
  const oklch = getColorCoordinates(color, 'oklch');

  return {
    hex: serializeColor(color, {
      space: 'srgb',
      format: 'hex',
      gamutMapping: mappedOptions,
    }).toUpperCase(),
    previewCss: serializeColor(color, {
      space: 'srgb',
      gamutMapping: mappedOptions,
    }),
    isInSrgbGamut,
    srgb: formatColorCoordinates(
      srgb.map((channel) => (channel === null ? null : channel * 255)),
      1,
    ),
    hsl: `${formatNumber(hsl[0], 1)}°  ${formatNumber(hsl[1], 1)}%  ${formatNumber(hsl[2], 1)}%`,
    xyzD65: formatColorCoordinates(getColorCoordinates(color, 'xyz-d65'), 4),
    oklab: formatColorCoordinates(getColorCoordinates(color, 'oklab'), 4),
    oklch: `${formatNumber(oklch[0], 4)}  ${formatNumber(oklch[1], 4)}  ${formatNumber(oklch[2], 1)}°`,
    alpha: formatNumber(color.alpha, 3),
  };
}
