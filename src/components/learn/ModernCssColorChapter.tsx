import { Link } from 'react-router-dom';
import { ContrastColorExperiment } from '../color/ContrastColorExperiment';
import { LightDarkExperiment } from '../color/LightDarkExperiment';
import { ModernColorSupport } from '../color/ModernColorSupport';
import { RelativeColorExperiment } from '../color/RelativeColorExperiment';

export function ModernCssColorChapter() {
  return (
    <section
      id="modern-css-color"
      className="learn-chapter modern-css-lesson"
      aria-labelledby="modern-css-color-title"
    >
      <p className="chapter-number">Chapter 10</p>
      <h2 id="modern-css-color-title">Modern CSS Color</h2>
      <p className="lesson-lead">
        ここまで学んだ色空間、channel、補間は、現代CSSでは固定値を表示するだけでなく、別の色を作り、状況に応じて選ぶためにも使えます。
      </p>

      <div className="lesson-copy">
        <h3>CSSは「色から色を作る」ことができる</h3>
        <pre aria-label="Relative color identity example">
          <code>{`--base: #d27a43;
color: oklch(from var(--base) l c h);`}</code>
        </pre>
        <p>
          <code>oklch(from ...)</code>はoriginをOkLChへ変換し、
          <code>l</code>、<code>c</code>、<code>h</code>
          を新しい色の材料にします。最初は同じchannelをそのまま使い、次の実験で個別に変えます。
        </p>
      </div>

      <RelativeColorExperiment />

      <div className="modern-choice-comparison">
        <article>
          <p className="eyebrow">One source</p>
          <h3>Relative Color</h3>
          <p>一つの色を変換し、channelを基準に別の色を作ります。</p>
          <code>oklch(from var(--brand) calc(l + 0.08) c h)</code>
        </article>
        <article>
          <p className="eyebrow">Multiple sources</p>
          <h3>color-mix()</h3>
          <p>複数色を、指定したinterpolation spaceで混ぜます。</p>
          <pre aria-label="color-mix theme variation example">
            <code>color-mix(in oklab, var(--brand), white 20%)</code>
          </pre>
        </article>
      </div>
      <p className="lesson-note">
        Chapter 9で見たColor interpolationが、CSSでは
        <code>color-mix()</code>としてtheme variationにも利用できます。Relative
        Colorとの優劣ではなく、channel操作か複数色のmixかで使い分けます。
      </p>

      <LightDarkExperiment />
      <ContrastColorExperiment />
      <ModernColorSupport />

      <div className="modern-level-summary">
        <article>
          <p className="eyebrow">CSS Color 4</p>
          <h3>色を直接表す範囲が広がる</h3>
          <p>Lab / LCh、Oklab / OkLCh、predefined wide-gamut spacesなど。</p>
        </article>
        <article>
          <p className="eyebrow">CSS Color 5</p>
          <h3>色を作る・選ぶ</h3>
          <p>
            Relative colors、color-mix()、light-dark()、contrast-color()など。
          </p>
        </article>
      </div>
      <p className="lesson-note">
        仕様levelとbrowser supportは別です。Color
        Engineは値を計算・分析し、browser CSS
        engineは実際の構文を解釈・描画します。新しい機能にはfallbackとruntime
        detectionを用意します。
      </p>

      <div className="lesson-conclusion modern-playground-callout">
        <p className="eyebrow">Learning path complete</p>
        <h3>次は自由に組み合わせて試す</h3>
        <p>
          Learnでは各概念を順番に学びました。Playgroundでは、これらの色空間やCSS表現を自由に組み合わせて試せるようにしていきます。
        </p>
        <Link className="playground-link" to="/playground">
          Color Playgroundへ進む
        </Link>
      </div>
    </section>
  );
}
