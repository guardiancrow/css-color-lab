export const MODERN_COLOR_FEATURES = [
  {
    id: 'relative-color',
    label: 'Relative colors',
    value: 'oklch(from red l c h)',
  },
  {
    id: 'color-mix',
    label: 'color-mix()',
    value: 'color-mix(in oklab, red, blue)',
  },
  {
    id: 'light-dark',
    label: 'light-dark()',
    value: 'light-dark(white, black)',
  },
  {
    id: 'contrast-color',
    label: 'contrast-color()',
    value: 'contrast-color(red)',
  },
  { id: 'oklab', label: 'Oklab', value: 'oklab(0.6 0.1 0.1)' },
  { id: 'oklch', label: 'OkLCh', value: 'oklch(60% 0.2 30)' },
  {
    id: 'display-p3',
    label: 'Display P3 syntax',
    value: 'color(display-p3 1 0 0)',
  },
  {
    id: 'rec2020',
    label: 'Rec.2020 syntax',
    value: 'color(rec2020 1 0 0)',
  },
] as const;

export type ModernColorFeatureId = (typeof MODERN_COLOR_FEATURES)[number]['id'];
export type FeatureSupportState = 'supported' | 'unsupported' | 'unavailable';
export type CssSupportsFunction = (property: string, value: string) => boolean;

export interface ModernColorFeatureStatus {
  readonly id: ModernColorFeatureId;
  readonly label: string;
  readonly state: FeatureSupportState;
}

function runtimeSupports(): CssSupportsFunction | null {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return null;
  }

  return CSS.supports.bind(CSS);
}

export function detectModernColorFeatures(
  supports: CssSupportsFunction | null = runtimeSupports(),
): readonly ModernColorFeatureStatus[] {
  return MODERN_COLOR_FEATURES.map((feature) => ({
    id: feature.id,
    label: feature.label,
    state:
      supports === null
        ? 'unavailable'
        : supports('color', feature.value)
          ? 'supported'
          : 'unsupported',
  }));
}

export function getModernColorFeatureStatus(
  featureId: ModernColorFeatureId,
  supports?: CssSupportsFunction | null,
): FeatureSupportState {
  return (
    detectModernColorFeatures(supports).find(({ id }) => id === featureId)
      ?.state ?? 'unavailable'
  );
}
