import { describe, expect, it } from 'vitest';
import { createColor } from './colorEngine';
import {
  commitSrgbByteInput,
  createSrgbColorFrom8Bit,
  getSrgb8BitChannels,
  parseSrgbByteInput,
  updateSrgb8BitChannel,
} from './srgb8Bit';

describe('8-bit sRGB UI boundary', () => {
  it('converts between UI integers and internal coordinates', () => {
    const color = createSrgbColorFrom8Bit([210, 122, 67]);

    expect(color.coordinates[0]).toBeCloseTo(210 / 255, 14);
    expect(color.coordinates[1]).toBeCloseTo(122 / 255, 14);
    expect(color.coordinates[2]).toBeCloseTo(67 / 255, 14);
    expect(getSrgb8BitChannels(color)).toEqual([210, 122, 67]);
  });

  it('rounds floating-point noise only at the UI boundary', () => {
    const color = createColor('srgb', [
      209.999999999 / 255,
      122.000000001 / 255,
      67 / 255,
    ]);

    expect(getSrgb8BitChannels(color)).toEqual([210, 122, 67]);
    expect(color.coordinates[0]).not.toBe(210 / 255);
  });

  it('updates one channel and preserves the others and alpha', () => {
    const updated = updateSrgb8BitChannel(
      createSrgbColorFrom8Bit([210, 122, 67], 0.35),
      0,
      255,
    );

    expect(getSrgb8BitChannels(updated)).toEqual([255, 122, 67]);
    expect(updated.alpha).toBe(0.35);
  });

  it('separates valid live input from blur and Enter normalization', () => {
    expect(parseSrgbByteInput('128')).toBe(128);
    expect(parseSrgbByteInput('')).toBeNull();
    expect(parseSrgbByteInput('-1')).toBeNull();
    expect(parseSrgbByteInput('256')).toBeNull();
    expect(parseSrgbByteInput('12.5')).toBeNull();
    expect(commitSrgbByteInput('', 42)).toBe(42);
    expect(commitSrgbByteInput('-1', 42)).toBe(0);
    expect(commitSrgbByteInput('300', 42)).toBe(255);
    expect(commitSrgbByteInput('12.5', 42)).toBe(13);
    expect(commitSrgbByteInput('not-a-number', 42)).toBe(42);
  });
});
