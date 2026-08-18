# CSS Color Lab

CSS Color Module Level 4 / Level 5 の色空間と色操作を、色に触れながら段階的に学ぶためのWebアプリケーションです。RGBは知っていても、OklabやOkLChがなぜ必要なのか分からない初学者を主な対象にしています。

## 現在のPhase

Phase 14では、PlaygroundへCurrent Color直結のGamut Explorerを追加しています。Learnは順番に理解する教材、Playgroundは同じ1色を複数空間から自由に編集・比較するツールとして責務を分けています。

- `/`: Chapter 1〜10を縦に読む、完成したLearnページ
- `/playground`: Color ConverterとGamut Explorerを備えた実験ツール
- Playground専用wide layout、Current Color summary、native / mapped preview
- sRGB、HSL、Lab、LCh、Oklab、OkLChの双方向editor grid
- Hexと6種類のCSS color syntax、3 gamut statusの同時表示
- 共通Alpha control、Reset、基本色と検証済みwide-gamut preset
- Current Colorと双方向同期するfocused OkLCh Gamut Explorer
- sRGB / Display P3 / Rec.2020の最大Chromaと境界差の数値表示
- 実計算値を位置へ反映する1次元Chroma boundary chart
- 各gamutのin-gamut lower boundaryへCを設定するaction
- 4種類の検証済みgamut presetとCurrent Colorへの適用
- sRGB / Display P3 / Rec.2020 targetを選べるclipping / CSS mapping比較
- stickyな章ナビゲーションとCurrent Color Inspector
- sRGB、Linear sRGB、XYZ D50/D65、HSL、Lab/LCh、Oklab/OkLCh、Display P3、Rec.2020の変換
- 単一の現在色state、alpha、gamut判定、明示的gamut mapping
- 0〜255のsRGB slider／number inputとリアルタイムpreview
- encoded sRGBとLinear sRGBを往復するneutral gray実験
- sRGB／Linear sRGBにおけるblack–white補間の比較
- Current ColorのsRGB → Linear sRGB → XYZ D65変換パイプライン
- RGB原色、relative luminance、sRGB／Display P3のXYZ比較
- Current Colorと双方向同期するHue／Saturation／Lightness editor
- HSL Lightness固定Hue比較とSaturation実験
- Current Colorと双方向同期するLab / LCh editor
- XYZ D65 → XYZ D50 → Lab pipelineとchromatic adaptation
- Lab Lightness、LCh Hue、out-of-sRGB gamutの教材実験
- Current Colorと双方向同期するOklab / OkLCh editor
- Lab D50 pipelineとOklab D65 pipelineの比較
- LCh / OkLChの共有Hue rotation比較とsRGB / Display P3判定
- Current ColorのsRGB / Display P3 / Rec.2020 gamut判定
- OkLCh Chroma / Hue / Lightnessと最大Chroma boundaryの実験
- simple clippingとCSS gamut mappingの数値比較
- sRGB / Linear sRGB / Oklab / OkLChの補間比較
- shorter / longer / increasing / decreasing hueの経路比較
- Engine sampleによるgradient、premultiplied alpha、raw中間色のgamut判定
- CSS `color-mix()` generatorとbrowser-native support preview
- Current ColorをbaseにしたOkLCh relative color syntaxとL / C / h操作
- Relative ColorのEngine計算、browser-native preview、3 gamut判定
- `light-dark()`のscheme simulationとnative preview
- `contrast-color()`のblack / white比較とcontrast ratio
- Modern CSS Color 7機能のruntime detectionと`@supports`例
- Chapter 10からPlaygroundへの明確な導線
- large desktopで余剰幅をmain contentへ配分する3カラムlayout
- proseの読みやすい行長とinteractive contentのwide表示を分離
- Oklab / OkLCh、Gamut、Interpolation、Modern CSS Colorの比較密度調整
- viewport高を超えるnav / Inspectorのsticky scroll対応
- レスポンシブな基本レイアウトとアクセシビリティの土台
- ESLint、Prettier、TypeScript strict mode、Vitest

RGB、HSL、Lab、LCh、Oklab、OkLChのいずれのControlsからcanonical stateを更新しても、ほかのeditor、Current Color Inspector、Playground summary、XYZ / Lab / Oklab pipeline、Current Color gamut status、Chapter 10のrelative color baseがColor Engine経由で再計算されます。各章の固定比較実験とrelative offsetは教材ローカルstateです。

## 技術構成

- Vite
- React / TypeScript
- React Router
- Color.js
- CSS
- Vitest / Testing Library / jsdom
- ESLint / Prettier

React Routerは、今後教材以外の実験ページが増えることを想定し、URLと画面の対応、404、ナビゲーションを宣言的に保つために採用しています。

## 開発方法

Node.js 20.19以上が必要です。

```bash
npm install
npm run dev
```

品質チェックは次のコマンドで実行できます。

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

## ディレクトリ構成

```text
src/
├─ components/
│  ├─ color/        # 現在色を表示・操作する共通UI
│  └─ learn/        # 教材の章と章ナビゲーション
├─ context/          # アプリ全体で共有する現在色state
├─ lib/
│  └─ color/         # UIから独立したColor Engineと表示formatter
├─ pages/            # URL単位の画面
├─ test/             # テストセットアップ
└─ types/            # 色・教材の共有型
```

## 色状態とColor Engine

Hex、HSL、XYZ、Oklabなどを個別の可変stateとして保持しません。アプリ所有のserializableな `{ space, coordinates, alpha }` を単一のcanonical stateとし、各表示はColor Engineを通して導出します。Color.jsオブジェクトをReact stateやUIへ露出させません。

詳しい判断と数値処理方針は[Color Architecture](docs/color-architecture.md)を参照してください。

## sRGB操作のUI境界

RGB Controls自身もcanonical stateをsRGBへ変換して現在値を導出し、独立したR/G/B stateは持ちません。UIでは各channelを0〜255の整数として扱い、Color Engineへ渡す境界で0〜1のsRGB coordinateへ変換します。浮動小数点値は内部では丸めず、0〜255表示へ戻すときだけ整数化します。

number inputは入力途中の空文字や範囲外値を一時的な文字列stateとして許容しますが、canonical stateへ反映する値は0〜255の整数に正規化します。

## sRGB transferと補間

Chapter 2・3の数値変換はUI内の近似式ではなく、Color Engineに隔離したColor.jsのsRGB／Linear sRGB変換を使用します。UIでは8-bit整数や読みやすい桁数に整形しますが、internal coordinateは丸めません。代表値として、8-bit sRGBの128はlinear lightで約0.216、linear lightの0.5は8-bit sRGBで約188になります。

補間helperはsRGBとLinear sRGBを明示的に選択し、alpha-premultiplied座標を計算します。clipやgamut mappingは行いません。Linear sRGBを固定のcanonical representationにはせず、従来の単一canonical color設計を維持しています。この責務境界と教材ローカルstateの判断は[Color Architecture](docs/color-architecture.md)に記録しています。

## XYZ D65

Chapter 4ではXYZ D65を、異なる色空間をつなぐ共通基盤として正式に扱います。Current Colorはencoded sRGBからLinear sRGBへdecodeされ、sRGBのprimariesとD65 white pointに基づく行列変換でXYZ D65になります。D65はsRGBとDisplay P3が採用する標準的な基準白です。

同じ`[1, 0.5, 0]`というcoordinatesをsRGBとDisplay P3として解釈し、それぞれのXYZ値が異なることを比較できます。Display P3比較は教材用のローカル実験であり、Current Colorをwide-gamutで編集する機能ではありません。XYZ計算には元の値を使い、clipやgamut mappingを行いません。previewには各RGB空間のCSS表現を渡すため、見た目の差はブラウザとディスプレイの対応色域に依存します。

## HSL editorと教材実験

Chapter 5ではHSLを、sRGBのRGB値をHue／Saturation／Lightnessとして操作しやすく再構成した表現として扱います。HSL Controlsは独立した永続stateを持たず、単一のCurrent Colorから値を導出し、編集時には同じcanonical stateを更新します。

Hueはcommit時に`[0, 360)`へnormalizeします。例えば`360° → 0°`、`-30° → 330°`、`390° → 30°`です。sRGBから変換した無彩色でHueがmissingの場合、UIでは編集開始値として`0°`を表示します。無彩色上で明示的に編集されたHueはhidden stateではなくcanonical HSL coordinateとして保持され、Saturationを上げるとそのHueが使われます。

Lightness固定Hue比較とSaturation実験はCurrent Colorから分離した教材ローカルstateです。HSL Lightnessはencoded sRGBのmax/minから得る計算上の座標であり、XYZ D65のYで確認するrelative luminanceや知覚的lightnessとは区別します。

## Lab / LCh editorとD50

Chapter 6では、知覚的均等性を目指して設計されたCIE Labと、そのa/b平面をpolar coordinatesへ変換したLChを扱います。CSSの`lab()` / `lch()`はD50基準で定義されるため、sRGB由来のXYZ D65からはColor Engine内部のBradford chromatic adaptationでXYZ D50へ対応づけてからLabへ変換します。

Lab ControlsはL/a/b、LCh ControlsはL/C/hを単一のCurrent Colorから導出し、どちらの編集も同じcanonical stateを更新します。LCh Hueは`[0, 360)`へnormalizeします。C = 0で変換結果のHueがmissingならUIは`0°`をfallback表示し、ユーザーが明示したpowerless Hueはcanonical LCh coordinateとして保持します。

Lab a/b sliderの`-125〜125`とLCh C sliderの`0〜150`はColor.jsのreference rangeに合わせた教材用操作範囲で、数学的な存在範囲や固定上限ではありません。number inputとcanonical stateはa/bやCがslider範囲外でも保持します。

Lab / LCh編集でsRGB gamut外になっても元のcanonical colorをclipしません。gamut判定とCSS Lab / LCh値は元の色から求め、previewとHexだけを既存の明示的なCSS gamut mappingでsRGB表示用に変換します。

## Oklab / OkLCh editorとD65

Chapter 7では、Lab / LChと同じく知覚的均等性を目指しつつ、現代的な画像・UI用途での改善を意図して設計されたOklabと、その円柱形式OkLChを扱います。CSS LabがXYZ D65からD50へのchromatic adaptationを経るのに対し、OklabはD65基準なのでsRGB → Linear sRGB → XYZ D65 → Oklabと進みます。この経路差だけで優劣や正確さを評価するものではありません。

Oklab ControlsはL/a/b、OkLCh ControlsはL/C/hを単一のCurrent Colorから導出します。Lab / LChと軸構造は似ていますが定義とscaleが異なり、数値に互換性はありません。OkLCh Hueは`[0, 360)`へnormalizeします。C = 0で変換Hueがmissingなら`0°`をfallback表示し、ユーザーが明示したpowerless Hueはcanonical OkLCh coordinateとして保持します。

sliderはCSS percentage reference rangeに合わせ、Oklabを`L 0〜1 / a,b −0.4〜0.4`、OkLChを`L 0〜1 / C 0〜0.4 / h 0〜360`とします。これは数学的上限ではありません。number inputとcanonical stateはslider範囲外のa/bと非負Cを保持し、内部精度を表示のために丸めません。internal Lの`0.65`とCSSの`65%`はUIで区別して表示します。

LCh / OkLCh Hue比較は、それぞれのscaleに適した独立したL/Cを固定し、共有Hueだけを教材ローカルstateで回します。各色はsRGBとDisplay P3のgamut状態を文字で示します。out-of-sRGBでも元のcanonical座標は保持し、swatchとHexだけを明示的にsRGB mappingします。OkLChはLightness、Chroma、Hueを分離してtheme variationやgradientを設計しやすく、wide-gamut値も表現できますが、完全な知覚モデルではなくgamut制約も残ります。

## Gamut、clipping、mapping

Chapter 8では、color spaceを色の座標系、gamutを特定の表現系やdeviceが扱える色の範囲として分けます。sRGB、Display P3、Rec.2020のRGB gamutを比較し、広いgamutはより多くの色を表現できる一方、常に用途上優れているとは限らないことを説明します。

Current Colorは3 gamutに対して元のcanonical colorを直接判定します。教材ローカルのOkLCh実験ではL/C/hを操作でき、現在のL/hにおける各gamut内の最大Chromaをtolerance `0.00001`のbinary searchで探索します。探索中にmappingやclippingは行わず、元OkLCh色への`isInColorGamut`だけを使用します。4つのpresetで、sRGB内、sRGB外/P3内、P3外/Rec.2020内、Rec.2020外を確認できます。

`clipColorToGamut`はtarget RGBへ変換したchannelを単純に範囲内へ切り詰め、`mapColorToGamut(..., 'css')`はCSS方式のgamut mappingを明示的に実行します。どちらも新しいcanonical valueを返し、元色を変更しません。mapped／clipped結果はColor.jsが元空間で返すため、Color Engine境界でtarget RGBへ明示変換してからtag付けします。

CSS例として`color(display-p3 ...)`、`color(rec2020 ...)`、`oklch(...)`を示します。OkLChとDisplay P3は同義ではありません。original CSS previewと明示的sRGB mapped previewを分離しますが、wide-gamut側の実際の見え方はbrowser、OS color management、display capabilityに依存します。`color-gamut` media featureも能力の目安であり、正確なdisplay診断ではありません。

## Color interpolation

Chapter 9では同じ2色をsRGB、Linear sRGB、Oklab、OkLChで補間します。端点presetとmix位置は教材ローカルstateであり、Current Colorを変更しません。各gradient stripはbrowser任せの2-stop gradientではなく、Color Engineが25点を計算し、各点を表示時だけ明示的にsRGB gamut mappingして作ります。結果カードは補間空間の座標、raw sRGB、OkLCh、sRGB / Display P3 / Rec.2020のgamut状態を別々に示します。

`interpolateColors`はCSSのmissing component carry-forward、OkLChのpowerless Hue、4つのHue interpolation method、alpha premultiplicationを扱います。補間中のcanonical valueはclipもmappingもしません。従来の`interpolateRgbColors`は互換wrapperとして残します。

generatorはEngineでserializeした端点から、interpolation spaceと必要なHue methodを明示する`color-mix()`を作ります。`CSS.supports()`とbrowser-native previewは実装確認用で、Engineの計算結果を置き換えるものではありません。

## Modern CSS Color

Chapter 10ではCurrent Colorをoriginとして`oklch(from var(--base) l c h)`を作り、L / C / h offsetを同時操作します。Relative OkLCh内のcomponent keywordはnumberで、Lは1.0が100%、Cは0.4が100%、Hueはdegree相当です。EngineはbaseをOkLChへ変換して同じ操作を再現し、raw resultを保持します。browser-native relative syntaxは独立したpreviewとして扱い、対応しなくてもEngine結果、gamut状態、generated CSSは残ります。

`color-mix()`は複数色の補間、relative colorは一つのoriginのchannel操作として整理します。`light-dark()`は`color-scheme`に応じたvalue選択を教材simulationとnative CSSで比較します。`contrast-color()`はblack / whiteを返す現行定義を紹介し、Engine欄ではWCAG 2.x contrast ratioを表示します。厳密なnative選択algorithmはUA定義なので、両結果を同一視しません。

`CSS.supports()`でrelative colors、`color-mix()`、`light-dark()`、`contrast-color()`、Oklab、OkLCh、Display P3 syntaxをruntime判定します。未対応時も教材を無効化せず、native previewだけをfallback表示にします。CSS側のprogressive enhancementとしてfallback declarationと`@supports`を併記しています。

## Learn layout

Learn pageは最大`148rem`まで利用し、large desktopではNavigation `180〜220px`、Current Color Inspector `220〜260px`に抑え、残りを教材main trackへ配分します。従来のmain上限`720px`は廃止しました。Chapter cardはmain track全体を利用しますが、lead、本文、note、conclusionなどのproseは最大`48rem`に制限し、読みやすい行長を維持します。

主要breakpointは次のとおりです。

- `1600px`以上: Gamutの3操作を横並びにしてwide trackを活用
- `1500px`以下: Navigation + mainの2カラム。InspectorはNavigation下へ移動し、sidebarがmainを圧迫しない構成
- `1000px`以下: Lab / LCh、Oklab / OkLCh editor比較を1列化
- `760px`以下: Learn全体を1カラム化し、stickyを解除

3カラム時のNavigationとInspectorにはviewport基準の最大高さと縦overflowを設定し、低いdesktop viewportでも全項目へ到達できるようにしています。code、長いCSS serialization、coordinate表示はpage全体を押し広げず、個別wrapまたはcode block内scrollで処理します。

## Playground Color Converter

PlaygroundはLearnの3カラムを再利用せず、最大`148rem`のinteraction areaを使う専用layoutです。上部にCurrent Color summary、下部に`sRGB / HSL`、`Lab / LCh`、`Oklab / OkLCh`の2列editor gridを配置します。`1100px`以下でeditorを1列化し、`760px`以下ではsummary、gamut、presetも1列の自然な順序にします。

6つのeditorはLearnと同じControlsをそのまま再利用し、すべてContext内の単一`CanonicalColor`を参照します。Resetは`#D27A43`へ戻し、presetはsRGB基本色、neutral gray、Phase 9で検証済みの「sRGB外 / Display P3内」のOkLCh色を提供します。Alphaは各editorへ重複させず、summaryに共通のrange / number inputを1つ置きます。色空間を変更しても既存alphaは保持されます。

summaryはColor Engineのserializerを通した`rgb()`、`hsl()`、`lab()`、`lch()`、`oklab()`、`oklch()`とHexを表示します。sRGB外のcanonical colorは変更せず、Hexとmapped previewだけをCSS方式でsRGBへmappingして注記します。Native / original previewは元のCSS表現をbrowserへ渡す独立した描画確認であり、Engineの計算結果として読み戻しません。sRGB、Display P3、Rec.2020の判定もmapping前のcanonical colorに対して行います。

## Playground Gamut Explorer

Gamut ExplorerはColor Converterと同じ`CanonicalColor`を直接参照し、focused OkLCh ControlsからL / C / hを操作します。Converter側の変更はExplorerへ、Explorer側の変更はConverter、Summary、CSS syntaxへ即時反映されます。Playground内にはColor Converter / Gamut Explorerへのanchor navigationを置き、機能を非表示にするtab stateは追加していません。

現在のL / hについて既存`findMaxChromaForGamut`を3 gamutへ適用し、sRGB、Display P3、Rec.2020それぞれのin-gamut側の最大Cを求めます。Current Cとの差を`remaining`または`outside boundary`で表示し、実計算値と動的scaleからChroma axis上のmarker位置を算出します。各boundary actionはbinary searchが返すlower boundへCurrent Cを設定します。Phase 9の4 gamut presetもCurrent Colorへ適用します。

Original / Simple clipping / CSS gamut mapping比較ではtargetをsRGB、Display P3、Rec.2020から選択できます。既存のclip / map APIからtarget RGB coordinates、resulting OkLCh、ΔL / ΔC / Δh、target gamut statusを導出します。これらは表示用の派生結果で、Original canonical colorを暗黙に変更しません。L / C / h操作時の3 boundary計算はCurrent Color単位で`useMemo`し、複雑なcache layerは追加していません。

## 対象ブラウザ

最新のChromium系ブラウザとFirefoxを対象とします。特定ブラウザ専用APIには依存しません。
