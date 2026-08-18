import { getGamutStatuses } from '../../lib/color/gamut';
import type { CanonicalColor } from '../../types/color';

interface GamutStatusListProps {
  readonly color: CanonicalColor;
  readonly label: string;
}

export function GamutStatusList({ color, label }: GamutStatusListProps) {
  return (
    <div className="gamut-status-grid" aria-label={label}>
      {getGamutStatuses(color).map((status) => (
        <article key={status.gamut} data-in-gamut={status.isInGamut}>
          <h4>{status.label}</h4>
          <p className="gamut-status" data-in-gamut={status.isInGamut}>
            <span aria-hidden="true" />
            {status.isInGamut
              ? `Inside ${status.label} gamut`
              : `Outside ${status.label} gamut`}
          </p>
        </article>
      ))}
    </div>
  );
}
