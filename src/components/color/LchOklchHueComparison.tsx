import { useId, useState } from 'react';
import { normalizeHue } from '../../lib/color/hsl';
import { createLchColor } from '../../lib/color/lab';
import { createOklchColor } from '../../lib/color/oklab';
import { OklabLessonColorCard } from './OklabLessonColorCard';
import { ScalarSlider } from './ScalarSlider';

const huePresets = [0, 60, 120, 180, 240, 300] as const;

export function LchOklchHueComparison() {
  const baseId = useId();
  const [hue, setHue] = useState(270);
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="lab-experiment oklab-hue-comparison"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Key experiment · local state</p>
        <h3 id={`${baseId}-title`}>同じHueをLChとOkLChで回す</h3>
        <p id={descriptionId}>
          LChはL = 65 / C = 55、OkLChはL = 0.7 / C =
          0.16と、それぞれのscaleに合う値を固定します。特に240〜300°のblue /
          purple周辺を観察してください。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="Shared LCh and OkLCh Hue rotation"
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
      <div
        className="preset-buttons"
        aria-label="Representative comparison hues"
      >
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
      <div className="lch-oklch-comparison" aria-live="polite">
        <OklabLessonColorCard
          title="LCh Hue rotation"
          color={createLchColor([65, 55, hue])}
          authoredSpace="LCh"
        />
        <OklabLessonColorCard
          title="OkLCh Hue rotation"
          color={createOklchColor([0.7, 0.16, hue])}
          authoredSpace="OkLCh"
        />
      </div>
      <p className="experiment-footnote">
        どちらも知覚を意識した円柱形式ですが、定義が異なるためHue
        progressionも一致しません。gamut外のカードは元座標を保持し、swatchだけをsRGBへmappingしています。
      </p>
    </div>
  );
}
