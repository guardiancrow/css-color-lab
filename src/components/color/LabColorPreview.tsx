import {
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from '../../lib/color/colorEngine';
import {
  formatSrgb8BitCss,
  formatSrgb8BitHex,
  getSrgb8BitChannels,
} from '../../lib/color/srgb8Bit';
import type { CanonicalColor } from '../../types/color';

interface LabColorPreviewProps {
  readonly color: CanonicalColor;
  readonly editorSpace: 'Lab' | 'LCh';
}

export function LabColorPreview({ color, editorSpace }: LabColorPreviewProps) {
  const isInSrgb = isInColorGamut(color, 'srgb');
  const previewColor = isInSrgb ? color : mapColorToGamut(color, 'srgb', 'css');
  const srgb = getSrgb8BitChannels(previewColor);

  return (
    <div className="lab-color-preview">
      <div
        className="lab-color-swatch"
        role="img"
        aria-label={`${editorSpace} current color preview${isInSrgb ? '' : ', mapped to sRGB for display'}`}
        style={{
          backgroundColor: serializeColor(previewColor, { space: 'srgb' }),
        }}
      />
      <p className="gamut-status" data-in-gamut={isInSrgb}>
        <span aria-hidden="true" />
        {isInSrgb ? 'In sRGB gamut' : 'Outside sRGB gamut'}
      </p>
      {!isInSrgb ? (
        <p className="preview-mapping-note">
          Original {editorSpace} color is retained. Preview is mapped to sRGB.
        </p>
      ) : null}
      <dl>
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
