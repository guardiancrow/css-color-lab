import { useId } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  getSrgb8BitChannels,
  updateSrgb8BitChannel,
} from '../../lib/color/srgb8Bit';
import type { SrgbChannelIndex } from '../../lib/color/srgb8Bit';
import { RGBChannelControl } from './RGBChannelControl';
import { SrgbColorPreview } from './SrgbColorPreview';

const channelDefinitions = [
  { name: 'Red', abbreviation: 'R', index: 0 },
  { name: 'Green', abbreviation: 'G', index: 1 },
  { name: 'Blue', abbreviation: 'B', index: 2 },
] as const;

export function RGBControls() {
  const baseId = useId();
  const { currentColor, setCurrentColor } = useCurrentColor();
  const channels = getSrgb8BitChannels(currentColor);
  const titleId = `${baseId}-title`;
  const helpId = `${baseId}-help`;

  const updateChannel = (index: SrgbChannelIndex, value: number) => {
    setCurrentColor((previousColor) =>
      updateSrgb8BitChannel(previousColor, index, value),
    );
  };

  return (
    <div className="rgb-controls" role="group" aria-labelledby={titleId}>
      <div className="rgb-controls-heading">
        <div>
          <p className="eyebrow">Interactive</p>
          <h3 id={titleId}>Mix red, green, and blue</h3>
        </div>
        <p id={helpId}>
          0から255の整数で指定します。矢印キーでも調整できます。
        </p>
      </div>
      <div className="rgb-workbench">
        <div className="rgb-channel-list">
          {channelDefinitions.map(({ name, abbreviation, index }) => (
            <RGBChannelControl
              key={abbreviation}
              id={`${baseId}-${abbreviation.toLowerCase()}`}
              name={name}
              abbreviation={abbreviation}
              descriptionId={helpId}
              value={channels[index]}
              onCommit={(value) => {
                updateChannel(index, value);
              }}
            />
          ))}
        </div>
        <SrgbColorPreview color={currentColor} />
      </div>
    </div>
  );
}
