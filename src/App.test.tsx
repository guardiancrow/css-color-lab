import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('application routes', () => {
  it('renders the Learn page and its chapter navigation', () => {
    renderAt('/');

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
  });

  it('renders the Playground page', () => {
    renderAt('/playground');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Color Playground' }),
    ).toBeInTheDocument();
  });
});
