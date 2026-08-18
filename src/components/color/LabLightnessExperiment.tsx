import { useId, useState } from 'react';
import { createLabColor } from '../../lib/color/lab';
import { LabLessonColorCard } from './LabLessonColorCard';
import { ScalarSlider } from './ScalarSlider';

export function LabLightnessExperiment() {
  const baseId = useId();
  const [lightness, setLightness] = useState(60);
  const descriptionId = `${baseId}-description`;
  const color = createLabColor([lightness, 45, 35]);

  return (
    <div
      className="lab-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Lab Lightness</p>
        <h3 id={`${baseId}-title`}>a / bを保ってLだけを動かす</h3>
        <p id={descriptionId}>
          a = 45、b =
          35を固定します。色味をおおむね保ちながらL軸を移動する教材ローカル実験で、Current
          Colorは変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="Lab Lightness experiment"
        value={lightness}
        min={0}
        max={100}
        step={1}
        startLabel="0 dark"
        endLabel="100 light"
        output={String(lightness)}
        descriptionId={descriptionId}
        onChange={setLightness}
      />
      <div className="lab-featured-result" aria-live="polite">
        <LabLessonColorCard title="Lab L result" color={color} />
      </div>
      <p className="experiment-footnote">
        Lab
        Lは知覚的lightnessを近似するための軸ですが、Lだけを変えれば見た目のHueが完全に不変という意味ではありません。
      </p>
    </div>
  );
}
