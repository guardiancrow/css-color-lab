import { useMemo, useState } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  getColorCoordinates,
  isPowerlessOklchChroma,
  serializeColor,
} from '../../lib/color/colorEngine';
import type {
  HueInterpolationMethod,
  InterpolationSpace,
} from '../../lib/color/colorEngine';
import { getGamutStatuses } from '../../lib/color/gamut';
import {
  getHuePath,
  HUE_METHODS,
  INTERPOLATION_PRESETS,
} from '../../lib/color/interpolation';
import {
  createColorMixValues,
  createGradientComparisons,
  createSelectedInterpolationResults,
  INITIAL_INTERPOLATION_AMOUNT,
  INITIAL_INTERPOLATION_HUE_METHOD,
  INITIAL_INTERPOLATION_PRESET,
} from '../../lib/color/playgroundInterpolation';
import { formatPlaygroundColor } from '../../lib/color/playgroundColor';
import { getModernColorFeatureStatus } from '../../lib/modernCssSupport';
import type { CanonicalColor } from '../../types/color';
import { InterpolationMixControl } from './InterpolationMixControl';

function formatHue(hue: number | null): string {
  return hue === null ? 'none' : `${String(Number(hue.toFixed(1)))}°`;
}

function previewSummary(color: CanonicalColor) {
  const view = formatPlaygroundColor(color);
  const oklch = view.syntaxes.find(({ id }) => id === 'oklch')?.value;

  return { view, oklch: oklch ?? 'Unavailable' };
}

interface EndpointCardProps {
  readonly role: 'Start' | 'End';
  readonly color: CanonicalColor;
  readonly onUseCurrent: () => void;
}

function EndpointCard({ role, color, onUseCurrent }: EndpointCardProps) {
  const { view, oklch } = previewSummary(color);
  const statuses = getGamutStatuses(color);

  return (
    <article className="playground-endpoint-card" aria-label={`${role} Color`}>
      <div
        className="playground-endpoint-swatch"
        role="img"
        aria-label={`${role} color preview${view.isInSrgbGamut ? '' : ', mapped to sRGB for display'}`}
        style={{ backgroundColor: view.mappedPreviewCss }}
      />
      <div className="playground-endpoint-content">
        <div className="playground-endpoint-heading">
          <h3>{role} Color</h3>
          <button type="button" onClick={onUseCurrent}>
            Use Current Color as {role}
          </button>
        </div>
        <dl>
          <div>
            <dt>CSS</dt>
            <dd data-testid={`interpolation-${role.toLowerCase()}-css`}>
              {serializeColor(color)}
            </dd>
          </div>
          <div>
            <dt>{view.isInSrgbGamut ? 'Hex' : 'Hex (mapped)'}</dt>
            <dd>{view.hex}</dd>
          </div>
          <div>
            <dt>OkLCh</dt>
            <dd>{oklch}</dd>
          </div>
        </dl>
        <ul
          className="compact-gamut-status"
          aria-label={`${role} gamut status`}
        >
          {statuses.map((status) => (
            <li key={status.gamut} data-in-gamut={status.isInGamut}>
              <span aria-hidden="true" />
              {status.label}: {status.isInGamut ? 'inside' : 'outside'}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

type GradientModel = ReturnType<typeof createGradientComparisons>[number];
type SelectedResult = ReturnType<
  typeof createSelectedInterpolationResults
>[number];

interface InterpolationCardProps {
  readonly gradient: GradientModel;
  readonly result: SelectedResult;
  readonly amount: number;
  readonly onApply: () => void;
}

function InterpolationCard({
  gradient,
  result,
  amount,
  onApply,
}: InterpolationCardProps) {
  return (
    <article
      className="playground-interpolation-card"
      aria-label={`${result.label} interpolation result`}
    >
      <div className="interpolation-result-heading">
        <div>
          <p className="eyebrow">Interpolation space</p>
          <h3>{result.label}</h3>
        </div>
        <div
          className="interpolation-result-swatch"
          role="img"
          aria-label={`${result.label} selected result preview${result.previewIsMapped ? ', mapped to sRGB for display' : ''}`}
          style={{ backgroundColor: result.previewCss }}
        />
      </div>
      <div
        className="playground-engine-gradient"
        style={{ backgroundImage: gradient.gradientCss }}
        role="img"
        aria-label={`${result.label} gradient sampled at 25 positions by the Color Engine; selected position ${String(Math.round(amount * 100))}%`}
      >
        <span aria-hidden="true" style={{ left: `${String(amount * 100)}%` }} />
      </div>
      <p className="playground-sample-summary">
        sRGB外sample: {String(gradient.outsideSrgbSamples)} /{' '}
        {String(gradient.samples.length)}
      </p>
      <dl className="interpolation-coordinate-list">
        <div>
          <dt>Raw CSS</dt>
          <dd data-testid={`interpolation-result-${result.space}`}>
            {serializeColor(result.color)}
          </dd>
        </div>
        <div>
          <dt>Raw coordinates</dt>
          <dd>
            {result.color.coordinates
              .map((value) =>
                value === null ? 'none' : String(Number(value.toFixed(5))),
              )
              .join('  ')}
          </dd>
        </div>
        <div>
          <dt>Alpha</dt>
          <dd>{String(Number(result.color.alpha.toFixed(4)))}</dd>
        </div>
      </dl>
      <ul
        className="compact-gamut-status"
        aria-label={`${result.label} selected result gamut status`}
      >
        {result.statuses.map((status) => (
          <li key={status.gamut} data-in-gamut={status.isInGamut}>
            <span aria-hidden="true" />
            {status.label}: {status.isInGamut ? 'inside' : 'outside'}
          </li>
        ))}
      </ul>
      <p className="mapping-disclosure">
        {result.previewIsMapped
          ? 'Raw result is retained outside sRGB. Displayed preview only is mapped to sRGB.'
          : 'Raw result is inside sRGB; preview mapping was not needed.'}
      </p>
      <button className="secondary-button" type="button" onClick={onApply}>
        Use {result.label} result as Current Color
      </button>
    </article>
  );
}

export function PlaygroundInterpolationExplorer() {
  const { currentColor, setCurrentColor } = useCurrentColor();
  const [startColor, setStartColor] = useState<CanonicalColor>(
    INITIAL_INTERPOLATION_PRESET.start,
  );
  const [endColor, setEndColor] = useState<CanonicalColor>(
    INITIAL_INTERPOLATION_PRESET.end,
  );
  const [amount, setAmount] = useState(INITIAL_INTERPOLATION_AMOUNT);
  const [hueMethod, setHueMethod] = useState<HueInterpolationMethod>(
    INITIAL_INTERPOLATION_HUE_METHOD,
  );
  const [nativeSpace, setNativeSpace] = useState<InterpolationSpace>('oklch');

  const gradients = useMemo(
    () => createGradientComparisons(startColor, endColor, hueMethod),
    [endColor, hueMethod, startColor],
  );
  const results = useMemo(
    () =>
      createSelectedInterpolationResults(
        startColor,
        endColor,
        amount,
        hueMethod,
      ),
    [amount, endColor, hueMethod, startColor],
  );
  const colorMixValues = useMemo(
    () => createColorMixValues(startColor, endColor, amount, hueMethod),
    [amount, endColor, hueMethod, startColor],
  );
  const startOklch = getColorCoordinates(startColor, 'oklch');
  const endOklch = getColorCoordinates(endColor, 'oklch');
  const startHue = isPowerlessOklchChroma(startOklch[1]) ? null : startOklch[2];
  const endHue = isPowerlessOklchChroma(endOklch[1]) ? null : endOklch[2];
  const huePath = getHuePath(startHue, endHue, hueMethod);
  const nativeCss =
    colorMixValues.find(({ space }) => space === nativeSpace)?.value ?? '';
  const nativeResult = results.find(({ space }) => space === nativeSpace);
  const support = getModernColorFeatureStatus('color-mix');

  const resetInterpolation = () => {
    setStartColor(INITIAL_INTERPOLATION_PRESET.start);
    setEndColor(INITIAL_INTERPOLATION_PRESET.end);
    setAmount(INITIAL_INTERPOLATION_AMOUNT);
    setHueMethod(INITIAL_INTERPOLATION_HUE_METHOD);
    setNativeSpace('oklch');
  };

  return (
    <section
      id="interpolation"
      className="playground-interpolation-explorer"
      aria-labelledby="playground-interpolation-title"
    >
      <div className="playground-section-heading">
        <div>
          <p className="eyebrow">Compare four routes</p>
          <h2 id="playground-interpolation-title">
            Interpolation / Gradient Explorer
          </h2>
        </div>
        <p>
          Start / EndはCurrent Colorから独立したlocal
          stateです。明示操作したときだけ相互に色を渡します。
        </p>
      </div>

      <div className="playground-interpolation-actions">
        <fieldset className="interpolation-presets">
          <legend>Endpoint presets</legend>
          {INTERPOLATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={
                startColor === preset.start && endColor === preset.end
              }
              onClick={() => {
                setStartColor(preset.start);
                setEndColor(preset.end);
              }}
            >
              {preset.label}
            </button>
          ))}
        </fieldset>
        <div className="playground-interpolation-action-buttons">
          <button
            type="button"
            onClick={() => {
              const previousStart = startColor;
              setStartColor(endColor);
              setEndColor(previousStart);
            }}
          >
            Swap Start / End
          </button>
          <button type="button" onClick={resetInterpolation}>
            Reset interpolation
          </button>
        </div>
      </div>

      <div className="playground-endpoint-grid">
        <EndpointCard
          role="Start"
          color={startColor}
          onUseCurrent={() => {
            setStartColor(currentColor);
          }}
        />
        <EndpointCard
          role="End"
          color={endColor}
          onUseCurrent={() => {
            setEndColor(currentColor);
          }}
        />
      </div>

      <div className="playground-interpolation-settings">
        <InterpolationMixControl amount={amount} onChange={setAmount} />
        <div className="playground-hue-setting">
          <label htmlFor="playground-hue-method">
            OkLCh Hue interpolation method
          </label>
          <select
            id="playground-hue-method"
            value={hueMethod}
            onChange={(event) => {
              setHueMethod(event.currentTarget.value as HueInterpolationMethod);
            }}
          >
            {HUE_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label} — {method.description}
              </option>
            ))}
          </select>
          <p aria-live="polite">
            Start h: {formatHue(startHue)} · End h: {formatHue(endHue)} ·{' '}
            Method: {hueMethod} · Path: {formatHue(huePath[0])} →{' '}
            {formatHue(huePath[1])} → {formatHue(huePath[2])}
          </p>
          <small>Hue methodはOkLCh補間だけに適用されます。</small>
        </div>
      </div>

      <div className="playground-interpolation-grid">
        {results.map((result, index) => {
          const gradient = gradients[index];
          if (!gradient) return null;
          return (
            <InterpolationCard
              key={result.space}
              gradient={gradient}
              result={result}
              amount={amount}
              onApply={() => {
                setCurrentColor(result.color);
              }}
            />
          );
        })}
      </div>

      <section
        className="playground-color-mix"
        aria-labelledby="playground-color-mix-title"
      >
        <div>
          <p className="eyebrow">CSS connection</p>
          <h3 id="playground-color-mix-title">Generated color-mix()</h3>
          <p>
            Startは{String(Number(((1 - amount) * 100).toFixed(2)))}%、Endは
            {String(Number((amount * 100).toFixed(2)))}%です。
          </p>
        </div>
        <div className="playground-generated-css">
          {colorMixValues.map(({ space, label, value }) => (
            <div key={space}>
              <h4>{label}</h4>
              <pre aria-label={`Generated ${label} color-mix CSS`}>
                <code data-testid={`color-mix-${space}`}>{value}</code>
              </pre>
            </div>
          ))}
        </div>

        <div className="playground-native-mix">
          <label htmlFor="playground-native-space">
            Native comparison space
          </label>
          <select
            id="playground-native-space"
            value={nativeSpace}
            onChange={(event) => {
              setNativeSpace(event.currentTarget.value as InterpolationSpace);
            }}
          >
            {colorMixValues.map(({ space, label }) => (
              <option key={space} value={space}>
                {label}
              </option>
            ))}
          </select>
          <div className="native-color-mix-preview">
            <div>
              <span
                style={{ backgroundColor: nativeResult?.previewCss }}
                aria-hidden="true"
              />
              <p>Color Engine result (mapped only for display)</p>
            </div>
            <div>
              <span
                style={
                  support === 'supported'
                    ? { backgroundColor: nativeCss }
                    : undefined
                }
                aria-hidden="true"
              />
              <p>
                Browser-native:{' '}
                {support === 'supported'
                  ? 'Supported'
                  : support === 'unsupported'
                    ? 'Unsupported'
                    : 'Detection unavailable'}
              </p>
            </div>
          </div>
          <p>
            Native renderingは独立した実装確認です。computed
            styleをEngineの期待値には使用しません。
          </p>
        </div>
      </section>
    </section>
  );
}
