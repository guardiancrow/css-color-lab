import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { useCurrentColor } from '../../context/useCurrentColor';
import {
  createColor,
  getColorCoordinates,
  isInColorGamut,
} from '../../lib/color/colorEngine';
import { createOklchColor } from '../../lib/color/oklab';
import { CurrentColorInspector } from './CurrentColorInspector';
import { CurrentColorOklabPipeline } from './CurrentColorOklabPipeline';
import { HSLControls } from './HSLControls';
import { LabControls } from './LabControls';
import { LChControls } from './LChControls';
import { OkLChControls } from './OkLChControls';
import { OklabControls } from './OklabControls';
import { RGBControls } from './RGBControls';

function ColorStateProbe() {
  const { currentColor } = useCurrentColor();

  return (
    <output
      data-testid="color-state"
      data-space={currentColor.space}
      data-in-srgb={isInColorGamut(currentColor, 'srgb')}
      data-rgb={JSON.stringify(getColorCoordinates(currentColor, 'srgb'))}
      data-hsl={JSON.stringify(getColorCoordinates(currentColor, 'hsl'))}
      data-lab={JSON.stringify(getColorCoordinates(currentColor, 'lab'))}
      data-lch={JSON.stringify(getColorCoordinates(currentColor, 'lch'))}
      data-xyz={JSON.stringify(getColorCoordinates(currentColor, 'xyz-d65'))}
      data-oklab={JSON.stringify(getColorCoordinates(currentColor, 'oklab'))}
    >
      {JSON.stringify(currentColor.coordinates)}
    </output>
  );
}

function renderEditors(initialValue = createColor('srgb', [1, 0, 0])) {
  return render(
    <ColorProvider initialValue={initialValue}>
      <RGBControls />
      <HSLControls />
      <LabControls />
      <LChControls />
      <CurrentColorOklabPipeline />
      <OklabControls />
      <OkLChControls />
      <CurrentColorInspector />
      <ColorStateProbe />
    </ColorProvider>,
  );
}

function getInput(label: string) {
  return screen.getByLabelText<HTMLInputElement>(label);
}

function getCanonicalCoordinates(): number[] {
  const parsed: unknown = JSON.parse(
    screen.getByTestId('color-state').textContent,
  );

  if (
    !Array.isArray(parsed) ||
    !parsed.every((value) => typeof value === 'number')
  ) {
    throw new TypeError('Expected numeric canonical color coordinates.');
  }

  return parsed;
}

describe('Oklab and OkLCh Controls', () => {
  it('exposes labeled native controls and axis directions', () => {
    renderEditors();

    expect(getInput('Oklab Lightness slider')).toHaveAttribute('type', 'range');
    expect(getInput('Oklab a axis value')).toHaveAttribute('type', 'number');
    expect(getInput('OkLCh Chroma slider')).toHaveAttribute('type', 'range');
    expect(getInput('OkLCh Hue value')).toHaveAttribute('type', 'number');
    expect(screen.getAllByText(/green · red/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/blue · yellow/).length).toBeGreaterThan(0);
  });

  it('updates every derived color view from Oklab Controls', () => {
    renderEditors();
    const state = screen.getByTestId('color-state');
    const before = {
      rgb: state.getAttribute('data-rgb'),
      hsl: state.getAttribute('data-hsl'),
      lab: state.getAttribute('data-lab'),
      lch: state.getAttribute('data-lch'),
      xyz: state.getAttribute('data-xyz'),
    };

    fireEvent.change(getInput('Oklab Lightness slider'), {
      target: { value: '0.7' },
    });

    expect(state).toHaveAttribute('data-space', 'oklab');
    expect(getCanonicalCoordinates()[0]).toBe(0.7);
    expect(getInput('OkLCh Lightness slider')).toHaveValue('0.7');
    expect(state.getAttribute('data-rgb')).not.toBe(before.rgb);
    expect(state.getAttribute('data-hsl')).not.toBe(before.hsl);
    expect(state.getAttribute('data-lab')).not.toBe(before.lab);
    expect(state.getAttribute('data-lch')).not.toBe(before.lch);
    expect(state.getAttribute('data-xyz')).not.toBe(before.xyz);
    const inspector = screen.getByRole('complementary', { name: 'Inspector' });
    expect(
      within(inspector).getByText('Oklab').nextElementSibling,
    ).toHaveTextContent('0.7');
  });

  it('updates Oklab and canonical state from OkLCh Controls', () => {
    renderEditors();
    const state = screen.getByTestId('color-state');
    const previousOklab = state.getAttribute('data-oklab');

    fireEvent.change(getInput('OkLCh Hue slider'), {
      target: { value: '120' },
    });

    expect(state).toHaveAttribute('data-space', 'oklch');
    expect(getCanonicalCoordinates()[2]).toBe(120);
    expect(state.getAttribute('data-oklab')).not.toBe(previousOklab);
    expect(getInput('Lab a axis slider')).not.toHaveValue('80.80492817043522');
    expect(getInput('Red slider')).not.toHaveValue('255');
  });

  it.each([
    ['360', '0'],
    ['-30', '330'],
    ['390', '30'],
  ])('normalizes OkLCh Hue input %s to %s', (input, expected) => {
    renderEditors();
    const hue = getInput('OkLCh Hue value');

    fireEvent.focus(hue);
    fireEvent.change(hue, { target: { value: input } });
    fireEvent.blur(hue);

    expect(getInput('OkLCh Hue slider')).toHaveValue(expected);
    expect(hue).toHaveValue(Number(expected));
  });

  it('preserves a number-input value beyond the teaching range', () => {
    renderEditors();
    const aValue = getInput('Oklab a axis value');

    fireEvent.focus(aValue);
    fireEvent.change(aValue, { target: { value: '0.55' } });
    fireEvent.blur(aValue);

    expect(aValue).toHaveValue(0.55);
    expect(getCanonicalCoordinates()[1]).toBe(0.55);
    expect(screen.getByTestId('color-state')).toHaveAttribute(
      'data-in-srgb',
      'false',
    );
  });

  it('retains explicit powerless Hue without changing the neutral color', () => {
    renderEditors(createOklchColor([0.6, 0, 30]));
    const initialRgb = screen
      .getByTestId('color-state')
      .getAttribute('data-rgb');

    fireEvent.change(getInput('OkLCh Hue slider'), {
      target: { value: '240' },
    });

    expect(getCanonicalCoordinates()).toEqual([0.6, 0, 240]);
    expect(screen.getByTestId('color-state')).toHaveAttribute(
      'data-rgb',
      initialRgb,
    );
  });

  it('labels retained wide-gamut values and mapped previews in text', () => {
    renderEditors(createOklchColor([0.7, 0.16, 270]));

    expect(screen.getAllByText('Outside sRGB gamut').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Display P3 gamut').length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText(/Original .* color is retained/).length,
    ).toBeGreaterThan(0);
  });
});
