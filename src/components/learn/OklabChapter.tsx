import { CurrentColorOklabPipeline } from '../color/CurrentColorOklabPipeline';
import { LchOklchHueComparison } from '../color/LchOklchHueComparison';
import { OkLChControls } from '../color/OkLChControls';
import { OklabControls } from '../color/OklabControls';

export function OklabChapter() {
  return (
    <section
      id="oklab"
      className="learn-chapter oklab-lesson"
      aria-labelledby="oklab-title"
    >
      <p className="chapter-number">Chapter 7</p>
      <h2 id="oklab-title">Oklab / OkLCh</h2>
      <p className="lesson-lead">
        Lab /
        LChではHSLよりも知覚を意識した色操作ができました。しかしLabでも、blue付近、高Chroma、色相ごとの知覚差などに不均一さが残ります。
      </p>

      <div className="lesson-copy">
        <p>
          Oklabは、現代的な画像処理やUI用途を念頭に、lightness・chroma・hueの知覚的な挙動を改善することを目指して設計されました。Labを単に置き換えるものでも、人の知覚を完全に再現するものでもありません。
        </p>
      </div>

      <CurrentColorOklabPipeline />

      <div className="oklab-concept-grid">
        <article>
          <strong>L · Lightness</strong>
          <span>0付近 → dark · 1付近 → light</span>
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
      <p className="lesson-note">
        軸の役割はLabと似ていますが、定義と数値scaleは異なります。Oklabのinternal
        L = 0.65はCSSで65%とも書けます。
      </p>

      <div className="lab-editor-grid oklab-editor-grid">
        <OklabControls />
        <OkLChControls />
      </div>

      <div className="lesson-copy">
        <h3>Oklabのa / bを、ChromaとHueへ</h3>
        <p>
          LabにLChがあるのと同様に、OklabにはOkLChがあります。a / b平面をpolar
          coordinatesへ変換し、Cを原点からの距離、hを角度として表します。
        </p>
      </div>
      <div
        className="lch-polar-concept"
        role="img"
        aria-label="Oklab a and b rectangular coordinates convert to OkLCh Chroma and Hue polar coordinates"
      >
        <span>Oklab: a / b</span>
        <strong aria-hidden="true">→</strong>
        <span>OkLCh: C / h</span>
        <small>C = distance · h = angle · L remains Oklab Lightness</small>
      </div>
      <p className="lesson-note">
        LChとOkLChは同じL / C /
        h形式でも、元の色空間とscaleが異なります。同じ数値をそのまま入れても同じ色にはなりません。C
        = 0ではHSLやLChと同様にHueはpowerlessです。
      </p>

      <LchOklchHueComparison />

      <div
        className="hsl-oklch-summary"
        aria-label="HSL and OkLCh short comparison"
      >
        <article>
          <h3>HSL</h3>
          <p>
            RGBをHue / Saturation /
            Lightnessへ操作しやすく再構成。Lightnessは知覚的な明るさではありません。
          </p>
        </article>
        <article>
          <h3>OkLCh</h3>
          <p>
            知覚的均等性の改善を目指したOklab由来。Lightness / Chroma /
            Hueを分けて操作できます。
          </p>
        </article>
      </div>

      <details className="formula-details oklab-transform-details">
        <summary>How does XYZ become Oklab? — 変換構造を見る</summary>
        <div>
          <p>
            XYZ D65を行列でLMS-like
            valuesへ変換し、各値へ非線形変換を適用してから、もう一つの行列でOklabのL
            / a / bを得ます。実際の係数と計算はCSS Color 4に沿うColor
            Engineへ委譲しています。
          </p>
          <div
            className="transformation-flow"
            aria-label="XYZ D65 to Oklab transformation structure"
          >
            <span>XYZ D65</span>
            <strong aria-hidden="true">→</strong>
            <span>matrix · LMS-like</span>
            <strong aria-hidden="true">→</strong>
            <span>cube-root nonlinearity</span>
            <strong aria-hidden="true">→</strong>
            <span>matrix · Oklab</span>
          </div>
          <p>
            LabはXYZ D65 → XYZ D50 → Lab、OklabはXYZ D65 →
            Oklabです。これは定義上の構造差であり、adaptationの有無だけで正確さを評価するものではありません。
          </p>
        </div>
      </details>

      <div className="lesson-copy">
        <h3>CSSでOkLChが注目される理由</h3>
        <ul className="oklch-use-list">
          <li>Lightnessを分けてtheme colorの明暗を調整しやすい</li>
          <li>ChromaとHueを分けて色の強さと方向を設計しやすい</li>
          <li>gradientやinterpolationで知覚を意識した変化を作りやすい</li>
          <li>sRGB外を含むwide-gamut colorも座標として表現できる</li>
        </ul>
        <p>
          ただしOkLChにもgamut制約があり、Cは知覚的saturationそのものではなく、知覚的均等性も完全ではありません。
        </p>
      </div>

      <div className="lesson-conclusion">
        <p className="eyebrow">Useful model, real display limits</p>
        <h3>扱いやすい座標と、表示できる範囲は別の問題です</h3>
        <p>
          OkLChは色設計に有用ですが、指定した色がすべてsRGBやDisplay
          P3で表示できるわけではありません。editorと比較カードのgamut
          statusは、その違いを色以外の文字でも示しています。
        </p>
      </div>

      <aside className="next-question" aria-labelledby="oklab-next-question">
        <p className="eyebrow">Next question</p>
        <h3 id="oklab-next-question">
          色空間と「ディスプレイが実際に表示できる色の範囲」は、どう違うのでしょうか？
        </h3>
        <p>
          次はsRGB、Display P3などのgamutを比較し、in-gamut /
          out-of-gamut、clipping、mappingの違いへ進みます。
        </p>
      </aside>
    </section>
  );
}
