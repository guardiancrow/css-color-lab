# CSS Color Lab

CSS Color Module Level 4 / Level 5 の色空間と色操作を、色に触れながら段階的に学ぶためのWebアプリケーションです。RGBは知っていても、OklabやOkLChがなぜ必要なのか分からない初学者を主な対象にしています。

## 現在のPhase

Phase 4では、Chapter 1「Color & RGB」に続き、Chapter 2「sRGB」とChapter 3「Linear RGB」をインタラクティブ教材として実装しています。

- `/`: Chapter 1〜3の教材と、後続7章のplaceholderを縦に読むLearnページ
- `/playground`: 将来の実験ツール用Playgroundページ
- stickyな章ナビゲーションとCurrent Color Inspector
- sRGB、Linear sRGB、XYZ D50/D65、HSL、Lab/LCh、Oklab/OkLCh、Display P3の変換
- 単一の現在色state、alpha、gamut判定、明示的gamut mapping
- 0〜255のsRGB slider／number inputとリアルタイムpreview
- encoded sRGBとLinear sRGBを往復するneutral gray実験
- sRGB／Linear sRGBにおけるblack–white補間の比較
- レスポンシブな基本レイアウトとアクセシビリティの土台
- ESLint、Prettier、TypeScript strict mode、Vitest

RGB Controlsからcanonical stateを更新すると、Current Color Inspectorの全表現がColor Engine経由で再計算されます。Chapter 2・3の実験は概念比較に集中できるよう教材内のローカルstateを使い、Current Colorは変更しません。HSLなどほかの編集UI、色空間の可視化、Chapter 4以降の教材本文はまだ実装していません。

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

## 対象ブラウザ

最新のChromium系ブラウザとFirefoxを対象とします。特定ブラウザ専用APIには依存しません。
