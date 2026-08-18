import { useId, useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

interface InterpolationMixControlProps {
  readonly amount: number;
  readonly onChange: (amount: number) => void;
}

function formatPercentage(amount: number): string {
  return String(Number((amount * 100).toFixed(2)));
}

function parsePercentage(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100
    ? parsed
    : null;
}

export function InterpolationMixControl({
  amount,
  onChange,
}: InterpolationMixControlProps) {
  const id = useId();
  const formattedValue = formatPercentage(amount);
  const [draftValue, setDraftValue] = useState(formattedValue);
  const [isEditing, setIsEditing] = useState(false);
  const displayedValue = isEditing ? draftValue : formattedValue;
  const isInvalid = isEditing && parsePercentage(displayedValue) === null;

  const commitDraft = (input: HTMLInputElement) => {
    const parsed = parsePercentage(input.value);
    const committed = parsed ?? amount * 100;
    setDraftValue(String(Number(committed.toFixed(2))));
    onChange(committed / 100);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.currentTarget.value;
    setDraftValue(nextDraft);
    const parsed = parsePercentage(nextDraft);
    if (parsed !== null) onChange(parsed / 100);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    commitDraft(event.currentTarget);
    setIsEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft(event.currentTarget);
      event.currentTarget.blur();
    }
  };

  return (
    <div className="playground-mix-control">
      <div className="playground-mix-heading">
        <label htmlFor={`${id}-range`}>Mix amount</label>
        <output htmlFor={`${id}-range ${id}-number`}>
          {formattedValue}% End
        </output>
      </div>
      <div className="playground-mix-inputs">
        <span aria-hidden="true">Start 0%</span>
        <label className="visually-hidden" htmlFor={`${id}-range`}>
          Interpolation mix amount slider
        </label>
        <input
          id={`${id}-range`}
          type="range"
          min="0"
          max="100"
          step="1"
          value={amount * 100}
          onChange={(event) => {
            onChange(event.currentTarget.valueAsNumber / 100);
          }}
        />
        <span aria-hidden="true">End 100%</span>
        <label htmlFor={`${id}-number`}>Interpolation mix amount value</label>
        <input
          id={`${id}-number`}
          type="number"
          min="0"
          max="100"
          step="1"
          inputMode="decimal"
          value={displayedValue}
          aria-invalid={isInvalid}
          onFocus={() => {
            setDraftValue(formattedValue);
            setIsEditing(true);
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
      <p>0% = Start · 100% = End。4方式すべてに同じ割合を適用します。</p>
    </div>
  );
}
