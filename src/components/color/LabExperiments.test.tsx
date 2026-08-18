import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LabLightnessExperiment } from './LabLightnessExperiment';
import { LchHueExperiment } from './LchHueExperiment';
import { LightnessDefinitionComparison } from './LightnessDefinitionComparison';

describe('Lab and LCh lesson experiments', () => {
  it('changes only the authored Lab L coordinate with a labeled slider', () => {
    render(<LabLightnessExperiment />);
    const slider = screen.getByLabelText('Lab Lightness experiment');

    fireEvent.change(slider, { target: { value: '80' } });

    const result = screen.getByRole('article', { name: 'Lab L result' });
    expect(within(result).getByText(/^80 45 35$/)).toBeInTheDocument();
  });

  it('shows different Lab L values for equal HSL Lightness', () => {
    render(<LightnessDefinitionComparison />);
    const yellow = screen.getByRole('article', {
      name: 'Yellow Lightness comparison',
    });
    const blue = screen.getByRole('article', {
      name: 'Blue Lightness comparison',
    });

    expect(within(yellow).getByText('97.61')).toBeInTheDocument();
    expect(within(blue).getByText('29.57')).toBeInTheDocument();
    expect(within(yellow).getByText('50%')).toBeInTheDocument();
    expect(within(blue).getByText('50%')).toBeInTheDocument();
  });

  it('selects LCh Hue and exposes gamut state as text', () => {
    render(<LchHueExperiment />);
    const hueButton = screen.getByRole('button', { name: '240°' });

    expect(hueButton.tagName).toBe('BUTTON');
    fireEvent.click(hueButton);

    expect(hueButton).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByLabelText('LCh Hue at fixed Lightness and Chroma'),
    ).toHaveValue('240');
    expect(
      within(
        screen.getByRole('article', { name: 'Selected LCh hue' }),
      ).getByText(/sRGB gamut/),
    ).toBeInTheDocument();
  });
});
