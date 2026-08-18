import { useCurrentColor } from '../../context/useCurrentColor';
import { getLabPipeline } from '../../lib/color/lab';
import { CoordinateCard } from './CoordinateCard';

const xyzLabels = ['X', 'Y', 'Z'] as const;
const labLabels = ['L', 'a', 'b'] as const;

export function CurrentColorLabPipeline() {
  const { currentColor } = useCurrentColor();
  const pipeline = getLabPipeline(currentColor);

  return (
    <div className="lab-current-pipeline">
      <div className="experiment-heading">
        <p className="eyebrow">Current Color</p>
        <h3>white pointを合わせてLabへ進む</h3>
        <p>
          RGB ControlsやHSL Controlsを変更すると、3段階すべてが更新されます。
        </p>
      </div>
      <div
        className="coordinate-pipeline"
        aria-label="Current Color XYZ D65 to Lab conversion pipeline"
      >
        <CoordinateCard
          title="XYZ D65"
          subtitle="sRGB側の基準白"
          labels={xyzLabels}
          coordinates={pipeline.xyzD65}
        />
        <span className="pipeline-arrow" aria-hidden="true">
          →<small>adapt white</small>
        </span>
        <CoordinateCard
          title="XYZ D50"
          subtitle="対応する同じ色をD50基準で表す"
          labels={xyzLabels}
          coordinates={pipeline.xyzD50}
        />
        <span className="pipeline-arrow" aria-hidden="true">
          →<small>Lab transform</small>
        </span>
        <CoordinateCard
          title="Lab"
          subtitle="知覚的均等性を目指した座標"
          labels={labLabels}
          coordinates={pipeline.lab}
        />
      </div>
    </div>
  );
}
