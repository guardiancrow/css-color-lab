import type { DisplayColorValue } from '../../types/color';

const placeholderValues: readonly DisplayColorValue[] = [
  { label: 'Hex', value: '#6C5CE7' },
  { label: 'sRGB', value: '108 92 231' },
  { label: 'HSL', value: '247° 74% 63%' },
  { label: 'XYZ', value: '— — —' },
  { label: 'Oklab', value: '— — —' },
  { label: 'OkLCh', value: '— — —' },
];

export function CurrentColorInspector() {
  return (
    <aside className="color-inspector" aria-labelledby="inspector-title">
      <div className="inspector-heading">
        <div
          className="color-swatch"
          role="img"
          aria-label="現在の仮の色: 紫"
        />
        <div>
          <p className="sidebar-heading">Current color</p>
          <h2 id="inspector-title">Inspector</h2>
        </div>
      </div>
      <dl className="color-values">
        {placeholderValues.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="inspector-note">
        Phase 1の仮表示です。今後、ひとつの現在色からすべての値を導出します。
      </p>
    </aside>
  );
}
