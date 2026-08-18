import { useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import {
  commitOklabInput,
  commitOklchInput,
  parseOklabInput,
  parseOklchInput,
} from '../../lib/color/oklab';
import type {
  OklabChannelIndex,
  OklchChannelIndex,
} from '../../lib/color/oklab';

interface OklabAxisControlProps {
  readonly id: string;
  readonly spaceName: 'Oklab' | 'OkLCh';
  readonly name: string;
  readonly abbreviation: string;
  readonly direction: string;
  readonly channelIndex: OklabChannelIndex | OklchChannelIndex;
  readonly value: number;
  readonly sliderMin: number;
  readonly sliderMax: number;
  readonly sliderStep: number;
  readonly numberStep: number;
  readonly unit?: '°' | undefined;
  readonly numberMin?: number | undefined;
  readonly numberMax?: number | undefined;
  readonly descriptionId: string;
  readonly onCommit: (value: number) => void;
}

function formatValue(value: number): string {
  return String(Number(value.toFixed(4)));
}

export function OklabAxisControl({
  id,
  spaceName,
  name,
  abbreviation,
  direction,
  channelIndex,
  value,
  sliderMin,
  sliderMax,
  sliderStep,
  numberStep,
  unit,
  numberMin,
  numberMax,
  descriptionId,
  onCommit,
}: OklabAxisControlProps) {
  const [draftValue, setDraftValue] = useState(formatValue(value));
  const [isEditing, setIsEditing] = useState(false);
  const formattedValue = formatValue(value);
  const displayedValue = isEditing ? draftValue : formattedValue;
  const sliderValue = Math.min(sliderMax, Math.max(sliderMin, value));
  const parseInput = spaceName === 'Oklab' ? parseOklabInput : parseOklchInput;
  const commitInput =
    spaceName === 'Oklab' ? commitOklabInput : commitOklchInput;
  const isInvalid =
    isEditing && parseInput(displayedValue, channelIndex) === null;

  const commitDraft = (input: HTMLInputElement) => {
    const committed = commitInput(input.value, value, channelIndex);
    setDraftValue(formatValue(committed));
    onCommit(committed);
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.currentTarget.value;
    setDraftValue(nextDraft);
    const parsed = parseInput(nextDraft, channelIndex);

    if (parsed !== null) {
      onCommit(parsed);
    }
  };

  const handleNumberBlur = (event: FocusEvent<HTMLInputElement>) => {
    commitDraft(event.currentTarget);
    setIsEditing(false);
  };

  const handleNumberKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft(event.currentTarget);
      event.currentTarget.blur();
    }
  };

  return (
    <div className="lab-axis">
      <div className="lab-axis-heading">
        <span>
          {name} <span aria-hidden="true">({abbreviation})</span>
        </span>
        <output htmlFor={`${id}-range ${id}-number`}>
          {formattedValue}
          {unit}
        </output>
      </div>
      <p className="lab-axis-direction" id={`${id}-direction`}>
        {direction}
      </p>
      <div className="lab-axis-inputs">
        <label className="visually-hidden" htmlFor={`${id}-range`}>
          {spaceName} {name} slider
        </label>
        <span aria-hidden="true">{sliderMin}</span>
        <input
          id={`${id}-range`}
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          value={sliderValue}
          aria-describedby={`${descriptionId} ${id}-direction`}
          onChange={(event) => {
            onCommit(event.currentTarget.valueAsNumber);
          }}
        />
        <span aria-hidden="true">{sliderMax}</span>
        <label htmlFor={`${id}-number`}>
          {spaceName} {name} value
        </label>
        <div className="lab-number-field">
          <input
            id={`${id}-number`}
            type="number"
            min={numberMin}
            max={numberMax}
            step={numberStep}
            inputMode="decimal"
            value={displayedValue}
            aria-invalid={isInvalid}
            aria-describedby={`${descriptionId} ${id}-direction`}
            onFocus={() => {
              setDraftValue(formattedValue);
              setIsEditing(true);
            }}
            onChange={handleNumberChange}
            onBlur={handleNumberBlur}
            onKeyDown={handleNumberKeyDown}
          />
          {unit ? <span aria-hidden="true">{unit}</span> : null}
        </div>
      </div>
    </div>
  );
}
