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
- `isInColorGamut`: 元の値を変更せずgamutを判定する
- `mapColorToGamut`: 呼び出し側が明示した場合だけlossy mappingする
- `serializeColor`: Color Engineの値をCSS境界へ渡す

Contextは現在色と汎用更新関数だけを共有する。channel固有setterは持たない。ReduxやZustandを必要とする状態量・更新関係がないため、React Contextと`useState`を使用する。

Phase 3のRGB Controlsは、canonical stateを毎render時にsRGBへ変換して0〜255のUI値を導出する。操作時には変更後の3channelをsRGBのcanonical valueとして保存し、既存alphaを保持する。HSL、XYZ、Oklabなどは引き続き派生値であり、個別stateにはしない。

## Numeric and gamut policy

- 内部座標はJavaScriptの`number`とColor.jsの計算精度を維持し、丸めない。
- UI用の桁数調整は表示formatterとUI境界helperだけで行う。
- sRGB Controlsでは`srgb8Bit` helperだけが0〜1座標と0〜255整数の境界変換を担当する。浮動小数点誤差の整数化はUI境界でのみ行う。
- alphaは常にcanonical valueに含め、`0`から`1`を許可する。変換時にも保持する。
- RGB座標が基準範囲外でも受け入れ、暗黙にclipしない。
- 変換、gamut判定、gamut mappingは別操作とする。
- gamut mappingの既定手法はCSS Color 4方式だが、`mapColorToGamut`の明示呼び出しなしには実行しない。
- Hexと画面上のpreviewは有限gamutを必要とするため、Inspectorが明示的にsRGB mappingを指定する。生のsRGB変換値とgamut状態は別に表示する。
- ブラウザの`CSS.supports()`やレンダリング結果を変換計算の情報源にしない。CSS serializationはEngineからブラウザへ渡す境界として扱う。

## Supported spaces in Phase 2

`srgb`、`srgb-linear`、`xyz-d65`、`xyz-d50`、`hsl`、`lab`、`lch`、`oklab`、`oklch`、`display-p3`を型と変換対象として扱う。
