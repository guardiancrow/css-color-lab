# Manual QA Checklist

`v1.0.0-rc.1`を正式なv1.0.0候補として確認するためのチェックリストです。自動テストでは確認できない描画、browser console、keyboard、Clipboard、OS accessibility設定を重点的に扱います。

## 準備

```bash
npm install
npm run build
npm run preview
```

preview URLの`/`と`/playground`を使用します。各browserでは通常profileを基本とし、必要に応じてprivate windowでも確認します。

## Browser matrix

Chromium系とFirefoxのそれぞれで確認します。

- `/`と`/playground`が読み込まれ、reloadしても404にならない
- DevTools consoleにReact warning、key warning、例外、unhandled rejectionがない
- main navigation、chapter navigation、Playground section navigationが動く
- rangeをpointerとarrow keyの両方で操作できる
- number inputの空文字・一時的な不正値で画面がcrashしない
- `details` / `summary`をEnterまたはSpaceで開閉でき、focus ringが見える
- Copy成功時に`Copied`、権限拒否時に手動選択案内が表示される
- Modern CSSのSupport statusが文字で表示され、UnsupportedでもEngine resultとgenerated CSSが残る

Clipboardは許可状態と拒否状態をそれぞれ確認します。`localhost`以外ではsecure context制約によりClipboard APIを利用できない場合があります。

### Chromium

- Learnのsticky Navigation / Inspector、anchors、range / number、`details` / `summary`
- PlaygroundのConverter、Gamut、4-space Interpolation、Modern CSS Tools
- Clipboardを許可した場合に`Copied`が通知される

### Firefox

- native range inputとarrow key操作
- Engine-sampled CSS gradientsとselected marker
- sticky領域とcode wrapping / local overflow
- `CSS.supports()`の表示とModern CSS unsupported fallback
- Clipboardの許可／拒否双方でgenerated CSSが残る

## Routes and anchors

- `/`
- `/playground`
- `/playground#gamut-explorer`
- `/playground#interpolation`
- `/playground#modern-css`

anchor移動後に対象headingが見え、page上端へ不自然に隠れないことを確認します。

## Viewports

各viewportでpage-level horizontal scrollbar、重なり、切れ、極端な空白がないことを確認します。code block内部の横scrollは許容します。

- 2560 × 1440: Learnの3カラムとPlaygroundの余剰幅利用
- 1920 × 1200: 主要desktop基準、sticky領域と縦方向の情報密度
- 1920 × 1080: section間隔、Playground各panelの幅
- 1366 × 768: sidebar解除後の順序、Gamut / Modern CSS grid
- 1024 × 768: 1カラム化したPlayground controlsとcode overflow
- 760px前後: breakpoint前後で内容が欠落しない
- 360〜430px: header、navigation wrapping、range + number、long CSS
- 200% zoom: 操作要素と文字が重ならず、page-level horizontal overflowが発生しない

## Learn

- Chapter navigationから各章へ移動できる
- Oklab / OkLCh ControlsがCurrent Colorと同期する
- Gamutでpreset、L / C / h、boundary、clipping / mapping説明を確認できる
- Interpolationで4空間、Hue method、powerless Hue、alpha例を確認できる
- Modern CSS ColorでRelative Color、`light-dark()`、`contrast-color()`、support一覧が表示される
- gamut status、mapping、support状態が色だけでなく文字でも分かる

## Playground

- 6 Color Editorsのどれを変更してもSummary、他editor、Gamut Explorerが更新される
- slider reference range外のLab / LCh / Oklab / OkLCh number値が保持される
- Gamut boundary drag中に入力が著しく詰まらず、3 gamutの値が更新される
- Gradient mix dragでselected resultだけが動き、gradient stripがちらつかない
- shorter / longer / increasing / decreasingでOkLCh Hue pathが更新される
- Interpolation Start / EndはCurrent Color変更へ自動追随せず、Import時だけ変わる
- Relative Color ApplyでCurrent Colorが更新され、Relative BaseとInterpolation endpointは維持される
- Modern CSS各toolのlocal stateが相互に勝手に変わらない
- out-of-sRGB colorでraw canonical値とgamut statusが残り、mapped previewの注記がある
- alphaがConverter、CSS syntax、Interpolation、Relative Colorで維持される
- Gamut ExplorerのHue / Lightness / Chroma変更でsRGB、Display P3、Rec.2020のmax Cが更新される
- boundary action後に対象gamut内となり、比較表示だけではOriginalが変わらない
- 同じendpointでもsRGB、Linear sRGB、Oklab、OkLChのgradientが異なる
- 350° → 10°でshorter / longer / increasing / decreasingのpathが区別できる
- HSL S = 0、LCh / OkLCh C = 0、neutral interpolation endpointでNaNや`undefined`が出ない
- Alphaを1未満にしてInterpolationへImport、Relative ColorへImport / Applyしても値が保持される
- number inputで空文字、一時的な`-`、decimal、非常に大きい値、許可／不許可のnegativeを入力してもcrashしない

## Modern CSS runtime and fallback

Relative Color、`color-mix()`、`light-dark()`、`contrast-color()`、Oklab、OkLCh、Display P3、Rec.2020の各statusを確認します。

- `Supported` / `Unsupported` / `Detection unavailable`がruntime結果として文字表示される
- unsupportedでもpanel、Engine calculation、simulation、generated CSSが残る
- blank area、layout collapse、exceptionが発生しない

## Keyboard and assistive settings

- skip linkで`main`へ移動できる
- Tab / Shift+Tabの順序が理解可能で、focusが見失われない
- rangeはarrow key、selectはkeyboard、radioはarrow keyで操作できる
- presetは選択状態を文字または`aria-pressed`で取得できる
- Import / Apply / Copyがnative buttonとして操作できる
- Copy feedbackをscreen readerのlive regionが通知する
- Windows Forced Colorsで選択状態、focus、gamut statusの境界が識別できる
- `prefers-reduced-motion: reduce`でsmooth scrollと不要なtransitionが抑制され、操作不能にならない

Learnのlarge desktopではDOM focus順がChapter Navigation → Current Color Inspector →教材本文、視覚配置がNavigation →本文→Inspectorです。実際にkeyboard利用上の混乱がないかを重点確認し、問題があれば次のrelease修正でDOM構造を再検討します。

## Record

各組み合わせについてbrowser version、OS、viewport、結果、console内容、再現手順を記録します。native Modern CSSの見え方はSupport statusと分け、display gamutやOS color managementの能力を構文supportの結果から推測しません。
