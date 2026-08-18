export function PlaygroundPage() {
  return (
    <main id="main-content" className="standalone-page playground-page">
      <p className="eyebrow">Experiment freely</p>
      <h1>Color Playground</h1>
      <p className="page-intro">
        色の変換、色域、補間を自由に比較するための実験室です。
      </p>
      <section
        className="placeholder-panel"
        aria-labelledby="future-tools-title"
      >
        <h2 id="future-tools-title">Coming in future phases</h2>
        <ul>
          <li>Color Converter</li>
          <li>Gamut Viewer</li>
          <li>Gradient / Interpolation comparison</li>
          <li>CSS Generator</li>
        </ul>
      </section>
    </main>
  );
}
