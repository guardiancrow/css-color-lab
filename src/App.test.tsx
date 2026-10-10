import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function expectNamedInteractiveControls(container: HTMLElement) {
  for (const control of container.querySelectorAll(
    'button, input, select, summary',
  )) {
    expect(control).toHaveAccessibleName();
  }
}

describe('application routes', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(['/', '/css-color-lab/'])(
    'links to third-party licenses at %s',
    (base) => {
      vi.stubEnv('BASE_URL', base);
      renderAt('/playground');
      expect(
        screen.getByRole('link', { name: '第三者ライセンス' }),
      ).toHaveAttribute('href', `${base}THIRD_PARTY_NOTICES.md`);
      expect(
        screen.getByRole('link', { name: 'MITライセンス' }),
      ).toHaveAttribute('href', `${base}LICENSE`);
    },
  );
  it('renders the Learn page and its chapter navigation', () => {
    const { container } = renderAt('/');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '色空間を、触りながら理解する。',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: '章ナビゲーション' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('region')).toHaveLength(10);
    expect(
      screen.getByRole('heading', { level: 3, name: 'RGBとは' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Mix red, green, and blue' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'sRGB' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Linear sRGB' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'XYZ' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'HSL' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Lab / LCh' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Oklab / OkLCh' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Gamut' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Modern CSS Color' }),
    ).toBeInTheDocument();
    expect(container.querySelector('.learn-layout')).toBeInTheDocument();
    expect(container.querySelector('.learn-sidebars')).toBeInTheDocument();
    expect(container.querySelector('.chapter-list')).toBeInTheDocument();
    expect(container.querySelector('.oklab-editor-grid')).toBeInTheDocument();
    expect(container.querySelector('.gamut-experiment')).toBeInTheDocument();
    expect(
      container.querySelector('.interpolation-result-grid'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.relative-color-experiment'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '本文へ移動' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expectNamedInteractiveControls(container);
  });

  it('renders the Playground page', () => {
    const { container } = renderAt('/playground');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Color Playground' }),
    ).toBeInTheDocument();
    const sectionNavigation = screen.getByRole('navigation', {
      name: 'Playground sections',
    });
    for (const link of sectionNavigation.querySelectorAll('a')) {
      const target = link.getAttribute('href');
      expect(target).toMatch(/^#/);
      expect(container.querySelector(target ?? '')).toBeInTheDocument();
    }
    expectNamedInteractiveControls(container);
  });
});
