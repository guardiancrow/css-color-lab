import {
  getColorCoordinates,
  getRelativeLuminance,
} from '../../lib/color/colorEngine';
import { formatColorCoordinates } from '../../lib/color/formatColor';
import { createHslColor } from '../../lib/color/hsl';

const colors = [
  { name: 'Yellow', hue: 60 },
  { name: 'Blue', hue: 240 },
] as const;

export function LightnessDefinitionComparison() {
  return (
    <div className="lightness-definition-comparison">
      {colors.map(({ name, hue }) => {
        const color = createHslColor([hue, 100, 50]);
        const lab = getColorCoordinates(color, 'lab');
        const luminance = getRelativeLuminance(color);

        return (
          <article key={name} aria-label={`${name} Lightness comparison`}>
            <h4>{name}</h4>
            <dl>
              <div>
                <dt>HSL Lightness</dt>
                <dd>50%</dd>
              </div>
              <div>
                <dt>Lab L</dt>
                <dd>{formatColorCoordinates([lab[0]], 2)}</dd>
              </div>
              <div>
                <dt>Relative luminance Y</dt>
                <dd>{formatColorCoordinates([luminance], 4)}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}
