import { useId } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  LAB_SLIDER_RANGE,
  getEditableLabCoordinates,
  updateLabChannel,
} from '../../lib/color/lab';
import { LabAxisControl } from './LabAxisControl';
import { LabColorPreview } from './LabColorPreview';

const axes = [
  {
    name: 'Lightness',
    abbreviation: 'L',
    direction: '0 = dark · 100 = light',
    index: 0,
    range: LAB_SLIDER_RANGE.lightness,
    numberMin: 0,
    numberMax: 100,
  },
  {
    name: 'a axis',
    abbreviation: 'a',
    direction: 'negative ← green · red → positive',
    index: 1,
    range: LAB_SLIDER_RANGE.a,
  },
  {
    name: 'b axis',
    abbreviation: 'b',
    direction: 'negative ← blue · yellow → positive',
    index: 2,
    range: LAB_SLIDER_RANGE.b,
  },
] as const;

export function LabControls() {
  const baseId = useId();
  const { currentColor, setCurrentColor } = useCurrentColor();
  const coordinates = getEditableLabCoordinates(currentColor);
  const titleId = `${baseId}-title`;
  const helpId = `${baseId}-help`;

  return (
    <div className="lab-controls" role="group" aria-labelledby={titleId}>
      <div className="lab-controls-heading">
        <p className="eyebrow">Current Color editor</p>
        <h3 id={titleId}>Lab Controls</h3>
        <p id={helpId}>
          a/b sliderは教材用の−125〜125です。number inputは範囲外も保持します。
        </p>
      </div>
      <div className="lab-channel-list">
        {axes.map((axis) => (
          <LabAxisControl
            key={axis.abbreviation}
            id={`${baseId}-${axis.abbreviation}`}
            spaceName="Lab"
            name={axis.name}
            abbreviation={axis.abbreviation}
            direction={axis.direction}
            channelIndex={axis.index}
            value={coordinates[axis.index]}
            sliderMin={axis.range[0]}
            sliderMax={axis.range[1]}
            numberMin={'numberMin' in axis ? axis.numberMin : undefined}
            numberMax={'numberMax' in axis ? axis.numberMax : undefined}
            descriptionId={helpId}
            onCommit={(value) => {
              setCurrentColor((previous) =>
                updateLabChannel(previous, axis.index, value),
              );
            }}
          />
        ))}
      </div>
      <LabColorPreview color={currentColor} editorSpace="Lab" />
    </div>
  );
}
