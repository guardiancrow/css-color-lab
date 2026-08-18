import { useState } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { analyzeBlackWhiteContrast } from '../../lib/color/contrast';
import { initialColor } from '../../lib/color/initialColor';
import { formatPlaygroundColor } from '../../lib/color/playgroundColor';
import { serializeColor } from '../../lib/color/colorEngine';
import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';
import type { CanonicalColor } from '../../types/color';
import { CssCodeBlock } from './CssCodeBlock';
import { FeatureSupportStatus } from './FeatureSupportStatus';

function ratio(value: number) {
  return `${value.toFixed(2)} : 1`;
}

export function PlaygroundContrastColorTool() {
  const { currentColor } = useCurrentColor();
  const [background, setBackground] = useState<CanonicalColor>(initialColor);
  const analysis = analyzeBlackWhiteContrast(background);
  const backgroundCss = serializeColor(background);
  const native = `contrast-color(${backgroundCss})`;
  const code = `.example {\n  background: ${backgroundCss};\n  color: ${native};\n}`;
  const support = getModernColorFeatureStatus('contrast-color');

  return (
    <article
      className="modern-tool-panel"
      aria-labelledby="modern-contrast-title"
    >
      <div className="modern-tool-heading">
        <div>
          <p className="eyebrow">Black or white</p>
          <h3 id="modern-contrast-title">contrast-color()</h3>
          <p>Backgroundに対するblack / white ratioをEngineで比較します。</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setBackground(currentColor);
          }}
        >
          Use Current Color as Background
        </button>
      </div>
      <div
        className="modern-contrast-preview"
        role="img"
        aria-label={`Contrast preview with ${analysis.selected} text`}
        style={{
          backgroundColor: formatPlaygroundColor(background).mappedPreviewCss,
          color: analysis.selected,
        }}
      >
        Engine selected: {analysis.selected}
      </div>
      <dl className="modern-contrast-values">
        <div>
          <dt>Black text contrast</dt>
          <dd>{ratio(analysis.blackRatio)}</dd>
        </div>
        <div>
          <dt>White text contrast</dt>
          <dd>{ratio(analysis.whiteRatio)}</dd>
        </div>
        <div>
          <dt>Engine analysis</dt>
          <dd>Best of black / white: {analysis.selected}</dd>
        </div>
      </dl>
      {support === 'supported' ? (
        <div
          className="modern-native-contrast"
          role="img"
          aria-label="Browser native contrast-color preview"
          style={{ backgroundColor: backgroundCss, color: native }}
        >
          Browser contrast-color()
        </div>
      ) : (
        <p className="modern-tool-note">
          Browser contrast-color() preview unavailable in this browser.
        </p>
      )}
      <FeatureSupportStatus feature="contrast-color" label="contrast-color()" />
      <p className="modern-accessibility-warning">
        Choosing the better of black and white does not guarantee that every
        accessibility requirement is satisfied.
      </p>
      <CssCodeBlock label="contrast-color" code={code} />
    </article>
  );
}
