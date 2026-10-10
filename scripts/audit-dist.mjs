import { resolve } from 'node:path';
import { auditDistribution, PAGES_BASE } from './distribution.mjs';
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--pages'))
  throw new Error('Usage: npm run audit:dist -- [--pages]');
const base = args.includes('--pages') ? PAGES_BASE : '/';
const files = auditDistribution(resolve('dist'), base);
console.log(`Distribution audit passed (${base}): ${files.join(', ')}`);
