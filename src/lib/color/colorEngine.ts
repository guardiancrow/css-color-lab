import {
  HSL,
  Lab,
  LCH,
  OKLab,
  OKLCH,
  P3,
  REC_2020,
  sRGB,
  sRGB_Linear,
  XYZ_D50,
  XYZ_D65,
  inGamut,
  serialize,
  to,
  toGamut,
} from 'colorjs.io/fn';
import type {
  CanonicalColor,
  ColorChannel,
  ColorCoordinates,
  ColorSpaceId,
  GamutSpaceId,
} from '../../types/color';

const colorSpaces = {
  srgb: sRGB,
  'srgb-linear': sRGB_Linear,
  'xyz-d65': XYZ_D65,
  'xyz-d50': XYZ_D50,
  hsl: HSL,
  lab: Lab,
  lch: LCH,
  oklab: OKLab,
  oklch: OKLCH,
  'display-p3': P3,
  rec2020: REC_2020,
} as const;

export interface SerializeColorOptions {
  readonly space?: ColorSpaceId;
  readonly format?: 'css' | 'hex';
  readonly precision?: number;
  readonly gamutMapping?: {
    readonly target: GamutSpaceId;
    readonly method: 'css';
  };
}

export type RgbInterpolationSpace = 'srgb' | 'srgb-linear';
export type InterpolationSpace = RgbInterpolationSpace | 'oklab' | 'oklch';
export type HueInterpolationMethod =
  'shorter' | 'longer' | 'increasing' | 'decreasing';

export interface InterpolateColorOptions {
  readonly space: InterpolationSpace;
  readonly hueMethod?: HueInterpolationMethod;
}

const OKLCH_POWERLESS_CHROMA = 0.000004;

export function isPowerlessOklchChroma(chroma: ColorChannel): boolean {
  return chroma === null || Math.abs(chroma) <= OKLCH_POWERLESS_CHROMA;
}

function assertChannel(channel: ColorChannel, index: number): void {
  if (channel !== null && !Number.isFinite(channel)) {
    throw new TypeError(
      `Color coordinate ${String(index)} must be finite or null.`,
    );
  }
}

function toMutableCoordinates(coordinates: ColorCoordinates) {
  return [...coordinates] as [ColorChannel, ColorChannel, ColorChannel];
}

function toLibraryColor(color: CanonicalColor) {
  return {
    space: colorSpaces[color.space],
    coords: toMutableCoordinates(color.coordinates),
    alpha: color.alpha,
  };
}

function fromLibraryColor(
  space: ColorSpaceId,
  coordinates: [ColorChannel, ColorChannel, ColorChannel],
  alpha: number | null,
): CanonicalColor {
  return createColor(space, coordinates, alpha ?? 1);
}

export function createColor(
  space: ColorSpaceId,
  coordinates: ColorCoordinates,
  alpha = 1,
): CanonicalColor {
  coordinates.forEach(assertChannel);

  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError('Color alpha must be a finite number from 0 to 1.');
  }

  return Object.freeze({
    space,
    coordinates: Object.freeze([
      coordinates[0],
      coordinates[1],
      coordinates[2],
    ] as const),
    alpha,
  });
}

export function convertColor(
  color: CanonicalColor,
  targetSpace: ColorSpaceId,
): CanonicalColor {
  if (color.space === targetSpace) {
    return color;
  }

  const converted = to(toLibraryColor(color), colorSpaces[targetSpace]);

  return fromLibraryColor(targetSpace, converted.coords, converted.alpha);
}

export function getColorCoordinates(
  color: CanonicalColor,
  targetSpace: ColorSpaceId,
): ColorCoordinates {
  return convertColor(color, targetSpace).coordinates;
}

/** Return XYZ D65 Y without clipping or gamut mapping. */
export function getRelativeLuminance(color: CanonicalColor): number {
  const y = getColorCoordinates(color, 'xyz-d65')[1];

  if (y === null) {
    throw new TypeError('XYZ D65 Y must be a numeric coordinate.');
  }

  return y;
}

function interpolateChannel(
  start: ColorChannel,
  end: ColorChannel,
  startAlpha: number,
  endAlpha: number,
  amount: number,
  resultAlpha: number,
): ColorChannel {
  if (start === null && end === null) {
    return null;
  }

  const resolvedStart = start ?? end;
  const resolvedEnd = end ?? start;

  if (resolvedStart === null || resolvedEnd === null) {
    return null;
  }

  const premultiplied =
    resolvedStart * startAlpha * (1 - amount) + resolvedEnd * endAlpha * amount;

  return resultAlpha === 0 ? premultiplied : premultiplied / resultAlpha;
}

/**
 * Interpolate two colors in an RGB space without clipping or gamut mapping.
 * Coordinates are alpha-premultiplied, matching CSS color interpolation.
 */
export function interpolateRgbColors(
  start: CanonicalColor,
  end: CanonicalColor,
  amount: number,
  space: RgbInterpolationSpace,
): CanonicalColor {
  return interpolateColors(start, end, amount, { space });
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/** Apply the CSS Color hue fixup rules after carrying forward a missing hue. */
export function adjustHueEndpoints(
  start: ColorChannel,
  end: ColorChannel,
  method: HueInterpolationMethod,
): readonly [ColorChannel, ColorChannel] {
  if (start === null && end === null) {
    return [null, null];
  }

  let adjustedStart = normalizeHue(start ?? end ?? 0);
  let adjustedEnd = normalizeHue(end ?? start ?? 0);
  const difference = adjustedEnd - adjustedStart;

  if (method === 'shorter') {
    if (difference > 180) adjustedStart += 360;
    else if (difference < -180) adjustedEnd += 360;
  } else if (method === 'longer') {
    if (difference > 0 && difference < 180) adjustedStart += 360;
    else if (difference <= 0 && difference > -180) adjustedEnd += 360;
  } else if (method === 'increasing' && difference < 0) {
    adjustedEnd += 360;
  } else if (method === 'decreasing' && difference > 0) {
    adjustedStart += 360;
  }

  return [adjustedStart, adjustedEnd];
}

/**
 * Interpolate without clipping or gamut mapping. Missing components are carried
 * forward, powerless OkLCh hues become missing, and alpha is premultiplied.
 */
export function interpolateColors(
  start: CanonicalColor,
  end: CanonicalColor,
  amount: number,
  options: InterpolateColorOptions,
): CanonicalColor {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) {
    throw new RangeError('Interpolation amount must be from 0 to 1.');
  }

  const { space, hueMethod = 'shorter' } = options;
  const startColor = convertColor(start, space);
  const endColor = convertColor(end, space);
  const alpha = startColor.alpha * (1 - amount) + endColor.alpha * amount;
  const startCoordinates = [...startColor.coordinates] as [
    ColorChannel,
    ColorChannel,
    ColorChannel,
  ];
  const endCoordinates = [...endColor.coordinates] as [
    ColorChannel,
    ColorChannel,
    ColorChannel,
  ];

  if (space === 'oklch') {
    if (isPowerlessOklchChroma(startCoordinates[1])) {
      startCoordinates[2] = null;
    }
    if (isPowerlessOklchChroma(endCoordinates[1])) {
      endCoordinates[2] = null;
    }

    const [startHue, endHue] = adjustHueEndpoints(
      startCoordinates[2],
      endCoordinates[2],
      hueMethod,
    );
    startCoordinates[2] = startHue;
    endCoordinates[2] = endHue;
  }

  const coordinates = startCoordinates.map((channel, index) =>
    interpolateChannel(
      channel,
      endCoordinates[index] ?? null,
      startColor.alpha,
      endColor.alpha,
      amount,
      alpha,
    ),
  ) as [ColorChannel, ColorChannel, ColorChannel];

  if (space === 'oklch') {
    const startHue = startCoordinates[2];
    const endHue = endCoordinates[2];
    coordinates[2] =
      startHue === null || endHue === null
        ? null
        : normalizeHue(startHue * (1 - amount) + endHue * amount);
  }

  return createColor(space, coordinates, alpha);
}

export function isInColorGamut(
  color: CanonicalColor,
  gamut: GamutSpaceId,
): boolean {
  return inGamut(toLibraryColor(color), colorSpaces[gamut]);
}

/** Gamut mapping is lossy and therefore only happens through this explicit API. */
export function mapColorToGamut(
  color: CanonicalColor,
  target: GamutSpaceId,
  method: 'css' = 'css',
): CanonicalColor {
  const mapped = toGamut(toLibraryColor(color), {
    space: colorSpaces[target],
    method,
  });
  const converted = to(mapped, colorSpaces[target]);

  return fromLibraryColor(target, converted.coords, converted.alpha);
}

/** Simple per-channel clipping, kept distinct from perceptual gamut mapping. */
export function clipColorToGamut(
  color: CanonicalColor,
  target: GamutSpaceId,
): CanonicalColor {
  const clipped = toGamut(toLibraryColor(color), {
    space: colorSpaces[target],
    method: 'clip',
  });
  const converted = to(clipped, colorSpaces[target]);

  return fromLibraryColor(target, converted.coords, converted.alpha);
}

export function serializeColor(
  color: CanonicalColor,
  options: SerializeColorOptions = {},
): string {
  const {
    space = color.space,
    format = 'css',
    precision = 5,
    gamutMapping,
  } = options;

  let outputColor = convertColor(color, space);

  if (gamutMapping) {
    outputColor = mapColorToGamut(
      outputColor,
      gamutMapping.target,
      gamutMapping.method,
    );
  }

  if (format === 'hex' && !isInColorGamut(outputColor, 'srgb')) {
    throw new RangeError(
      'An out-of-sRGB color requires explicit gamut mapping before hex serialization.',
    );
  }

  return serialize(toLibraryColor(outputColor), {
    format: format === 'css' ? undefined : format,
    precision,
    inGamut: false,
  });
}
