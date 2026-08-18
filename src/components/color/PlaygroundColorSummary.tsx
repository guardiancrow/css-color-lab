import type { CSSProperties } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { getGamutStatuses } from '../../lib/color/gamut';
import { initialColor } from '../../lib/color/initialColor';
import {
  formatPlaygroundColor,
  PLAYGROUND_PRESETS,
} from '../../lib/color/playgroundColor';
import { AlphaControl } from './AlphaControl';
import { GamutStatusList } from './GamutStatusList';

type PreviewProperties = CSSProperties & {
  '--original-color': string;
  '--mapped-color': string;
};

export function PlaygroundColorSummary() {
  const { currentColor, setCurrentColor } = useCurrentColor();
  const view = formatPlaygroundColor(currentColor);
  const previewStyle: PreviewProperties = {
    '--original-color': view.originalPreviewCss,
    '--mapped-color': view.mappedPreviewCss,
  };

  return (
    <section
      className="playground-summary"
      aria-labelledby="current-color-summary-title"
    >
      <div className="playground-summary-heading">
        <div>
          <p className="eyebrow">Shared canonical color</p>
          <h2 id="current-color-summary-title">Current Color</h2>
          <p>
            どのeditorから操作しても、この色とすべての表示が同時に更新されます。
          </p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            setCurrentColor(initialColor);
          }}
        >
          Reset to #D27A43
        </button>
      </div>

      <div className="playground-summary-grid">
        <div className="playground-preview-panel">
          <div
            className="playground-original-preview"
            role="img"
            aria-label="Native original color preview"
            style={previewStyle}
          >
            <span>Native / original</span>
          </div>
          <div
            className="playground-mapped-preview"
            role="img"
            aria-label="Color preview mapped to sRGB for display"
            style={{ backgroundColor: view.mappedPreviewCss }}
          >
            <span>Mapped sRGB</span>
          </div>
          <p className="playground-preview-note">
            Native previewは元のCSS表現をbrowserへ渡します。Mapped
            previewとHexは表示用にsRGBへmappingしています。
          </p>
          <AlphaControl />
        </div>

        <div className="playground-css-panel">
          <h3>CSS values</h3>
          <dl className="playground-css-values">
            <div>
              <dt>{view.isInSrgbGamut ? 'Hex' : 'Hex (mapped to sRGB)'}</dt>
              <dd data-testid="playground-hex">{view.hex}</dd>
            </div>
            {view.syntaxes.map(({ id, label, value }) => (
              <div key={id}>
                <dt>{label}</dt>
                <dd data-testid={`playground-css-${id}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="playground-gamut-panel">
          <h3>Gamut status</h3>
          <p>
            mapping前のcanonical
            colorを判定しています。previewの見た目とは独立したEngine結果です。
          </p>
          <GamutStatusList
            color={currentColor}
            label="Playground gamut status"
          />
          <p className="playground-gamut-summary" aria-live="polite">
            {getGamutStatuses(currentColor)
              .map(
                ({ label, isInGamut }) =>
                  `${label}: ${isInGamut ? 'Inside' : 'Outside'}`,
              )
              .join(' · ')}
          </p>
        </div>
      </div>

      <div className="playground-presets" aria-label="Color presets">
        <span>Presets</span>
        <div>
          {PLAYGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() => {
                setCurrentColor(preset.color);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
