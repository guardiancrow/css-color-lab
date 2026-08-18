import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

function renderPlayground() {
  return render(
    <MemoryRouter initialEntries={['/playground']}>
      <App />
    </MemoryRouter>,
  );
}

function inputValue(label: string): string {
  return screen.getByLabelText<HTMLInputElement>(label).value;
}

describe('Playground Color Converter', () => {
  it('renders the summary, all six editors, and accessible navigation', () => {
    renderPlayground();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Current Color' }),
    ).toBeInTheDocument();
    for (const name of ['sRGB', 'HSL', 'Lab', 'LCh', 'Oklab', 'OkLCh']) {
      expect(
        screen.getByRole('heading', { level: 2, name }),
      ).toBeInTheDocument();
    }
    expect(screen.getByLabelText('Red value')).toBeInTheDocument();
    expect(screen.getByLabelText('OkLCh Hue value')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reset to #D27A43' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Wide gamut' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Playground' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByLabelText('Playground gamut status'),
    ).toBeInTheDocument();
  });

  it('starts from #D27A43 and derives each editor from that color', () => {
    renderPlayground();

    expect(screen.getByTestId('playground-hex')).toHaveTextContent('#D27A43');
    expect(inputValue('Red value')).toBe('210');
    expect(inputValue('Green value')).toBe('122');
    expect(inputValue('Blue value')).toBe('67');
    expect(Number(inputValue('Hue value'))).toBeGreaterThan(0);
    expect(Number(inputValue('Lab a axis value'))).toBeGreaterThan(0);
    expect(Number(inputValue('LCh Chroma value'))).toBeGreaterThan(0);
    expect(Number(inputValue('Oklab a axis value'))).toBeGreaterThan(0);
    expect(Number(inputValue('OkLCh Chroma value'))).toBeGreaterThan(0);
  });

  it('synchronizes every space and CSS summary from OkLCh and sRGB edits', () => {
    renderPlayground();

    const labels = [
      'Red value',
      'Hue value',
      'Lab a axis value',
      'LCh Chroma value',
      'Oklab a axis value',
      'OkLCh Chroma value',
    ];
    const before = labels.map(inputValue);
    const cssBefore = screen.getByTestId('playground-css-rgb').textContent;
    const gamutBefore = screen.getByText(
      /sRGB: Inside · Display P3: Inside/,
    ).textContent;

    fireEvent.change(screen.getByLabelText('OkLCh Chroma value'), {
      target: { value: '0.3' },
    });

    labels.forEach((label, index) => {
      expect(inputValue(label)).not.toBe(before[index]);
    });
    expect(screen.getByTestId('playground-css-rgb').textContent).not.toBe(
      cssBefore,
    );
    expect(screen.getByText(/sRGB: Outside/).textContent).not.toBe(gamutBefore);

    const oklchBeforeRgbEdit = screen.getByTestId(
      'playground-css-oklch',
    ).textContent;
    fireEvent.change(screen.getByLabelText('Red value'), {
      target: { value: '0' },
    });
    expect(screen.getByTestId('playground-css-oklch').textContent).not.toBe(
      oklchBeforeRgbEdit,
    );
  });

  it('applies presets and resets the canonical color', () => {
    renderPlayground();

    fireEvent.click(screen.getByRole('button', { name: 'Blue' }));
    expect(screen.getByTestId('playground-hex')).toHaveTextContent('#00F');

    fireEvent.click(screen.getByRole('button', { name: 'Reset to #D27A43' }));
    expect(screen.getByTestId('playground-hex')).toHaveTextContent('#D27A43');
    expect(inputValue('Alpha value')).toBe('1');
  });

  it('keeps the verified wide-gamut original while annotating mapped output', () => {
    renderPlayground();

    fireEvent.click(screen.getByRole('button', { name: 'Wide gamut' }));

    expect(screen.getByText(/sRGB: Outside/)).toBeInTheDocument();
    expect(screen.getByText(/Display P3: Inside/)).toBeInTheDocument();
    expect(screen.getByText('Hex (mapped to sRGB)')).toBeInTheDocument();
    expect(screen.getByTestId('playground-css-oklch')).toHaveTextContent('70%');
    expect(
      screen.getByLabelText('Native original color preview'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Color preview mapped to sRGB for display'),
    ).toBeInTheDocument();
  });

  it('updates alpha once, serializes it, and preserves it across color edits', () => {
    renderPlayground();

    fireEvent.change(screen.getByLabelText('Alpha value'), {
      target: { value: '0.5' },
    });
    expect(screen.getByTestId('playground-css-oklch')).toHaveTextContent('/');

    fireEvent.change(screen.getByLabelText('Blue value'), {
      target: { value: '20' },
    });
    expect(inputValue('Alpha value')).toBe('0.5');
    expect(screen.getByTestId('playground-css-rgb')).toHaveTextContent('/');
  });

  it('keeps powerless OkLCh Hue editable when Chroma is zero', () => {
    renderPlayground();

    fireEvent.change(screen.getByLabelText('OkLCh Chroma value'), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText('OkLCh Hue value'), {
      target: { value: '120' },
    });

    expect(inputValue('OkLCh Chroma value')).toBe('0');
    expect(inputValue('OkLCh Hue value')).toBe('120');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Color Converter' }),
    ).toBeInTheDocument();
  });
});
