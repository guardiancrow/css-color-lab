import { useId } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  OKLCH_SLIDER_RANGE,
  getEditableOklchCoordinates,
  updateOklchChannel,
} from '../../lib/color/oklab';
import { OklabAxisControl } from './OklabAxisControl';
import { OklabColorPreview } from './OklabColorPreview';

const axes = [
  {
    name: 'Lightness',
    abbreviation: 'L',
    direction: 'Oklabと同じLightness · 0〜1',
    index: 0,
    range: OKLCH_SLIDER_RANGE.lightness,
    sliderStep: 0.001,
    numberStep: 0.001,
    numberMin: 0,
    numberMax: 1,
  },
  {
    name: 'Chroma',
    abbreviation: 'C',
    direction: 'Oklab a/b原点からの距離 · fixed upper limitではありません',
    index: 1,
    range: OKLCH_SLIDER_RANGE.chroma,
    sliderStep: 0.001,
    numberStep: 0.001,
    numberMin: 0,
  },
  {
    name: 'Hue',
    abbreviation: 'h',
    direction: 'Oklab a/b平面上の循環する角度',
    index: 2,
    range: OKLCH_SLIDER_RANGE.hue,
    sliderStep: 1,
    numberStep: 0.1,
    unit: '°',
  },
] as const;

export function OkLChControls() {
  const baseId = useId();
  const { currentColor, setCurrentColor } = useCurrentColor();
  const coordinates = getEditableOklchCoordinates(currentColor);
  const titleId = `${baseId}-title`;
  const helpId = `${baseId}-help`;

  return (
    <div className="lab-controls" role="group" aria-labelledby={titleId}>
      <div className="lab-controls-heading">
        <p className="eyebrow">Current Color editor</p>
        <h3 id={titleId}>OkLCh Controls</h3>
        <p id={helpId}>
          C sliderの0〜0.4はCSS reference
          rangeです。Hueはcommit時に0〜360°へwrapします。
        </p>
      </div>
      <div className="lab-channel-list">
        {axes.map((axis) => (
          <OklabAxisControl
            key={axis.abbreviation}
            id={`${baseId}-${axis.abbreviation}`}
            spaceName="OkLCh"
            name={axis.name}
            abbreviation={axis.abbreviation}
            direction={axis.direction}
            channelIndex={axis.index}
            value={coordinates[axis.index]}
            sliderMin={axis.range[0]}
            sliderMax={axis.range[1]}
            sliderStep={axis.sliderStep}
            numberStep={axis.numberStep}
            unit={'unit' in axis ? axis.unit : undefined}
            numberMin={'numberMin' in axis ? axis.numberMin : undefined}
            numberMax={'numberMax' in axis ? axis.numberMax : undefined}
            descriptionId={helpId}
            onCommit={(value) => {
              setCurrentColor((previous) =>
                updateOklchChannel(previous, axis.index, value),
              );
            }}
          />
        ))}
      </div>
      <OklabColorPreview color={currentColor} editorSpace="OkLCh" />
      <p className="experiment-footnote">
        C =
        0ではHueはpowerlessです。変換でHueがmissingなら0°を表示し、明示編集したHueはcanonical
        OkLCh coordinateとして保持します。
      </p>
    </div>
  );
}
