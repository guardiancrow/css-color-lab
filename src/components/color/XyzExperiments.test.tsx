import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorProvider } from '../../context/ColorProvider';
import { initialColor } from '../../lib/color/initialColor';
import { CurrentColorXyzPipeline } from './CurrentColorXyzPipeline';
import { RGBControls } from './RGBControls';
import { RgbSpaceComparison } from './RgbSpaceComparison';
import { XyzGrayExperiment } from './XyzGrayExperiment';
import { XyzPrimaryExperiment } from './XyzPrimaryExperiment';

describe('XYZ lesson experiments', () => {
  it('updates the XYZ pipeline when RGB Controls update Current Color', () => {
    render(
      <ColorProvider initialValue={initialColor}>
        <RGBControls />
        <CurrentColorXyzPipeline />
      </ColorProvider>,
    );
    const xyzCard = screen.getByRole('article', { name: 'XYZ D65' });
    const xValue = within(xyzCard).getByLabelText('XYZ D65 X value');
    const initialX = xValue.textContent;

    fireEvent.change(screen.getByLabelText('Red slider'), {
      target: { value: '0' },
    });

    expect(xValue.textContent).not.toBe(initialX);
  });

  it('selects RGB presets with accessible native buttons', () => {
    render(<XyzPrimaryExperiment />);

    const redButton = screen.getByRole('button', { name: 'Red' });
    const blueButton = screen.getByRole('button', { name: 'Blue' });
    expect(redButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(blueButton);

    expect(blueButton).toHaveAttribute('aria-pressed', 'true');
    expect(redButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('XYZ D65 X value')).toHaveTextContent(
      '0.1805',
    );
  });

  it('keeps neutral gray Y synchronized with its labeled slider', () => {
    render(<XyzGrayExperiment />);
    const slider = screen.getByLabelText('sRGB gray for Y comparison');

    expect(slider).toHaveAttribute('type', 'range');
    expect(screen.getByLabelText('Neutral gray XYZ Y value')).toHaveTextContent(
      '0.2159',
    );

    fireEvent.change(slider, { target: { value: '255' } });

    expect(screen.getByLabelText('Neutral gray XYZ Y value')).toHaveTextContent(
      '1',
    );
  });

  it('shows different XYZ results for the same RGB coordinates', () => {
    render(<RgbSpaceComparison />);

    expect(screen.getByLabelText('Shared green coordinate')).toHaveValue('50');
    const srgb = screen.getByRole('article', { name: 'sRGB → XYZ D65' });
    const p3 = screen.getByRole('article', {
      name: 'Display P3 → XYZ D65',
    });

    expect(
      within(srgb).getByLabelText('sRGB → XYZ D65 X value'),
    ).toHaveTextContent('0.4889');
    expect(
      within(p3).getByLabelText('Display P3 → XYZ D65 X value'),
    ).toHaveTextContent('0.5434');
  });
});
