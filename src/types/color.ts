export interface DisplayColorValue {
  label: string;
  value: string;
}

export type ColorChannel = number | null;

export type ColorCoordinates = readonly [
  ColorChannel,
  ColorChannel,
  ColorChannel,
];

export type ColorSpaceId =
  | 'srgb'
  | 'srgb-linear'
  | 'xyz-d65'
  | 'xyz-d50'
  | 'hsl'
  | 'lab'
  | 'lch'
  | 'oklab'
  | 'oklch'
  | 'display-p3'
  | 'rec2020';

export type GamutSpaceId = 'srgb' | 'display-p3' | 'rec2020';

/**
 * The single, serializable color value stored by the application.
 *
 * It deliberately contains no Color.js object. Components keep one value in
 * the color's authoring space and derive every other representation through
 * the Color Engine. Coordinates are never rounded or implicitly clipped.
 */
export interface CanonicalColor {
  readonly space: ColorSpaceId;
  readonly coordinates: ColorCoordinates;
  readonly alpha: number;
}
