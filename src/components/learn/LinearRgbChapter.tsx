import { LinearSrgbExperiment } from '../color/LinearSrgbExperiment';
import {
  GrayMidpointComparison,
  RgbInterpolationComparison,
} from '../color/RgbInterpolationComparison';

export function LinearRgbChapter() {
  return (
    <section
      id="linear-rgb"
      className="learn-chapter transfer-lesson"
      aria-labelledby="linear-rgb-title"
    >
      <p className="chapter-number">Chapter 3</p>
      <h2 id="linear-rgb-title">Linear RGB</h2>
      <p className="lesson-lead">
        Linear
        sRGBでは、0.5は基準となる白の50%の光量を表します。表示するときはtransfer
        functionでencoded sRGBへ戻します。
      </p>

      <LinearSrgbExperiment />

      <div className="midpoint-section">
        <div className="experiment-heading">
          <p className="eyebrow">Compare</p>
          <h3>128と188、どちらが「半分」？</h3>
          <p>
            128はencoded数値の中間、約188はblackとwhiteの光量の中間です。何を半分にするかで答えが変わります。
          </p>
        </div>
        <GrayMidpointComparison />
      </div>

      <RgbInterpolationComparison />

      <details className="formula-details">
        <summary>Linear sRGBをencoded sRGBへ戻す式を見る</summary>
        <div>
          <p>
            linear-light成分
            <var>
              C<sub>linear</sub>
            </var>
            からencoded成分
            <var>C</var>へ戻す式も2つの区間を持ちます。
          </p>
          <div
            className="formula"
            aria-label="Linear sRGB to encoded sRGB formula"
          >
            <code>
              C<sub>linear</sub> ≤ 0.0031308: C = 12.92 × C<sub>linear</sub>
            </code>
            <code>
              C<sub>linear</sub> &gt; 0.0031308: C = 1.055 × C<sub>linear</sub>
              <sup>1 / 2.4</sup> − 0.055
            </code>
          </div>
        </div>
      </details>

      <aside className="next-question" aria-labelledby="linear-next-question">
        <p className="eyebrow">Next question</p>
        <h3 id="linear-next-question">
          「人間が感じる色の違い」を一定にするには、どんな座標が必要でしょうか？
        </h3>
        <p>
          Linear
          RGBは光の混合や物理的な計算に適していますが、人間の知覚に対して均等な色空間ではありません。
        </p>
      </aside>
    </section>
  );
}
