import type { ChapterDefinition } from '../types/learn';

export const chapters = [
  {
    id: 'rgb',
    number: 1,
    title: 'Introduction / Color & RGB',
    description: '色を数値で表す考え方と、RGBの基本から始めます。',
  },
  {
    id: 'srgb',
    number: 2,
    title: 'sRGB',
    description: 'Webで最も身近な色空間と、その前提を整理します。',
  },
  {
    id: 'linear-rgb',
    number: 3,
    title: 'Linear sRGB',
    description: '光の量と計算結果の関係を、sRGBとの違いから学びます。',
  },
  {
    id: 'xyz',
    number: 4,
    title: 'XYZ',
    description: '色空間をつなぐ基準となるCIE XYZを概観します。',
  },
  {
    id: 'hsl',
    number: 5,
    title: 'HSL',
    description: '色相・彩度・明度による直感的な指定と限界を見ます。',
  },
  {
    id: 'lab',
    number: 6,
    title: 'Lab / LCh',
    description: '知覚的な均等性を目指した色表現に触れます。',
  },
  {
    id: 'oklab',
    number: 7,
    title: 'Oklab / OkLCh',
    description: '現代のUIで扱いやすい知覚ベースの色空間を学びます。',
  },
  {
    id: 'gamut',
    number: 8,
    title: 'Gamut',
    description: 'sRGBやDisplay P3が表現できる色の範囲を比較します。',
  },
  {
    id: 'interpolation',
    number: 9,
    title: 'Color interpolation',
    description: '色空間によってグラデーションが変わる理由を探ります。',
  },
  {
    id: 'modern-css-color',
    number: 10,
    title: 'Modern CSS Color',
    description: 'CSS Color Module Level 4 / Level 5 の機能を概観します。',
  },
] as const satisfies readonly ChapterDefinition[];
