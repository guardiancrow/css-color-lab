import { useCurrentColor } from '../../context/useCurrentColor';
import { formatColorForInspector } from '../../lib/color/formatColor';
import type { DisplayColorValue } from '../../types/color';

export function CurrentColorInspector() {
  const { currentColor } = useCurrentColor();
  const formatted = formatColorForInspector(currentColor);
  const values: readonly DisplayColorValue[] = [
    {
      label: formatted.isInSrgbGamut ? 'Hex' : 'Hex (mapped)',
      value: formatted.hex,
    },
    { label: 'sRGB', value: formatted.srgb },
    { label: 'HSL', value: formatted.hsl },
    { label: 'XYZ D65', value: formatted.xyzD65 },
    { label: 'Oklab', value: formatted.oklab },
    { label: 'OkLCh', value: formatted.oklch },
    { label: 'Alpha', value: formatted.alpha },
  ];

  return (
    <aside className="color-inspector" aria-labelledby="inspector-title">
      <div className="inspector-heading">
        <div
          className="color-swatch"
          role="img"
          aria-label={`現在の色: ${formatted.hex}`}
          style={{ backgroundColor: formatted.previewCss }}
        />
        <div>
          <p className="sidebar-heading">Current color</p>
          <h2 id="inspector-title">Inspector</h2>
        </div>
      </div>
      <dl className="color-values">
        {values.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="gamut-status" data-in-gamut={formatted.isInSrgbGamut}>
        <span aria-hidden="true" />
        sRGB gamut: {formatted.isInSrgbGamut ? 'In gamut' : 'Out of gamut'}
      </p>
      <p className="inspector-note">
        すべての値は、同じ現在色から導出しています。
      </p>
    </aside>
  );
}
