import { useMemo, useState } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { isInColorGamut, serializeColor } from '../../lib/color/colorEngine';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import { GAMUTS, compareClippingAndMapping } from '../../lib/color/gamut';
import type { GamutSpaceId } from '../../types/color';

type ComparisonResult = ReturnType<typeof compareClippingAndMapping>;

interface ResultCardProps {
  readonly method: 'Simple clipping' | 'CSS gamut mapping';
  readonly color: ComparisonResult['clipped'];
  readonly oklch: ComparisonResult['clippedOklch'];
  readonly delta: ComparisonResult['clippedDelta'];
  readonly target: GamutSpaceId;
  readonly targetLabel: string;
}

function ResultCard({
  method,
  color,
  oklch,
  delta,
  target,
  targetLabel,
}: ResultCardProps) {
  const isInTarget = isInColorGamut(color, target);

  return (
    <article aria-label={`${method} result for ${targetLabel}`}>
      <div
        className="mapping-result-swatch"
        role="img"
        aria-label={`${method} ${targetLabel} preview`}
        style={{ backgroundColor: serializeColor(color) }}
      />
      <h4>{method}</h4>
      <p className="gamut-status" data-in-gamut={isInTarget}>
        <span aria-hidden="true" />
        {isInTarget
          ? `Inside ${targetLabel} gamut`
          : `Outside ${targetLabel} gamut`}
      </p>
      <dl>
        <div>
          <dt>Resulting {targetLabel}</dt>
          <dd>{formatColorCoordinates(color.coordinates, 5)}</dd>
        </div>
        <div>
          <dt>OkLCh after</dt>
          <dd>{formatColorCoordinates(oklch, 5)}</dd>
        </div>
        <div>
          <dt>ΔL / ΔC / Δh</dt>
          <dd>{formatColorCoordinates(delta, 5)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function PlaygroundGamutMappingComparison() {
  const { currentColor } = useCurrentColor();
  const [target, setTarget] = useState<GamutSpaceId>('srgb');
  const comparison = useMemo(
    () => compareClippingAndMapping(currentColor, target),
    [currentColor, target],
  );
  const targetLabel =
    GAMUTS.find((candidate) => candidate.id === target)?.label ?? target;
  const originalIsInTarget = isInColorGamut(currentColor, target);

  return (
    <section
      className="playground-mapping-comparison"
      aria-labelledby="playground-mapping-title"
    >
      <div className="playground-mapping-heading">
        <div>
          <p className="eyebrow">Derived results</p>
          <h3 id="playground-mapping-title">Clipping / Mapping comparison</h3>
          <p>
            Originalは変更しません。選択したtargetへの2つの派生結果を比較します。
          </p>
        </div>
        <label>
          Target gamut
          <select
            value={target}
            onChange={(event) => {
              setTarget(event.currentTarget.value as GamutSpaceId);
            }}
          >
            {GAMUTS.map((gamut) => (
              <option key={gamut.id} value={gamut.id}>
                {gamut.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <article
        className="playground-mapping-original"
        aria-label="Original canonical color"
      >
        <div
          className="mapping-result-swatch"
          role="img"
          aria-label="Native original color preview for gamut comparison"
          style={{ backgroundColor: serializeColor(currentColor) }}
        />
        <div>
          <h4>Original</h4>
          <p className="gamut-status" data-in-gamut={originalIsInTarget}>
            <span aria-hidden="true" />
            {originalIsInTarget
              ? `Inside ${targetLabel} gamut`
              : `Outside ${targetLabel} gamut`}
          </p>
          <dl>
            <div>
              <dt>Original OkLCh</dt>
              <dd>{formatColorCoordinates(comparison.originalOklch, 5)}</dd>
            </div>
            <div>
              <dt>Raw {targetLabel}</dt>
              <dd>
                {formatColorCoordinates(comparison.rawTarget.coordinates, 5)}
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <div className="mapping-result-grid playground-mapping-results">
        <ResultCard
          method="Simple clipping"
          color={comparison.clipped}
          oklch={comparison.clippedOklch}
          delta={comparison.clippedDelta}
          target={target}
          targetLabel={targetLabel}
        />
        <ResultCard
          method="CSS gamut mapping"
          color={comparison.mapped}
          oklch={comparison.mappedOklch}
          delta={comparison.mappedDelta}
          target={target}
          targetLabel={targetLabel}
        />
      </div>
    </section>
  );
}
