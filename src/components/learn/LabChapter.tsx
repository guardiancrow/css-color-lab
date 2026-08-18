import { CurrentColorLabPipeline } from '../color/CurrentColorLabPipeline';
import { LabControls } from '../color/LabControls';
import { LabLightnessExperiment } from '../color/LabLightnessExperiment';
import { LChControls } from '../color/LChControls';
import { LchHueExperiment } from '../color/LchHueExperiment';
import { LightnessDefinitionComparison } from '../color/LightnessDefinitionComparison';

export function LabChapter() {
  return (
    <section
      id="lab"
      className="learn-chapter lab-lesson"
      aria-labelledby="lab-title"
    >
      <p className="chapter-number">Chapter 6</p>
      <h2 id="lab-title">Lab / LCh</h2>
      <p className="lesson-lead">
        HSLではLを50%に揃えても、yellowとblueの見た目は大きく異なりました。Labは、人が感じる色の差をより均等に扱うことを目指して設計された色空間です。
      </p>

      <div className="lesson-copy">
        <p>
          Labは完全に知覚的に均等ではありません。それでも、encoded
          sRGBのmax/minから作るHSL
          Lightnessとは異なり、Lを知覚的lightnessに対応させようとしています。
        </p>
      </div>

      <div className="lab-concept-grid">
        <article>
          <strong>L · Lightness</strong>
          <span>low → dark · high → light</span>
        </article>
        <article>
          <strong>a · opponent-like axis</strong>
          <span>negative ← green · red → positive</span>
        </article>
        <article>
          <strong>b · opponent-like axis</strong>
          <span>negative ← blue · yellow → positive</span>
        </article>
      </div>

      <div className="lesson-copy">
        <h3>D65からD50へ、基準白を対応づける</h3>
        <p>
          sRGBとXYZ D65はD65を基準白にします。一方、CSSの
          <code>lab()</code>と<code>lch()</code>
          はD50基準として定義されているため、CSSを書くたびにwhite
          pointを指定する必要はありません。変換時には、対応する同じ色を別の基準白で表すchromatic
          adaptationが入ります。これはclippingやgamut mappingではありません。
        </p>
      </div>

      <CurrentColorLabPipeline />

      <details className="formula-details matrix-details">
        <summary>How is D65 converted to D50? — adaptation行列を見る</summary>
        <div>
          <p>
            Color EngineはColor.jsのlinear Bradford
            transformを使います。異なるwhite point間を対応づける3×3行列です。
          </p>
          <div
            className="matrix-equation"
            aria-label="XYZ D65 to XYZ D50 linear Bradford matrix"
          >
            <span>[X Y Z]D50 =</span>
            <table>
              <caption className="visually-hidden">
                XYZ D65 to XYZ D50 linear Bradford adaptation matrix
              </caption>
              <tbody>
                <tr>
                  <td>1.0479298</td>
                  <td>0.0229469</td>
                  <td>−0.0501923</td>
                </tr>
                <tr>
                  <td>0.0296278</td>
                  <td>0.9904344</td>
                  <td>−0.0170738</td>
                </tr>
                <tr>
                  <td>−0.0092430</td>
                  <td>0.0150552</td>
                  <td>0.7518743</td>
                </tr>
              </tbody>
            </table>
            <span>× [X Y Z]D65</span>
          </div>
        </div>
      </details>

      <div className="lab-editor-grid">
        <LabControls />
        <LChControls />
      </div>

      <p className="lesson-note">
        a / bはRGB channelではありません。LabやLChを編集してsRGB
        gamut外になってもcanonical
        colorは保持され、previewだけが明示的にsRGBへmappingされます。
      </p>

      <LabLightnessExperiment />

      <div className="lesson-copy">
        <h3>HSL LightnessとLab Lは別の定義</h3>
        <p>
          YellowとBlueはどちらもHSL L = 50%ですが、Lab Lは異なります。relative
          luminance Yともそれぞれ別の量です。
        </p>
      </div>
      <LightnessDefinitionComparison />

      <div className="lesson-copy">
        <h3>Labのa / b平面を、C / hで操作する</h3>
        <p>
          LChはLabの新しい別色空間というより、同じLとa/b平面をpolar
          coordinatesへ変換した表現です。Cは原点からの距離、hはpositive
          a方向からの角度です。Cは知覚的saturationと完全に同じではありません。
        </p>
      </div>

      <div
        className="lch-polar-concept"
        role="img"
        aria-label="Lab a and b rectangular coordinates convert to LCh Chroma and Hue polar coordinates"
      >
        <span>Lab: a / b</span>
        <strong aria-hidden="true">→</strong>
        <span>LCh: C / h</span>
        <small>C = distance · h = angle</small>
      </div>

      <LchHueExperiment />

      <div className="lesson-conclusion">
        <p className="eyebrow">Better model, remaining limits</p>
        <h3>Lab / LChにも不均一性とgamut制約が残ります</h3>
        <p>
          HSLより知覚を意識した操作ができますが、特にblue付近のHueや高Chromaでは課題があり、すべての色をsRGBで表示できるわけでもありません。
        </p>
      </div>

      <aside className="next-question" aria-labelledby="lab-next-question">
        <p className="eyebrow">Next question</p>
        <h3 id="lab-next-question">
          現代のディスプレイやUI向けに、さらに改善できないでしょうか？
        </h3>
        <p>
          次はLab / LChと比較しながら、Oklab /
          OkLChが改善しようとした点を見ていきます。
        </p>
      </aside>
    </section>
  );
}
