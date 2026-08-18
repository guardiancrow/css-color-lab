import { useId, useState } from 'react';
import { serializeColor } from '../../lib/color/colorEngine';
import { formatSrgb8BitCss } from '../../lib/color/srgb8Bit';
import {
  createNeutralSrgbColor,
  decodeSrgbChannel,
} from '../../lib/color/srgbTransfer';
import { ScalarSlider } from './ScalarSlider';

function formatDecimal(value: number, digits = 3): string {
  return value.toFixed(digits);
}

function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function SrgbDecodeExperiment() {
  const baseId = useId();
  const [byteValue, setByteValue] = useState(128);
  const encoded = byteValue / 255;
  const linear = decodeSrgbChannel(encoded);
  const color = createNeutralSrgbColor(encoded);
  const previewCss = serializeColor(color, { space: 'srgb' });
  const descriptionId = `${baseId}-description`;

  return (
    <div
      className="transfer-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Experiment 1</p>
        <h3 id={`${baseId}-title`}>128は、光量50%でしょうか？</h3>
        <p id={descriptionId}>
          R・G・Bを同じ値にしたneutral
          grayで確認します。この教材内の実験値であり、Current
          Colorは変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="sRGB encoded gray value"
        value={byteValue}
        min={0}
        max={255}
        step={1}
        startLabel="0"
        endLabel="255"
        output={String(byteValue)}
        descriptionId={descriptionId}
        onChange={setByteValue}
      />
      <div className="decode-result" aria-live="polite">
        <div
          className="decode-preview"
          role="img"
          aria-label={`Neutral gray preview: ${formatSrgb8BitCss([byteValue, byteValue, byteValue])}`}
          style={{ backgroundColor: previewCss }}
        />
        <dl className="transfer-values">
          <div>
            <dt>8-bit sRGB</dt>
            <dd>{byteValue}</dd>
          </div>
          <div>
            <dt>Normalized encoded</dt>
            <dd aria-label="Normalized encoded value">
              {formatDecimal(encoded)} · {formatPercent(encoded)}
            </dd>
          </div>
          <div className="key-result">
            <dt>Linear light</dt>
            <dd aria-label="Decoded linear-light value">
              {formatDecimal(linear)} · {formatPercent(linear)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
