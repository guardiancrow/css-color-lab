import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { useCurrentColor } from '../../context/useCurrentColor';
import { createColor } from '../../lib/color/colorEngine';
import { CurrentColorInspector } from './CurrentColorInspector';
import { HSLControls } from './HSLControls';
import { RGBControls } from './RGBControls';

function ColorStateProbe() {
  const { currentColor } = useCurrentColor();

  return (
    <output data-testid="color-state" data-space={currentColor.space}>
      {JSON.stringify(currentColor.coordinates)}
    </output>
  );
}

function renderEditors(initialValue = createColor('srgb', [1, 0, 0])) {
  return render(
    <ColorProvider initialValue={initialValue}>
      <RGBControls />
      <HSLControls />
      <CurrentColorInspector />
      <ColorStateProbe />
    </ColorProvider>,
  );
}

function getInput(label: string) {
  return screen.getByLabelText<HTMLInputElement>(label);
}

describe('HSLControls', () => {
  it('derives labeled HSL controls from Current Color', () => {
    renderEditors();

    expect(getInput('Hue slider')).toHaveValue('0');
    expect(getInput('Hue value')).toHaveValue(0);
    expect(getInput('Saturation slider')).toHaveValue('100');
    expect(getInput('Lightness slider')).toHaveValue('50');
  });

  it('updates canonical state, RGB Controls, Inspector, and preview from Hue', () => {
    renderEditors();

    fireEvent.change(getInput('Hue slider'), { target: { value: '120' } });

    expect(screen.getByTestId('color-state')).toHaveAttribute(
      'data-space',
      'hsl',
    );
    expect(JSON.parse(screen.getByTestId('color-state').textContent)).toEqual([
      120, 100, 50,
    ]);
    expect(getInput('Red slider')).toHaveValue('0');
    expect(getInput('Green slider')).toHaveValue('255');
    expect(screen.getAllByText('rgb(0 255 0)').length).toBeGreaterThan(0);
    expect(screen.getByText('120° 100% 50%')).toBeInTheDocument();
  });

  it('follows RGB Controls updates without a second HSL state', () => {
    renderEditors();

    fireEvent.change(getInput('Green slider'), { target: { value: '255' } });

    expect(getInput('Hue slider')).toHaveValue('60');
    expect(getInput('Saturation slider')).toHaveValue('100');
    expect(getInput('Lightness slider')).toHaveValue('50');
  });

  it.each([
    ['360', '0'],
    ['-30', '330'],
    ['390', '30'],
  ])('normalizes Hue number input %s to %s', (input, expected) => {
    renderEditors();
    const hueNumber = getInput('Hue value');

    fireEvent.focus(hueNumber);
    fireEvent.change(hueNumber, { target: { value: input } });
    fireEvent.blur(hueNumber);

    expect(getInput('Hue slider')).toHaveValue(expected);
    expect(hueNumber).toHaveValue(Number(expected));
  });

  it('allows transient percentage input and clamps it on blur', () => {
    renderEditors();
    const saturation = getInput('Saturation value');

    fireEvent.focus(saturation);
    fireEvent.change(saturation, { target: { value: '120' } });
    expect(saturation).toHaveAttribute('aria-invalid', 'true');
    expect(getInput('Saturation slider')).toHaveValue('100');
    fireEvent.blur(saturation);

    expect(saturation).toHaveValue(100);
    expect(getInput('Saturation slider')).toHaveValue('100');
  });

  it('handles Lightness slider boundaries as black and white', () => {
    renderEditors();
    const lightness = getInput('Lightness slider');

    fireEvent.change(lightness, { target: { value: '0' } });
    expect(screen.getAllByText('rgb(0 0 0)').length).toBeGreaterThan(0);

    fireEvent.change(lightness, { target: { value: '100' } });
    expect(screen.getAllByText('rgb(255 255 255)').length).toBeGreaterThan(0);
  });

  it('uses 0 degrees for converted gray and retains an explicitly edited hue', () => {
    renderEditors(createColor('srgb', [0.5, 0.5, 0.5]));

    expect(getInput('Hue slider')).toHaveValue('0');
    fireEvent.change(getInput('Hue slider'), { target: { value: '120' } });
    expect(getInput('Red slider')).toHaveValue('128');
    expect(getInput('Green slider')).toHaveValue('128');
    expect(getInput('Blue slider')).toHaveValue('128');

    fireEvent.change(getInput('Saturation slider'), {
      target: { value: '100' },
    });

    expect(getInput('Hue slider')).toHaveValue('120');
    expect(getInput('Green slider')).toHaveValue('255');
  });
});
