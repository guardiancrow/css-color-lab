import { useId, useState } from 'react';
import { createColor, serializeColor } from '../../lib/color/colorEngine';
import { getSrgbToXyzPipeline } from '../../lib/color/xyzLesson';
import type { ColorCoordinates } from '../../types/color';
import { CoordinateCard } from './CoordinateCard';

const presets = [
  { id: 'red', label: 'Red', coordinates: [1, 0, 0] },
  { id: 'green', label: 'Green', coordinates: [0, 1, 0] },
  { id: 'blue', label: 'Blue', coordinates: [0, 0, 1] },
  { id: 'white', label: 'White', coordinates: [1, 1, 1] },
  { id: 'black', label: 'Black', coordinates: [0, 0, 0] },
] as const satisfies readonly {
  id: string;
  label: string;
  coordinates: ColorCoordinates;
}[];

const rgbLabels = ['R', 'G', 'B'] as const;
const xyzLabels = ['X', 'Y', 'Z'] as const;

export function XyzPrimaryExperiment() {
  const baseId = useId();
  const [selectedId, setSelectedId] = useState('red');
  const selected = presets.find(({ id }) => id === selectedId) ?? presets[0];
  const color = createColor('srgb', selected.coordinates);
  const pipeline = getSrgbToXyzPipeline(color);

  return (
    <div
      className="xyz-experiment"
      role="group"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="experiment-heading">
        <p className="eyebrow">Experiment</p>
        <h3 id={`${baseId}-title`}>RGB原色をXYZで見る</h3>
        <p>
          presetを選び、X・Y・ZがR・G・Bの別名ではないことを数値で確かめます。
        </p>
      </div>
      <div className="preset-buttons" aria-label="sRGB color presets">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={selected.id === preset.id}
            onClick={() => {
              setSelectedId(preset.id);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="primary-result" aria-live="polite">
        <div
          className="primary-preview"
          role="img"
          aria-label={`${selected.label} preview`}
          style={{ backgroundColor: serializeColor(color, { space: 'srgb' }) }}
        />
        <div className="comparison-grid compact-comparison">
          <CoordinateCard
            title="Linear sRGB"
            subtitle={`${selected.label} after decode`}
            labels={rgbLabels}
            coordinates={pipeline.linearSrgb}
          />
          <CoordinateCard
            title="XYZ D65"
            subtitle={`${selected.label} in common coordinates`}
            labels={xyzLabels}
            coordinates={pipeline.xyzD65}
          />
        </div>
      </div>
      <p className="lesson-note">
        Redを選んでもX・Y・Zの複数成分が0ではありません。X = red、Y = green、Z =
        blueではありません。
      </p>
    </div>
  );
}
