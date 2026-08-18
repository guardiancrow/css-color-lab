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

interface OklabLessonColorCardProps {
  readonly title: string;
  readonly color: CanonicalColor;
  readonly authoredSpace: 'LCh' | 'OkLCh';
}

export function OklabLessonColorCard({
  title,
  color,
  authoredSpace,
}: OklabLessonColorCardProps) {
  const titleId = useId();
  const coordinates = getColorCoordinates(
    color,
    authoredSpace === 'LCh' ? 'lch' : 'oklch',
  );
  const isInSrgb = isInColorGamut(color, 'srgb');
  const isInP3 = isInColorGamut(color, 'display-p3');
  const previewColor = isInSrgb ? color : mapColorToGamut(color, 'srgb', 'css');
  const previewRgb = formatSrgb8BitCss(getSrgb8BitChannels(previewColor));

  return (
    <article className="lab-result-card" aria-labelledby={titleId}>
      <div
        className="lab-result-preview"
        role="img"
        aria-label={`${title}, Hue ${formatColorCoordinates([coordinates[2]], 1)} degrees, ${isInSrgb ? 'in sRGB gamut' : 'outside sRGB gamut'}, ${isInP3 ? 'in Display P3 gamut' : 'outside Display P3 gamut'}${isInSrgb ? '' : ', preview mapped to sRGB'}`}
        style={{
          backgroundColor: serializeColor(previewColor, { space: 'srgb' }),
        }}
      />
      <div className="lab-result-body">
        <h4 id={titleId}>{title}</h4>
        <div className="gamut-status-list">
          <p className="gamut-status" data-in-gamut={isInSrgb}>
            <span aria-hidden="true" />
            {isInSrgb ? 'In sRGB gamut' : 'Outside sRGB gamut'}
          </p>
          <p className="gamut-status" data-in-gamut={isInP3}>
            <span aria-hidden="true" />
            {isInP3 ? 'In Display P3 gamut' : 'Outside Display P3 gamut'}
          </p>
        </div>
        <dl>
          <div>
            <dt>{authoredSpace}</dt>
            <dd>{formatColorCoordinates(coordinates, 4)}</dd>
          </div>
          <div>
            <dt>Hue angle</dt>
            <dd>{formatColorCoordinates([coordinates[2]], 1)}°</dd>
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
