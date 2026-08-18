import { useId } from 'react';
import { serializeColor } from '../../lib/color/colorEngine';
import type { CanonicalColor } from '../../types/color';

interface ResultValue {
  readonly label: string;
  readonly value: string;
}

interface TransferResultProps {
  readonly title: string;
  readonly description: string;
  readonly color: CanonicalColor;
  readonly values: readonly ResultValue[];
}

export function TransferResult({
  title,
  description,
  color,
  values,
}: TransferResultProps) {
  const titleId = useId();
  const previewCss = serializeColor(color, { space: 'srgb' });

  return (
    <article className="transfer-result" aria-labelledby={titleId}>
      <div
        className="transfer-result-preview"
        role="img"
        aria-label={`${title}: ${description}`}
        style={{ backgroundColor: previewCss }}
      />
      <div className="transfer-result-body">
        <h4 id={titleId}>{title}</h4>
        <p>{description}</p>
        <dl>
          {values.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
