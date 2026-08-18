import { useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { commitHslInput, parseHslInput } from '../../lib/color/hsl';
import type { HslChannelIndex } from '../../lib/color/hsl';

interface HSLChannelControlProps {
  readonly id: string;
  readonly name: string;
  readonly abbreviation: 'H' | 'S' | 'L';
  readonly channelIndex: HslChannelIndex;
  readonly value: number;
  readonly unit: '°' | '%';
  readonly max: number;
  readonly descriptionId: string;
  readonly onCommit: (value: number) => void;
}

function formatControlValue(value: number): string {
  return String(Number(value.toFixed(1)));
}

export function HSLChannelControl({
  id,
  name,
  abbreviation,
  channelIndex,
  value,
  unit,
  max,
  descriptionId,
  onCommit,
}: HSLChannelControlProps) {
  const [draftValue, setDraftValue] = useState(formatControlValue(value));
  const [isEditing, setIsEditing] = useState(false);
  const formattedValue = formatControlValue(value);
  const displayedValue = isEditing ? draftValue : formattedValue;
  const isInvalid =
    isEditing && parseHslInput(displayedValue, channelIndex) === null;

  const commitDraft = (input: HTMLInputElement) => {
    const committed = commitHslInput(input.value, value, channelIndex);
    setDraftValue(formatControlValue(committed));
    onCommit(committed);
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.currentTarget.value;
    setDraftValue(nextDraft);

    const parsed = parseHslInput(nextDraft, channelIndex);
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
    <div className="hsl-channel" data-channel={abbreviation.toLowerCase()}>
      <div className="hsl-channel-heading">
        <span>
          {name} <span aria-hidden="true">({abbreviation})</span>
        </span>
        <output htmlFor={`${id}-range ${id}-number`}>
          {formattedValue}
          {unit}
        </output>
      </div>
      {channelIndex === 0 ? (
        <div className="hue-strip" aria-hidden="true" />
      ) : null}
      <div className="hsl-channel-inputs">
        <label className="visually-hidden" htmlFor={`${id}-range`}>
          {name} slider
        </label>
        <span aria-hidden="true">0{unit}</span>
        <input
          id={`${id}-range`}
          type="range"
          min="0"
          max={max}
          step="1"
          value={value}
          aria-describedby={descriptionId}
          onChange={(event) => {
            onCommit(event.currentTarget.valueAsNumber);
          }}
        />
        <span aria-hidden="true">
          {max}
          {unit}
        </span>
        <label htmlFor={`${id}-number`}>{name} value</label>
        <div className="hsl-number-field">
          <input
            id={`${id}-number`}
            type="number"
            min={channelIndex === 0 ? undefined : 0}
            max={channelIndex === 0 ? undefined : 100}
            step="0.1"
            inputMode="decimal"
            value={displayedValue}
            aria-invalid={isInvalid}
            aria-describedby={descriptionId}
            onFocus={() => {
              setDraftValue(formattedValue);
              setIsEditing(true);
            }}
            onChange={handleNumberChange}
            onBlur={handleNumberBlur}
            onKeyDown={handleNumberKeyDown}
          />
          <span aria-hidden="true">{unit}</span>
        </div>
      </div>
    </div>
  );
}
