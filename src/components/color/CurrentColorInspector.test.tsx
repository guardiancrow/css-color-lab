import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { CurrentColorInspector } from './CurrentColorInspector';

describe('CurrentColorInspector', () => {
  it('renders the placeholder color representations', () => {
    render(
      <ColorProvider>
        <CurrentColorInspector />
      </ColorProvider>,
    );

    expect(
      screen.getByRole('complementary', { name: 'Inspector' }),
    ).toBeInTheDocument();
    expect(screen.getByText('#D27A43')).toBeInTheDocument();
    expect(screen.getByText('210 122 67')).toBeInTheDocument();
    expect(screen.getByText('XYZ D65')).toBeInTheDocument();
    expect(screen.getByText('OkLCh')).toBeInTheDocument();
    expect(screen.getByText('sRGB gamut: In gamut')).toBeInTheDocument();
    expect(screen.queryByText('— — —')).not.toBeInTheDocument();
  });
});
