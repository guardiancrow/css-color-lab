import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { LearnPage } from './pages/LearnPage';
import { PlaygroundPage } from './pages/PlaygroundPage';

function NotFoundPage() {
  return (
    <main id="main-content" className="standalone-page">
      <p className="eyebrow">404</p>
      <h1>ページが見つかりません</h1>
      <p>指定されたURLを確認するか、教材の最初に戻ってください。</p>
      <Link className="text-link" to="/">
        Learnへ戻る
      </Link>
    </main>
  );
}

export function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        本文へ移動
      </a>
      <header className="site-header">
        <Link className="site-title" to="/" aria-label="CSS Color Lab ホーム">
          <span className="brand-mark" aria-hidden="true" />
          CSS Color Lab
        </Link>
        <nav aria-label="メインナビゲーション">
          <ul className="site-nav">
            <li>
              <NavLink to="/" end>
                Learn
              </NavLink>
            </li>
            <li>
              <NavLink to="/playground">Playground</NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<LearnPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
