import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { AppRouter } from './AppRouter';

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

function renderAt(mode: string, url: string) {
  window.history.replaceState(null, '', url);
  return render(
    <AppRouter mode={mode}>
      <App />
    </AppRouter>,
  );
}

describe.each(['development', 'production', 'pages'])('%s routing', (mode) => {
  const pages = mode === 'pages';
  const prefix = pages ? '/css-color-lab/' : '';
  const route = (path: string) => `${prefix}${pages ? '#' : ''}${path}`;

  it('opens Learn at the base URL and navigates to Playground and back', async () => {
    const getElementById = vi.spyOn(document, 'getElementById');
    renderAt(mode, pages ? prefix : '/');
    expect(getElementById).not.toHaveBeenCalledWith('');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '色空間を、触りながら理解する。',
    );
    const nav = within(
      screen.getByRole('navigation', { name: 'メインナビゲーション' }),
    );
    expect(nav.getByRole('link', { name: 'Playground' })).toHaveAttribute(
      'href',
      pages ? '#/playground' : '/playground',
    );
    fireEvent.click(nav.getByRole('link', { name: 'Playground' }));
    await screen.findByRole('heading', { name: 'Color Playground' });
    expect(window.location.pathname + window.location.hash).toBe(
      route('/playground'),
    );
    fireEvent.click(nav.getByRole('link', { name: 'Learn' }));
    await screen.findByRole('heading', {
      name: '色空間を、触りながら理解する。',
    });
    expect(window.location.pathname + window.location.hash).toBe(route('/'));
    expect(getElementById).not.toHaveBeenCalledWith('');
  });

  it('ignores a fragment whose target is not on the page', () => {
    const getElementById = vi.spyOn(document, 'getElementById');
    renderAt(mode, route('/playground') + '#missing-target');
    expect(getElementById).toHaveBeenCalledWith('missing-target');
    expect(
      screen.getByRole('heading', { name: 'Color Playground' }),
    ).toBeInTheDocument();
  });

  it('opens Playground directly, including after remounting on the same URL', () => {
    const first = renderAt(mode, route('/playground'));
    expect(
      screen.getByRole('heading', { name: 'Color Playground' }),
    ).toBeInTheDocument();
    first.unmount();
    renderAt(mode, window.location.pathname + window.location.hash);
    expect(
      screen.getByRole('heading', { name: 'Color Playground' }),
    ).toBeInTheDocument();
  });

  it('renders an app 404 and returns to Learn', async () => {
    renderAt(mode, route('/missing'));
    expect(
      screen.getByRole('heading', { name: 'ページが見つかりません' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Learnへ戻る' }));
    await screen.findByRole('heading', {
      name: '色空間を、触りながら理解する。',
    });
  });
});

describe.each(['production', 'pages'])('%s fragments', (mode) => {
  const pages = mode === 'pages';
  const route = (path: string) => `${pages ? '/css-color-lab/#' : ''}${path}`;

  it('keeps the Playground route for section navigation and focuses the skip target', async () => {
    renderAt(mode, route('/playground'));
    const nav = within(
      screen.getByRole('navigation', { name: 'Playground sections' }),
    );
    const link = nav.getByRole('link', { name: 'Gamut Explorer' });
    expect(link).toHaveAttribute(
      'href',
      pages ? '#/playground#gamut-explorer' : '#gamut-explorer',
    );
    const scroll = vi.fn();
    const section = document.getElementById('gamut-explorer');
    if (!section) throw new Error('Gamut Explorer was not rendered');
    section.scrollIntoView = scroll;
    fireEvent.click(link);
    await waitFor(() => {
      expect(scroll).toHaveBeenCalled();
    });
    expect(window.location.hash).toBe(
      pages ? '#/playground#gamut-explorer' : '#gamut-explorer',
    );
    expect(
      screen.getByRole('heading', { name: 'Color Playground' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: '本文へ移動' }));
    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveFocus();
    });
    expect(window.location.hash).toBe(
      pages ? '#/playground#main-content' : '#main-content',
    );
  });

  it('restores a section fragment on direct access and preserves Learn chapter links', async () => {
    renderAt(mode, route('/playground') + '#modern-css');
    expect(
      screen.getByRole('heading', { name: 'Color Playground' }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(
        screen.getByRole('navigation', { name: 'メインナビゲーション' }),
      ).getByRole('link', { name: 'Learn' }),
    );
    await screen.findByRole('heading', {
      name: '色空間を、触りながら理解する。',
    });
    const chapters = screen.getByRole('navigation', {
      name: '章ナビゲーション',
    });
    const rgb = chapters.querySelector<HTMLAnchorElement>(
      pages ? 'a[href="#/#rgb"]' : 'a[href="#rgb"]',
    );
    if (!rgb) throw new Error('RGB chapter link was not rendered');
    expect(rgb).toBeInTheDocument();
    fireEvent.click(rgb);
    await waitFor(() => {
      expect(window.location.hash).toBe(pages ? '#/#rgb' : '#rgb');
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '色空間を、触りながら理解する。',
    );
  });
});
