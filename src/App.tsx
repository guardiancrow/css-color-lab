import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { ColorProvider } from './context/ColorProvider';
import { FragmentLink, RouteFragment } from './components/FragmentLink';
import { LearnPage } from './pages/LearnPage';
import { PlaygroundPage } from './pages/PlaygroundPage';

function NotFoundPage() {
  return (
    <main id="main-content" className="standalone-page" tabIndex={-1}>
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
    <ColorProvider>
      <RouteFragment />
      <div className="app-shell">
        <FragmentLink className="skip-link" targetId="main-content">
          本文へ移動
        </FragmentLink>
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
        <footer className="site-footer">
          <a className="text-link" href={`${import.meta.env.BASE_URL}LICENSE`}>
            MITライセンス
          </a>{' '}
          ·{' '}
          <a
            className="text-link"
            href={`${import.meta.env.BASE_URL}THIRD_PARTY_NOTICES.md`}
          >
            第三者ライセンス
          </a>
        </footer>
      </div>
    </ColorProvider>
  );
}
