import { useId } from 'react';
import {
  getColorCoordinates,
  isInColorGamut,
  mapColorToGamut,
  serializeColor,
} from '../../lib/color/colorEngine';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import {
  formatSrgb8BitCss,
  getSrgb8BitChannels,
} from '../../lib/color/srgb8Bit';
import type { CanonicalColor } from '../../types/color';

interface LabLessonColorCardProps {
  readonly title: string;
  readonly color: CanonicalColor;
}

export function LabLessonColorCard({ title, color }: LabLessonColorCardProps) {
  const titleId = useId();
  const lab = getColorCoordinates(color, 'lab');
  const lch = getColorCoordinates(color, 'lch');
  const isInSrgb = isInColorGamut(color, 'srgb');
  const previewColor = isInSrgb ? color : mapColorToGamut(color, 'srgb', 'css');
  const previewRgb = formatSrgb8BitCss(getSrgb8BitChannels(previewColor));

  return (
    <article className="lab-result-card" aria-labelledby={titleId}>
      <div
        className="lab-result-preview"
        role="img"
        aria-label={`${title} preview${isInSrgb ? '' : ', mapped to sRGB'}`}
        style={{
          backgroundColor: serializeColor(previewColor, { space: 'srgb' }),
        }}
      />
      <div className="lab-result-body">
        <h4 id={titleId}>{title}</h4>
        <p className="gamut-status" data-in-gamut={isInSrgb}>
          <span aria-hidden="true" />
          {isInSrgb ? 'In sRGB gamut' : 'Outside sRGB gamut'}
        </p>
        <dl>
          <div>
            <dt>Lab</dt>
            <dd>{formatColorCoordinates(lab, 2)}</dd>
          </div>
          <div>
            <dt>LCh</dt>
            <dd>{formatColorCoordinates(lch, 2)}</dd>
          </div>
          <div>
            <dt>{isInSrgb ? 'sRGB' : 'Mapped preview'}</dt>
            <dd>{previewRgb}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
