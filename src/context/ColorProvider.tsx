import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { initialColor } from '../lib/color/initialColor';
import type { CanonicalColor } from '../types/color';
import { ColorContext } from './ColorContext';

interface ColorProviderProps extends PropsWithChildren {
  readonly initialValue?: CanonicalColor;
}

export function ColorProvider({
  children,
  initialValue = initialColor,
}: ColorProviderProps) {
  const [currentColor, setCurrentColor] = useState(initialValue);
  const value = useMemo(
    () => ({ currentColor, setCurrentColor }),
    [currentColor],
  );

  return <ColorContext value={value}>{children}</ColorContext>;
}
