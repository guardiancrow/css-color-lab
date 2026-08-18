import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LchOklchHueComparison } from './LchOklchHueComparison';

describe('LCh and OkLCh comparison experiment', () => {
  it('updates both labeled previews from one keyboard-accessible Hue control', () => {
    render(<LchOklchHueComparison />);
    const slider = screen.getByLabelText('Shared LCh and OkLCh Hue rotation');
    const lch = screen.getByRole('article', { name: 'LCh Hue rotation' });
    const oklch = screen.getByRole('article', { name: 'OkLCh Hue rotation' });

    fireEvent.change(slider, { target: { value: '240' } });

    expect(slider).toHaveValue('240');
    expect(within(lch).getByText('240°')).toBeInTheDocument();
    expect(within(oklch).getByText('240°')).toBeInTheDocument();
    expect(within(lch).getByText(/sRGB gamut/)).toBeInTheDocument();
    expect(within(oklch).getByText(/Display P3 gamut/)).toBeInTheDocument();
    expect(
      within(lch).getByRole('img', { name: /Hue 240 degrees/ }),
    ).toBeInTheDocument();
    expect(
      within(oklch).getByRole('img', { name: /Hue 240 degrees/ }),
    ).toBeInTheDocument();
  });

  it('offers native buttons for representative blue and purple hues', () => {
    render(<LchOklchHueComparison />);
    const purple = screen.getByRole('button', { name: '300°' });

    fireEvent.click(purple);

    expect(purple).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByLabelText('Shared LCh and OkLCh Hue rotation'),
    ).toHaveValue('300');
  });
});
