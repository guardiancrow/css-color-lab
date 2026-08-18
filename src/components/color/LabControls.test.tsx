import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { useCurrentColor } from '../../context/useCurrentColor';
import { createColor, isInColorGamut } from '../../lib/color/colorEngine';
import { createLabColor, createLchColor } from '../../lib/color/lab';
import { CurrentColorInspector } from './CurrentColorInspector';
import { CurrentColorLabPipeline } from './CurrentColorLabPipeline';
import { HSLControls } from './HSLControls';
import { LabControls } from './LabControls';
import { LChControls } from './LChControls';
import { RGBControls } from './RGBControls';

function ColorStateProbe() {
  const { currentColor } = useCurrentColor();

  return (
    <output
      data-testid="color-state"
      data-space={currentColor.space}
      data-in-srgb={isInColorGamut(currentColor, 'srgb')}
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
      <CurrentColorLabPipeline />
      <div>
        <LabControls />
        <LChControls />
      </div>
      <CurrentColorInspector />
      <ColorStateProbe />
    </ColorProvider>,
  );
}

function getInput(label: string) {
  return screen.getByLabelText<HTMLInputElement>(label);
}

function getProbedCoordinates(): number[] {
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

describe('Lab and LCh Controls', () => {
  it('exposes labeled native controls and known initial values', () => {
    renderEditors();

    expect(getInput('Lab Lightness slider')).toHaveAttribute('type', 'range');
    expect(getInput('Lab a axis value')).toHaveAttribute('type', 'number');
    expect(getInput('LCh Chroma slider')).toHaveAttribute('type', 'range');
    expect(getInput('LCh Hue value')).toHaveAttribute('type', 'number');
    expect(getInput('Lab Lightness slider')).toHaveValue('54.29054140467191');
  });

  it('updates every derived editor and view from Lab Controls', () => {
    renderEditors();
    const inspector = screen.getByRole('complementary', { name: 'Inspector' });
    const originalHex = within(inspector).getByText('#F00');

    fireEvent.change(getInput('Lab Lightness slider'), {
      target: { value: '70' },
    });

    const state = screen.getByTestId('color-state');
    expect(state).toHaveAttribute('data-space', 'lab');
    expect(getProbedCoordinates()[0]).toBe(70);
    expect(getInput('LCh Lightness slider')).toHaveValue('70');
    expect(getInput('Green slider')).not.toHaveValue('0');
    expect(getInput('Lightness slider')).not.toHaveValue('50');
    expect(
      within(screen.getByRole('article', { name: 'Lab' })).getByLabelText(
        'Lab L value',
      ),
    ).toHaveTextContent('70');
    expect(originalHex).not.toBeInTheDocument();
  });

  it('updates Lab and the shared canonical state from LCh Controls', () => {
    renderEditors();

    fireEvent.change(getInput('LCh Hue slider'), {
      target: { value: '120' },
    });

    const state = screen.getByTestId('color-state');
    expect(state).toHaveAttribute('data-space', 'lch');
    expect(getProbedCoordinates()[2]).toBe(120);
    expect(getInput('Lab a axis slider')).not.toHaveValue('80.80492817043522');
    expect(getInput('Red slider')).not.toHaveValue('255');
  });

  it.each([
    ['360', '0'],
    ['-30', '330'],
    ['390', '30'],
  ])('normalizes LCh Hue input %s to %s', (input, expected) => {
    renderEditors();
    const hue = getInput('LCh Hue value');

    fireEvent.focus(hue);
    fireEvent.change(hue, { target: { value: input } });
    fireEvent.blur(hue);

    expect(getInput('LCh Hue slider')).toHaveValue(expected);
    expect(hue).toHaveValue(Number(expected));
  });

  it('preserves a number-input value beyond the Lab teaching slider range', () => {
    renderEditors();
    const aValue = getInput('Lab a axis value');

    fireEvent.focus(aValue);
    fireEvent.change(aValue, { target: { value: '180' } });
    fireEvent.blur(aValue);

    expect(aValue).toHaveValue(180);
    expect(getProbedCoordinates()[1]).toBe(180);
    expect(screen.getByTestId('color-state')).toHaveAttribute(
      'data-in-srgb',
      'false',
    );
  });

  it('retains explicit Hue at C zero without changing the neutral color', () => {
    renderEditors(createLchColor([50, 0, 30]));
    const initialRgb = [
      getInput('Red slider').value,
      getInput('Green slider').value,
      getInput('Blue slider').value,
    ];

    fireEvent.change(getInput('LCh Hue slider'), {
      target: { value: '240' },
    });

    expect(getProbedCoordinates()).toEqual([50, 0, 240]);
    expect([
      getInput('Red slider').value,
      getInput('Green slider').value,
      getInput('Blue slider').value,
    ]).toEqual(initialRgb);
  });

  it('labels out-of-gamut canonical color and mapped previews in text', () => {
    renderEditors(createLabColor([60, 125, 125]));

    expect(screen.getByTestId('color-state')).toHaveAttribute(
      'data-in-srgb',
      'false',
    );
    expect(screen.getAllByText('Outside sRGB gamut').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Original .* color is retained/).length,
    ).toBeGreaterThan(0);
  });
});
