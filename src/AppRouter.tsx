import type { ReactNode } from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';

interface AppRouterProps {
  children: ReactNode;
  mode?: string;
}

export function AppRouter({
  children,
  mode = import.meta.env.MODE,
}: AppRouterProps) {
  const Router = mode === 'pages' ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
}
