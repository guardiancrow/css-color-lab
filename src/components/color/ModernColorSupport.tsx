import { detectModernColorFeatures } from '../../lib/modernCssSupport';

function statusLabel(state: 'supported' | 'unsupported' | 'unavailable') {
  if (state === 'supported') return 'Supported';
  if (state === 'unsupported') return 'Unsupported';
  return 'Detection unavailable';
}

export function ModernColorSupport() {
  const statuses = detectModernColorFeatures();

  return (
    <div className="modern-support-panel" aria-labelledby="support-panel-title">
      <div className="experiment-heading">
        <p className="eyebrow">Runtime feature detection</p>
        <h3 id="support-panel-title">Your browser</h3>
        <p>
          固定version表ではなく、このbrowserの<code>CSS.supports()</code>
          で構文を判定します。表示deviceの色域や正確さを判定する機能ではありません。
        </p>
      </div>
      <ul className="modern-support-list" aria-label="Modern CSS Color support">
        {statuses.map((feature) => (
          <li key={feature.id} data-state={feature.state}>
            <span>{feature.label}</span>
            <strong>{statusLabel(feature.state)}</strong>
          </li>
        ))}
      </ul>

      <pre aria-label="Progressive enhancement CSS example">
        <code>{`.card {
  background: #d27a43;
}

@supports (color: oklch(60% 0.2 30)) {
  .card {
    background: oklch(65% 0.16 45);
  }
}

@supports (color: oklch(from red l c h)) {
  .card--lighter {
    background: oklch(from var(--base) calc(l + 0.08) c h);
  }
}`}</code>
      </pre>
    </div>
  );
}
