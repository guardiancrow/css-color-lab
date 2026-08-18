import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorInterpolationExperiment } from './ColorInterpolationExperiment';
import { HueInterpolationExperiment } from './HueInterpolationExperiment';

describe('color interpolation experiment', () => {
  it('renders four Engine-sampled comparisons with textual gamut details', () => {
    render(<ColorInterpolationExperiment />);

    for (const label of ['sRGB', 'Linear sRGB', 'Oklab', 'OkLCh']) {
      const card = screen
        .getByRole('heading', { level: 4, name: label })
        .closest('article');
      if (card === null) {
        throw new Error(`Missing ${label} result card.`);
      }
      expect(within(card).getByRole('img')).toHaveAccessibleName(
        `${label} interpolation sampled by the Color Engine`,
      );
      expect(within(card).getByText('raw sRGB')).toBeInTheDocument();
      expect(
        within(card).getByText('Rec.2020:', { exact: false }),
      ).toBeInTheDocument();
    }
  });

  it('updates the shared mix position and endpoint preset', () => {
    render(<ColorInterpolationExperiment />);
    const slider = screen.getByLabelText('Mix position');
    const cards = screen.getAllByText('raw sRGB');
    const before = cards.map((label) => label.nextElementSibling?.textContent);

    fireEvent.change(slider, { target: { value: '0.25' } });
    expect(screen.getByText('25% Color B')).toBeInTheDocument();
    const after = cards.map((label) => label.nextElementSibling?.textContent);
    expect(after.every((value, index) => value !== before[index])).toBe(true);

    const preset = screen.getByRole('button', {
      name: 'Magenta → Green',
    });
    fireEvent.click(preset);
    expect(preset).toHaveAttribute('aria-pressed', 'true');
  });

  it('generates color-mix CSS and exposes hue method only for OkLCh', () => {
    render(<ColorInterpolationExperiment />);
    const space = screen.getByLabelText('Interpolation space');

    expect(screen.queryByLabelText('Hue method')).not.toBeInTheDocument();
    fireEvent.change(space, { target: { value: 'oklch' } });
    fireEvent.change(screen.getByLabelText('Hue method'), {
      target: { value: 'longer' },
    });

    expect(
      screen.getAllByText(/color-mix\(in oklch longer hue/),
    ).not.toHaveLength(0);
    expect(screen.getByText(/Browser-native:/)).toBeInTheDocument();
  });
});

describe('Hue interpolation experiment', () => {
  it('switches between keyboard-operable CSS hue methods', () => {
    render(<HueInterpolationExperiment />);

    expect(screen.getByLabelText('Hue path')).toHaveTextContent('340°');
    const longer = screen.getByRole('radio', { name: /longer hue/ });
    fireEvent.click(longer);
    expect(screen.getByLabelText('Hue path')).toHaveTextContent('160°');
    expect(longer).toBeChecked();
  });
});
