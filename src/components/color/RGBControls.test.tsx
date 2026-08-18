import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { useCurrentColor } from '../../context/useCurrentColor';
import { initialColor } from '../../lib/color/initialColor';
import { createSrgbColorFrom8Bit } from '../../lib/color/srgb8Bit';
import type { CanonicalColor } from '../../types/color';
import { CurrentColorInspector } from './CurrentColorInspector';
import { RGBControls } from './RGBControls';

function ColorStateProbe() {
  const { currentColor } = useCurrentColor();

  return (
    <output
      data-testid="color-state"
      data-space={currentColor.space}
      data-alpha={currentColor.alpha}
    >
      {JSON.stringify(currentColor.coordinates)}
    </output>
  );
}

function renderControls(initialValue?: CanonicalColor) {
  return render(
    <ColorProvider initialValue={initialValue ?? initialColor}>
      <RGBControls />
      <CurrentColorInspector />
      <ColorStateProbe />
    </ColorProvider>,
  );
}

function getInput(label: string) {
  return screen.getByLabelText<HTMLInputElement>(label);
}

describe('RGBControls', () => {
  it('derives the initial 8-bit controls from the canonical color', () => {
    renderControls();

    expect(getInput('Red slider')).toHaveValue('210');
    expect(getInput('Red value')).toHaveValue(210);
    expect(getInput('Green slider')).toHaveValue('122');
    expect(getInput('Green value')).toHaveValue(122);
    expect(getInput('Blue slider')).toHaveValue('67');
    expect(getInput('Blue value')).toHaveValue(67);
    expect(screen.getByText('rgb(210 122 67)')).toBeInTheDocument();
    expect(screen.getAllByText('#D27A43')).toHaveLength(2);
  });

  it('updates canonical state, preview, and Inspector from the Red slider', () => {
    renderControls();

    fireEvent.change(getInput('Red slider'), { target: { value: '255' } });

    expect(getInput('Red value')).toHaveValue(255);
    expect(getInput('Green slider')).toHaveValue('122');
    expect(getInput('Blue slider')).toHaveValue('67');
    expect(screen.getByText('rgb(255 122 67)')).toBeInTheDocument();
    expect(screen.getAllByText('#FF7A43')).toHaveLength(2);
    expect(screen.getByText('255 122 67')).toBeInTheDocument();

    const state = screen.getByTestId('color-state');
    expect(state).toHaveAttribute('data-space', 'srgb');
    expect(JSON.parse(state.textContent)).toEqual([1, 122 / 255, 67 / 255]);
  });

  it('keeps number input, slider, and other channels synchronized at boundaries', () => {
    renderControls();
    const greenNumber = getInput('Green value');

    fireEvent.focus(greenNumber);
    fireEvent.change(greenNumber, { target: { value: '0' } });
    expect(getInput('Green slider')).toHaveValue('0');
    expect(getInput('Red slider')).toHaveValue('210');
    expect(getInput('Blue slider')).toHaveValue('67');

    fireEvent.change(greenNumber, { target: { value: '255' } });
    expect(getInput('Green slider')).toHaveValue('255');
    expect(screen.getByText('rgb(210 255 67)')).toBeInTheDocument();
  });

  it('allows transient invalid text and normalizes it on blur', () => {
    renderControls();
    const redNumber = getInput('Red value');

    fireEvent.focus(redNumber);
    fireEvent.change(redNumber, { target: { value: '' } });
    expect(redNumber).toHaveValue(null);
    expect(redNumber).toHaveAttribute('aria-invalid', 'true');
    expect(getInput('Red slider')).toHaveValue('210');
    fireEvent.blur(redNumber);
    expect(redNumber).toHaveValue(210);

    fireEvent.focus(redNumber);
    fireEvent.change(redNumber, { target: { value: '300' } });
    expect(getInput('Red slider')).toHaveValue('210');
    fireEvent.blur(redNumber);
    expect(getInput('Red slider')).toHaveValue('255');
    expect(redNumber).toHaveValue(255);
  });

  it('rounds a decimal on Enter and preserves alpha', () => {
    renderControls(createSrgbColorFrom8Bit([210, 122, 67], 0.4));
    const blueNumber = getInput('Blue value');

    fireEvent.focus(blueNumber);
    fireEvent.change(blueNumber, { target: { value: '12.5' } });
    expect(getInput('Blue slider')).toHaveValue('67');
    fireEvent.keyDown(blueNumber, { key: 'Enter' });

    expect(getInput('Blue slider')).toHaveValue('13');
    expect(screen.getByTestId('color-state')).toHaveAttribute(
      'data-alpha',
      '0.4',
    );
  });

  it('exposes labeled native range and number controls', () => {
    renderControls();

    expect(getInput('Red slider')).toHaveAttribute('type', 'range');
    expect(getInput('Red value')).toHaveAttribute('type', 'number');
    const descriptionId =
      getInput('Red slider').getAttribute('aria-describedby');
    expect(descriptionId).not.toBeNull();
    expect(document.getElementById(descriptionId ?? '')).toHaveTextContent(
      '0から255の整数',
    );
  });
});
