import { useState } from 'react';
import {
  interpolateColors,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from '../../lib/color/colorEngine';
import type { HueInterpolationMethod } from '../../lib/color/colorEngine';
import { getHuePath, HUE_METHODS } from '../../lib/color/interpolation';
import { createOklchColor } from '../../lib/color/oklab';

const START_HUE = 20;
const END_HUE = 300;

function formatHue(hue: number | null): string {
  return hue === null ? 'none' : `${String(Number(hue.toFixed(1)))}°`;
}

export function HueInterpolationExperiment() {
  const [method, setMethod] = useState<HueInterpolationMethod>('shorter');
  const start = createOklchColor([0.7, 0.18, START_HUE]);
  const end = createOklchColor([0.7, 0.18, END_HUE]);
  const result = interpolateColors(start, end, 0.5, {
    space: 'oklch',
    hueMethod: method,
  });
  const path = getHuePath(START_HUE, END_HUE, method);
  const routeLandmark =
    method === 'shorter' || method === 'decreasing' ? '0° / 360°' : '180°';
  const mapped = isInColorGamut(result, 'srgb')
    ? result
    : mapColorToGamut(result, 'srgb');

  return (
    <div className="hue-interpolation-experiment">
      <div className="experiment-heading">
        <p className="eyebrow">Polar color-space experiment</p>
        <h3>Hueはどちら向きに回る？</h3>
        <p>
          OkLChの20°から300°へ進むとき、同じ端点でもHue
          methodによって通る色相が変わります。
        </p>
      </div>
      <fieldset className="hue-method-options">
        <legend>Hue interpolation method</legend>
        {HUE_METHODS.map((candidate) => (
          <label key={candidate.id}>
            <input
              type="radio"
              name="hue-method"
              value={candidate.id}
              checked={method === candidate.id}
              onChange={() => {
                setMethod(candidate.id);
              }}
            />
            <span>
              <strong>{candidate.label} hue</strong>
              <small>{candidate.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="hue-path-result" aria-live="polite">
        <div
          className="hue-result-swatch"
          style={{ backgroundColor: serializeColor(mapped) }}
          aria-label={`${method} hue midpoint preview`}
        />
        <div>
          <p className="hue-path-values" aria-label="Hue path">
            {formatHue(START_HUE)} → <strong>{formatHue(path[1])}</strong> →{' '}
            {formatHue(END_HUE)}
          </p>
          <p>
            Route landmark: {formatHue(START_HUE)} → {routeLandmark} →{' '}
            {formatHue(END_HUE)}
          </p>
          <p>
            midpoint: <code>{serializeColor(result)}</code>
          </p>
          <p>
            {isInColorGamut(result, 'srgb')
              ? 'Inside sRGB gamut'
              : 'Outside sRGB; swatch only is gamut-mapped'}
          </p>
        </div>
      </div>
      <aside className="lesson-note">
        <strong>0°/360°は同じ方向です。</strong> <code>shorter</code>
        は境界をまたぐ短い道、
        <code>longer</code>は反対側の長い道を選びます。Chromaがほぼ0のHueは
        powerlessとしてmissingになり、もう一方のHueを引き継ぎます。両方がmissingなら結果もmissingです。
      </aside>
    </div>
  );
}
