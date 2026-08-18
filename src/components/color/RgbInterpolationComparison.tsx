import { useId, useState } from 'react';
import { createColor, interpolateRgbColors } from '../../lib/color/colorEngine';
import { getSrgb8BitChannels } from '../../lib/color/srgb8Bit';
import { ScalarSlider } from './ScalarSlider';
import { TransferResult } from './TransferResult';

const black = createColor('srgb', [0, 0, 0]);
const white = createColor('srgb', [1, 1, 1]);

function grayDescription(byte: number): string {
  return `Rendered as rgb(${String(byte)} ${String(byte)} ${String(byte)}).`;
}

export function GrayMidpointComparison() {
  const encodedMidpoint = interpolateRgbColors(black, white, 0.5, 'srgb');
  const linearMidpoint = interpolateRgbColors(black, white, 0.5, 'srgb-linear');
  const encodedByte = getSrgb8BitChannels(encodedMidpoint)[0];
  const linearByte = getSrgb8BitChannels(linearMidpoint)[0];

  return (
    <div
      className="comparison-grid"
      aria-label="Black and white midpoint comparison"
    >
      <TransferResult
        title="Numeric midpoint"
        description={grayDescription(encodedByte)}
        color={encodedMidpoint}
        values={[
          { label: 'Space', value: 'sRGB encoded' },
          { label: 'Coordinate', value: '0.500' },
          { label: '8-bit', value: String(encodedByte) },
        ]}
      />
      <TransferResult
        title="Linear-light midpoint"
        description={grayDescription(linearByte)}
        color={linearMidpoint}
        values={[
          { label: 'Space', value: 'Linear sRGB' },
          { label: 'Light amount', value: '0.500' },
          { label: '8-bit display', value: String(linearByte) },
        ]}
      />
    </div>
  );
}

export function RgbInterpolationComparison() {
  const baseId = useId();
  const [percentage, setPercentage] = useState(50);
  const amount = percentage / 100;
  const encodedMix = interpolateRgbColors(black, white, amount, 'srgb');
  const linearMix = interpolateRgbColors(black, white, amount, 'srgb-linear');
  const encodedByte = getSrgb8BitChannels(encodedMix)[0];
  const linearByte = getSrgb8BitChannels(linearMix)[0];
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="interpolation-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Interpolation</p>
        <h3 id={`${baseId}-title`}>同じ割合で、blackとwhiteを混ぜる</h3>
        <p id={descriptionId}>
          mix
          amountは同じです。違うのは、どの色空間で座標を補間するかだけです。この比較もCurrent
          Colorは変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="White mix amount"
        value={percentage}
        min={0}
        max={100}
        step={1}
        startLabel="Black 0%"
        endLabel="White 100%"
        output={`${String(percentage)}%`}
        descriptionId={descriptionId}
        onChange={setPercentage}
      />
      <div className="comparison-grid" aria-live="polite">
        <TransferResult
          title="sRGB encoded interpolation"
          description={grayDescription(encodedByte)}
          color={encodedMix}
          values={[
            { label: 'Mix amount', value: `${String(percentage)}%` },
            { label: 'Encoded coordinate', value: amount.toFixed(3) },
            { label: '8-bit result', value: String(encodedByte) },
          ]}
        />
        <TransferResult
          title="Linear sRGB interpolation"
          description={grayDescription(linearByte)}
          color={linearMix}
          values={[
            { label: 'Mix amount', value: `${String(percentage)}%` },
            { label: 'Linear coordinate', value: amount.toFixed(3) },
            { label: '8-bit display', value: String(linearByte) },
          ]}
        />
      </div>
    </div>
  );
}
