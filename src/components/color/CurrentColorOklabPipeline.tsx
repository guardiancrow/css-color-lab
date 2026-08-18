import { useCurrentColor } from '../../context/useCurrentColor';
import { getColorCoordinates } from '../../lib/color/colorEngine';
import { getOklabPipeline } from '../../lib/color/oklab';
import { CoordinateCard } from './CoordinateCard';

const xyzLabels = ['X', 'Y', 'Z'] as const;
const labLabels = ['L', 'a', 'b'] as const;

export function CurrentColorOklabPipeline() {
  const { currentColor } = useCurrentColor();
  const pipeline = getOklabPipeline(currentColor);
  const lab = getColorCoordinates(currentColor, 'lab');

  return (
    <div className="lab-current-pipeline oklab-current-pipeline">
      <div className="experiment-heading">
        <p className="eyebrow">Current Color · two paths</p>
        <h3>LabはD50へ、OklabはD65から直接進む</h3>
        <p>
          どちらも同じCurrent
          Colorから導出します。経路が短いことは、Oklabの方が「正しい」という意味ではありません。
        </p>
      </div>
      <div
        className="pipeline-comparison"
        aria-label="Lab and Oklab conversion pipeline comparison"
      >
        <article>
          <h4>Lab</h4>
          <ol>
            <li>sRGB</li>
            <li>Linear sRGB</li>
            <li>XYZ D65</li>
            <li>chromatic adaptation</li>
            <li>XYZ D50</li>
            <li>Lab</li>
          </ol>
        </article>
        <article>
          <h4>Oklab</h4>
          <ol>
            <li>sRGB</li>
            <li>Linear sRGB</li>
            <li>XYZ D65</li>
            <li>Oklab transform</li>
            <li>Oklab</li>
          </ol>
        </article>
      </div>
      <div
        className="coordinate-pipeline oklab-coordinate-pipeline"
        aria-label="Current Color XYZ D65 to Oklab conversion pipeline"
      >
        <CoordinateCard
          title="XYZ D65"
          subtitle="sRGBとOklabが共有する基準白"
          labels={xyzLabels}
          coordinates={pipeline.xyzD65}
        />
        <span className="pipeline-arrow" aria-hidden="true">
          →<small>Oklab transform</small>
        </span>
        <CoordinateCard
          title="Oklab"
          subtitle="D65基準のL / a / b"
          labels={labLabels}
          coordinates={pipeline.oklab}
        />
      </div>
      <div
        className="lab-oklab-values"
        aria-label="Current Color Lab and Oklab coordinate comparison"
      >
        <CoordinateCard
          title="Lab"
          subtitle="Lは0〜100 · a/bはLab scale"
          labels={labLabels}
          coordinates={lab}
        />
        <CoordinateCard
          title="Oklab"
          subtitle="Lは0〜1 · a/bはOklab scale"
          labels={labLabels}
          coordinates={pipeline.oklab}
        />
      </div>
      <p className="lesson-note">
        形は同じL / a /
        bでも定義とscaleが異なります。Labの値をOklabへコピーしても同じ色にはなりません。
      </p>
    </div>
  );
}
