import { useId, useState } from 'react';
import { getSrgb8BitChannels } from '../../lib/color/srgb8Bit';
import {
  createNeutralLinearSrgbColor,
  encodeLinearSrgbChannel,
} from '../../lib/color/srgbTransfer';
import { ScalarSlider } from './ScalarSlider';
import { TransferResult } from './TransferResult';

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function LinearSrgbExperiment() {
  const baseId = useId();
  const [linear, setLinear] = useState(0.5);
  const color = createNeutralLinearSrgbColor(linear);
  const encoded = encodeLinearSrgbChannel(linear);
  const byte = getSrgb8BitChannels(color)[0];
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="transfer-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Experiment 2</p>
        <h3 id={`${baseId}-title`}>光量50%は、どのsRGB値でしょうか？</h3>
        <p id={descriptionId}>
          今度はLinear sRGBの光量を起点に、画面へ渡すencoded
          sRGB値へ戻します。この教材内の実験値であり、Current
          Colorは変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="Linear-light gray value"
        value={linear}
        min={0}
        max={1}
        step={0.01}
        startLabel="0"
        endLabel="1"
        output={linear.toFixed(2)}
        descriptionId={descriptionId}
        onChange={setLinear}
      />
      <div aria-live="polite">
        <TransferResult
          title="Encoded for display"
          description={`Linear ${percent(linear)} is displayed near rgb(${String(byte)} ${String(byte)} ${String(byte)}).`}
          color={color}
          values={[
            {
              label: 'Linear light',
              value: `${linear.toFixed(3)} · ${percent(linear)}`,
            },
            {
              label: 'Encoded sRGB',
              value: `${encoded.toFixed(3)} · ${percent(encoded)}`,
            },
            { label: '8-bit sRGB', value: String(byte) },
          ]}
        />
      </div>
    </div>
  );
}
