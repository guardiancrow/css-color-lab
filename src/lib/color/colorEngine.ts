import {
  HSL,
  Lab,
  LCH,
  OKLab,
  OKLCH,
  P3,
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
} as const;

export interface SerializeColorOptions {
  readonly space?: ColorSpaceId;
  readonly format?: 'css' | 'hex';
  readonly precision?: number;
  readonly gamutMapping?: {
    readonly target: GamutSpaceId;
    readonly method: 'css' | 'clip';
  };
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
  method: 'css' | 'clip' = 'css',
): CanonicalColor {
  const mapped = toGamut(toLibraryColor(color), {
    space: colorSpaces[target],
    method,
  });

  return fromLibraryColor(target, mapped.coords, mapped.alpha);
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
