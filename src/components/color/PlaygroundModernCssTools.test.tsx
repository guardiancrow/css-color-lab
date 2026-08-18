import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../App';

function renderPlayground() {
  return render(
    <MemoryRouter initialEntries={['/playground']}>
      <App />
    </MemoryRouter>,
  );
}

function generatedCode(label: string) {
  return screen.getByLabelText(`Generated ${label} CSS`).textContent;
}

describe('Playground Modern CSS Tools', () => {
  it('renders four accessible tools, generated code, and section navigation', () => {
    renderPlayground();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Modern CSS Tools' }),
    ).toBeInTheDocument();
    for (const name of [
      'Relative Color',
      'color-mix()',
      'light-dark()',
      'contrast-color()',
    ]) {
      expect(
        screen.getByRole('heading', { level: 3, name }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByLabelText('Generated Relative Color CSS'),
    ).toHaveTextContent('oklch(from var(--base)');
    expect(screen.getByLabelText('Generated color-mix CSS')).toHaveTextContent(
      'color-mix(in oklab',
    );
    expect(screen.getByLabelText('Generated light-dark CSS')).toHaveTextContent(
      'color-scheme: light dark',
    );
    expect(
      screen.getByLabelText('Generated contrast-color CSS'),
    ).toHaveTextContent('contrast-color(');
    const navigation = screen.getByRole('navigation', {
      name: 'Playground sections',
    });
    expect(
      within(navigation).getByRole('link', { name: 'Modern CSS Tools' }),
    ).toHaveAttribute('href', '#modern-css');
  });

  it('keeps Relative Color local until explicit import and apply actions', () => {
    renderPlayground();
    const initialCode = generatedCode('Relative Color');
    const interpolationStart = screen.getByTestId(
      'interpolation-start-css',
    ).textContent;

    fireEvent.click(screen.getByRole('button', { name: 'Blue' }));
    expect(generatedCode('Relative Color')).toBe(initialCode);

    fireEvent.click(
      screen.getByRole('button', { name: 'Use Current Color as Base' }),
    );
    expect(generatedCode('Relative Color')).not.toBe(initialCode);
    expect(generatedCode('Relative Color')).toContain('45.201%');
    const before = screen.getByTestId('modern-relative-result').textContent;
    fireEvent.change(screen.getByLabelText('Relative Chroma offset'), {
      target: { value: '0.2' },
    });
    expect(screen.getByTestId('modern-relative-result').textContent).not.toBe(
      before,
    );
    expect(
      within(
        screen.getByLabelText('Modern Relative Color gamut status'),
      ).getByText('Outside sRGB gamut'),
    ).toBeInTheDocument();
    const baseAfterImport = generatedCode('Relative Color');
    const currentBeforeApply = screen.getByTestId('playground-hex').textContent;

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Use Relative Color Result as Current Color',
      }),
    );
    expect(screen.getByTestId('playground-css-oklch')).toHaveTextContent(
      'oklch',
    );
    expect(screen.getByTestId('playground-hex').textContent).not.toBe(
      currentBeforeApply,
    );
    expect(generatedCode('Relative Color')).toBe(baseAfterImport);
    expect(screen.getByTestId('interpolation-start-css').textContent).toBe(
      interpolationStart,
    );
    expect(
      screen.getByLabelText('Gamut Explorer OkLCh Chroma value'),
    ).toBeInTheDocument();
  }, 15_000);

  it('resets only Relative Color state and preserves Current Color', () => {
    renderPlayground();
    const initialCode = generatedCode('Relative Color');
    fireEvent.click(screen.getByRole('button', { name: 'Blue' }));
    const current = screen.getByTestId('playground-hex').textContent;
    fireEvent.click(
      screen.getByRole('button', { name: 'Use Current Color as Base' }),
    );
    fireEvent.change(screen.getByLabelText('Relative Hue offset'), {
      target: { value: '90' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Relative Color' }),
    );

    expect(screen.getByTestId('playground-hex').textContent).toBe(current);
    expect(screen.getByLabelText('Relative Hue offset')).toHaveValue('0');
    expect(generatedCode('Relative Color')).toBe(initialCode);
  });

  it('imports color-mix endpoints and updates space, amount, and hue method', () => {
    renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'Red' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Use Current Color as Color A' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Blue' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Use Current Color as Color B' }),
    );
    fireEvent.change(screen.getByLabelText('Modern color-mix amount'), {
      target: { value: '0.25' },
    });
    fireEvent.change(screen.getByLabelText('color-mix interpolation space'), {
      target: { value: 'oklch' },
    });
    fireEvent.change(screen.getByLabelText('color-mix OkLCh Hue method'), {
      target: { value: 'longer' },
    });

    expect(generatedCode('color-mix')).toContain('in oklch longer hue');
    expect(generatedCode('color-mix')).toContain('25%');
    expect(screen.getByTestId('modern-color-mix-result')).toHaveTextContent(
      'oklch',
    );
    expect(
      screen.getByLabelText('Modern color-mix gamut status'),
    ).toBeInTheDocument();
  });

  it('simulates light and dark locally and emits the required color-scheme', () => {
    renderPlayground();
    expect(
      screen.getByLabelText('Simulated light scheme result'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(
      screen.getByLabelText('Simulated dark scheme result'),
    ).toBeInTheDocument();
    expect(generatedCode('light-dark')).toContain('color-scheme: light dark');
    expect(generatedCode('light-dark')).toContain('light-dark(');
  });

  it('shows verified black and white ratios for neutral gray', () => {
    renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'Neutral gray' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Use Current Color as Background',
      }),
    );

    expect(screen.getByText('5.28 : 1')).toBeInTheDocument();
    expect(screen.getByText('3.98 : 1')).toBeInTheDocument();
    expect(
      screen.getByText('Best of black / white: black'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /does not guarantee that every accessibility requirement/,
      ),
    ).toBeInTheDocument();
  });

  it('reports runtime support when CSS.supports is available', () => {
    vi.stubGlobal('CSS', { supports: vi.fn(() => true) });
    try {
      renderPlayground();
      for (const label of [
        'Relative Color',
        'color-mix()',
        'light-dark()',
        'contrast-color()',
      ]) {
        expect(
          screen.getByText(`${label} support: Supported`),
        ).toBeInTheDocument();
      }
      expect(
        screen.getByLabelText('Browser native relative color preview'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Browser native light-dark preview'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Browser native contrast-color preview'),
      ).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps Engine tools usable when native CSS is unsupported', () => {
    vi.stubGlobal('CSS', { supports: vi.fn(() => false) });
    try {
      renderPlayground();
      for (const label of [
        'Relative Color',
        'color-mix()',
        'light-dark()',
        'contrast-color()',
      ]) {
        expect(
          screen.getByText(`${label} support: Unsupported`),
        ).toBeInTheDocument();
      }
      expect(
        screen.getAllByText('Native preview unavailable in this browser.'),
      ).not.toHaveLength(0);
      expect(
        screen.getByText('Engine result remains available.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'Use Relative Color Result as Current Color',
        }),
      ).toBeEnabled();
      expect(screen.getByText(/Best of black \/ white:/)).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('announces clipboard success and failure without hiding generated CSS', async () => {
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'clipboard',
    );
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    try {
      renderPlayground();
      fireEvent.click(
        screen.getByRole('button', { name: 'Copy Relative Color CSS' }),
      );
      expect(await screen.findByText('Copied')).toBeInTheDocument();
      expect(writeText).toHaveBeenCalledWith(generatedCode('Relative Color'));

      writeText.mockRejectedValueOnce(new Error('Denied'));
      fireEvent.click(
        screen.getByRole('button', { name: 'Copy color-mix CSS' }),
      );
      expect(
        await screen.findByText(
          'Could not copy automatically. Select the code manually.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Generated color-mix CSS')).toBeVisible();

      Reflect.deleteProperty(navigator, 'clipboard');
      fireEvent.click(
        screen.getByRole('button', { name: 'Copy contrast-color CSS' }),
      );
      await waitFor(() => {
        expect(
          screen.getAllByText(
            'Could not copy automatically. Select the code manually.',
          ),
        ).toHaveLength(2);
      });
    } finally {
      if (clipboardDescriptor) {
        Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
      } else {
        Reflect.deleteProperty(navigator, 'clipboard');
      }
    }
  });
});
