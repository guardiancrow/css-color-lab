import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinearSrgbExperiment } from './LinearSrgbExperiment';
import { RgbInterpolationComparison } from './RgbInterpolationComparison';
import { SrgbDecodeExperiment } from './SrgbDecodeExperiment';

describe('sRGB transfer experiments', () => {
  it('decodes an adjustable 8-bit neutral gray', () => {
    render(<SrgbDecodeExperiment />);
    const slider = screen.getByLabelText('sRGB encoded gray value');

    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveValue('128');
    expect(
      screen.getByLabelText('Decoded linear-light value'),
    ).toHaveTextContent('0.216 · 21.6%');

    fireEvent.change(slider, { target: { value: '255' } });

    expect(
      screen.getByLabelText('Decoded linear-light value'),
    ).toHaveTextContent('1.000 · 100.0%');
  });

  it('encodes an adjustable linear-light gray for display', () => {
    render(<LinearSrgbExperiment />);
    const slider = screen.getByLabelText('Linear-light gray value');

    expect(slider).toHaveValue('0.5');
    expect(screen.getByText(/rgb\(188 188 188\)/)).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '0' } });

    expect(screen.getByText(/rgb\(0 0 0\)/)).toBeInTheDocument();
  });

  it('compares encoded and linear interpolation at the same amount', () => {
    render(<RgbInterpolationComparison />);

    const encoded = screen.getByRole('article', {
      name: 'sRGB encoded interpolation',
    });
    const linear = screen.getByRole('article', {
      name: 'Linear sRGB interpolation',
    });

    expect(within(encoded).getByText('128')).toBeInTheDocument();
    expect(within(linear).getByText('188')).toBeInTheDocument();

    const slider = screen.getByLabelText('White mix amount');
    fireEvent.change(slider, { target: { value: '100' } });

    expect(within(encoded).getByText('255')).toBeInTheDocument();
    expect(within(linear).getByText('255')).toBeInTheDocument();
  });
});
