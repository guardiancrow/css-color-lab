import type { Plugin } from 'vite';
export const PAGES_BASE: string;
export const NOTICE: string;
export function distributionPlugin(): Plugin;
export function verifyNotices(root: string, notice?: string): string;
export function verifyModule(id: string): void;
export function auditDistribution(
  directory: string,
  base: string,
  root?: string,
): string[];
