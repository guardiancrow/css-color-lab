import { CurrentColorInspector } from '../components/color/CurrentColorInspector';
import { ChapterNavigation } from '../components/learn/ChapterNavigation';
import { ChapterSectionList } from '../components/learn/ChapterSections';
import { chapters } from '../lib/chapters';

export function LearnPage() {
  return (
    <main id="main-content" className="learn-page">
      <header className="learn-hero">
        <p className="eyebrow">Interactive learning path</p>
        <h1>色空間を、触りながら理解する。</h1>
        <p>
          RGBからOklabまで。CSSの色がどのように表現され、計算されるのかを段階的に学びます。
        </p>
      </header>
      <div className="learn-layout">
        <div className="sticky-region">
          <ChapterNavigation chapters={chapters} />
        </div>
        <div className="chapter-list">
          <ChapterSectionList />
        </div>
        <div className="sticky-region inspector-region">
          <CurrentColorInspector />
        </div>
      </div>
    </main>
  );
}
