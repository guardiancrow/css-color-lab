import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrentColorInspector } from './CurrentColorInspector';

describe('CurrentColorInspector', () => {
  it('renders the placeholder color representations', () => {
    render(<CurrentColorInspector />);

    expect(
      screen.getByRole('complementary', { name: 'Inspector' }),
    ).toBeInTheDocument();
    expect(screen.getByText('#6C5CE7')).toBeInTheDocument();
    expect(screen.getByText('OkLCh')).toBeInTheDocument();
  });
});
