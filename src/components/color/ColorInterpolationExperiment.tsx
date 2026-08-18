import { useMemo, useState } from 'react';
import {
  convertColor,
  interpolateColors,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from '../../lib/color/colorEngine';
import type {
  HueInterpolationMethod,
  InterpolationSpace,
} from '../../lib/color/colorEngine';
import { getGamutStatuses } from '../../lib/color/gamut';
import {
  createPreviewGradient,
  formatInterpolationCoordinates,
  HUE_METHODS,
  INTERPOLATION_PRESETS,
  INTERPOLATION_SPACES,
  sampleInterpolation,
  serializeColorMix,
} from '../../lib/color/interpolation';
import type { CanonicalColor } from '../../types/color';
import { ScalarSlider } from './ScalarSlider';

const SPACE_NOTES: Record<InterpolationSpace, string> = {
  srgb: 'Encoded coordinatesを直接結びます。用途によっては途中が暗く濁って見えることがありますが、常に不適切とは限りません。',
  'srgb-linear':
    '光量に比例するcoordinatesを結びます。光の計算には適しますが、知覚的に均等という意味ではありません。',
  oklab:
    '知覚的な変化をより均等に扱うことを目指します。補間に有用ですが、常に最適な選択とは限りません。',
  oklch:
    'Lightness / Chroma / Hueを補間します。循環するHueには、進む経路の指定も必要です。',
};

function previewCss(color: CanonicalColor): string {
  const displayColor = isInColorGamut(color, 'srgb')
    ? convertColor(color, 'srgb')
    : mapColorToGamut(color, 'srgb');
  return serializeColor(displayColor);
}

interface ResultCardProps {
  readonly start: CanonicalColor;
  readonly end: CanonicalColor;
  readonly amount: number;
  readonly space: InterpolationSpace;
  readonly label: string;
  readonly hueMethod: HueInterpolationMethod;
}

function InterpolationResultCard({
  start,
  end,
  amount,
  space,
  label,
  hueMethod,
}: ResultCardProps) {
  const samples = useMemo(
    () => sampleInterpolation(start, end, space, hueMethod),
    [end, hueMethod, space, start],
  );
  const result = interpolateColors(start, end, amount, { space, hueMethod });
  const statuses = getGamutStatuses(result);
  const mappedForPreview = !isInColorGamut(result, 'srgb');
  const outsideSrgbSamples = samples.filter(
    (sample) => !isInColorGamut(sample, 'srgb'),
  ).length;

  return (
    <article className="interpolation-result-card">
      <div className="interpolation-result-heading">
        <div>
          <p className="eyebrow">Interpolation space</p>
          <h4>{label}</h4>
        </div>
        <span
          className="interpolation-result-swatch"
          style={{ backgroundColor: previewCss(result) }}
          aria-label={`${label} result color preview`}
        />
      </div>
      <div
        className="engine-gradient"
        style={{ backgroundImage: createPreviewGradient(samples) }}
        role="img"
        aria-label={`${label} interpolation sampled by the Color Engine`}
      />
      <p className="interpolation-space-note">{SPACE_NOTES[space]}</p>
      <dl className="interpolation-coordinate-list">
        <div>
          <dt>{label}</dt>
          <dd>{formatInterpolationCoordinates(result, space)}</dd>
        </div>
        <div>
          <dt>raw sRGB</dt>
          <dd>{formatInterpolationCoordinates(result, 'srgb')}</dd>
        </div>
        <div>
          <dt>OkLCh</dt>
          <dd>{formatInterpolationCoordinates(result, 'oklch')}</dd>
        </div>
      </dl>
      <ul className="compact-gamut-status" aria-label={`${label} gamut status`}>
        {statuses.map((status) => (
          <li key={status.gamut} data-in-gamut={status.isInGamut}>
            <span aria-hidden="true" />
            {status.label}: {status.isInGamut ? 'inside' : 'outside'}
          </li>
        ))}
      </ul>
      <p className="mapping-disclosure">
        {mappedForPreview
          ? 'Raw result is outside sRGB. Only this preview is CSS gamut-mapped.'
          : 'Raw result is inside sRGB; no preview mapping was needed.'}
      </p>
      <p className="mapping-disclosure">
        Gradient samples outside sRGB: {String(outsideSrgbSamples)} /{' '}
        {String(samples.length)}
      </p>
    </article>
  );
}

export function ColorInterpolationExperiment() {
  const defaultPreset = INTERPOLATION_PRESETS[0];
  const [presetId, setPresetId] = useState<string>(defaultPreset.id);
  const [amount, setAmount] = useState(0.5);
  const [cssSpace, setCssSpace] = useState<InterpolationSpace>('oklab');
  const [hueMethod, setHueMethod] = useState<HueInterpolationMethod>('shorter');
  const preset =
    INTERPOLATION_PRESETS.find(({ id }) => id === presetId) ?? defaultPreset;
  const generatedCss = serializeColorMix(
    preset.start,
    preset.end,
    amount,
    cssSpace,
    hueMethod,
  );
  const selectedResult = interpolateColors(preset.start, preset.end, amount, {
    space: cssSpace,
    hueMethod,
  });
  const browserSupport =
    typeof CSS === 'undefined' || typeof CSS.supports !== 'function'
      ? null
      : CSS.supports('color', generatedCss);

  return (
    <div className="color-interpolation-experiment">
      <div className="experiment-heading">
        <p className="eyebrow">Same endpoints, different routes</p>
        <h3>4つの色空間で同じ2色をmixする</h3>
        <p>
          sliderはColor Bの割合です。各stripはCSS gradient任せではなく、Color
          Engineで計算した25個の色を並べています。
        </p>
      </div>

      <fieldset className="interpolation-presets">
        <legend>Endpoint preset</legend>
        {INTERPOLATION_PRESETS.map((candidate) => (
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
      <p className="experiment-footnote">{preset.description}</p>

      <div className="interpolation-endpoints">
        {[
          ['Color A', preset.start],
          ['Color B', preset.end],
        ].map(([label, color]) => (
          <article key={label as string}>
            <span
              className="endpoint-swatch"
              style={{ backgroundColor: previewCss(color as CanonicalColor) }}
              aria-hidden="true"
            />
            <div>
              <h4>{label as string}</h4>
              <code>{serializeColor(color as CanonicalColor)}</code>
            </div>
          </article>
        ))}
      </div>

      <ScalarSlider
        id="interpolation-mix-amount"
        label="Mix position"
        value={amount}
        min={0}
        max={1}
        step={0.01}
        startLabel="A"
        endLabel="B"
        output={`${String(Math.round(amount * 100))}% Color B`}
        onChange={setAmount}
      />

      <div className="interpolation-result-grid">
        {INTERPOLATION_SPACES.map((space) => (
          <InterpolationResultCard
            key={space.id}
            start={preset.start}
            end={preset.end}
            amount={amount}
            space={space.id}
            label={space.label}
            hueMethod="shorter"
          />
        ))}
      </div>

      <div className="color-mix-generator">
        <div>
          <p className="eyebrow">CSS connection</p>
          <h3 id="color-mix-title">color-mix() generator</h3>
        </div>
        <div className="color-mix-controls">
          <label htmlFor="color-mix-space">Interpolation space</label>
          <select
            id="color-mix-space"
            value={cssSpace}
            onChange={(event) => {
              setCssSpace(event.currentTarget.value as InterpolationSpace);
            }}
          >
            {INTERPOLATION_SPACES.map((space) => (
              <option key={space.id} value={space.id}>
                {space.label}
              </option>
            ))}
          </select>
          {cssSpace === 'oklch' ? (
            <>
              <label htmlFor="color-mix-hue-method">Hue method</label>
              <select
                id="color-mix-hue-method"
                value={hueMethod}
                onChange={(event) => {
                  setHueMethod(
                    event.currentTarget.value as HueInterpolationMethod,
                  );
                }}
              >
                {HUE_METHODS.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </div>
        <pre aria-label="Generated color-mix CSS">
          <code>{`background: ${generatedCss};`}</code>
        </pre>
        <div className="native-color-mix-preview">
          <div>
            <span
              style={{ backgroundColor: previewCss(selectedResult) }}
              aria-hidden="true"
            />
            <p>Color Engine (mapped for display)</p>
            <code>{serializeColor(selectedResult)}</code>
          </div>
          <div>
            <span
              style={
                browserSupport ? { backgroundColor: generatedCss } : undefined
              }
              aria-hidden="true"
            />
            <p>
              Browser-native:{' '}
              {browserSupport === null
                ? 'support detection unavailable'
                : browserSupport
                  ? 'supported'
                  : 'not supported'}
            </p>
            <code>{generatedCss}</code>
          </div>
        </div>
        <p className="experiment-footnote">
          このpreviewはブラウザ実装の確認用です。上の4比較は常にColor
          Engineの計算を正とします。
        </p>
      </div>
    </div>
  );
}
