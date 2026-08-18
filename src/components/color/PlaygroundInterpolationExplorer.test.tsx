import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../../App';
import { serializeColor } from '../../lib/color/colorEngine';
import {
  INITIAL_INTERPOLATION_PRESET,
  INTERPOLATION_SAMPLE_COUNT,
} from '../../lib/color/playgroundInterpolation';

function renderPlayground() {
  return render(
    <MemoryRouter initialEntries={['/playground']}>
      <App />
    </MemoryRouter>,
  );
}

function endpointCss(role: 'start' | 'end') {
  return screen.getByTestId(`interpolation-${role}-css`).textContent;
}

function resultCss(space: string) {
  return screen.getByTestId(`interpolation-result-${space}`).textContent;
}

describe('Playground Interpolation / Gradient Explorer', () => {
  it('renders endpoints, controls, four spaces, CSS, and navigation', () => {
    renderPlayground();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Interpolation / Gradient Explorer',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('article', { name: 'Start Color' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('article', { name: 'End Color' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Interpolation mix amount slider'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('OkLCh Hue interpolation method'),
    ).toBeInTheDocument();
    for (const label of ['sRGB', 'Linear sRGB', 'Oklab', 'OkLCh']) {
      const card = screen.getByRole('article', {
        name: `${label} interpolation result`,
      });
      expect(
        within(card).getByRole('img', { name: /sampled at 25 positions/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(`Generated ${label} color-mix CSS`),
      ).toBeInTheDocument();
    }
    expect(INTERPOLATION_SAMPLE_COUNT).toBe(25);
    expect(
      screen.getByRole('button', { name: 'Swap Start / End' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reset interpolation' }),
    ).toBeInTheDocument();
    const navigation = screen.getByRole('navigation', {
      name: 'Playground sections',
    });
    expect(
      within(navigation).getByRole('link', {
        name: 'Interpolation / Gradient',
      }),
    ).toHaveAttribute('href', '#interpolation');
  });

  it('starts from the Phase 10 Blue to Yellow endpoints', () => {
    renderPlayground();

    expect(endpointCss('start')).toBe(
      serializeColor(INITIAL_INTERPOLATION_PRESET.start),
    );
    expect(endpointCss('end')).toBe(
      serializeColor(INITIAL_INTERPOLATION_PRESET.end),
    );
    expect(screen.getByLabelText('Interpolation mix amount value')).toHaveValue(
      50,
    );
  });

  it('imports Current Color only through explicit endpoint actions', () => {
    renderPlayground();
    const initialStart = endpointCss('start');
    const initialEnd = endpointCss('end');

    fireEvent.click(screen.getByRole('button', { name: 'Blue' }));
    expect(endpointCss('start')).toBe(initialStart);
    expect(endpointCss('end')).toBe(initialEnd);

    fireEvent.click(
      screen.getByRole('button', { name: 'Use Current Color as Start' }),
    );
    expect(endpointCss('start')).toContain('rgb(0% 0% 100%)');
    expect(endpointCss('end')).toBe(initialEnd);

    fireEvent.click(screen.getByRole('button', { name: 'Red' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Use Current Color as End' }),
    );
    expect(endpointCss('end')).toContain('rgb(100% 0% 0%)');
  });

  it('swaps endpoints without changing interpolation settings', () => {
    renderPlayground();
    const start = endpointCss('start');
    const end = endpointCss('end');
    fireEvent.change(screen.getByLabelText('OkLCh Hue interpolation method'), {
      target: { value: 'longer' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Swap Start / End' }));

    expect(endpointCss('start')).toBe(end);
    expect(endpointCss('end')).toBe(start);
    expect(screen.getByLabelText('OkLCh Hue interpolation method')).toHaveValue(
      'longer',
    );
  });

  it('updates four selected results without changing sampled gradients', () => {
    renderPlayground();
    const spaces = ['srgb', 'srgb-linear', 'oklab', 'oklch'];
    const before = spaces.map(resultCss);
    const gradients = screen.getAllByRole('img', {
      name: /gradient sampled at 25 positions/,
    });
    const gradientStyles = gradients.map((gradient) =>
      gradient.getAttribute('style'),
    );

    fireEvent.change(screen.getByLabelText('Interpolation mix amount slider'), {
      target: { value: '25' },
    });

    spaces.forEach((space, index) => {
      expect(resultCss(space)).not.toBe(before[index]);
    });
    expect(gradients.map((gradient) => gradient.getAttribute('style'))).toEqual(
      gradientStyles,
    );
    expect(screen.getByTestId('color-mix-oklch')).toHaveTextContent('25%');
  });

  it('changes only the OkLCh route when selecting another Hue method', () => {
    renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'Magenta → Green' }));
    const srgbBefore = resultCss('srgb');
    const oklchBefore = resultCss('oklch');

    fireEvent.change(screen.getByLabelText('OkLCh Hue interpolation method'), {
      target: { value: 'longer' },
    });

    expect(resultCss('srgb')).toBe(srgbBefore);
    expect(resultCss('oklch')).not.toBe(oklchBefore);
    expect(screen.getByTestId('color-mix-oklch')).toHaveTextContent(
      'oklch longer hue',
    );
  });

  it('handles powerless Hue and premultiplied alpha endpoints', () => {
    renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'Neutral gray' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Use Current Color as Start' }),
    );
    expect(screen.getByText(/Start h: none/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Transparent red → Blue' }),
    );
    for (const label of ['sRGB', 'Linear sRGB', 'Oklab', 'OkLCh']) {
      const card = screen.getByRole('article', {
        name: `${label} interpolation result`,
      });
      expect(within(card).getByText('0.5')).toBeInTheDocument();
    }
  });

  it('discloses raw out-of-gamut results and maps only previews', () => {
    renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'Magenta → Green' }));
    const card = screen.getByRole('article', {
      name: 'OkLCh interpolation result',
    });

    expect(
      within(card).getByText(/Raw result is retained outside sRGB/),
    ).toBeInTheDocument();
    expect(within(card).getByText('sRGB: outside')).toBeInTheDocument();
    expect(resultCss('oklch')).toContain('oklch');
  });

  it('applies one selected result to Current Color without changing endpoints', () => {
    renderPlayground();
    const start = endpointCss('start');
    const end = endpointCss('end');
    const result = resultCss('oklab');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Use Oklab result as Current Color',
      }),
    );

    expect(screen.getByTestId('playground-css-oklab').textContent).toBe(result);
    expect(endpointCss('start')).toBe(start);
    expect(endpointCss('end')).toBe(end);
    expect(
      screen.getByLabelText('Gamut Explorer OkLCh Chroma value'),
    ).toBeInTheDocument();
  });

  it('resets only interpolation state and preserves Current Color', () => {
    renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'Blue' }));
    const currentHex = screen.getByTestId('playground-hex').textContent;
    fireEvent.click(
      screen.getByRole('button', { name: 'Transparent red → Blue' }),
    );
    fireEvent.change(screen.getByLabelText('Interpolation mix amount value'), {
      target: { value: '20' },
    });
    fireEvent.change(screen.getByLabelText('OkLCh Hue interpolation method'), {
      target: { value: 'decreasing' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset interpolation' }),
    );

    expect(endpointCss('start')).toBe(
      serializeColor(INITIAL_INTERPOLATION_PRESET.start),
    );
    expect(endpointCss('end')).toBe(
      serializeColor(INITIAL_INTERPOLATION_PRESET.end),
    );
    expect(screen.getByLabelText('Interpolation mix amount value')).toHaveValue(
      50,
    );
    expect(screen.getByLabelText('OkLCh Hue interpolation method')).toHaveValue(
      'shorter',
    );
    expect(screen.getByTestId('playground-hex').textContent).toBe(currentHex);
  });
});
