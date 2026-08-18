import { use } from 'react';
import { ColorContext } from './ColorContext';

export function useCurrentColor() {
  const context = use(ColorContext);

  if (!context) {
    throw new Error('useCurrentColor must be used within ColorProvider.');
  }

  return context;
}
