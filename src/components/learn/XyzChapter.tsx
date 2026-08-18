import { CurrentColorXyzPipeline } from '../color/CurrentColorXyzPipeline';
import { RgbSpaceComparison } from '../color/RgbSpaceComparison';
import { XyzGrayExperiment } from '../color/XyzGrayExperiment';
import { XyzPrimaryExperiment } from '../color/XyzPrimaryExperiment';

export function XyzChapter() {
  return (
    <section
      id="xyz"
      className="learn-chapter xyz-lesson"
      aria-labelledby="xyz-title"
    >
      <p className="chapter-number">Chapter 4</p>
      <h2 id="xyz-title">XYZ</h2>
      <p className="lesson-lead">
        RGBは一種類ではありません。同じ数値でも、sRGB、Display
        P3、Rec.2020ではprimariesなどの定義が違うため、表す色も変わります。
      </p>

      <div className="lesson-copy">
        <h3>色空間をつなぐ「共通座標系」</h3>
        <p>
          CIE
          XYZは特定のディスプレイのR・G・B成分ではなく、device-independentな色表現として、多くの色空間変換の共通基盤に使われます。すべての変換が必ずXYZを経由する、という意味ではありません。
        </p>
      </div>

      <div
        className="xyz-hub"
        role="img"
        aria-label="sRGB、Display P3、Rec.2020などからXYZを共通基盤としてLabなどへつなぐ概念図"
      >
        <div className="xyz-hub-sources">
          <span>sRGB</span>
          <span>Display P3</span>
          <span>Rec.2020</span>
        </div>
        <span className="xyz-hub-arrow" aria-hidden="true">
          →
        </span>
        <strong>XYZ</strong>
        <span className="xyz-hub-arrow" aria-hidden="true">
          →
        </span>
        <span>Labなど</span>
      </div>

      <CurrentColorXyzPipeline />
      <XyzPrimaryExperiment />

      <div className="lesson-copy">
        <h3>Yとrelative luminance</h3>
        <p>
          XYZ D65のY成分はrelative
          luminance（相対輝度）と対応するよう設計されています。ただし、人間が感じる明るさそのもの、CSSのLightness、OklabのLと同じ概念ではありません。
        </p>
      </div>

      <XyzGrayExperiment />

      <details className="formula-details matrix-details">
        <summary>How does Linear sRGB become XYZ? — 行列を見る</summary>
        <div>
          <p>
            Linear sRGBの3成分へ、sRGBのprimariesとD65 white
            pointから決まる行列を掛けます。
          </p>
          <div
            className="matrix-equation"
            aria-label="Linear sRGB to XYZ D65 matrix"
          >
            <span>[X Y Z]ᵀ =</span>
            <table>
              <caption className="visually-hidden">
                Linear sRGB to XYZ D65 conversion matrix
              </caption>
              <tbody>
                <tr>
                  <td>0.4123908</td>
                  <td>0.3575843</td>
                  <td>0.1804808</td>
                </tr>
                <tr>
                  <td>0.2126390</td>
                  <td>0.7151687</td>
                  <td>0.0721923</td>
                </tr>
                <tr>
                  <td>0.0193308</td>
                  <td>0.1191948</td>
                  <td>0.9505322</td>
                </tr>
              </tbody>
            </table>
            <span>× [R G B]ᵀ</span>
          </div>
          <p>
            XYZの値は基準となるwhite
            pointと組み合わせて扱います。sRGBでは標準的な白色点D65を使います。分光分布やchromatic
            adaptationの詳細は後続章で扱います。
          </p>
        </div>
      </details>

      <RgbSpaceComparison />

      <aside className="next-question" aria-labelledby="xyz-next-question">
        <p className="eyebrow">Next question</p>
        <h3 id="xyz-next-question">
          座標を人が選びやすく、色の差も捉えやすくするには？
        </h3>
        <p>
          XYZは変換の基盤として有用ですが、直感的な色調整や知覚的な差の読み取りを目的とした座標ではありません。
        </p>
      </aside>
    </section>
  );
}
