import { SrgbDecodeExperiment } from '../color/SrgbDecodeExperiment';

export function SrgbChapter() {
  return (
    <section
      id="srgb"
      className="learn-chapter transfer-lesson"
      aria-labelledby="srgb-title"
    >
      <p className="chapter-number">Chapter 2</p>
      <h2 id="srgb-title">sRGB</h2>
      <p className="lesson-lead">
        RGBは色を3成分で表す一般的な考え方です。sRGBは、その中でもWebや一般的なディスプレイ環境で広く使われる、具体的なRGB色空間です。
      </p>

      <div className="lesson-copy">
        <p>
          Chapter 1で操作した<code>rgb()</code>
          や8-bit値はsRGBでした。sRGBはRed・Green・Blueの基準色（primaries）、白の基準（white
          point）、数値と光量を結ぶtransfer functionなどを定義しています。
        </p>
        <p>
          今回注目するのはtransfer
          functionです。CSSで普段見る値は保存・伝送に使う
          <strong>encoded sRGB</strong>
          で、ディスプレイが出す光の量に比例する値ではありません。
        </p>
      </div>

      <div
        className="transfer-flow"
        aria-label="sRGBからLinear sRGBへの変換手順"
      >
        <div>
          <strong>sRGB encoded value</strong>
          <span>CSS・8-bit RGBで見る値</span>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <strong>Transfer function decode</strong>
          <span>非線形encodingを戻す</span>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <strong>Linear sRGB</strong>
          <span>光量に比例する値</span>
        </div>
      </div>

      <SrgbDecodeExperiment />

      <div className="lesson-conclusion">
        <p className="eyebrow">Result</p>
        <h3>数値の約50%は、光量の約22%</h3>
        <p>
          つまり、sRGBのencoded値とLinear
          sRGBの値を同じ数として扱うことはできません。まずtransfer
          functionで目的に合う表現へ変換する必要があります。
        </p>
      </div>

      <details className="formula-details">
        <summary>How does the conversion work? — 変換式を見る</summary>
        <div>
          <p>
            0〜1へ正規化したencoded成分を<var>C</var>、linear-light成分を
            <var>
              C<sub>linear</sub>
            </var>
            とすると、decodeは次のpiecewise functionです。
          </p>
          <div
            className="formula"
            aria-label="Encoded sRGB to Linear sRGB formula"
          >
            <code>
              C ≤ 0.04045: C<sub>linear</sub> = C / 12.92
            </code>
            <code>
              C &gt; 0.04045: C<sub>linear</sub> = ((C + 0.055) / 1.055)
              <sup>2.4</sup>
            </code>
          </div>
          <p>
            このような非線形encodingはgamma
            correctionと関連して説明されますが、sRGBは単純な「gamma
            2.2」一本のpower functionではありません。
          </p>
        </div>
      </details>
    </section>
  );
}
