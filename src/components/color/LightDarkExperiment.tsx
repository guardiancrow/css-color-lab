import { useState } from 'react';
import { createColor, serializeColor } from '../../lib/color/colorEngine';
import {
  selectLightDarkColor,
  type SimulatedColorScheme,
} from '../../lib/color/modernCss';
import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';

const lightColor = createColor('srgb', [0.97, 0.96, 1]);
const darkColor = createColor('srgb', [0.12, 0.1, 0.18]);

export function LightDarkExperiment() {
  const [scheme, setScheme] = useState<SimulatedColorScheme>('light');
  const selectedColor = selectLightDarkColor(lightColor, darkColor, scheme);
  const lightCss = serializeColor(lightColor);
  const darkCss = serializeColor(darkColor);
  const nativeCss = `light-dark(${lightCss}, ${darkCss})`;
  const support = getModernColorFeatureStatus('light-dark');

  return (
    <div className="modern-experiment" aria-labelledby="light-dark-title">
      <div className="experiment-heading">
        <p className="eyebrow">Scheme-aware color</p>
        <h3 id="light-dark-title">light-dark()で2つの値を一つにする</h3>
        <p>
          1番目はlight、2番目はdarkのelement color schemeで選ばれます。利用には
          <code>color-scheme</code>の設定が必要です。
        </p>
      </div>

      <div className="scheme-source-grid" aria-label="Light and dark values">
        <article style={{ backgroundColor: lightCss, color: '#20202a' }}>
          <strong>Light value</strong>
          <code>{lightCss}</code>
        </article>
        <article style={{ backgroundColor: darkCss, color: '#ffffff' }}>
          <strong>Dark value</strong>
          <code>{darkCss}</code>
        </article>
      </div>

      <fieldset className="compact-radio-group">
        <legend>Simulated scheme</legend>
        {(['light', 'dark'] as const).map((candidate) => (
          <label key={candidate}>
            <input
              type="radio"
              name="simulated-color-scheme"
              value={candidate}
              checked={scheme === candidate}
              onChange={() => {
                setScheme(candidate);
              }}
            />
            {candidate === 'light' ? 'Light' : 'Dark'}
          </label>
        ))}
      </fieldset>

      <div className="native-engine-comparison" aria-live="polite">
        <article>
          <p className="eyebrow">Lesson simulation</p>
          <div
            className="scheme-result-preview"
            style={{
              backgroundColor: serializeColor(selectedColor),
              color: scheme === 'light' ? '#20202a' : '#ffffff',
            }}
          >
            Selected: {scheme}
          </div>
          <p>このtoggleは教材内のsimulationで、OS設定ではありません。</p>
        </article>
        <article>
          <p className="eyebrow">Browser native</p>
          <div
            className="scheme-result-preview"
            style={
              support === 'supported'
                ? { colorScheme: scheme, backgroundColor: nativeCss }
                : undefined
            }
          >
            Native light-dark()
          </div>
          <p className="feature-result" data-state={support}>
            {support === 'supported'
              ? 'Supported'
              : support === 'unsupported'
                ? 'Unsupported — simulation remains available'
                : 'Detection unavailable — simulation remains available'}
          </p>
        </article>
      </div>

      <pre aria-label="light-dark CSS example">
        <code>{`:root {
  color-scheme: light dark;
}

.example {
  background: ${nativeCss};
}`}</code>
      </pre>
      <p className="experiment-footnote">
        <code>prefers-color-scheme</code>は条件付きrule全体を切り替えられます。
        <code>light-dark()</code>
        は一つのvalue内で色を選ぶ機能で、完全な代替関係ではありません。
      </p>
    </div>
  );
}
