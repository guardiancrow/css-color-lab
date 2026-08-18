interface ScalarSliderProps {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly startLabel: string;
  readonly endLabel: string;
  readonly output: string;
  readonly descriptionId?: string;
  readonly onChange: (value: number) => void;
}

export function ScalarSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  startLabel,
  endLabel,
  output,
  descriptionId,
  onChange,
}: ScalarSliderProps) {
  return (
    <div className="scalar-control">
      <div className="scalar-control-heading">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{output}</output>
      </div>
      <div className="scalar-control-input">
        <span aria-hidden="true">{startLabel}</span>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={descriptionId}
          onChange={(event) => {
            onChange(event.currentTarget.valueAsNumber);
          }}
        />
        <span aria-hidden="true">{endLabel}</span>
      </div>
    </div>
  );
}
