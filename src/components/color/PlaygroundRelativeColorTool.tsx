import { useState } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import { initialColor } from '../../lib/color/initialColor';
import {
  deriveRelativeOklch,
  serializeRelativeOklch,
  serializeRelativeOklchDeclarations,
} from '../../lib/color/modernCss';
import { formatPlaygroundColor } from '../../lib/color/playgroundColor';
import { serializeColor } from '../../lib/color/colorEngine';
import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';
import type { CanonicalColor } from '../../types/color';
import { CssCodeBlock } from './CssCodeBlock';
import { FeatureSupportStatus } from './FeatureSupportStatus';
import { GamutStatusList } from './GamutStatusList';
import { ScalarSlider } from './ScalarSlider';

const ZERO_OFFSETS = { lightness: 0, chroma: 0, hue: 0 } as const;

export function PlaygroundRelativeColorTool() {
  const { currentColor, setCurrentColor } = useCurrentColor();
  const [baseColor, setBaseColor] = useState<CanonicalColor>(initialColor);
  const [lightness, setLightness] = useState(0);
  const [chroma, setChroma] = useState(0);
  const [hue, setHue] = useState(0);
  const adjustments = { lightness, chroma, hue };
  const derived = deriveRelativeOklch(baseColor, adjustments);
  const view = formatPlaygroundColor(derived.result);
  const nativeCss = serializeRelativeOklch(
    adjustments,
    serializeColor(baseColor),
  );
  const code = serializeRelativeOklchDeclarations(baseColor, adjustments);
  const support = getModernColorFeatureStatus('relative-color');

  return (
    <article
      className="modern-tool-panel modern-relative-tool"
      aria-labelledby="modern-relative-title"
    >
      <div className="modern-tool-heading">
        <div>
          <p className="eyebrow">Relative Color Syntax</p>
          <h3 id="modern-relative-title">Relative Color</h3>
          <p>
            BaseのOkLCh channelへoffsetを加え、raw resultとCSSを生成します。
          </p>
        </div>
        <div className="modern-tool-actions">
          <button
            type="button"
            onClick={() => {
              setBaseColor(currentColor);
            }}
          >
            Use Current Color as Base
          </button>
          <button
            type="button"
            onClick={() => {
              setBaseColor(initialColor);
              setLightness(ZERO_OFFSETS.lightness);
              setChroma(ZERO_OFFSETS.chroma);
              setHue(ZERO_OFFSETS.hue);
            }}
          >
            Reset Relative Color
          </button>
        </div>
      </div>

      <div className="modern-relative-grid">
        <div className="modern-slider-grid">
          <ScalarSlider
            id="playground-relative-l"
            label="Relative Lightness offset"
            value={lightness}
            min={-0.3}
            max={0.3}
            step={0.01}
            startLabel="−0.30"
            endLabel="+0.30"
            output={lightness.toFixed(2)}
            onChange={setLightness}
          />
          <ScalarSlider
            id="playground-relative-c"
            label="Relative Chroma offset"
            value={chroma}
            min={-0.2}
            max={0.2}
            step={0.01}
            startLabel="−0.20"
            endLabel="+0.20"
            output={chroma.toFixed(2)}
            onChange={setChroma}
          />
          <ScalarSlider
            id="playground-relative-h"
            label="Relative Hue offset"
            value={hue}
            min={-180}
            max={180}
            step={1}
            startLabel="−180°"
            endLabel="+180°"
            output={`${String(hue)}°`}
            onChange={setHue}
          />
        </div>
        <div className="modern-relative-result">
          <div className="modern-relative-previews">
            <div
              role="img"
              aria-label="Engine relative color result preview"
              style={{ backgroundColor: view.mappedPreviewCss }}
            />
            {support === 'supported' ? (
              <div
                role="img"
                aria-label="Browser native relative color preview"
                style={{ backgroundColor: nativeCss }}
              />
            ) : (
              <div>Native preview unavailable in this browser.</div>
            )}
          </div>
          <dl>
            <div>
              <dt>Base OkLCh</dt>
              <dd>{formatColorCoordinates(derived.baseCoordinates, 4)}</dd>
            </div>
            <div>
              <dt>Result OkLCh</dt>
              <dd data-testid="modern-relative-result">
                {formatColorCoordinates(derived.result.coordinates, 4)}
              </dd>
            </div>
            <div>
              <dt>Result CSS</dt>
              <dd>{serializeColor(derived.result)}</dd>
            </div>
            <div>
              <dt>Alpha</dt>
              <dd>{String(derived.result.alpha)}</dd>
            </div>
          </dl>
          <p>
            {view.isInSrgbGamut
              ? 'Raw result is inside sRGB.'
              : 'Raw result is outside sRGB; Engine preview only is mapped.'}
          </p>
          <GamutStatusList
            color={derived.result}
            label="Modern Relative Color gamut status"
          />
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setCurrentColor(derived.result);
            }}
          >
            Use Relative Color Result as Current Color
          </button>
        </div>
      </div>
      <FeatureSupportStatus feature="relative-color" label="Relative Color" />
      {support === 'supported' ? null : (
        <p className="modern-tool-note">Engine result remains available.</p>
      )}
      <CssCodeBlock label="Relative Color" code={code} />
    </article>
  );
}
