import { useId, useState } from 'react';
import {
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from '../../lib/color/colorEngine';
import {
  GAMUTS,
  GAMUT_PRESETS,
  findMaxChromaForGamut,
} from '../../lib/color/gamut';
import { normalizeHue } from '../../lib/color/hsl';
import { createOklchColor } from '../../lib/color/oklab';
import { GamutStatusList } from './GamutStatusList';
import { ScalarSlider } from './ScalarSlider';

function formatBoundary(value: number): string {
  return value.toFixed(4);
}

export function OklchGamutExperiment() {
  const baseId = useId();
  const [lightness, setLightness] = useState(0.7);
  const [chroma, setChroma] = useState(0.22);
  const [hue, setHue] = useState(20);
  const color = createOklchColor([lightness, chroma, hue]);
  const mapped = mapColorToGamut(color, 'srgb', 'css');
  const boundaries = GAMUTS.map((gamut) => ({
    ...gamut,
    chroma: findMaxChromaForGamut({
      lightness,
      hue,
      gamut: gamut.id,
    }),
  }));
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="gamut-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Key experiment · local state</p>
        <h3 id={`${baseId}-title`}>OkLChから3つのgamut boundaryを越える</h3>
        <p id={descriptionId}>
          初期値L = 0.70 / h = 20°ではChromaを上げると、sRGB、Display
          P3、Rec.2020の順に境界を越えます。HueやLightnessを変えると境界値も動きます。
        </p>
      </div>
      <div className="gamut-slider-list">
        <ScalarSlider
          id={`${baseId}-chroma`}
          label="OkLCh Chroma gamut experiment"
          value={chroma}
          min={0}
          max={0.5}
          step={0.001}
          startLabel="C 0"
          endLabel="C 0.5"
          output={chroma.toFixed(3)}
          descriptionId={descriptionId}
          onChange={setChroma}
        />
        <ScalarSlider
          id={`${baseId}-hue`}
          label="OkLCh Hue gamut experiment"
          value={hue}
          min={0}
          max={360}
          step={1}
          startLabel="0°"
          endLabel="360°"
          output={`${String(hue)}°`}
          descriptionId={descriptionId}
          onChange={(value) => {
            setHue(normalizeHue(value));
          }}
        />
        <ScalarSlider
          id={`${baseId}-lightness`}
          label="OkLCh Lightness gamut experiment"
          value={lightness}
          min={0.2}
          max={0.9}
          step={0.01}
          startLabel="L 0.2"
          endLabel="L 0.9"
          output={lightness.toFixed(2)}
          descriptionId={descriptionId}
          onChange={setLightness}
        />
      </div>

      <div
        className="gamut-boundary-values"
        aria-label="Maximum Chroma at current Lightness and Hue"
      >
        <p>
          At L = {lightness.toFixed(2)}, h = {String(hue)}°
        </p>
        <dl>
          {boundaries.map((boundary) => (
            <div key={boundary.id}>
              <dt>{boundary.label} max C</dt>
              <dd>≈ {formatBoundary(boundary.chroma)}</dd>
            </div>
          ))}
        </dl>
        <small>
          binary search tolerance: 0.00001 · returned value is in gamut
        </small>
      </div>

      <div
        className="gamut-preset-buttons"
        aria-label="Representative gamut presets"
      >
        {GAMUT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={
              lightness === preset.coordinates[0] &&
              chroma === preset.coordinates[1] &&
              hue === preset.coordinates[2]
            }
            onClick={() => {
              setLightness(preset.coordinates[0]);
              setChroma(preset.coordinates[1]);
              setHue(preset.coordinates[2]);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <GamutStatusList color={color} label="Experiment color gamut status" />

      <div className="wide-preview-comparison">
        <article>
          <div
            className="wide-preview-swatch"
            role="img"
            aria-label="Original OkLCh CSS preview; appearance depends on browser and display gamut"
            style={{ backgroundColor: serializeColor(color) }}
          />
          <h4>Original CSS preview</h4>
          <p>{serializeColor(color)}</p>
          <p>
            Browserが構文を解釈しても、displayがこのgamutを再現できるとは限りません。
          </p>
        </article>
        <article>
          <div
            className="wide-preview-swatch"
            role="img"
            aria-label="Explicitly mapped sRGB preview"
            style={{ backgroundColor: serializeColor(mapped) }}
          />
          <h4>sRGB mapped preview</h4>
          <p>{serializeColor(mapped)}</p>
          <p>既存editorのout-of-gamut previewと同じ明示的CSS mappingです。</p>
        </article>
      </div>

      <dl className="wide-css-values">
        <div>
          <dt>Display P3 coordinates</dt>
          <dd>{serializeColor(color, { space: 'display-p3' })}</dd>
        </div>
        <div>
          <dt>Rec.2020 coordinates</dt>
          <dd>{serializeColor(color, { space: 'rec2020' })}</dd>
        </div>
        <div>
          <dt>Original in sRGB?</dt>
          <dd>{isInColorGamut(color, 'srgb') ? 'Yes' : 'No'}</dd>
        </div>
      </dl>
    </div>
  );
}
