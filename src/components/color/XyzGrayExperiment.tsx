import { useId, useState } from 'react';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import { createNeutralSrgbColor } from '../../lib/color/srgbTransfer';
import { getSrgbToXyzPipeline } from '../../lib/color/xyzLesson';
import { ScalarSlider } from './ScalarSlider';

export function XyzGrayExperiment() {
  const baseId = useId();
  const [byteValue, setByteValue] = useState(128);
  const pipeline = getSrgbToXyzPipeline(
    createNeutralSrgbColor(byteValue / 255),
  );
  const linear = pipeline.linearSrgb[0];
  const y = pipeline.xyzD65[1];

  return (
    <div
      className="xyz-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Relative luminance</p>
        <h3 id={`${baseId}-title`}>neutral grayの光量とY</h3>
        <p id={`${baseId}-description`}>
          sRGB grayをdecodeし、XYZ
          D65のYまで追います。この教材内の実験値であり、Current
          Colorは変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="sRGB gray for Y comparison"
        value={byteValue}
        min={0}
        max={255}
        step={1}
        startLabel="0"
        endLabel="255"
        output={String(byteValue)}
        descriptionId={`${baseId}-description`}
        onChange={setByteValue}
      />
      <dl className="xyz-y-values" aria-live="polite">
        <div>
          <dt>sRGB gray</dt>
          <dd>{byteValue}</dd>
        </div>
        <div>
          <dt>Linear R = G = B</dt>
          <dd aria-label="Neutral gray linear value">
            {formatColorCoordinates([linear], 4)}
          </dd>
        </div>
        <div>
          <dt>XYZ D65 Y</dt>
          <dd aria-label="Neutral gray XYZ Y value">
            {formatColorCoordinates([y], 4)}
          </dd>
        </div>
      </dl>
      <p className="experiment-footnote">
        neutral grayではLinear
        R・G・Bが等しいためYと一致します。一般の色で各RGB成分とYが一致するわけではありません。
      </p>
    </div>
  );
}
