import {
  getColorCoordinates,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from '../../lib/color/colorEngine';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import {
  formatSrgb8BitCss,
  formatSrgb8BitHex,
  getSrgb8BitChannels,
} from '../../lib/color/srgb8Bit';
import type { CanonicalColor } from '../../types/color';

interface OklabColorPreviewProps {
  readonly color: CanonicalColor;
  readonly editorSpace: 'Oklab' | 'OkLCh';
}

export function OklabColorPreview({
  color,
  editorSpace,
}: OklabColorPreviewProps) {
  const isInSrgb = isInColorGamut(color, 'srgb');
  const isInP3 = isInColorGamut(color, 'display-p3');
  const previewColor = isInSrgb ? color : mapColorToGamut(color, 'srgb', 'css');
  const srgb = getSrgb8BitChannels(previewColor);
  const oklab = getColorCoordinates(color, 'oklab');
  const cssLightness =
    oklab[0] === null
      ? 'none'
      : `${String(Number((oklab[0] * 100).toFixed(2)))}%`;

  return (
    <div className="lab-color-preview oklab-color-preview">
      <div
        className="lab-color-swatch"
        role="img"
        aria-label={`${editorSpace} current color preview${isInSrgb ? '' : ', mapped to sRGB for display'}`}
        style={{
          backgroundColor: serializeColor(previewColor, { space: 'srgb' }),
        }}
      />
      <div
        className="gamut-status-list"
        aria-label="Current color gamut status"
      >
        <p className="gamut-status" data-in-gamut={isInSrgb}>
          <span aria-hidden="true" />
          {isInSrgb ? 'In sRGB gamut' : 'Outside sRGB gamut'}
        </p>
        <p className="gamut-status" data-in-gamut={isInP3}>
          <span aria-hidden="true" />
          {isInP3 ? 'In Display P3 gamut' : 'Outside Display P3 gamut'}
        </p>
      </div>
      {!isInSrgb ? (
        <p className="preview-mapping-note">
          Original {editorSpace} color is retained. Preview is mapped to sRGB.
        </p>
      ) : null}
      <dl>
        <div>
          <dt>CSS Oklab</dt>
          <dd>{serializeColor(color, { space: 'oklab' })}</dd>
        </div>
        <div>
          <dt>CSS OkLCh</dt>
          <dd>{serializeColor(color, { space: 'oklch' })}</dd>
        </div>
        <div>
          <dt>L scale</dt>
          <dd>
            internal {formatColorCoordinates([oklab[0]], 4)} · CSS{' '}
            {cssLightness}
          </dd>
        </div>
        <div>
          <dt>CSS Lab</dt>
          <dd>{serializeColor(color, { space: 'lab' })}</dd>
        </div>
        <div>
          <dt>CSS LCh</dt>
          <dd>{serializeColor(color, { space: 'lch' })}</dd>
        </div>
        <div>
          <dt>{isInSrgb ? 'sRGB' : 'sRGB preview'}</dt>
          <dd>{formatSrgb8BitCss(srgb)}</dd>
        </div>
        <div>
          <dt>{isInSrgb ? 'Hex' : 'Hex preview'}</dt>
          <dd>{formatSrgb8BitHex(srgb, color.alpha)}</dd>
        </div>
      </dl>
    </div>
  );
}
