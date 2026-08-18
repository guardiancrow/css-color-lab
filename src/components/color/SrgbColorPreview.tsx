import { serializeColor } from '../../lib/color/colorEngine';
import {
  formatSrgb8BitCss,
  formatSrgb8BitHex,
  getSrgb8BitChannels,
} from '../../lib/color/srgb8Bit';
import type { CanonicalColor } from '../../types/color';

interface SrgbColorPreviewProps {
  readonly color: CanonicalColor;
}

export function SrgbColorPreview({ color }: SrgbColorPreviewProps) {
  const channels = getSrgb8BitChannels(color);
  const rgb = formatSrgb8BitCss(channels);
  const hex = formatSrgb8BitHex(channels, color.alpha);
  const previewCss = serializeColor(color, { space: 'srgb' });

  return (
    <div className="srgb-preview" aria-label="現在のsRGB色">
      <div
        className="srgb-preview-swatch"
        role="img"
        aria-label={`Color preview: ${rgb}, ${hex}`}
        style={{ backgroundColor: previewCss }}
      >
        <span>Current color</span>
      </div>
      <dl className="srgb-current-values">
        <div>
          <dt>CSS</dt>
          <dd>{rgb}</dd>
        </div>
        <div>
          <dt>Hex</dt>
          <dd>{hex}</dd>
        </div>
      </dl>
    </div>
  );
}
