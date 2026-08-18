import { useId } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  OKLAB_SLIDER_RANGE,
  getEditableOklabCoordinates,
  updateOklabChannel,
} from '../../lib/color/oklab';
import { OklabAxisControl } from './OklabAxisControl';
import { OklabColorPreview } from './OklabColorPreview';

const axes = [
  {
    name: 'Lightness',
    abbreviation: 'L',
    direction: '0 = dark · 1 = light (CSSでは0%〜100%)',
    index: 0,
    range: OKLAB_SLIDER_RANGE.lightness,
    sliderStep: 0.001,
    numberStep: 0.001,
    numberMin: 0,
    numberMax: 1,
  },
  {
    name: 'a axis',
    abbreviation: 'a',
    direction: 'negative ← green · red → positive',
    index: 1,
    range: OKLAB_SLIDER_RANGE.a,
    sliderStep: 0.001,
    numberStep: 0.001,
  },
  {
    name: 'b axis',
    abbreviation: 'b',
    direction: 'negative ← blue · yellow → positive',
    index: 2,
    range: OKLAB_SLIDER_RANGE.b,
    sliderStep: 0.001,
    numberStep: 0.001,
  },
] as const;

export function OklabControls() {
  const baseId = useId();
  const { currentColor, setCurrentColor } = useCurrentColor();
  const coordinates = getEditableOklabCoordinates(currentColor);
  const titleId = `${baseId}-title`;
  const helpId = `${baseId}-help`;

  return (
    <div className="lab-controls" role="group" aria-labelledby={titleId}>
      <div className="lab-controls-heading">
        <p className="eyebrow">Current Color editor</p>
        <h3 id={titleId}>Oklab Controls</h3>
        <p id={helpId}>
          a/b sliderの−0.4〜0.4はCSS reference rangeです。number
          inputは範囲外も保持します。
        </p>
      </div>
      <div className="lab-channel-list">
        {axes.map((axis) => (
          <OklabAxisControl
            key={axis.abbreviation}
            id={`${baseId}-${axis.abbreviation}`}
            spaceName="Oklab"
            name={axis.name}
            abbreviation={axis.abbreviation}
            direction={axis.direction}
            channelIndex={axis.index}
            value={coordinates[axis.index]}
            sliderMin={axis.range[0]}
            sliderMax={axis.range[1]}
            sliderStep={axis.sliderStep}
            numberStep={axis.numberStep}
            numberMin={'numberMin' in axis ? axis.numberMin : undefined}
            numberMax={'numberMax' in axis ? axis.numberMax : undefined}
            descriptionId={helpId}
            onCommit={(value) => {
              setCurrentColor((previous) =>
                updateOklabChannel(previous, axis.index, value),
              );
            }}
          />
        ))}
      </div>
      <OklabColorPreview color={currentColor} editorSpace="Oklab" />
    </div>
  );
}
