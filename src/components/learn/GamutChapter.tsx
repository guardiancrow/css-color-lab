import { ClippingMappingComparison } from '../color/ClippingMappingComparison';
import { CurrentColorGamutStatus } from '../color/CurrentColorGamutStatus';
import { OklchGamutExperiment } from '../color/OklchGamutExperiment';

export function GamutChapter() {
  return (
    <section
      id="gamut"
      className="learn-chapter gamut-lesson"
      aria-labelledby="gamut-title"
    >
      <p className="chapter-number">Chapter 8</p>
      <h2 id="gamut-title">Gamut</h2>
      <p className="lesson-lead">
        Chapter
        7では、OkLChでChromaを上げるとsRGB外になる色がありました。その色は「存在しない」のではなく、sRGBという特定のRGB表示系ではそのまま表せない色です。
      </p>

      <div className="space-gamut-distinction">
        <article>
          <p className="eyebrow">Color space</p>
          <h3>色を座標として表す仕組み</h3>
          <p>例: OkLChのL / C / h、sRGBのR / G / B</p>
        </article>
        <strong aria-hidden="true">≠</strong>
        <article>
          <p className="eyebrow">Gamut</p>
          <h3>ある表現系やdeviceが扱える色の範囲</h3>
          <p>例: sRGB gamut、Display P3 gamut</p>
        </article>
      </div>
      <p className="lesson-note">
        sRGBはcolor spaceの名前でもあり、その有効なRGB
        coordinatesが作る範囲をsRGB gamutと呼びます。OkLChは「Display
        P3より広い箱」ではなく、sRGB gamut外の座標も表せる別の座標系です。
      </p>

      <div
        className="gamut-range-summary"
        aria-label="Conceptual RGB gamut size comparison"
      >
        <article>
          <span
            className="gamut-range-mark gamut-range-srgb"
            aria-hidden="true"
          />
          <h3>sRGB</h3>
          <p>Webで最も身近な基準。3つの中では最も狭い色度範囲です。</p>
        </article>
        <article>
          <span
            className="gamut-range-mark gamut-range-p3"
            aria-hidden="true"
          />
          <h3>Display P3</h3>
          <p>sRGBより広いRGB gamut。対応displayでより広い範囲を表せます。</p>
        </article>
        <article>
          <span
            className="gamut-range-mark gamut-range-rec2020"
            aria-hidden="true"
          />
          <h3>Rec.2020</h3>
          <p>
            さらに広いRGB
            gamut。広いことが常に用途上betterという意味ではありません。
          </p>
        </article>
      </div>
      <p className="lesson-note">
        ここではxy色度範囲の概念として、おおむねsRGB ⊂ Display P3 ⊂
        Rec.2020と捉えます。各RGB color
        spaceの完全な定義にはprimaries以外にwhite pointやtransfer
        functionも含まれます。
      </p>

      <CurrentColorGamutStatus />
      <OklchGamutExperiment />

      <div className="lesson-copy">
        <h3>表示可能範囲へ移す、二つの考え方</h3>
        <p>
          raw
          sRGB変換でchannelが0未満または1超過ならsRGB外です。単純なclippingは各channelを境界へ切り詰めます。gamut
          mappingは、見た目の変化を抑えることを目指して別のin-gamut色を探します。
        </p>
      </div>
      <ClippingMappingComparison />

      <div className="lesson-copy wide-css-explanation">
        <h3>CSSはsRGB外の色も指定できる</h3>
        <pre aria-label="CSS wide gamut color syntax examples">
          <code>{`color: color(display-p3 0.9 0.2 0.1);
color: color(rec2020 0.75 0.2 0.1);
color: oklch(70% 0.22 20);`}</code>
        </pre>
        <p>
          <code>oklch()</code>と<code>color(display-p3 ...)</code>
          は同義ではありません。前者はOkLCh座標、後者はDisplay P3 RGB
          coordinatesです。どちらもsRGB外の色を指定できます。
        </p>
        <p>
          ブラウザがCSS構文をsupportしていても、最終的な見え方はOSのcolor
          managementとdisplay capabilityに依存します。
          <code>(color-gamut: p3)</code>
          も能力の目安であり、monitorの正確さを診断するものではありません。
        </p>
      </div>

      <div className="lesson-conclusion">
        <p className="eyebrow">Coordinates, boundary, compromise</p>
        <h3>元色・判定・表示用変換を分けて考える</h3>
        <p>
          このアプリがこれまでout-of-gamut canonical
          colorを保持し、previewだけを明示的にmappingしてきた理由がここにあります。gamut外色を有限gamutへ表示するには妥協が必要ですが、計算前に元座標を失う必要はありません。
        </p>
      </div>

      <aside className="next-question" aria-labelledby="gamut-next-question">
        <p className="eyebrow">Next question</p>
        <h3 id="gamut-next-question">
          同じ2色でも、途中の色をどの色空間で計算するかで結果は変わるのでしょうか？
        </h3>
        <p>
          次はsRGB、Linear sRGB、Oklab、OkLChのinterpolationを比較し、CSS
          <code>color-mix()</code>へつながる考え方を学びます。
        </p>
      </aside>
    </section>
  );
}
