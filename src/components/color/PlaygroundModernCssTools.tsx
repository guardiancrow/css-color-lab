import { PlaygroundColorMixTool } from './PlaygroundColorMixTool';
import { PlaygroundContrastColorTool } from './PlaygroundContrastColorTool';
import { PlaygroundLightDarkTool } from './PlaygroundLightDarkTool';
import { PlaygroundRelativeColorTool } from './PlaygroundRelativeColorTool';

export function PlaygroundModernCssTools() {
  return (
    <section
      id="modern-css"
      className="playground-modern-tools"
      aria-labelledby="playground-modern-title"
    >
      <div className="playground-section-heading">
        <div>
          <p className="eyebrow">Generate practical CSS</p>
          <h2 id="playground-modern-title">Modern CSS Tools</h2>
        </div>
        <p>
          各toolは独立したlocal stateを持ち、Current
          Colorとの連携は明示的なImport / Applyだけです。
        </p>
      </div>
      <div className="modern-tools-grid">
        <PlaygroundRelativeColorTool />
        <PlaygroundColorMixTool />
        <PlaygroundLightDarkTool />
        <PlaygroundContrastColorTool />
      </div>
    </section>
  );
}
