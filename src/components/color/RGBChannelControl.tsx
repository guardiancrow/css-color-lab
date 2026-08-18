import { useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import {
  commitSrgbByteInput,
  parseSrgbByteInput,
} from '../../lib/color/srgb8Bit';

interface RGBChannelControlProps {
  readonly id: string;
  readonly name: string;
  readonly abbreviation: 'R' | 'G' | 'B';
  readonly descriptionId: string;
  readonly value: number;
  readonly onCommit: (value: number) => void;
}

export function RGBChannelControl({
  id,
  name,
  abbreviation,
  descriptionId,
  value,
  onCommit,
}: RGBChannelControlProps) {
  const [draftValue, setDraftValue] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);
  const displayedValue = isEditing ? draftValue : String(value);
  const parsedDraft = parseSrgbByteInput(displayedValue);
  const isInvalid = isEditing && parsedDraft === null;

  const commitDraft = (input: HTMLInputElement) => {
    const committed = commitSrgbByteInput(input.value, value);
    setDraftValue(String(committed));
    onCommit(committed);
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.currentTarget.value;
    setDraftValue(nextDraft);

    const parsed = parseSrgbByteInput(nextDraft);
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
    <div className="rgb-channel" data-channel={abbreviation.toLowerCase()}>
      <div className="rgb-channel-heading">
        <span>
          {name} <span aria-hidden="true">({abbreviation})</span>
        </span>
        <output htmlFor={`${id}-range ${id}-number`}>{value}</output>
      </div>
      <div className="rgb-channel-inputs">
        <label className="visually-hidden" htmlFor={`${id}-range`}>
          {name} slider
        </label>
        <span aria-hidden="true">0</span>
        <input
          id={`${id}-range`}
          type="range"
          min="0"
          max="255"
          step="1"
          value={value}
          aria-describedby={descriptionId}
          onChange={(event) => {
            onCommit(event.currentTarget.valueAsNumber);
          }}
        />
        <span aria-hidden="true">255</span>
        <label htmlFor={`${id}-number`}>{name} value</label>
        <input
          id={`${id}-number`}
          className="rgb-number-input"
          type="number"
          min="0"
          max="255"
          step="1"
          inputMode="numeric"
          value={displayedValue}
          aria-invalid={isInvalid}
          aria-describedby={descriptionId}
          onFocus={() => {
            setDraftValue(String(value));
            setIsEditing(true);
          }}
          onChange={handleNumberChange}
          onBlur={handleNumberBlur}
          onKeyDown={handleNumberKeyDown}
        />
      </div>
    </div>
  );
}
