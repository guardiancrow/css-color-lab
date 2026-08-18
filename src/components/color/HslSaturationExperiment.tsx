import { useId, useState } from 'react';
import { HslLessonColorCard } from './HslLessonColorCard';
import { ScalarSlider } from './ScalarSlider';

export function HslSaturationExperiment() {
  const baseId = useId();
  const [saturation, setSaturation] = useState(100);
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="hsl-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Saturation</p>
        <h3 id={`${baseId}-title`}>grayから色味を加える</h3>
        <p id={descriptionId}>
          Hue = 30°、Lightness =
          50%を固定します。これは教材ローカルの実験で、Current
          Colorは変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="HSL saturation experiment"
        value={saturation}
        min={0}
        max={100}
        step={1}
        startLabel="0% gray"
        endLabel="100% color"
        output={`${String(saturation)}%`}
        descriptionId={descriptionId}
        onChange={setSaturation}
      />
      <div className="hsl-featured-result" aria-live="polite">
        <HslLessonColorCard
          title="Saturation result"
          hue={30}
          saturation={saturation}
          lightness={50}
        />
      </div>
      <p className="experiment-footnote">
        0%ではHueが見た目に影響しないgrayになります。ただしSaturation
        50%が、人にとって「鮮やかさ半分」を意味するわけではありません。
      </p>
    </div>
  );
}
