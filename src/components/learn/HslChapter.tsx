import { HSLControls } from '../color/HSLControls';
import { HslLightnessExperiment } from '../color/HslLightnessExperiment';
import { HslSaturationExperiment } from '../color/HslSaturationExperiment';

export function HslChapter() {
  return (
    <section
      id="hsl"
      className="learn-chapter hsl-lesson"
      aria-labelledby="hsl-title"
    >
      <p className="chapter-number">Chapter 5</p>
      <h2 id="hsl-title">HSL</h2>
      <p className="lesson-lead">
        HSLはsRGBのRGB値を、色を操作しやすいHue・Saturation・Lightnessへ再構成した表現です。独立した物理モデルやdevice-independentな色空間ではありません。
      </p>

      <div className="hsl-concept-grid">
        <article>
          <strong>H · Hue</strong>
          <span>色相を円周上の角度として選ぶ</span>
        </article>
        <article>
          <strong>S · Saturation</strong>
          <span>grayからどれくらい色味を持たせるか</span>
        </article>
        <article>
          <strong>L · Lightness</strong>
          <span>0%がblack、100%がwhiteとなる計算上の軸</span>
        </article>
      </div>

      <div className="lesson-copy">
        <p>
          RGBで色相だけを変えるには複数channelの調整が必要です。HSLならSとLを保ち、Hueだけを回せます。まずCurrent
          Colorで便利さを試しましょう。
        </p>
      </div>

      <HSLControls />

      <div className="lesson-copy">
        <h3>Hueは一周して戻る</h3>
        <p>
          0°と360°は同じredです。120°はpure sRGB
          green、240°はblueを表します。HSLは円柱に似た考え方で説明できますが、知覚に基づく完全な円柱ではありません。
        </p>
      </div>

      <HslLightnessExperiment />

      <details className="formula-details">
        <summary>How is HSL Lightness calculated? — 定義を見る</summary>
        <div>
          <p>
            encoded sRGB座標の最大値をmax、最小値をminとすると、HSL
            Lightnessは次の関係で定義されます。
          </p>
          <div className="formula" aria-label="HSL Lightness definition">
            <code>L = (max(R, G, B) + min(R, G, B)) / 2</code>
          </div>
          <p>
            そのためL = 50%は、relative
            luminance、光量、知覚的lightnessの50%を意味しません。
          </p>
        </div>
      </details>

      <HslSaturationExperiment />

      <div className="lesson-conclusion">
        <p className="eyebrow">Convenient, not perceptually uniform</p>
        <h3>操作しやすさと、見た目の均一さは別です</h3>
        <p>
          HSLは色相・色味・Lightnessを分けて操作するのに便利です。しかし同じ数値差が、同じ見た目の差になるとは限りません。
        </p>
      </div>

      <aside className="next-question" aria-labelledby="hsl-next-question">
        <p className="eyebrow">Next question</p>
        <h3 id="hsl-next-question">
          人間が感じる色の違いを、もっと均等に扱えないでしょうか？
        </h3>
        <p>
          次はXYZとの関係を保ちながら、知覚を考慮したLab /
          LChという座標へ進みます。
        </p>
      </aside>
    </section>
  );
}
