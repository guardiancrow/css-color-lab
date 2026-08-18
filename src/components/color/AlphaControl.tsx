import { useId, useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { useCurrentColor } from '../../context/useCurrentColor';
import { updateColorAlpha } from '../../lib/color/playgroundColor';

function formatAlpha(value: number): string {
  return String(Number(value.toFixed(3)));
}

function parseAlpha(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : null;
}

export function AlphaControl() {
  const id = useId();
  const { currentColor, setCurrentColor } = useCurrentColor();
  const formattedValue = formatAlpha(currentColor.alpha);
  const [draftValue, setDraftValue] = useState(formattedValue);
  const [isEditing, setIsEditing] = useState(false);
  const displayedValue = isEditing ? draftValue : formattedValue;
  const isInvalid = isEditing && parseAlpha(displayedValue) === null;

  const updateAlpha = (alpha: number) => {
    setCurrentColor((previous) => updateColorAlpha(previous, alpha));
  };

  const commitDraft = (input: HTMLInputElement) => {
    const parsed = parseAlpha(input.value);
    const committed = parsed ?? currentColor.alpha;
    setDraftValue(formatAlpha(committed));
    updateAlpha(committed);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.currentTarget.value;
    setDraftValue(nextDraft);
    const parsed = parseAlpha(nextDraft);
    if (parsed !== null) updateAlpha(parsed);
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
    <div className="playground-alpha">
      <div className="playground-alpha-heading">
        <label htmlFor={`${id}-range`}>Alpha</label>
        <output htmlFor={`${id}-range ${id}-number`}>
          {Math.round(currentColor.alpha * 100)}%
        </output>
      </div>
      <div className="playground-alpha-inputs">
        <label className="visually-hidden" htmlFor={`${id}-range`}>
          Alpha slider
        </label>
        <input
          id={`${id}-range`}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentColor.alpha}
          onChange={(event) => {
            updateAlpha(event.currentTarget.valueAsNumber);
          }}
        />
        <label htmlFor={`${id}-number`}>Alpha value</label>
        <input
          id={`${id}-number`}
          type="number"
          min="0"
          max="1"
          step="0.01"
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
    </div>
  );
}
