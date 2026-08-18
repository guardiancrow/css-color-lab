import type { CanonicalColor } from '../../types/color';
import {
  convertColor,
  interpolateColors,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from './colorEngine';
import type { HueInterpolationMethod, InterpolationSpace } from './colorEngine';
import { getGamutStatuses } from './gamut';
import {
  createPreviewGradient,
  INTERPOLATION_PRESETS,
  INTERPOLATION_SPACES,
  sampleInterpolation,
  serializeColorMix,
} from './interpolation';

export const INITIAL_INTERPOLATION_PRESET = INTERPOLATION_PRESETS[0];
export const INITIAL_INTERPOLATION_AMOUNT = 0.5;
export const INITIAL_INTERPOLATION_HUE_METHOD: HueInterpolationMethod =
  'shorter';
export const INTERPOLATION_SAMPLE_COUNT = 25;

export interface GradientComparison {
  readonly space: InterpolationSpace;
  readonly label: string;
  readonly samples: readonly CanonicalColor[];
  readonly gradientCss: string;
  readonly outsideSrgbSamples: number;
}

export interface SelectedInterpolationResult {
  readonly space: InterpolationSpace;
  readonly label: string;
  readonly color: CanonicalColor;
  readonly previewCss: string;
  readonly previewIsMapped: boolean;
  readonly statuses: ReturnType<typeof getGamutStatuses>;
}

export function createGradientComparisons(
  start: CanonicalColor,
  end: CanonicalColor,
  hueMethod: HueInterpolationMethod,
): readonly GradientComparison[] {
  return INTERPOLATION_SPACES.map(({ id, label }) => {
    const samples = sampleInterpolation(
      start,
      end,
      id,
      hueMethod,
      INTERPOLATION_SAMPLE_COUNT,
    );

    return {
      space: id,
      label,
      samples,
      gradientCss: createPreviewGradient(samples),
      outsideSrgbSamples: samples.filter(
        (sample) => !isInColorGamut(sample, 'srgb'),
      ).length,
    };
  });
}

export function createSelectedInterpolationResults(
  start: CanonicalColor,
  end: CanonicalColor,
  amount: number,
  hueMethod: HueInterpolationMethod,
): readonly SelectedInterpolationResult[] {
  return INTERPOLATION_SPACES.map(({ id, label }) => {
    const color = interpolateColors(start, end, amount, {
      space: id,
      hueMethod,
    });
    const previewIsMapped = !isInColorGamut(color, 'srgb');
    const previewColor = previewIsMapped
      ? mapColorToGamut(color, 'srgb')
      : convertColor(color, 'srgb');

    return {
      space: id,
      label,
      color,
      previewCss: serializeColor(previewColor),
      previewIsMapped,
      statuses: getGamutStatuses(color),
    };
  });
}

export function createColorMixValues(
  start: CanonicalColor,
  end: CanonicalColor,
  amount: number,
  hueMethod: HueInterpolationMethod,
) {
  return INTERPOLATION_SPACES.map(({ id, label }) => ({
    space: id,
    label,
    value: serializeColorMix(start, end, amount, id, hueMethod),
  }));
}
