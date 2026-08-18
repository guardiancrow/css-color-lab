import type { CanonicalColor, ColorCoordinates } from '../../types/color';
import { convertColor } from './colorEngine';

export interface SrgbToXyzPipeline {
  readonly encodedSrgb: ColorCoordinates;
  readonly linearSrgb: ColorCoordinates;
  readonly xyzD65: ColorCoordinates;
}

/**
 * Builds the explicit teaching path from encoded sRGB to XYZ D65.
 * Conversion remains delegated to the Color Engine; no values are rounded or
 * gamut-mapped here.
 */
export function getSrgbToXyzPipeline(color: CanonicalColor): SrgbToXyzPipeline {
  const encoded = convertColor(color, 'srgb');
  const linear = convertColor(encoded, 'srgb-linear');
  const xyz = convertColor(linear, 'xyz-d65');

  return {
    encodedSrgb: encoded.coordinates,
    linearSrgb: linear.coordinates,
    xyzD65: xyz.coordinates,
  };
}
