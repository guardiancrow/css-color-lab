# CSS Color Lab

An interactive Japanese learning app and playground for CSS Color 4/5, color spaces, gamut mapping, and interpolation.

CSS Color Module Level 4 / Level 5の色空間と色操作を、色に触れながら学ぶWebアプリケーションです。RGBは知っていても、OklabやOkLChがなぜ必要なのか分からない初学者を主な対象にしています。教材とUIの主言語は日本語です。

アプリ本体の最初の完成版は`v1.0.0`です。開発過程とreleaseの区切りは[Development Notes](docs/development.md)にまとめています。

## Learn

`/`では、次の10章を順番に学びます。共通のCurrent Colorを操作するeditorと、条件を固定して比較する教材実験があります。

| Chapter | 内容                           |
| ------- | ------------------------------ |
| 1       | Introduction / Color & RGB     |
| 2       | sRGBとtransfer function        |
| 3       | Linear sRGBと光量・補間        |
| 4       | XYZ D65とRGB色空間の比較       |
| 5       | HSL                            |
| 6       | Lab / LChとD50                 |
| 7       | Oklab / OkLChとD65             |
| 8       | Gamut、clipping、mapping       |
| 9       | Color interpolationとHueの経路 |
| 10      | Modern CSS Color               |

## Playground

`/playground`では、4つのtoolを使って色の変換・比較とCSS生成を試せます。

| Tool                              | できること                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------- |
| Color Converter                   | sRGB、HSL、Lab、LCh、Oklab、OkLChの編集、Alpha操作、HexとCSS構文の確認            |
| Gamut Explorer                    | sRGB、Display P3、Rec.2020の境界探索と、simple clipping / CSS gamut mappingの比較 |
| Interpolation / Gradient Explorer | 同じ2色をsRGB、Linear sRGB、Oklab、OkLChで補間し、Hue methodとalphaの影響を比較   |
| Modern CSS Tools                  | Relative Color、`color-mix()`、`light-dark()`、`contrast-color()`の実験とCSS生成  |

Color ConverterとGamut Explorerは同じCurrent Colorを編集します。Interpolationの端点とModern CSS Toolsの作業用の色は独立して保持し、Import / ApplyでCurrent Colorと連携します。

## 主な特徴

- sRGBからwide-gamutまで、色座標・CSS構文・gamut状態を同時に確認
- 元の色とsRGBへmappingしたpreviewを分けて表示
- 4つの補間空間とshorter / longer / increasing / decreasing Hue methodを比較
- Modern CSSの対応状況を実行時に判定し、生成したCSSをcopy
- Responsive layout、keyboard操作、Forced Colorsとreduced motionへの対応

## Browser support

最新のChromium系ブラウザとFirefoxを対象にしています。Relative Color、`color-mix()`、`light-dark()`、`contrast-color()`、Oklab / OkLCh、Display P3、Rec.2020のnative構文対応は、実行時の`CSS.supports()`で判定します。未対応の構文があっても、Engineの計算結果、生成CSS、教材の説明を利用できます。

Wide-gamut previewの見え方はbrowser、OSのcolor management、displayの対応色域に依存します。Engineの計算結果とbrowser-native previewは別々に表示します。

## 起動方法

Node.js 24.15以上の24系を推奨します。対応範囲は22.22.2以上の22系、24.15以上の24系、または26以上です。Viteだけでなく、固定済みのtest / lint dependencyの要件も含みます。正確な範囲は`package.json`の`engines.node`を参照してください。

```bash
npm install
npm run dev
```

Lockfileどおりにdependencyをinstallする場合は、`npm install`の代わりに`npm ci`を使用できます。

## Test / build

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Production buildをローカルで確認する場合は、build後にpreview serverを起動します。

```bash
npm run preview
```

Build結果は`dist/`に出力します。`dist/`はGit管理対象に含めません。実機での確認項目は[Manual QA](docs/manual-qa.md)を参照してください。

## Architecture overview

Vite、React、TypeScript、React Router、Color.jsを使用しています。TestsはVitest / Testing Library / jsdom、静的チェックはESLint / Prettierで実行します。

色はアプリ所有のserializableな`{ space, coordinates, alpha }`を単一のcanonical stateとして保持し、各editorと表示値をColor Engine経由で導出します。色空間変換は主にColor.jsへ委譲し、変換・gamut判定・clipping・mappingを別の操作として扱います。内部座標は表示のために丸めず、previewとHexに必要なmappingだけを明示的に行います。

`src/components/`は教材・色操作UI、`src/context/`はCurrent Color、`src/lib/color/`はColor Engineとhelper、`src/pages/`はLearn / Playgroundを担当します。詳細は[Color Architecture](docs/color-architecture.md)を参照してください。

## License / attribution

Project licenseは未設定です。MIT Licenseを採用する方針ですが、copyright holderの確定後にLICENSEとpackage metadataへ反映します。この記述はMIT Licenseの付与を意味しません。第三者dependencyのlicenseは、それぞれの配布条件に従います。

### References

- [CSS Color Module Level 4 — W3C](https://www.w3.org/TR/css-color-4/)：sRGB transfer、XYZ / Bradford行列、missing component、Hue interpolation、premultiplied alphaなどの参照元。[Sample conversion code](https://www.w3.org/TR/css-color-4/#color-conversion-code)は数値testの出典にも使用しています。
- [CSS Color Module Level 5 — W3C](https://www.w3.org/TR/css-color-5/)：relative colors、`color-mix()`、`light-dark()`、`contrast-color()`の参照元。
- [A perceptual color space for image processing — Björn Ottosson](https://bottosson.github.io/posts/oklab/)：Oklabの原典。行列・式に基づく期待値の出典としてtestからも参照しています。
- [Color.js](https://colorjs.io/)：Color Engineの主要dependency。`colorjs.io/fn`を通して色空間変換、gamut判定・mapping、serializationを利用しています。Versionはpackage / lockfileで管理します。

W3Cのsample conversion codeを同梱した実装ではなく、変換処理は主にColor.jsを利用しています。Oklab原典のreference implementationや長い説明文も転載していません。教材の数式・定数と仕様に沿う補間処理は、上記の一次資料を参照しています。

Dependencyのcopyright・license本文と、browser bundle配布時の確認事項は[Third-party Notices](THIRD_PARTY_NOTICES.md)にまとめています。

通常buildとPages buildにはこのnoticeを同梱し、画面末尾の「第三者ライセンス」から参照できます。Build後は`npm run audit:dist`、Pages用では`npm run audit:dist -- --pages`で配布物を検査します。

## Documentation

- [Color Architecture](docs/color-architecture.md)：設計判断、stateの責務、数値・gamut方針
- [Manual QA](docs/manual-qa.md)：browser、responsive layout、keyboard、accessibilityの確認項目
- [Development Notes](docs/development.md)：開発・release履歴と機能の実装詳細
- [Third-party Notices](THIRD_PARTY_NOTICES.md)：第三者dependencyのlicenseと配布時の確認事項
- [Release Readiness](docs/release-readiness.md)：ライセンス・version・公開承認の判断事項
- [Deployment Plan](docs/deployment-plan.md)：Pagesの権限・手動承認・公開停止の設計
