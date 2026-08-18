import { useState } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { interpolateColors, serializeColor } from '../../lib/color/colorEngine';
import type {
  HueInterpolationMethod,
  InterpolationSpace,
} from '../../lib/color/colorEngine';
import { getGamutStatuses } from '../../lib/color/gamut';
import {
  HUE_METHODS,
  INTERPOLATION_SPACES,
  serializeColorMix,
} from '../../lib/color/interpolation';
import { INITIAL_INTERPOLATION_PRESET } from '../../lib/color/playgroundInterpolation';
import { formatPlaygroundColor } from '../../lib/color/playgroundColor';
import type { CanonicalColor } from '../../types/color';
import { CssCodeBlock } from './CssCodeBlock';
import { FeatureSupportStatus } from './FeatureSupportStatus';
import { ScalarSlider } from './ScalarSlider';

export function PlaygroundColorMixTool() {
  const { currentColor } = useCurrentColor();
  const [colorA, setColorA] = useState<CanonicalColor>(
    INITIAL_INTERPOLATION_PRESET.start,
  );
  const [colorB, setColorB] = useState<CanonicalColor>(
    INITIAL_INTERPOLATION_PRESET.end,
  );
  const [amount, setAmount] = useState(0.5);
  const [space, setSpace] = useState<InterpolationSpace>('oklab');
  const [hueMethod, setHueMethod] = useState<HueInterpolationMethod>('shorter');
  const result = interpolateColors(colorA, colorB, amount, {
    space,
    hueMethod,
  });
  const css = serializeColorMix(colorA, colorB, amount, space, hueMethod);
  const view = formatPlaygroundColor(result);

  return (
    <article className="modern-tool-panel" aria-labelledby="modern-mix-title">
      <div className="modern-tool-heading">
        <div>
          <p className="eyebrow">Compact generator</p>
          <h3 id="modern-mix-title">color-mix()</h3>
          <p>2色と補間空間からCSSとEngine resultを生成します。</p>
        </div>
      </div>
      <div className="modern-compact-endpoints">
        <div>
          <span
            role="img"
            aria-label="Color A preview"
            style={{
              backgroundColor: formatPlaygroundColor(colorA).mappedPreviewCss,
            }}
          />
          <code>{serializeColor(colorA)}</code>
          <button
            type="button"
            onClick={() => {
              setColorA(currentColor);
            }}
          >
            Use Current Color as Color A
          </button>
        </div>
        <div>
          <span
            role="img"
            aria-label="Color B preview"
            style={{
              backgroundColor: formatPlaygroundColor(colorB).mappedPreviewCss,
            }}
          />
          <code>{serializeColor(colorB)}</code>
          <button
            type="button"
            onClick={() => {
              setColorB(currentColor);
            }}
          >
            Use Current Color as Color B
          </button>
        </div>
      </div>
      <ScalarSlider
        id="modern-mix-amount"
        label="Modern color-mix amount"
        value={amount}
        min={0}
        max={1}
        step={0.01}
        startLabel="A 0%"
        endLabel="B 100%"
        output={`${String(Math.round(amount * 100))}% B`}
        onChange={setAmount}
      />
      <div className="modern-select-grid">
        <label>
          color-mix interpolation space
          <select
            value={space}
            onChange={(event) => {
              setSpace(event.currentTarget.value as InterpolationSpace);
            }}
          >
            {INTERPOLATION_SPACES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {space === 'oklch' ? (
          <label>
            color-mix OkLCh Hue method
            <select
              value={hueMethod}
              onChange={(event) => {
                setHueMethod(
                  event.currentTarget.value as HueInterpolationMethod,
                );
              }}
            >
              {HUE_METHODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="modern-compact-result">
        <span
          role="img"
          aria-label="color-mix Engine result preview"
          style={{ backgroundColor: view.mappedPreviewCss }}
        />
        <div>
          <code data-testid="modern-color-mix-result">
            {serializeColor(result)}
          </code>
          <ul
            className="compact-gamut-status"
            aria-label="Modern color-mix gamut status"
          >
            {getGamutStatuses(result).map((status) => (
              <li key={status.gamut} data-in-gamut={status.isInGamut}>
                <span aria-hidden="true" />
                {status.label}: {status.isInGamut ? 'inside' : 'outside'}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <FeatureSupportStatus feature="color-mix" label="color-mix()" />
      <CssCodeBlock label="color-mix" code={`background: ${css};`} />
      <p className="modern-tool-note">
        Full gradient comparison is available in{' '}
        <a href="#interpolation">Interpolation / Gradient Explorer</a>.
      </p>
    </article>
  );
}
