import { useId } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { serializeColor } from '../../lib/color/colorEngine';
import {
  getEditableHslCoordinates,
  updateHslChannel,
} from '../../lib/color/hsl';
import {
  formatSrgb8BitCss,
  formatSrgb8BitHex,
  getSrgb8BitChannels,
} from '../../lib/color/srgb8Bit';
import { HSLChannelControl } from './HSLChannelControl';

const channels = [
  { name: 'Hue', abbreviation: 'H', index: 0, unit: '°', max: 360 },
  { name: 'Saturation', abbreviation: 'S', index: 1, unit: '%', max: 100 },
  { name: 'Lightness', abbreviation: 'L', index: 2, unit: '%', max: 100 },
] as const;

export function HSLControls() {
  const baseId = useId();
  const { currentColor, setCurrentColor } = useCurrentColor();
  const coordinates = getEditableHslCoordinates(currentColor);
  const srgb = getSrgb8BitChannels(currentColor);
  const titleId = `${baseId}-title`;
  const helpId = `${baseId}-help`;

  return (
    <div className="hsl-controls" role="group" aria-labelledby={titleId}>
      <div className="hsl-controls-heading">
        <div>
          <p className="eyebrow">Current Color editor</p>
          <h3 id={titleId}>Edit with Hue, Saturation, and Lightness</h3>
        </div>
        <p id={helpId}>
          Hueは循環し、SaturationとLightnessは0〜100%に収めます。矢印キーでも調整できます。
        </p>
      </div>
      <div className="hsl-workbench">
        <div className="hsl-channel-list">
          {channels.map(({ name, abbreviation, index, unit, max }) => (
            <HSLChannelControl
              key={abbreviation}
              id={`${baseId}-${abbreviation.toLowerCase()}`}
              name={name}
              abbreviation={abbreviation}
              channelIndex={index}
              value={coordinates[index]}
              unit={unit}
              max={max}
              descriptionId={helpId}
              onCommit={(value) => {
                setCurrentColor((previous) =>
                  updateHslChannel(previous, index, value),
                );
              }}
            />
          ))}
        </div>
        <div className="hsl-current-preview">
          <div
            className="hsl-current-swatch"
            role="img"
            aria-label={`Current color preview: ${formatSrgb8BitCss(srgb)}`}
            style={{
              backgroundColor: serializeColor(currentColor, { space: 'srgb' }),
            }}
          />
          <dl>
            <div>
              <dt>CSS HSL</dt>
              <dd>{serializeColor(currentColor, { space: 'hsl' })}</dd>
            </div>
            <div>
              <dt>sRGB</dt>
              <dd>{formatSrgb8BitCss(srgb)}</dd>
            </div>
            <div>
              <dt>Hex</dt>
              <dd>{formatSrgb8BitHex(srgb, currentColor.alpha)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p className="experiment-footnote">
        grayではHueが見た目に影響しないため、RGBから変換してHueがmissingになる場合は0°を編集開始値として表示します。
      </p>
    </div>
  );
}
