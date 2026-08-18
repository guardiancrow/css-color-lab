import { isInColorGamut, serializeColor } from '../../lib/color/colorEngine';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import { compareSrgbClippingAndMapping } from '../../lib/color/gamut';
import { createOklchColor } from '../../lib/color/oklab';

const comparison = compareSrgbClippingAndMapping(
  createOklchColor([0.7, 0.29, 20]),
);

interface ResultCardProps {
  readonly method: 'Simple clipping' | 'CSS gamut mapping';
  readonly color: typeof comparison.clipped;
  readonly oklch: typeof comparison.clippedOklch;
  readonly delta: typeof comparison.clippedDelta;
}

function ResultCard({ method, color, oklch, delta }: ResultCardProps) {
  return (
    <article aria-label={`${method} result`}>
      <div
        className="mapping-result-swatch"
        role="img"
        aria-label={`${method} sRGB preview`}
        style={{ backgroundColor: serializeColor(color) }}
      />
      <h4>{method}</h4>
      <p className="gamut-status" data-in-gamut={isInColorGamut(color, 'srgb')}>
        <span aria-hidden="true" />
        Inside sRGB gamut
      </p>
      <dl>
        <div>
          <dt>Resulting sRGB</dt>
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

export function ClippingMappingComparison() {
  return (
    <div
      className="mapping-comparison"
      aria-labelledby="mapping-comparison-title"
    >
      <div className="experiment-heading">
        <p className="eyebrow">Same original · two explicit methods</p>
        <h3 id="mapping-comparison-title">
          Clippingとgamut mappingは同じではない
        </h3>
        <p>
          OriginalはRec.2020内ですがsRGB外のOkLCh色です。どちらの処理も新しい結果を作り、元のcanonical
          valueを変更しません。
        </p>
      </div>

      <article
        className="mapping-original"
        aria-label="Original out-of-sRGB color"
      >
        <div
          className="mapping-result-swatch"
          role="img"
          aria-label="Original OkLCh preview; browser may map it for the display"
          style={{ backgroundColor: serializeColor(comparison.original) }}
        />
        <div>
          <h4>Original OkLCh</h4>
          <dl>
            <div>
              <dt>OkLCh</dt>
              <dd>{formatColorCoordinates(comparison.originalOklch, 5)}</dd>
            </div>
            <div>
              <dt>Raw sRGB conversion</dt>
              <dd>
                {formatColorCoordinates(comparison.rawSrgb.coordinates, 5)}
              </dd>
            </div>
          </dl>
          <p className="gamut-status" data-in-gamut="false">
            <span aria-hidden="true" />
            Outside sRGB gamut · raw channels may be below 0 or above 1
          </p>
        </div>
      </article>

      <div className="mapping-result-grid">
        <ResultCard
          method="Simple clipping"
          color={comparison.clipped}
          oklch={comparison.clippedOklch}
          delta={comparison.clippedDelta}
        />
        <ResultCard
          method="CSS gamut mapping"
          color={comparison.mapped}
          oklch={comparison.mappedOklch}
          delta={comparison.mappedDelta}
        />
      </div>
      <div className="mapping-explanation">
        <p>
          <strong>Simple clipping:</strong> encoded
          sRGBの各channelを0〜1へ切り詰めます。簡単ですが、元のL / C /
          hを保つ保証はありません。
        </p>
        <p>
          <strong>CSS gamut mapping:</strong> Color Engineの
          <code>method: 'css'</code>
          を明示し、見た目の変化を抑えながらsRGB内へ移します。元色を完全に再現する処理ではありません。
        </p>
      </div>
    </div>
  );
}
