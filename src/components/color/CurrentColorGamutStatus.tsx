import { useCurrentColor } from '../../context/useCurrentColor';
import { serializeColor } from '../../lib/color/colorEngine';
import { GamutStatusList } from './GamutStatusList';

export function CurrentColorGamutStatus() {
  const { currentColor } = useCurrentColor();

  return (
    <div className="gamut-current-status">
      <div className="experiment-heading">
        <p className="eyebrow">Current Color</p>
        <h3>一つの色を、3つのRGB gamutで判定する</h3>
        <p>
          Chapter 1〜7のどのeditorから変更しても更新されます。判定対象はmapped
          previewではなく、元のcanonical colorです。
        </p>
      </div>
      <GamutStatusList
        color={currentColor}
        label="Current Color gamut status"
      />
      <dl className="gamut-current-values">
        <div>
          <dt>Original space</dt>
          <dd>{currentColor.space}</dd>
        </div>
        <div>
          <dt>CSS OkLCh</dt>
          <dd>{serializeColor(currentColor, { space: 'oklch' })}</dd>
        </div>
      </dl>
    </div>
  );
}
