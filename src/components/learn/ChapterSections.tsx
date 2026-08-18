import { chapters } from '../../lib/chapters';
import { GamutChapter } from './GamutChapter';
import { HslChapter } from './HslChapter';
import { InterpolationChapter } from './InterpolationChapter';
import { LabChapter } from './LabChapter';
import { LinearRgbChapter } from './LinearRgbChapter';
import { LearnChapter } from './LearnChapter';
import { OklabChapter } from './OklabChapter';
import { RgbChapter } from './RgbChapter';
import { SrgbChapter } from './SrgbChapter';
import { XyzChapter } from './XyzChapter';

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
