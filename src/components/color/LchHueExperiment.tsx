import { useId, useState } from 'react';
import { normalizeHue } from '../../lib/color/hsl';
import { createLchColor } from '../../lib/color/lab';
import { LabLessonColorCard } from './LabLessonColorCard';
import { ScalarSlider } from './ScalarSlider';

const huePresets = [0, 60, 120, 180, 240, 300] as const;

export function LchHueExperiment() {
  const baseId = useId();
  const [hue, setHue] = useState(60);
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="lab-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Key experiment</p>
        <h3 id={`${baseId}-title`}>L = 65、C = 60でHueを回す</h3>
        <p id={descriptionId}>
          LChはHSLよりlightnessの変化を抑えることを目指した座標ですが、完全に均一ではありません。また色相によってsRGB
          gamut外になります。Current Colorとは分離した実験です。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="LCh Hue at fixed Lightness and Chroma"
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
      <div className="preset-buttons" aria-label="Representative LCh hues">
        {huePresets.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-pressed={hue === preset}
            onClick={() => {
              setHue(preset);
            }}
          >
            {preset}°
          </button>
        ))}
      </div>
      <div className="lab-featured-result" aria-live="polite">
        <LabLessonColorCard
          title="Selected LCh hue"
          color={createLchColor([65, 60, hue])}
        />
      </div>
      <div className="experiment-heading representative-heading">
        <h4>同じL / Cの代表Hue</h4>
        <p>gamut状態はpreviewの色だけでなく、各カードの文字で確認できます。</p>
      </div>
      <div className="lab-hue-grid">
        {huePresets.map((preset) => (
          <LabLessonColorCard
            key={preset}
            title={`Hue ${String(preset)}°`}
            color={createLchColor([65, 60, preset])}
          />
        ))}
      </div>
    </div>
  );
}
