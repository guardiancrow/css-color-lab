import { useState } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { createColor, serializeColor } from '../../lib/color/colorEngine';
import { selectLightDarkColor } from '../../lib/color/modernCss';
import type { SimulatedColorScheme } from '../../lib/color/modernCss';
import { formatPlaygroundColor } from '../../lib/color/playgroundColor';
import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';
import type { CanonicalColor } from '../../types/color';
import { CssCodeBlock } from './CssCodeBlock';
import { FeatureSupportStatus } from './FeatureSupportStatus';

const INITIAL_LIGHT = createColor('srgb', [0.97, 0.96, 1]);
const INITIAL_DARK = createColor('srgb', [0.12, 0.1, 0.18]);

export function PlaygroundLightDarkTool() {
  const { currentColor } = useCurrentColor();
  const [lightColor, setLightColor] = useState<CanonicalColor>(INITIAL_LIGHT);
  const [darkColor, setDarkColor] = useState<CanonicalColor>(INITIAL_DARK);
  const [scheme, setScheme] = useState<SimulatedColorScheme>('light');
  const selected = selectLightDarkColor(lightColor, darkColor, scheme);
  const lightCss = serializeColor(lightColor);
  const darkCss = serializeColor(darkColor);
  const expression = `light-dark(${lightCss}, ${darkCss})`;
  const code = `:root {\n  color-scheme: light dark;\n}\n\n.example {\n  background: ${expression};\n}`;
  const support = getModernColorFeatureStatus('light-dark');

  return (
    <article
      className="modern-tool-panel"
      aria-labelledby="modern-light-dark-title"
    >
      <div className="modern-tool-heading">
        <div>
          <p className="eyebrow">Scheme-aware value</p>
          <h3 id="modern-light-dark-title">light-dark()</h3>
          <p>
            Light / Darkをlocal stateで選び、schemeをtool内でsimulationします。
          </p>
        </div>
      </div>
      <div className="modern-compact-endpoints">
        <div>
          <span
            role="img"
            aria-label="Light Color preview"
            style={{
              backgroundColor:
                formatPlaygroundColor(lightColor).mappedPreviewCss,
            }}
          />
          <code>{lightCss}</code>
          <button
            type="button"
            onClick={() => {
              setLightColor(currentColor);
            }}
          >
            Use Current Color as Light Color
          </button>
        </div>
        <div>
          <span
            role="img"
            aria-label="Dark Color preview"
            style={{
              backgroundColor:
                formatPlaygroundColor(darkColor).mappedPreviewCss,
            }}
          />
          <code>{darkCss}</code>
          <button
            type="button"
            onClick={() => {
              setDarkColor(currentColor);
            }}
          >
            Use Current Color as Dark Color
          </button>
        </div>
      </div>
      <fieldset className="compact-radio-group">
        <legend>Preview scheme simulation</legend>
        {(['light', 'dark'] as const).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="playground-scheme"
              value={value}
              checked={scheme === value}
              onChange={() => {
                setScheme(value);
              }}
            />
            {value === 'light' ? 'Light' : 'Dark'}
          </label>
        ))}
      </fieldset>
      <div className="modern-scheme-previews">
        <div
          role="img"
          aria-label={`Simulated ${scheme} scheme result`}
          style={{
            backgroundColor: formatPlaygroundColor(selected).mappedPreviewCss,
          }}
        >
          Simulation: {scheme}
        </div>
        {support === 'supported' ? (
          <div
            role="img"
            aria-label="Browser native light-dark preview"
            style={{ colorScheme: scheme, backgroundColor: expression }}
          >
            Native light-dark()
          </div>
        ) : (
          <div>Native preview unavailable in this browser.</div>
        )}
      </div>
      <p className="modern-tool-note">
        SimulationはOS preferenceとは独立しています。Native選択には
        <code>color-scheme</code>が必要です。
      </p>
      <FeatureSupportStatus feature="light-dark" label="light-dark()" />
      <CssCodeBlock label="light-dark" code={code} />
    </article>
  );
}
