import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { CanonicalColor } from '../types/color';

export interface ColorContextValue {
  readonly currentColor: CanonicalColor;
  readonly setCurrentColor: Dispatch<SetStateAction<CanonicalColor>>;
}

export const ColorContext = createContext<ColorContextValue | null>(null);
