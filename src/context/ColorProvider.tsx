import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { initialColor } from '../lib/color/initialColor';
import { ColorContext } from './ColorContext';

export function ColorProvider({ children }: PropsWithChildren) {
  const [currentColor, setCurrentColor] = useState(initialColor);
  const value = useMemo(
    () => ({ currentColor, setCurrentColor }),
    [currentColor],
  );

  return <ColorContext value={value}>{children}</ColorContext>;
}
