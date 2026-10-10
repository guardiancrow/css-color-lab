import { useEffect, type ReactNode } from 'react';
import { Link, useHref, useLocation } from 'react-router-dom';

interface FragmentLinkProps {
  targetId: string;
  children: ReactNode;
  className?: string;
}

export function FragmentLink({
  targetId,
  children,
  className,
}: FragmentLinkProps) {
  const { pathname, search } = useLocation();
  const to = { pathname, search, hash: `#${targetId}` };
  const href = useHref(to);

  if (href.startsWith('#')) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={`#${targetId}`} className={className}>
      {children}
    </a>
  );
}

export function RouteFragment() {
  const location = useLocation();

  useEffect(() => {
    const targetId = location.hash.slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;
    if (typeof target.scrollIntoView === 'function') target.scrollIntoView();
    if (target.id === 'main-content') target.focus({ preventScroll: true });
  }, [location]);

  return null;
}
