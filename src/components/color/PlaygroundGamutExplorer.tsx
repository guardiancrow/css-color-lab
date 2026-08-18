import { useMemo } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { serializeColor } from '../../lib/color/colorEngine';
import { GAMUT_PRESETS } from '../../lib/color/gamut';
import {
  analyzeGamutBoundaries,
  formatBoundaryDifference,
} from '../../lib/color/gamutExplorer';
import { createOklchColor } from '../../lib/color/oklab';
import { GamutBoundaryChart } from './GamutBoundaryChart';
import { GamutStatusList } from './GamutStatusList';
import { OkLChControls } from './OkLChControls';
import { PlaygroundGamutMappingComparison } from './PlaygroundGamutMappingComparison';

export function PlaygroundGamutExplorer() {
  const { currentColor, setCurrentColor } = useCurrentColor();
  const analysis = useMemo(
    () => analyzeGamutBoundaries(currentColor),
    [currentColor],
  );

  const setOklch = (coordinates: readonly [number, number, number]) => {
    setCurrentColor(createOklchColor(coordinates, currentColor.alpha));
  };

  return (
    <section
      id="gamut-explorer"
      className="playground-gamut-explorer"
      aria-labelledby="gamut-explorer-title"
    >
      <div className="playground-section-heading">
        <div>
          <p className="eyebrow">Explore the boundary</p>
          <h2 id="gamut-explorer-title">Gamut Explorer</h2>
        </div>
        <p>
          Current ColorのOkLCh L / C / hを動かし、3つのRGB
          gamut境界と明示的なclipping / mappingを比較します。
        </p>
      </div>

      <div className="playground-gamut-grid">
        <div className="playground-gamut-controls">
          <OkLChControls
            labelPrefix="Gamut Explorer OkLCh"
            heading="Focused OkLCh Controls"
            eyebrow="Edits shared Current Color"
            showPreview={false}
          />
          <div
            className="gamut-preset-buttons playground-gamut-presets"
            aria-label="Gamut Explorer presets"
          >
            {GAMUT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-pressed={
                  analysis.lightness === preset.coordinates[0] &&
                  analysis.chroma === preset.coordinates[1] &&
                  analysis.hue === preset.coordinates[2]
                }
                onClick={() => {
                  setOklch(preset.coordinates);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="playground-boundary-panel">
          <div className="playground-boundary-heading">
            <div>
              <p className="eyebrow">Calculated at current L / h</p>
              <h3>Maximum Chroma boundaries</h3>
            </div>
            <p>
              L {analysis.lightness.toFixed(3)} · C {analysis.chroma.toFixed(4)}{' '}
              · h {analysis.hue.toFixed(1)}°
            </p>
          </div>

          <GamutBoundaryChart analysis={analysis} />

          <div
            className="playground-boundary-values"
            aria-label="Current gamut boundary values"
          >
            {analysis.boundaries.map((boundary) => (
              <article key={boundary.id} data-in-gamut={boundary.isInGamut}>
                <h4>{boundary.label}</h4>
                <dl>
                  <div>
                    <dt>Maximum C</dt>
                    <dd>{boundary.maximumChroma.toFixed(4)}</dd>
                  </div>
                  <div>
                    <dt>Current relation</dt>
                    <dd>{formatBoundaryDifference(boundary.difference)}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => {
                    setOklch([
                      analysis.lightness,
                      boundary.maximumChroma,
                      analysis.hue,
                    ]);
                  }}
                >
                  Set C to {boundary.label} boundary
                </button>
              </article>
            ))}
          </div>
          <p className="playground-boundary-note">
            max Cはtolerance 0.00001のbinary searchで得たin-gamut側の値です。
          </p>
        </div>

        <aside className="playground-gamut-context" aria-label="Gamut context">
          <h3>Current gamut hierarchy</h3>
          <GamutStatusList
            color={currentColor}
            label="Gamut Explorer current color status"
          />
          <dl className="playground-wide-css-values">
            <div>
              <dt>OkLCh</dt>
              <dd>{serializeColor(currentColor, { space: 'oklch' })}</dd>
            </div>
            <div>
              <dt>Display P3</dt>
              <dd>{serializeColor(currentColor, { space: 'display-p3' })}</dd>
            </div>
            <div>
              <dt>Rec.2020</dt>
              <dd>{serializeColor(currentColor, { space: 'rec2020' })}</dd>
            </div>
          </dl>
          <p>
            Gamut判定は色座標としての判定です。実際にその色を見られるかはbrowser・OS・displayのcolor
            managementにも依存します。
          </p>
        </aside>
      </div>

      <PlaygroundGamutMappingComparison />
    </section>
  );
}
