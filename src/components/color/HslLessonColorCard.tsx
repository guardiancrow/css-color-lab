import { useId } from 'react';
import {
  getRelativeLuminance,
  serializeColor,
} from '../../lib/color/colorEngine';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import { createHslColor } from '../../lib/color/hsl';
import {
  formatSrgb8BitCss,
  getSrgb8BitChannels,
} from '../../lib/color/srgb8Bit';

interface HslLessonColorCardProps {
  readonly title: string;
  readonly hue: number;
  readonly saturation: number;
  readonly lightness: number;
}

export function HslLessonColorCard({
  title,
  hue,
  saturation,
  lightness,
}: HslLessonColorCardProps) {
  const titleId = useId();
  const color = createHslColor([hue, saturation, lightness]);
  const srgb = getSrgb8BitChannels(color);
  const luminance = getRelativeLuminance(color);

  return (
    <article className="hsl-result-card" aria-labelledby={titleId}>
      <div
        className="hsl-result-preview"
        role="img"
        aria-label={`${title} preview`}
        style={{ backgroundColor: serializeColor(color, { space: 'srgb' }) }}
      />
      <div className="hsl-result-body">
        <h4 id={titleId}>{title}</h4>
        <dl>
          <div>
            <dt>HSL</dt>
            <dd>{`${String(hue)}° ${String(saturation)}% ${String(lightness)}%`}</dd>
          </div>
          <div>
            <dt>sRGB</dt>
            <dd>{formatSrgb8BitCss(srgb)}</dd>
          </div>
          <div>
            <dt>Relative luminance Y</dt>
            <dd aria-label={`${title} relative luminance`}>
              {formatColorCoordinates([luminance], 4)}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
