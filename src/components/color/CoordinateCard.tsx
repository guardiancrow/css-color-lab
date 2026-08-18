import { useId } from 'react';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import type { ColorCoordinates } from '../../types/color';

interface CoordinateCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly labels: readonly [string, string, string];
  readonly coordinates: ColorCoordinates;
  readonly previewCss?: string;
  readonly previewLabel?: string;
}

export function CoordinateCard({
  title,
  subtitle,
  labels,
  coordinates,
  previewCss,
  previewLabel,
}: CoordinateCardProps) {
  const titleId = useId();
  const rows = [
    { label: labels[0], value: coordinates[0] },
    { label: labels[1], value: coordinates[1] },
    { label: labels[2], value: coordinates[2] },
  ] as const;

  return (
    <article className="coordinate-card" aria-labelledby={titleId}>
      {previewCss ? (
        <div
          className="coordinate-preview"
          role="img"
          aria-label={previewLabel ?? `${title} preview`}
          style={{ backgroundColor: previewCss }}
        />
      ) : null}
      <div className="coordinate-card-body">
        <h4 id={titleId}>{title}</h4>
        <p>{subtitle}</p>
        <dl>
          {rows.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd aria-label={`${title} ${label} value`}>
                {formatColorCoordinates([value], 4)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
