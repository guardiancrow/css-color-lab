import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';
import type { ModernColorFeatureId } from '../../lib/modernCssSupport';

interface FeatureSupportStatusProps {
  readonly feature: ModernColorFeatureId;
  readonly label: string;
}

export function FeatureSupportStatus({
  feature,
  label,
}: FeatureSupportStatusProps) {
  const status = getModernColorFeatureStatus(feature);
  const text =
    status === 'supported'
      ? 'Supported'
      : status === 'unsupported'
        ? 'Unsupported'
        : 'Detection unavailable';

  return (
    <p className="feature-result" data-state={status}>
      {label} support: {text}
    </p>
  );
}
