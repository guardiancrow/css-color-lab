import { RGBControls } from '../color/RGBControls';

export function RgbChapter() {
  return (
    <section
      id="rgb"
      className="learn-chapter rgb-lesson"
      aria-labelledby="rgb-title"
    >
      <p className="chapter-number">Chapter 1</p>
      <h2 id="rgb-title">Introduction / Color &amp; RGB</h2>
      <p className="lesson-lead">
        デジタル画面の色は、Red（赤）、Green（緑）、Blue（青）の3つの成分を組み合わせて表現できます。
      </p>

      <div className="lesson-copy">
        <h3>RGBとは</h3>
        <p>
          3つの値は、それぞれの成分の強さを表します。たとえば
          <code>rgb(255 0 0)</code>は赤、<code>rgb(0 255 0)</code>は緑、
          <code>rgb(0 0 255)</code>は青です。
        </p>
        <p>
          すべて最大の<code>rgb(255 255 255)</code>は白、すべて0の
          <code>rgb(0 0 0)</code>は黒になります。
        </p>
        <aside className="lesson-note" aria-label="この章で扱うRGBについて">
          この教材では、まずWebで最も一般的なRGB色空間であるsRGBを使って、RGBの考え方を体験します。sRGBの詳しい仕組みは次の章で扱います。
        </aside>
      </div>

      <RGBControls />

      <div className="try-it">
        <p className="eyebrow">Try it</p>
        <h3>3つの成分だけで色を作ってみよう</h3>
        <ol>
          <li>Redを255にします。</li>
          <li>GreenとBlueを0にします。</li>
          <li>previewとInspectorが純粋な赤へ変わることを確認します。</li>
        </ol>
        <p>
          次に<code>255 255 0</code>のyellow、<code>0 255 255</code>のcyan、
          <code>255 0 255</code>のmagenta、<code>255 255 255</code>
          のwhiteも試してみましょう。
        </p>
      </div>

      <aside className="next-question" aria-labelledby="rgb-next-question">
        <p className="eyebrow">Next question</p>
        <h3 id="rgb-next-question">
          RGBの数値を半分にすると、見た目の明るさも半分になるのでしょうか？
        </h3>
        <p>Chapter 2のsRGBとChapter 3のLinear RGBで確かめます。</p>
      </aside>
    </section>
  );
}
