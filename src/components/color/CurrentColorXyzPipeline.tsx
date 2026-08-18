import { useCurrentColor } from '../../context/useCurrentColor';
import { getSrgbToXyzPipeline } from '../../lib/color/xyzLesson';
import { CoordinateCard } from './CoordinateCard';

const rgbLabels = ['R', 'G', 'B'] as const;
const xyzLabels = ['X', 'Y', 'Z'] as const;

export function CurrentColorXyzPipeline() {
  const { currentColor } = useCurrentColor();
  const pipeline = getSrgbToXyzPipeline(currentColor);

  return (
    <div className="xyz-current-pipeline">
      <div className="experiment-heading">
        <p className="eyebrow">Current Color</p>
        <h3>同じ色を、3段階で見る</h3>
        <p>
          Chapter 1のRGB Controlsを変更すると、3つの表現が同時に更新されます。
        </p>
      </div>
      <div
        className="coordinate-pipeline"
        aria-label="Current Color conversion pipeline"
      >
        <CoordinateCard
          title="sRGB encoded"
          subtitle="0〜1へ正規化したencoded値"
          labels={rgbLabels}
          coordinates={pipeline.encodedSrgb}
        />
        <span className="pipeline-arrow" aria-hidden="true">
          →<small>decode</small>
        </span>
        <CoordinateCard
          title="Linear sRGB"
          subtitle="光量に比例する値"
          labels={rgbLabels}
          coordinates={pipeline.linearSrgb}
        />
        <span className="pipeline-arrow" aria-hidden="true">
          →<small>matrix</small>
        </span>
        <CoordinateCard
          title="XYZ D65"
          subtitle="共通基盤となる座標"
          labels={xyzLabels}
          coordinates={pipeline.xyzD65}
        />
      </div>
    </div>
  );
}
