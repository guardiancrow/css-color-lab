import type { CSSProperties } from 'react';
import type { GamutBoundaryAnalysis } from '../../lib/color/gamutExplorer';

type MarkerStyle = CSSProperties & { '--marker-position': string };

interface GamutBoundaryChartProps {
  readonly analysis: GamutBoundaryAnalysis;
}

export function GamutBoundaryChart({ analysis }: GamutBoundaryChartProps) {
  const accessibleSummary = [
    `Current chroma: ${analysis.chroma.toFixed(4)}`,
    ...analysis.boundaries.map(
      ({ label, maximumChroma }) =>
        `${label} maximum chroma: ${maximumChroma.toFixed(4)}`,
    ),
  ].join('. ');

  return (
    <figure className="gamut-boundary-chart" aria-label={accessibleSummary}>
      <div className="gamut-boundary-track" aria-hidden="true">
        {analysis.boundaries.map((boundary) => (
          <span
            key={boundary.id}
            className="gamut-boundary-marker"
            data-gamut={boundary.id}
            style={
              {
                '--marker-position': `${String(boundary.positionPercent)}%`,
              } as MarkerStyle
            }
          />
        ))}
        <span
          className="gamut-current-marker"
          style={
            {
              '--marker-position': `${String(analysis.currentPositionPercent)}%`,
            } as MarkerStyle
          }
        />
      </div>
      <figcaption>
        <span>C 0</span>
        <span>Display extent C {analysis.scaleMaximum.toFixed(3)}</span>
      </figcaption>
      <ul className="gamut-boundary-legend">
        {analysis.boundaries.map(({ id, label, maximumChroma }) => (
          <li key={id} data-gamut={id}>
            <span aria-hidden="true" />
            {label} {maximumChroma.toFixed(4)}
          </li>
        ))}
        <li data-gamut="current">
          <span aria-hidden="true" />
          Current {analysis.chroma.toFixed(4)}
        </li>
      </ul>
    </figure>
  );
}
