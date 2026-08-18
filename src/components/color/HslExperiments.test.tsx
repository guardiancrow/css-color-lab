import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HslLightnessExperiment } from './HslLightnessExperiment';
import { HslSaturationExperiment } from './HslSaturationExperiment';

describe('HSL lesson experiments', () => {
  it('compares yellow and blue at equal HSL Lightness', () => {
    render(<HslLightnessExperiment />);

    const yellow = screen.getByRole('article', { name: 'Yellow' });
    const blue = screen.getByRole('article', { name: 'Blue' });

    expect(within(yellow).getByText('60° 100% 50%')).toBeInTheDocument();
    expect(within(blue).getByText('240° 100% 50%')).toBeInTheDocument();
    expect(
      within(yellow).getByLabelText('Yellow relative luminance'),
    ).toHaveTextContent('0.9278');
    expect(
      within(blue).getByLabelText('Blue relative luminance'),
    ).toHaveTextContent('0.0722');
  });

  it('selects a representative Hue with native buttons', () => {
    render(<HslLightnessExperiment />);
    const blue = screen.getByRole('button', { name: 'Blue' });

    expect(blue.tagName).toBe('BUTTON');
    fireEvent.click(blue);

    expect(blue).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Hue at fixed HSL lightness')).toHaveValue(
      '240',
    );
    expect(
      screen.getByRole('article', { name: 'Selected: Blue' }),
    ).toBeInTheDocument();
  });

  it('moves from color to gray with the labeled Saturation slider', () => {
    render(<HslSaturationExperiment />);
    const slider = screen.getByLabelText('HSL saturation experiment');

    expect(slider).toHaveAttribute('type', 'range');
    fireEvent.change(slider, { target: { value: '0' } });

    const result = screen.getByRole('article', { name: 'Saturation result' });
    expect(within(result).getByText('30° 0% 50%')).toBeInTheDocument();
    expect(within(result).getByText('rgb(128 128 128)')).toBeInTheDocument();
  });
});
