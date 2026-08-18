import { useState } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  convertColor,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from '../../lib/color/colorEngine';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import {
  deriveRelativeOklch,
  serializeRelativeOklch,
  serializeRelativeOklchDeclarations,
} from '../../lib/color/modernCss';
import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';
import type { CanonicalColor } from '../../types/color';
import { GamutStatusList } from './GamutStatusList';
import { ScalarSlider } from './ScalarSlider';

function displayCss(color: CanonicalColor): string {
  const displayColor = isInColorGamut(color, 'srgb')
    ? convertColor(color, 'srgb')
    : mapColorToGamut(color, 'srgb');
  return serializeColor(displayColor);
}

export function RelativeColorExperiment() {
  const { currentColor } = useCurrentColor();
  const [lightness, setLightness] = useState(0);
  const [chroma, setChroma] = useState(0);
  const [hue, setHue] = useState(0);
  const adjustments = { lightness, chroma, hue };
  const { base, baseCoordinates, result } = deriveRelativeOklch(
    currentColor,
    adjustments,
  );
  const relativeCss = serializeRelativeOklch(adjustments);
  const nativeCss = serializeRelativeOklch(
    adjustments,
    serializeColor(currentColor),
  );
  const support = getModernColorFeatureStatus('relative-color');

  return (
    <div
      className="modern-experiment relative-color-experiment"
      aria-labelledby="relative-color-experiment-title"
    >
      <div className="experiment-heading">
        <p className="eyebrow">Relative Color Syntax</p>
        <h3 id="relative-color-experiment-title">
          Current Colorのchannelから新しい色を作る
        </h3>
        <p>
          元色はまずOkLChへ変換され、そのL / C / hがcomponent
          keywordになります。文字列置換ではなく、CSSの色変換機構です。
        </p>
      </div>

      <div className="relative-base-summary">
        <span
          className="modern-color-swatch"
          style={{ backgroundColor: displayCss(base) }}
          role="img"
          aria-label="Current Color base preview"
        />
        <dl>
          <div>
            <dt>Base color</dt>
            <dd>{serializeColor(currentColor)}</dd>
          </div>
          <div>
            <dt>Converted OkLCh</dt>
            <dd>{formatColorCoordinates(baseCoordinates, 4)}</dd>
          </div>
        </dl>
      </div>

      <div className="modern-slider-grid">
        <ScalarSlider
          id="relative-lightness-offset"
          label="Lightness adjustment"
          value={lightness}
          min={-0.3}
          max={0.3}
          step={0.01}
          startLabel="−0.30"
          endLabel="+0.30"
          output={`${lightness >= 0 ? '+' : ''}${lightness.toFixed(2)}`}
          onChange={setLightness}
        />
        <ScalarSlider
          id="relative-chroma-offset"
          label="Chroma adjustment"
          value={chroma}
          min={-0.2}
          max={0.2}
          step={0.01}
          startLabel="−0.20"
          endLabel="+0.20"
          output={`${chroma >= 0 ? '+' : ''}${chroma.toFixed(2)}`}
          onChange={setChroma}
        />
        <ScalarSlider
          id="relative-hue-offset"
          label="Hue offset"
          value={hue}
          min={-180}
          max={180}
          step={1}
          startLabel="−180°"
          endLabel="+180°"
          output={`${hue >= 0 ? '+' : ''}${String(hue)}°`}
          onChange={setHue}
        />
      </div>

      <div className="native-engine-comparison" aria-live="polite">
        <article>
          <p className="eyebrow">Color Engine</p>
          <span
            className="modern-result-preview"
            style={{ backgroundColor: displayCss(result) }}
            role="img"
            aria-label="Engine relative color result"
          />
          <h4>Calculated result</h4>
          <code>{serializeColor(result)}</code>
          <p>OkLCh: {formatColorCoordinates(result.coordinates, 4)}</p>
          <p>
            {isInColorGamut(result, 'srgb')
              ? 'Raw result is inside sRGB.'
              : 'Raw result is outside sRGB; preview only is mapped.'}
          </p>
        </article>
        <article>
          <p className="eyebrow">Browser CSS engine</p>
          <span
            className="modern-result-preview"
            style={
              support === 'supported'
                ? { backgroundColor: nativeCss }
                : undefined
            }
            role="img"
            aria-label="Browser native relative color result"
          />
          <h4>Native result</h4>
          <p className="feature-result" data-state={support}>
            {support === 'supported'
              ? 'Supported — rendered by this browser'
              : support === 'unsupported'
                ? 'Unsupported — native preview unavailable'
                : 'Detection unavailable — native preview unavailable'}
          </p>
          <code>{relativeCss}</code>
        </article>
      </div>

      <GamutStatusList color={result} label="Relative color gamut status" />

      <pre aria-label="Generated relative OkLCh CSS">
        <code>
          {serializeRelativeOklchDeclarations(currentColor, adjustments)}
        </code>
      </pre>

      <details className="modern-details">
        <summary>異なるorigin spaceとalpha</summary>
        <pre>
          <code>{`oklch(from #d27a43 l c h)
rgb(from oklch(65% 0.16 45) r g b)
oklch(from var(--base) l c h / 50%)`}</code>
        </pre>
        <p>
          出力関数がprocessing
          spaceを決めます。alphaを省略するとoriginのalphaを引き継ぎ、明示したalphaは0〜1へclampされます。
        </p>
      </details>
    </div>
  );
}
