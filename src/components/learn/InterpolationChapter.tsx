import { ColorInterpolationExperiment } from '../color/ColorInterpolationExperiment';
import { HueInterpolationExperiment } from '../color/HueInterpolationExperiment';

export function InterpolationChapter() {
  return (
    <section
      id="interpolation"
      className="learn-chapter interpolation-lesson"
      aria-labelledby="interpolation-title"
    >
      <p className="chapter-number">Chapter 9</p>
      <h2 id="interpolation-title">Color interpolation</h2>
      <p className="lesson-lead">
        2色の「間」は1本に決まりません。どのcolor
        spaceで座標を直線的に結ぶかによって、明るさ、彩度、通る色相が変わります。
      </p>

      <div className="lesson-copy">
        <h3>Chapter 4で見た50%を一般化する</h3>
        <p>
          黒と白の50%はencoded sRGBで約128、Linear
          sRGBで約188でした。今回は端点と割合を変えながら、OklabとOkLChも同じ画面で比較します。
        </p>
        <p>
          Oklabは知覚的な均一さを目指す直交座標、OkLChはそれをLightness / Chroma
          /
          Hueに読み替えた円筒座標です。OkLChではHueを進む向きも選択になります。
        </p>
      </div>

      <ColorInterpolationExperiment />

      <details className="lesson-note">
        <summary>4つのcolor-mix()構文を並べる</summary>
        <pre aria-label="color-mix interpolation space examples">
          <code>{`color-mix(in srgb, red 50%, blue)
color-mix(in srgb-linear, red 50%, blue)
color-mix(in oklab, red 50%, blue)
color-mix(in oklch, red 50%, blue)`}</code>
        </pre>
        <p>
          この章では2色の割合を合計100%に限定します。percentage省略などの詳細は次章以降で扱えます。
        </p>
      </details>

      <div className="lesson-copy">
        <h3>計算中の色を、表示範囲で先に切らない</h3>
        <p>
          Color Engineは補間前後のraw coordinatesを保持します。途中色がsRGB
          gamut外でも、その場でclipやmapはしません。この章のswatchとgradientだけが、表示のため明示的にsRGBへgamut
          mappingします。
        </p>
        <p>
          alpha付きの色は、各座標をalphaでpremultiplyしてから補間し、最後に戻します。これにより透明な端点に隠れたRGB値が途中へ不自然に漏れるのを防ぎます。
        </p>
      </div>

      <HueInterpolationExperiment />

      <div className="lesson-conclusion">
        <p className="eyebrow">A route is part of the result</p>
        <h3>「何色と何色」だけでなく「どこを通るか」を指定する</h3>
        <p>
          sRGB、Linear sRGB、Oklab、OkLChは同じ端点から異なる途中色を作ります。
          CSSの<code>color-mix()</code>は、そのinterpolation spaceとpolar
          spaceのHue methodをコードとして指定できます。
        </p>
      </div>

      <aside
        className="next-question"
        aria-labelledby="interpolation-next-question"
      >
        <p className="eyebrow">Next question</p>
        <h3 id="interpolation-next-question">
          現代のCSSでは、これらの色空間と計算を実際のUIへどう組み込めるのでしょうか？
        </h3>
        <p>
          次はmodern CSS color syntaxとLevel
          5の機能を、実用的なコードへつなげます。既存色から別の色を作るrelative
          color syntaxなども見ていきます。
        </p>
      </aside>
    </section>
  );
}
