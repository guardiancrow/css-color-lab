import { useState } from 'react';
import { analyzeBlackWhiteContrast } from '../../lib/color/contrast';
import { createColor, serializeColor } from '../../lib/color/colorEngine';
import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';

const BACKGROUND_PRESETS = [
  {
    id: 'brand',
    label: 'Brand orange',
    color: createColor('srgb', [0.82, 0.48, 0.26]),
  },
  {
    id: 'mid',
    label: 'Middle gray',
    color: createColor('srgb', [0.5, 0.5, 0.5]),
  },
  {
    id: 'dark',
    label: 'Deep blue',
    color: createColor('srgb', [0.08, 0.16, 0.38]),
  },
] as const;

function formatRatio(value: number): string {
  return `${value.toFixed(2)} : 1`;
}

export function ContrastColorExperiment() {
  const [presetId, setPresetId] = useState<string>(BACKGROUND_PRESETS[0].id);
  const preset =
    BACKGROUND_PRESETS.find(({ id }) => id === presetId) ??
    BACKGROUND_PRESETS[0];
  const backgroundCss = serializeColor(preset.color);
  const analysis = analyzeBlackWhiteContrast(preset.color);
  const selectedCss = serializeColor(analysis.selectedColor);
  const nativeCss = `contrast-color(${backgroundCss})`;
  const support = getModernColorFeatureStatus('contrast-color');
  const selectedRatio =
    analysis.selected === 'black' ? analysis.blackRatio : analysis.whiteRatio;

  return (
    <div className="modern-experiment" aria-labelledby="contrast-color-title">
      <div className="experiment-heading">
        <p className="eyebrow">Black or white</p>
        <h3 id="contrast-color-title">contrast-color()とcontrast ratio</h3>
        <p>
          CSSはsolid backgroundに対してblack /
          whiteのうちcontrastが大きい方を選びます。 Engine欄では学習用にWCAG 2.x
          ratioを比較します。
        </p>
      </div>

      <fieldset className="modern-preset-buttons">
        <legend>Background preset</legend>
        {BACKGROUND_PRESETS.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            aria-pressed={candidate.id === preset.id}
            onClick={() => {
              setPresetId(candidate.id);
            }}
          >
            {candidate.label}
          </button>
        ))}
      </fieldset>

      <div className="contrast-preview-grid" aria-live="polite">
        <article
          style={{ backgroundColor: backgroundCss, color: selectedCss }}
          aria-label="Engine selected foreground preview"
        >
          <p>Engine comparison</p>
          <strong>{analysis.selected} text</strong>
        </article>
        <article
          style={
            support === 'supported'
              ? { backgroundColor: backgroundCss, color: nativeCss }
              : { backgroundColor: backgroundCss }
          }
          aria-label="Browser native contrast-color preview"
        >
          <p>Browser native</p>
          <strong>
            {support === 'supported' ? 'contrast-color()' : 'Not supported'}
          </strong>
        </article>
      </div>

      <dl className="contrast-ratio-list">
        <div>
          <dt>White text</dt>
          <dd>{formatRatio(analysis.whiteRatio)}</dd>
        </div>
        <div>
          <dt>Black text</dt>
          <dd>{formatRatio(analysis.blackRatio)}</dd>
        </div>
        <div>
          <dt>Engine selected</dt>
          <dd>
            {analysis.selected} · {formatRatio(selectedRatio)}
          </dd>
        </div>
      </dl>

      <pre aria-label="contrast-color CSS example">
        <code>{`.button {
  background: ${backgroundCss};
  color: ${nativeCss};
}`}</code>
      </pre>
      <aside className="lesson-note">
        <strong>自動選択だけでaccessibility確認は完了しません。</strong>
        ratio、文字サイズ・太さ、周辺色などを別途確認してください。現仕様の厳密な選択algorithmはUA定義なので、EngineのWCAG比による選択とnative結果が常に一致するとは限りません。
      </aside>
    </div>
  );
}
