import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { createColor } from '../../lib/color/colorEngine';
import { ContrastColorExperiment } from './ContrastColorExperiment';
import { LightDarkExperiment } from './LightDarkExperiment';
import { ModernColorSupport } from './ModernColorSupport';
import { RelativeColorExperiment } from './RelativeColorExperiment';

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderRelative() {
  return render(
    <ColorProvider initialValue={createColor('oklch', [0.65, 0.14, 350])}>
      <RelativeColorExperiment />
    </ColorProvider>,
  );
}

describe('relative color experiment', () => {
  it('updates Engine values and generated CSS from labeled controls', () => {
    renderRelative();
    const code = screen.getByLabelText('Generated relative OkLCh CSS');

    fireEvent.change(screen.getByLabelText('Lightness adjustment'), {
      target: { value: '0.08' },
    });
    fireEvent.change(screen.getByLabelText('Chroma adjustment'), {
      target: { value: '-0.02' },
    });
    fireEvent.change(screen.getByLabelText('Hue offset'), {
      target: { value: '20' },
    });

    expect(code).toHaveTextContent('calc(l + 0.08)');
    expect(code).toHaveTextContent('calc(c - 0.02)');
    expect(code).toHaveTextContent('calc(h + 20)');
    expect(screen.getByText(/0.73 0.12 10/)).toBeInTheDocument();
  });

  it('keeps raw out-of-gamut results visible instead of disabling the lesson', () => {
    renderRelative();

    fireEvent.change(screen.getByLabelText('Chroma adjustment'), {
      target: { value: '0.2' },
    });

    const statuses = screen.getByLabelText('Relative color gamut status');
    expect(
      within(statuses).getByText('Outside sRGB gamut'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Raw result is outside sRGB/)).toBeInTheDocument();
  });

  it('retains Engine explanation when native relative colors are unsupported', () => {
    vi.stubGlobal('CSS', { supports: vi.fn(() => false) });
    renderRelative();

    expect(
      screen.getByText(/Unsupported — native preview unavailable/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Engine relative color result' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Generated relative OkLCh CSS'),
    ).toBeInTheDocument();
  });
});

describe('light-dark experiment', () => {
  it('changes the lesson simulation independently of native support', () => {
    vi.stubGlobal('CSS', { supports: vi.fn(() => false) });
    render(<LightDarkExperiment />);

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByText('Selected: dark')).toBeInTheDocument();
    expect(
      screen.getByText('Unsupported — simulation remains available'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('light-dark CSS example')).toBeInTheDocument();
  });
});

describe('contrast-color experiment', () => {
  it('shows black and white ratios and updates a background preset', () => {
    render(<ContrastColorExperiment />);
    const gray = screen.getByRole('button', { name: 'Middle gray' });

    fireEvent.click(gray);

    expect(gray).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('5.28 : 1')).toBeInTheDocument();
    expect(screen.getByText('3.98 : 1')).toBeInTheDocument();
    expect(screen.getByText(/black · 5.28 : 1/)).toBeInTheDocument();
    expect(
      screen.getByLabelText('contrast-color CSS example'),
    ).toBeInTheDocument();
  });
});

describe('feature support panel', () => {
  it('renders supported and unsupported states as text', () => {
    vi.stubGlobal('CSS', {
      supports: vi.fn((_property: string, value: string) =>
        value.startsWith('oklch'),
      ),
    });
    render(<ModernColorSupport />);
    const list = screen.getByLabelText('Modern CSS Color support');

    expect(within(list).getAllByText('Supported')).not.toHaveLength(0);
    expect(within(list).getAllByText('Unsupported')).not.toHaveLength(0);
    expect(within(list).getByText('Relative colors')).toBeInTheDocument();
    expect(within(list).getByText('Display P3 syntax')).toBeInTheDocument();
  });
});
