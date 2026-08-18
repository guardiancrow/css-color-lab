import { GamutChapter } from './GamutChapter';
import { HslChapter } from './HslChapter';
import { InterpolationChapter } from './InterpolationChapter';
import { LabChapter } from './LabChapter';
import { LinearRgbChapter } from './LinearRgbChapter';
import { ModernCssColorChapter } from './ModernCssColorChapter';
import { OklabChapter } from './OklabChapter';
import { RgbChapter } from './RgbChapter';
import { SrgbChapter } from './SrgbChapter';
import { XyzChapter } from './XyzChapter';

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
