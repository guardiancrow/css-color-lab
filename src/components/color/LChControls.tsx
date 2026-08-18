import { useId } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  LCH_SLIDER_RANGE,
  getEditableLchCoordinates,
  updateLchChannel,
} from '../../lib/color/lab';
import { LabAxisControl } from './LabAxisControl';
import { LabColorPreview } from './LabColorPreview';

const axes = [
  {
    name: 'Lightness',
    abbreviation: 'L',
    direction: 'Labと同じLightness axis',
    index: 0,
    range: LCH_SLIDER_RANGE.lightness,
    numberMin: 0,
    numberMax: 100,
  },
  {
    name: 'Chroma',
    abbreviation: 'C',
    direction: 'a/b原点からの距離 · fixed upper limitではありません',
    index: 1,
    range: LCH_SLIDER_RANGE.chroma,
    numberMin: 0,
  },
  {
    name: 'Hue',
    abbreviation: 'h',
    direction: 'a/b平面上の循環する角度',
    index: 2,
    range: LCH_SLIDER_RANGE.hue,
    unit: '°',
  },
] as const;

export function LChControls() {
  const baseId = useId();
  const { currentColor, setCurrentColor } = useCurrentColor();
  const coordinates = getEditableLchCoordinates(currentColor);
  const titleId = `${baseId}-title`;
  const helpId = `${baseId}-help`;

  return (
    <div className="lab-controls" role="group" aria-labelledby={titleId}>
      <div className="lab-controls-heading">
        <p className="eyebrow">Current Color editor</p>
        <h3 id={titleId}>LCh Controls</h3>
        <p id={helpId}>
          C sliderの0〜150は教材用です。Hueはcommit時に0〜360°へwrapします。
        </p>
      </div>
      <div className="lab-channel-list">
        {axes.map((axis) => (
          <LabAxisControl
            key={axis.abbreviation}
            id={`${baseId}-${axis.abbreviation}`}
            spaceName="LCh"
            name={axis.name}
            abbreviation={axis.abbreviation}
            direction={axis.direction}
            channelIndex={axis.index}
            value={coordinates[axis.index]}
            sliderMin={axis.range[0]}
            sliderMax={axis.range[1]}
            unit={'unit' in axis ? axis.unit : undefined}
            numberMin={'numberMin' in axis ? axis.numberMin : undefined}
            numberMax={'numberMax' in axis ? axis.numberMax : undefined}
            descriptionId={helpId}
            onCommit={(value) => {
              setCurrentColor((previous) =>
                updateLchChannel(previous, axis.index, value),
              );
            }}
          />
        ))}
      </div>
      <LabColorPreview color={currentColor} editorSpace="LCh" />
      <p className="experiment-footnote">
        C =
        0ではHueはpowerlessです。変換でHueがmissingなら0°を表示し、明示編集したHueはcanonical
        LCh coordinateとして保持します。
      </p>
    </div>
  );
}
