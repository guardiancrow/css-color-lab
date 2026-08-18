import { chapters } from '../../lib/chapters';
import { LearnChapter } from './LearnChapter';

export function RgbChapter() {
  return <LearnChapter chapter={chapters[0]} />;
}

export function SrgbChapter() {
  return <LearnChapter chapter={chapters[1]} />;
}

export function LinearRgbChapter() {
  return <LearnChapter chapter={chapters[2]} />;
}

export function XyzChapter() {
  return <LearnChapter chapter={chapters[3]} />;
}

export function HslChapter() {
  return <LearnChapter chapter={chapters[4]} />;
}

export function LabChapter() {
  return <LearnChapter chapter={chapters[5]} />;
}

export function OklabChapter() {
  return <LearnChapter chapter={chapters[6]} />;
}

export function GamutChapter() {
  return <LearnChapter chapter={chapters[7]} />;
}

export function InterpolationChapter() {
  return <LearnChapter chapter={chapters[8]} />;
}

export function ModernCssColorChapter() {
  return <LearnChapter chapter={chapters[9]} />;
}

export function ChapterSectionList() {
  return (
    <>
      <RgbChapter />
      <SrgbChapter />
      <LinearRgbChapter />
      <XyzChapter />
      <HslChapter />
      <LabChapter />
      <OklabChapter />
      <GamutChapter />
      <InterpolationChapter />
      <ModernCssColorChapter />
    </>
  );
}
