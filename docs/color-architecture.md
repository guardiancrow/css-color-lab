# Color Architecture

## Library decision

Phase 2ではColor.js 0.7を採用する。

| 候補      | 評価                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color.js  | TypeScript型、ESM、tree-shakable APIを提供。必要なCSS Color 4色空間、任意空間変換、alpha、gamut判定・mappingを網羅する。CSS Color仕様の共同編集者が開発しており、仕様に近い挙動を教材化する目的に最も適する。 |
| Culori    | 対応空間と関数型APIは有力で、代替候補として妥当。ただし標準パッケージのTypeScript型と仕様編集者による直接的な設計という点ではColor.jsに及ばない。                                                             |
| Chroma.js | 軽量で成熟しているが、XYZ D50/D65、Linear sRGB、Display P3を含む今回の対象全体の基盤には不足する。                                                                                                            |

Color.jsは`src/lib/color`の内部に隔離する。UIやContextからライブラリAPIを直接呼ばないため、将来の交換可能性を維持する。

## Canonical color representation

React stateには、アプリが所有する次のimmutableかつserializableな値を1つだけ保持する。

```ts
interface CanonicalColor {
  space: ColorSpaceId;
  coordinates: readonly [number | null, number | null, number | null];
  alpha: number;
}
```

特定の固定色空間やColor.jsオブジェクトをcanonicalにはしない。入力元の色空間をtagとして保持することで、wide-gamut／out-of-gamut座標とCSS上の表現意図を失わず、URLやlocalStorageへ保存できる。`null`は無彩色のhueなど、CSSのmissing/powerless componentを表せる。

## Boundaries and API

```text
React UI
  ↓ useCurrentColor()
serializable CanonicalColor (Context)
  ↓
Color Engine
  ↓ temporary objects only
Color.js
```

Color Engineの公開責務は次に限定する。

- `createColor`: 検証済みcanonical valueを作る
- `convertColor` / `getColorCoordinates`: 丸めずに別空間へ変換する
- `getRelativeLuminance`: gamut mappingせずXYZ D65のYを取得する
- `isInColorGamut`: 元の値を変更せずgamutを判定する
- `clipColorToGamut`: 呼び出し側が明示したtarget RGBへsimple clippingする
- `mapColorToGamut`: 呼び出し側が明示した場合だけlossy mappingする
- `serializeColor`: Color Engineの値をCSS境界へ渡す
- `interpolateColors`: 補間空間と必要なHue methodを明示し、gamut mappingせずに2色を補間する
- `interpolateRgbColors`: Phase 4からのsRGB／Linear sRGB用compatibility wrapper

Contextは現在色と汎用更新関数だけを共有する。channel固有setterは持たない。ReduxやZustandを必要とする状態量・更新関係がないため、React Contextと`useState`を使用する。

Phase 3のRGB Controlsは、canonical stateを毎render時にsRGBへ変換して0〜255のUI値を導出する。操作時には変更後の3channelをsRGBのcanonical valueとして保存し、既存alphaを保持する。HSL、XYZ、Oklabなどは引き続き派生値であり、個別stateにはしない。

Phase 4のtransfer function教材は、Color Engineの`sRGB`と`sRGB_Linear`間の変換を利用する。教材UI内に式を再実装せず、`srgbTransfer` helperがneutral grayの1channel値とEngineの境界を担当する。UIでは8-bit整数または桁数を制限した値を表示するが、Engineへ渡すinternal coordinateは0〜1の浮動小数点精度を維持する。Chapter 2・3のsliderは比較の基準値を安定して残すための教材ローカルstateであり、アプリ全体の「現在色」とは意図的に分離する。各実験には、その操作がCurrent Colorを変更しないことを明記する。Linear sRGBを固定のcanonical representationへ変更したわけではなく、従来どおり入力空間tagを保持する単一のcanonical colorを使用する。

Phase 4のRGB補間APIは直交座標の`sRGB`と`sRGB_Linear`を扱い、Phase 10では明示的なoptionsを持つ汎用`interpolateColors`へ実装を集約する。旧APIは既存教材とのcompatibility wrapperとして維持する。

Phase 5のXYZ教材は既存の`convertColor`を順に呼び、encoded sRGB → Linear sRGB → XYZ D65という学習用pipelineを組み立てる。Color Engineにはすでに必要な空間と任意空間変換があるため、XYZ専用の重複APIは追加しない。`xyzLesson` helperは変換を実装せず、3段階のserializableな座標を教材へ渡す表示モデルだけを担当する。

XYZ D65は特定ディスプレイのRGB channelではなく、異なる色空間間の共通基盤として扱う。D65はsRGBとDisplay P3のwhite pointである。Current Color pipelineだけが共有canonical stateを参照し、RGB primaries、neutral gray、sRGB／Display P3比較は教材ローカルstateまたは固定値とする。Display P3をCurrent Colorへ設定するeditorはPhase 5に含めない。

sRGB／Display P3比較では同じcoordinatesからそれぞれ直接XYZ D65を計算し、暗黙のclipやgamut mappingを行わない。previewだけは元のRGB空間のCSS serializationをブラウザへ渡す。したがって計算値はdisplay gamutに依存しない一方、実際のpreviewはブラウザ・ディスプレイ環境に依存する。

Phase 6のHSL ControlsはRGB Controlsと同様に、canonical colorから毎renderでHSL座標を導出する。H／S／Lを別の永続stateとして保持しない。操作すると既存alphaを保った`hsl` tagged canonical valueを作るため、RGB Controls、Inspector、XYZ pipelineも同じ色から再計算される。number inputの入力途中に限り、各channel component内で一時的な文字列stateを持つ。

Hueはcommit時に剰余で`[0, 360)`へnormalizeし、SaturationとLightnessは`[0, 100]`へclampする。RGB等から無彩色をHSLへ変換してHueがmissingになった場合、editorは追加のhidden Hue stateを作らず`0°`をfallback表示する。ユーザーがgray上でHueを編集した場合は、明示されたpowerless Hueをcanonical HSL coordinateとして保持するため、その後Saturationを上げても選択したHueを利用できる。

HSL Lightness固定Hue比較とSaturation比較は教材ローカルstateであり、Current Colorを変更しない。relative luminanceはColor Engineの`getRelativeLuminance`がXYZ D65のYを返す。HSL UIや教材内に輝度式を重複実装せず、clipやgamut mappingも行わない。Hue stripのCSS gradientは操作補助であり、色変換計算の情報源にはしない。

Phase 7のLab / LCh Controlsもcanonical colorから毎renderで座標を導出し、L/a/bまたはL/C/hを別の永続stateとして持たない。編集時は既存alphaを保った`lab`または`lch` tagged canonical valueを作るため、RGB、HSL、XYZ pipeline、Inspectorも同じ色から再計算される。教材用Lab Lightness実験とLCh Hue実験だけがCurrent Colorから分離したlocal stateを持つ。

Lab変換pipelineは既存`convertColor`をXYZ D65 → XYZ D50 → Labの順に構成する。D65 → D50 chromatic adaptationの実装はColor Engine内部のColor.jsへ委譲し、React UIや`lab` helperへBradford行列を重複実装しない。CSSの`lab()` / `lch()`はD50基準として扱う。

Lab a/b sliderは`-125〜125`、LCh C sliderは`0〜150`を教材用reference rangeとする。これらは数学的上限ではなく、number inputとcanonical stateはslider範囲外のa/bおよび非負Cも保持する。Lは`0〜100`、Cは0以上へ制約する。LCh Hueは`[0, 360)`へnormalizeする。C = 0で変換Hueがmissingならeditorは`0°`をfallback表示し、明示編集したpowerless Hueはhidden stateではなくcanonical LCh coordinateとして保持する。

Lab / LCh canonical colorがsRGB gamut外でもclipまたはmappingしない。`isInColorGamut`は元の色を判定し、CSS Lab / LCh serializationも元座標を使う。画面swatchとHexだけが`mapColorToGamut(..., 'srgb', 'css')`を明示的に呼び、UIにはoriginal colorを保持したmapped previewであることを表示する。

Phase 8のOklab / OkLCh Controlsも同じ方針で、canonical colorから毎renderでL/a/bまたはL/C/hを導出する。Color EngineにはPhase 2から両空間が登録済みで、任意変換、serialization、sRGB / Display P3判定が揃っているため公開APIを追加しない。`oklab` helperはUIのreference range、入力commit、Hue normalization、XYZ D65 → Oklab教材pipelineだけを担当する。

OklabはD65基準なので、sRGB由来の変換はencoded sRGB → Linear sRGB → XYZ D65 → Oklabと構成する。CSS LabのXYZ D65 → XYZ D50 chromatic adaptationを含む経路と並べて表示するが、経路の長さを正確さや優劣とは結びつけない。OklabのL/a/bとLabのL/a/b、OkLChのL/C/hとLChのL/C/hは構造が似ていても定義とscaleが異なり、数値には互換性がない。

Oklab a/b sliderはCSS percentage reference rangeの`-0.4〜0.4`、OkLCh C sliderは`0〜0.4`を教材用範囲とする。Lは内部coordinateの`0〜1`、Hueは`0〜360`を使う。a/b/Cは理論上unboundedなので、number inputとcanonical stateはslider外のa/bと非負Cを保持する。OkLCh Hueは`[0, 360)`へnormalizeし、C = 0で変換Hueがmissingなら`0°`をfallback表示する。明示編集されたpowerless Hueはhidden stateではなくcanonical OkLCh coordinateへ保持する。

LCh / OkLCh Hue比較はCurrent Color editorではなく教材ローカル実験であり、各空間のscaleに適したL/Cを別々に固定し、共有Hueだけをlocal stateにする。元のLCh / OkLCh座標についてsRGBとDisplay P3をそれぞれ判定し、previewだけを必要に応じて明示的にsRGB mappingする。canonical座標、計算値、gamut状態はmapping前の値を維持する。

Phase 9では`rec2020`をColor Engineの変換対象と`GamutSpaceId`へ追加する。Current ColorのsRGB / Display P3 / Rec.2020判定は共有canonical stateから毎renderで導出する。OkLCh Chroma / Hue / Lightness実験、preset、clipping / mapping比較は教材ローカルstateまたは固定値であり、Current Color editorとは分離する。

`findMaxChromaForGamut`は固定L/hのOkLCh ray上で、元色への`isInColorGamut`だけを使ってbinary searchする。初期upper boundをC = 0.4とし、必要ならout-of-gamutを見つけるまで拡張する。既定toleranceは`0.00001`で、返すlower boundはin-gamut、対応するupper boundはout-of-gamutである。探索中にclipやmappingを行わない。

simple clippingは新しい`clipColorToGamut`で明示し、CSS方式の`mapColorToGamut`とAPIを分ける。Color.jsの`toGamut`はmapped colorをorigin spaceで返すため、両APIは結果をtarget RGB spaceへ明示変換してからcanonical valueを作る。元canonical colorはimmutableで変更しない。教材はraw target RGB、resulting RGB、resulting OkLCh、originalとの差分を別々に表示する。

wide-gamut previewはoriginal CSS syntaxと明示的sRGB mapped previewを区別する。`color(display-p3 ...)`や`color(rec2020 ...)`のserializationは元値から導出し、表示能力を計算の根拠にはしない。browserのsyntax support、OS color management、display gamutによって実際の見え方が異なり、`color-gamut` media featureも近似的なcapability hintに留まる。

Phase 10の補間対象は`sRGB`、`sRGB_Linear`、`Oklab`、`OkLCh`とする。両端を指定空間へ変換してからmissing componentをcarry forwardし、OkLChではCが`0.000004`以下のpowerless Hueをmissingとして扱う。polar Hueには`shorter`、`longer`、`increasing`、`decreasing`のCSS Hue fixupを適用する。rectangular coordinatesは全成分、OkLChはL/Cだけをalpha-premultiplyし、Hueはpremultiplyしない。

Color.js 0.7のrange APIは補間前にendpointへgamut処理を行うため、この章のraw intermediate保持方針にはそのまま使用しない。色空間変換は引き続きColor.jsへ委譲し、missing component、Hue fixup、premultiplied alphaのCSS補間手順はColor Engine wrapperが明示的に構成する。

補間APIはraw intermediateを返し、clipもgamut mappingも行わない。教材のswatchとEngine-sampled gradient stopだけが、表示境界で必要に応じて`mapColorToGamut(..., 'srgb')`を明示する。`color-mix()` generatorはEngineのserializationからCSSを作り、browser-native previewと`CSS.supports()`は参考表示に限定する。

Phase 11のRelative Color実験は共有Current Colorを読み取り専用のbaseとし、Lightness / Chroma / Hue offsetだけを教材local stateにする。`deriveRelativeOklch`はbaseをOkLChへ変換し、L / C / hをraw coordinateとして操作する。Lは1.0 = 100%、Cは0.4 = 100%、Hueはdegree相当のnumberというCSS relative component semanticsをserializationとUIの両方で維持する。resultは暗黙にclipまたはmappingせず、previewだけを必要に応じて明示的にsRGB mappingする。

`serializeRelativeOklch`はCSS構文生成だけを担当し、browser computed styleをEngineのexpected値として読み戻さない。browser-native relative color、`light-dark()`、`contrast-color()`のpreviewはCSS engineによる独立した実装確認である。未対応時はnative previewだけをfallback表示へ切り替え、Engine計算、simulation、説明、code outputは維持する。

`calculateContrastRatio`は既存`getRelativeLuminance`からWCAG 2.x ratioを導出し、`analyzeBlackWhiteContrast`は教材用にblack / whiteの大きいratioを選ぶ。現行`contrast-color()`もblack / whiteの最大contrastを選ぶが、厳密なalgorithmはUA定義であるため、Engine選択をnative resultの再実装やexpected値とは扱わない。ratioだけでfont、size、周辺色を含むaccessibilityを保証しない。

runtime feature detectionは`modernCssSupport`へ隔離し、`CSS.supports('color', value)`で7つの構文を判定する。状態は`Supported`、`Unsupported`、`Detection unavailable`を文字で表示する。この判定はsyntax supportだけを対象とし、display gamut、OS color management、描画精度は判定しない。

Phase 13のPlayground Color ConverterはLearn用wrapperを複製せず、既存のRGB、HSL、Lab、LCh、Oklab、OkLCh Controlsを同じColorProvider配下へ同時配置する。各Controlsはcanonical colorから派生値を取得し、編集元空間で新しいcanonical valueを保存するため、6 editor、CSS summary、preview、gamut判定が一方向の導出関係を維持する。6空間分の永続stateやColor.js objectは追加しない。

Playground presentationは`playgroundColor` helperへ集約する。6種類のCSS syntaxとHexは`serializeColor`、3 gamut判定は既存gamut helperを利用し、React内で変換値を手組みしない。Phase 9で期待gamutをテスト済みのOkLCh presetをwide-gamut例として再利用する。Native previewはsource spaceのserializationをbrowserへ渡し、mapped previewとHexだけが明示的なsRGB CSS gamut mappingを使う。元canonical coordinatesは置換しない。

Alpha editorはPlayground summaryに1つだけ置き、同じspace / coordinatesからalphaだけを変更したcanonical valueを作る。各space editorの既存更新helperはprevious colorのalphaを引き継ぐため、色操作後も透明度を保持する。number inputの不正な一時文字列はUI local draftに留まり、NaNやInfinityをcanonical stateへ渡さない。

## Numeric and gamut policy

- 内部座標はJavaScriptの`number`とColor.jsの計算精度を維持し、丸めない。
- UI用の桁数調整は表示formatterとUI境界helperだけで行う。
- sRGB Controlsでは`srgb8Bit` helperだけが0〜1座標と0〜255整数の境界変換を担当する。浮動小数点誤差の整数化はUI境界でのみ行う。
- alphaは常にcanonical valueに含め、`0`から`1`を許可する。変換時にも保持する。
- RGB座標が基準範囲外でも受け入れ、暗黙にclipしない。
- 変換、gamut判定、gamut mappingは別操作とする。
- simple clippingも`clipColorToGamut`による明示操作とし、gamut mappingとは区別する。
- gamut mappingの既定手法はCSS Color 4方式だが、`mapColorToGamut`の明示呼び出しなしには実行しない。
- Hexと画面上のpreviewは有限gamutを必要とするため、Inspectorが明示的にsRGB mappingを指定する。生のsRGB変換値とgamut状態は別に表示する。
- ブラウザの`CSS.supports()`やレンダリング結果を変換計算の情報源にしない。CSS serializationはEngineからブラウザへ渡す境界として扱う。

## Supported spaces

`srgb`、`srgb-linear`、`xyz-d65`、`xyz-d50`、`hsl`、`lab`、`lch`、`oklab`、`oklch`、`display-p3`、`rec2020`を型と変換対象として扱う。
