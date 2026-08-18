import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { ModernCssColorChapter } from './ModernCssColorChapter';

describe('Modern CSS Color chapter', () => {
  it('renders the final learning flow and accessible Playground link', () => {
    render(
      <MemoryRouter>
        <ColorProvider>
          <ModernCssColorChapter />
        </ColorProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Modern CSS Color' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Relative Color')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'color-mix()' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('color-mix theme variation example'),
    ).toBeInTheDocument();
    expect(screen.getByText('CSS Color 4')).toBeInTheDocument();
    expect(screen.getByText('CSS Color 5')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Color Playgroundへ進む' }),
    ).toHaveAttribute('href', '/playground');
  });
});
