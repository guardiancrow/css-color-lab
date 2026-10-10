import { HSLControls } from '../components/color/HSLControls';
import { LabControls } from '../components/color/LabControls';
import { LChControls } from '../components/color/LChControls';
import { OklabControls } from '../components/color/OklabControls';
import { OkLChControls } from '../components/color/OkLChControls';
import { PlaygroundColorSummary } from '../components/color/PlaygroundColorSummary';
import { PlaygroundGamutExplorer } from '../components/color/PlaygroundGamutExplorer';
import { PlaygroundInterpolationExplorer } from '../components/color/PlaygroundInterpolationExplorer';
import { PlaygroundModernCssTools } from '../components/color/PlaygroundModernCssTools';
import { RGBControls } from '../components/color/RGBControls';
import { FragmentLink } from '../components/FragmentLink';

const editors = [
  {
    id: 'srgb',
    title: 'sRGB',
    note: '0〜255のchannelで、display向けRGBとして編集します。',
    Controls: RGBControls,
  },
  {
    id: 'hsl',
    title: 'HSL',
    note: '同じsRGB色をHue / Saturation / Lightnessで編集します。',
    Controls: HSLControls,
  },
  {
    id: 'lab',
    title: 'Lab',
    note: 'D50基準のLightnessと直交するa / b軸で編集します。',
    Controls: LabControls,
  },
  {
    id: 'lch',
    title: 'LCh',
    note: 'LabをLightness / Chroma / Hueとして編集します。',
    Controls: LChControls,
  },
  {
    id: 'oklab',
    title: 'Oklab',
    note: 'D65基準の知覚的なLightnessとa / b軸で編集します。',
    Controls: OklabControls,
  },
  {
    id: 'oklch',
    title: 'OkLCh',
    note: 'OklabをLightness / Chroma / Hueとして編集します。',
    Controls: OkLChControls,
  },
] as const;

export function PlaygroundPage() {
  return (
    <main id="main-content" className="playground-shell" tabIndex={-1}>
      <header className="playground-hero">
        <p className="eyebrow">Experiment freely</p>
        <h1>Color Playground</h1>
        <p>
          教材の順序を離れ、同じ1色を6つの色空間から自由に編集・比較できます。
        </p>
      </header>

      <nav className="playground-section-nav" aria-label="Playground sections">
        <span>Jump to</span>
        <FragmentLink targetId="color-converter">Color Converter</FragmentLink>
        <FragmentLink targetId="gamut-explorer">Gamut Explorer</FragmentLink>
        <FragmentLink targetId="interpolation">
          Interpolation / Gradient
        </FragmentLink>
        <FragmentLink targetId="modern-css">Modern CSS Tools</FragmentLink>
      </nav>

      <PlaygroundColorSummary />

      <section
        id="color-converter"
        className="playground-converter"
        aria-labelledby="color-converter-title"
      >
        <div className="playground-section-heading">
          <div>
            <p className="eyebrow">Six views, one color</p>
            <h2 id="color-converter-title">Color Converter</h2>
          </div>
          <p>
            sliderは共通のreference rangeです。number
            inputは既存仕様どおり、対応する範囲外のcanonical値も保持できます。
          </p>
        </div>
        <div className="playground-editor-grid">
          {editors.map(({ id, title, note, Controls }) => (
            <section
              key={id}
              className="playground-editor-card"
              aria-labelledby={`playground-${id}-title`}
            >
              <header>
                <h2 id={`playground-${id}-title`}>{title}</h2>
                <p>{note}</p>
              </header>
              <Controls />
            </section>
          ))}
        </div>
      </section>

      <PlaygroundGamutExplorer />

      <PlaygroundInterpolationExplorer />

      <PlaygroundModernCssTools />
    </main>
  );
}
