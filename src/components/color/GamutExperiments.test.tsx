import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { createOklchColor } from '../../lib/color/oklab';
import { ClippingMappingComparison } from './ClippingMappingComparison';
import { CurrentColorGamutStatus } from './CurrentColorGamutStatus';
import { OkLChControls } from './OkLChControls';
import { OklchGamutExperiment } from './OklchGamutExperiment';

describe('OkLCh gamut experiment', () => {
  it('changes textual gamut states as Chroma crosses boundaries', () => {
    render(<OklchGamutExperiment />);
    const slider = screen.getByLabelText('OkLCh Chroma gamut experiment');

    expect(screen.getByText('Outside sRGB gamut')).toBeInTheDocument();
    expect(screen.getByText('Inside Display P3 gamut')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '0.4' } });

    expect(slider).toHaveValue('0.4');
    expect(screen.getByText('Outside Rec.2020 gamut')).toBeInTheDocument();
  });

  it('updates boundaries from labeled Hue and Lightness sliders', () => {
    render(<OklchGamutExperiment />);
    const boundary = screen.getByLabelText(
      'Maximum Chroma at current Lightness and Hue',
    );
    const initial = boundary.textContent;

    fireEvent.change(screen.getByLabelText('OkLCh Hue gamut experiment'), {
      target: { value: '200' },
    });
    fireEvent.change(
      screen.getByLabelText('OkLCh Lightness gamut experiment'),
      { target: { value: '0.6' } },
    );

    expect(boundary).toHaveTextContent('At L = 0.60, h = 200°');
    expect(boundary.textContent).not.toBe(initial);
  });

  it('offers keyboard-accessible presets for all four states', () => {
    render(<OklchGamutExperiment />);
    const preset = screen.getByRole('button', {
      name: 'Outside Display P3 / Inside Rec.2020',
    });

    fireEvent.click(preset);

    expect(preset).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Outside Display P3 gamut')).toBeInTheDocument();
    expect(screen.getByText('Inside Rec.2020 gamut')).toBeInTheDocument();
  });

  it('labels original and mapped previews without relying on color', () => {
    render(<OklchGamutExperiment />);

    expect(
      screen.getByRole('img', { name: /Original OkLCh CSS preview/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Explicitly mapped sRGB preview' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/color\(display-p3/)).toBeInTheDocument();
    expect(screen.getByText(/color\(rec2020/)).toBeInTheDocument();
  });
});

describe('Current Color gamut synchronization', () => {
  it('follows edits from the shared OkLCh Controls', () => {
    render(
      <ColorProvider initialValue={createOklchColor([0.7, 0.12, 20])}>
        <OkLChControls />
        <CurrentColorGamutStatus />
      </ColorProvider>,
    );
    const status = screen.getByLabelText('Current Color gamut status');

    expect(within(status).getByText('Inside sRGB gamut')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('OkLCh Chroma slider'), {
      target: { value: '0.29' },
    });

    expect(within(status).getByText('Outside sRGB gamut')).toBeInTheDocument();
    expect(
      within(status).getByText('Outside Display P3 gamut'),
    ).toBeInTheDocument();
    expect(
      within(status).getByText('Inside Rec.2020 gamut'),
    ).toBeInTheDocument();
  });
});

describe('clipping and mapping comparison', () => {
  it('shows methods, coordinates, deltas, and gamut status as text', () => {
    render(<ClippingMappingComparison />);
    const clipping = screen.getByRole('article', {
      name: 'Simple clipping result',
    });
    const mapping = screen.getByRole('article', {
      name: 'CSS gamut mapping result',
    });

    for (const card of [clipping, mapping]) {
      expect(within(card).getByText('Resulting sRGB')).toBeInTheDocument();
      expect(within(card).getByText('OkLCh after')).toBeInTheDocument();
      expect(within(card).getByText('ΔL / ΔC / Δh')).toBeInTheDocument();
      expect(within(card).getByText('Inside sRGB gamut')).toBeInTheDocument();
      expect(within(card).getByRole('img')).toBeInTheDocument();
    }

    expect(
      screen.getByText(/Outside sRGB gamut · raw channels/),
    ).toBeInTheDocument();
  });
});
