import { useId, useState } from 'react';
import {
  createColor,
  getColorCoordinates,
  serializeColor,
} from '../../lib/color/colorEngine';
import type { ColorSpaceId } from '../../types/color';
import { CoordinateCard } from './CoordinateCard';
import { ScalarSlider } from './ScalarSlider';

const rgbLabels = ['R', 'G', 'B'] as const;
const xyzLabels = ['X', 'Y', 'Z'] as const;

interface SpaceResultProps {
  readonly title: string;
  readonly space: Extract<ColorSpaceId, 'srgb' | 'display-p3'>;
  readonly green: number;
}

function SpaceResult({ title, space, green }: SpaceResultProps) {
  const color = createColor(space, [1, green, 0]);
  const xyz = getColorCoordinates(color, 'xyz-d65');

  return (
    <div className="rgb-space-result">
      <CoordinateCard
        title={title}
        subtitle="Same numeric coordinates"
        labels={rgbLabels}
        coordinates={color.coordinates}
        previewCss={serializeColor(color)}
        previewLabel={`${title} preview for coordinates 1, ${String(green)}, 0`}
      />
      <CoordinateCard
        title={`${title} → XYZ D65`}
        subtitle="No clipping or gamut mapping"
        labels={xyzLabels}
        coordinates={xyz}
      />
    </div>
  );
}

export function RgbSpaceComparison() {
  const baseId = useId();
  const [greenPercent, setGreenPercent] = useState(50);
  const green = greenPercent / 100;

  return (
    <div
      className="xyz-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Same coordinates, different spaces</p>
        <h3 id={`${baseId}-title`}>RGB値だけで、色は決まるでしょうか？</h3>
        <p id={`${baseId}-description`}>
          R = 1、B = 0を固定し、同じGをsRGBとDisplay
          P3で解釈します。この比較はCurrent Colorを変更しません。
        </p>
      </div>
      <ScalarSlider
        id={`${baseId}-slider`}
        label="Shared green coordinate"
        value={greenPercent}
        min={0}
        max={100}
        step={1}
        startLabel="0"
        endLabel="1"
        output={green.toFixed(2)}
        descriptionId={`${baseId}-description`}
        onChange={setGreenPercent}
      />
      <div className="rgb-space-comparison" aria-live="polite">
        <SpaceResult title="sRGB" space="srgb" green={green} />
        <SpaceResult title="Display P3" space="display-p3" green={green} />
      </div>
      <p className="experiment-footnote">
        XYZ値が異なるため、同じRGB
        coordinatesでも同じ色ではありません。previewの実際の差は、ディスプレイの色域やブラウザ環境によって異なります。
      </p>
    </div>
  );
}
