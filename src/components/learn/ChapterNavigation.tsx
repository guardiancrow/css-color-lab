import type { ChapterDefinition } from '../../types/learn';

interface ChapterNavigationProps {
  chapters: readonly ChapterDefinition[];
}

export function ChapterNavigation({ chapters }: ChapterNavigationProps) {
  return (
    <nav className="chapter-navigation" aria-label="章ナビゲーション">
      <p className="sidebar-heading">Chapters</p>
      <ol>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <a href={`#${chapter.id}`}>
              <span aria-hidden="true">
                {String(chapter.number).padStart(2, '0')}
              </span>
              {chapter.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
