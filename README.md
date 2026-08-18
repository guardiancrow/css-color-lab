# CSS Color Lab

CSS Color Module Level 4 / Level 5 の色空間と色操作を、色に触れながら段階的に学ぶためのWebアプリケーションです。RGBは知っていても、OklabやOkLChがなぜ必要なのか分からない初学者を主な対象にしています。

## 現在のPhase

Phase 1では、教材を拡張できるプロジェクト基盤と画面構成のみを実装しています。

- `/`: 10章のplaceholderを縦に読むLearnページ
- `/playground`: 将来の実験ツール用Playgroundページ
- stickyな章ナビゲーションとCurrent Color Inspector
- レスポンシブな基本レイアウトとアクセシビリティの土台
- ESLint、Prettier、TypeScript strict mode、Vitest

色変換、操作UI、可視化、長い教材本文はまだ実装していません。

## 技術構成

- Vite
- React / TypeScript
- React Router
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
├─ lib/              # 章定義などUIに依存しない共有データ
├─ pages/            # URL単位の画面
├─ test/             # テストセットアップ
└─ types/            # 色・教材の共有型
```

## 色状態の設計方針

将来の色操作では、Hex、HSL、XYZ、Oklabなどを個別の可変stateとして保持しません。「現在の色」を表す単一のcanonical stateを持ち、各色空間の表示値はそこから導出します。canonical representationは、Phase 2で変換ライブラリ、精度、色域外の値、alphaの扱いを比較したうえで決定します。

## 対象ブラウザ

最新のChromium系ブラウザとFirefoxを対象とします。特定ブラウザ専用APIには依存しません。
