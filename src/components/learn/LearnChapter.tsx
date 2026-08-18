import type { ChapterDefinition } from '../../types/learn';

interface LearnChapterProps {
  chapter: ChapterDefinition;
}

export function LearnChapter({ chapter }: LearnChapterProps) {
  return (
    <section
      id={chapter.id}
      className="learn-chapter"
      aria-labelledby={`${chapter.id}-title`}
    >
      <p className="chapter-number">Chapter {chapter.number}</p>
      <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
      <p>{chapter.description}</p>
      <p className="coming-soon">Interactive lesson coming in a later phase.</p>
    </section>
  );
}
