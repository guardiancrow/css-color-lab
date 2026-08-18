import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../../App';

function renderPlayground() {
  return render(
    <MemoryRouter initialEntries={['/playground']}>
      <App />
    </MemoryRouter>,
  );
}

function valueOf(label: string): string {
  return screen.getByLabelText<HTMLInputElement>(label).value;
}

describe('Playground Gamut Explorer', () => {
  it('renders controls, boundaries, statuses, and section navigation', () => {
    renderPlayground();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Gamut Explorer' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Gamut Explorer OkLCh Lightness value'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Gamut Explorer OkLCh Chroma value'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Gamut Explorer OkLCh Hue value'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Current chroma: .*sRGB maximum chroma:/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Gamut Explorer current color status'),
    ).toBeInTheDocument();
    const navigation = screen.getByRole('navigation', {
      name: 'Playground sections',
    });
    expect(
      within(navigation).getByRole('link', { name: 'Color Converter' }),
    ).toHaveAttribute('href', '#color-converter');
    expect(
      within(navigation).getByRole('link', { name: 'Gamut Explorer' }),
    ).toHaveAttribute('href', '#gamut-explorer');
  });

  it('synchronizes Converter, Explorer, and Summary in both directions', () => {
    renderPlayground();

    fireEvent.change(screen.getByLabelText('OkLCh Chroma value'), {
      target: { value: '0.3' },
    });
    expect(valueOf('Gamut Explorer OkLCh Chroma value')).toBe('0.3');

    const hexBefore = screen.getByTestId('playground-hex').textContent;
    fireEvent.change(screen.getByLabelText('Gamut Explorer OkLCh Hue value'), {
      target: { value: '200' },
    });

    expect(valueOf('OkLCh Hue value')).toBe('200');
    expect(screen.getByTestId('playground-hex').textContent).not.toBe(
      hexBefore,
    );
  });

  it('updates boundary values when Hue changes', () => {
    renderPlayground();
    const initialChart = screen.getByLabelText(
      /Current chroma: .*sRGB maximum chroma:/,
    );
    const initialDescription = initialChart.getAttribute('aria-label');

    fireEvent.change(screen.getByLabelText('Gamut Explorer OkLCh Hue slider'), {
      target: { value: '240' },
    });

    expect(
      screen.getByLabelText(/Current chroma: .*sRGB maximum chroma:/),
    ).not.toHaveAttribute('aria-label', initialDescription);
  });

  it('sets Current Color to an in-gamut binary-search boundary', () => {
    renderPlayground();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Outside sRGB / Inside Display P3',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Set C to sRGB boundary' }),
    );

    const status = screen.getByLabelText('Gamut Explorer current color status');
    expect(within(status).getByText('Inside sRGB gamut')).toBeInTheDocument();
    expect(valueOf('OkLCh Chroma value')).toBe(
      valueOf('Gamut Explorer OkLCh Chroma value'),
    );
  });

  it('applies all four verified presets to canonical Current Color', () => {
    renderPlayground();
    const status = screen.getByLabelText('Gamut Explorer current color status');
    const cases = [
      ['In sRGB', ['Inside sRGB gamut', 'Inside Display P3 gamut']],
      [
        'Outside sRGB / Inside Display P3',
        ['Outside sRGB gamut', 'Inside Display P3 gamut'],
      ],
      [
        'Outside Display P3 / Inside Rec.2020',
        ['Outside Display P3 gamut', 'Inside Rec.2020 gamut'],
      ],
      ['Outside Rec.2020', ['Outside Rec.2020 gamut']],
    ] as const;

    cases.forEach(([preset, expectedStatuses]) => {
      fireEvent.click(screen.getByRole('button', { name: preset }));
      expectedStatuses.forEach((expected) => {
        expect(within(status).getByText(expected)).toBeInTheDocument();
      });
    });
  });

  it('changes mapping target while preserving canonical Original', () => {
    renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'Outside Rec.2020' }));
    const originalCss = screen.getByTestId('playground-css-oklch').textContent;

    fireEvent.change(screen.getByLabelText('Target gamut'), {
      target: { value: 'display-p3' },
    });

    expect(
      screen.getByRole('article', {
        name: 'Simple clipping result for Display P3',
      }),
    ).toHaveTextContent('Inside Display P3 gamut');
    expect(
      screen.getByRole('article', {
        name: 'CSS gamut mapping result for Display P3',
      }),
    ).toHaveTextContent('Inside Display P3 gamut');
    expect(screen.getByTestId('playground-css-oklch')).toHaveTextContent(
      originalCss,
    );
  });
});
