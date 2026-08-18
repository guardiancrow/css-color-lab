import { useId, useState } from 'react';
import { normalizeHue } from '../../lib/color/hsl';
import { HslLessonColorCard } from './HslLessonColorCard';
import { ScalarSlider } from './ScalarSlider';

const huePresets = [
  { name: 'Red', hue: 0 },
  { name: 'Yellow', hue: 60 },
  { name: 'Green (pure RGB)', hue: 120 },
  { name: 'Cyan', hue: 180 },
  { name: 'Blue', hue: 240 },
  { name: 'Magenta', hue: 300 },
] as const;

function getHueName(hue: number): string {
  return huePresets.find((preset) => preset.hue === hue)?.name ?? 'Custom hue';
}

export function HslLightnessExperiment() {
  const baseId = useId();
  const [hue, setHue] = useState(60);
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="hsl-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Key experiment</p>
        <h3 id={`${baseId}-title`}>Lightnessを50%に固定してHueを回す</h3>
        <p id={descriptionId}>
          SaturationとLightnessは同じままです。色相ごとの見た目とrelative
          luminance Yを比べてください。この実験はCurrent Colorを変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="Hue at fixed HSL lightness"
        value={hue}
        min={0}
        max={360}
        step={1}
        startLabel="0° red"
        endLabel="360° red"
        output={`${String(hue)}°`}
        descriptionId={descriptionId}
        onChange={(value) => {
          setHue(normalizeHue(value));
        }}
      />
      <div className="hue-strip wide-hue-strip" aria-hidden="true" />
      <div className="preset-buttons" aria-label="Representative HSL hues">
        {huePresets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            aria-pressed={hue === preset.hue}
            onClick={() => {
              setHue(preset.hue);
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>
      <div className="hsl-featured-result" aria-live="polite">
        <HslLessonColorCard
          title={`Selected: ${getHueName(hue)}`}
          hue={hue}
          saturation={100}
          lightness={50}
        />
      </div>
      <div className="experiment-heading representative-heading">
        <h4>同じL = 50%の代表色</h4>
        <p>すべて同じHSL Lightnessですが、Yは大きく異なります。</p>
      </div>
      <div className="hsl-representative-grid">
        {huePresets.map((preset) => (
          <HslLessonColorCard
            key={preset.name}
            title={preset.name}
            hue={preset.hue}
            saturation={100}
            lightness={50}
          />
        ))}
      </div>
      <p className="lesson-note">
        Yellowは高いY、Blueは低いYになります。relative
        luminanceも知覚的lightnessそのものではありませんが、HSL
        Lightnessが光量や見た目の明るさを一定にしないことを確認できます。
      </p>
    </div>
  );
}
