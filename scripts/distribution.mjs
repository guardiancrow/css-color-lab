import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
export const PAGES_BASE = '/css-color-lab/';
export const NOTICE = 'THIRD_PARTY_NOTICES.md';
const groups = {
  'React / React DOM / Scheduler': [
    'react/LICENSE',
    'react-dom/LICENSE',
    'scheduler/LICENSE',
  ],
  'React Router / React Router DOM': [
    'react-router/LICENSE.md',
    'react-router-dom/LICENSE.md',
  ],
  'Color.js': ['colorjs.io/LICENSE'],
  cookie: ['cookie/LICENSE'],
  'set-cookie-parser': ['set-cookie-parser/LICENSE'],
  'Vite browser helpers': ['vite/LICENSE.md'],
  'Rolldown runtime': ['rolldown/LICENSE'],
  'Rolldown third-party notices': ['rolldown/THIRD-PARTY-LICENSE'],
};
const virtualModules = new Set([
  '\0rolldown/runtime.js',
  '\0vite/modulepreload-polyfill.js',
  '\0vite/preload-helper.js',
]);
const normalize = (value) => value.replace(/\r\n/g, '\n').trim();
export function verifyNotices(
  root,
  notice = readFileSync(resolve(root, NOTICE), 'utf8'),
) {
  const lock = JSON.parse(
    readFileSync(resolve(root, 'package-lock.json'), 'utf8'),
  );
  for (const [heading, sources] of Object.entries(groups)) {
    const section = normalize(notice)
      .split(`### ${heading}\n`)[1]
      ?.split('\n### ')[0];
    const text = section?.match(/```text\n([\s\S]*?)\n```/)?.[1];
    if (!text) throw new Error(`Missing license: ${heading}`);
    for (const source of sources) {
      let installed = normalize(
        readFileSync(resolve(root, 'node_modules', source), 'utf8'),
      );
      if (source === 'vite/LICENSE.md') {
        installed = installed
          .slice(installed.indexOf('MIT License\n'))
          .split('\n# Licenses of bundled dependencies')[0]
          .trim();
      }
      if (normalize(text) !== installed)
        throw new Error(`License differs: ${source}`);
      if (heading === 'Rolldown third-party notices') continue;
      const name = source.split('/')[0];
      const meta = JSON.parse(
        readFileSync(
          resolve(root, 'node_modules', name, 'package.json'),
          'utf8',
        ),
      );
      const locked = lock.packages[`node_modules/${name}`];
      if (
        locked?.version !== meta.version ||
        locked.license !== meta.license ||
        meta.license !== 'MIT'
      )
        throw new Error(`License metadata differs: ${name}`);
      const row = new RegExp(
        `\\|\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\|\\s*${meta.version.replaceAll('.', '\\.')}\\s*\\|\\s*MIT\\s*\\|`,
      );
      if (!row.test(notice)) throw new Error(`Notice version differs: ${name}`);
    }
  }
  return notice;
}
export function verifyModule(id) {
  if (id.startsWith('\0')) {
    if (!virtualModules.has(id))
      throw new Error(
        `Unreviewed generated module: ${id.replaceAll('\0', '')}`,
      );
    return;
  }
  const name = id
    .replaceAll('\\', '/')
    .split('/node_modules/')
    .at(-1)
    ?.split('/')[0];
  if (
    id.replaceAll('\\', '/').includes('/node_modules/') &&
    !Object.values(groups)
      .flat()
      .some((source) => source.startsWith(`${name}/`))
  ) {
    throw new Error(`Unreviewed bundled dependency: ${name}`);
  }
}
export function distributionPlugin() {
  let root = '';
  return {
    name: 'distribution-notices',
    apply: 'build',
    configResolved(config) {
      root = config.root;
    },
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === 'chunk')
          for (const id of Object.keys(output.modules)) verifyModule(id);
      }
      this.emitFile({
        type: 'asset',
        fileName: NOTICE,
        source: verifyNotices(root),
      });
    },
  };
}
export function auditDistribution(directory, base, root = resolve('.')) {
  const notice = verifyNotices(root);
  const files = [];
  const walk = (relative) => {
    for (const entry of readdirSync(resolve(directory, relative))) {
      const name = relative ? `${relative}/${entry}` : entry;
      const stat = lstatSync(resolve(directory, name));
      if (stat.isSymbolicLink())
        throw new Error(`Symlink in distribution: ${name}`);
      if (stat.isDirectory()) {
        if (name !== 'assets') throw new Error(`Unexpected directory: ${name}`);
        walk(name);
      } else {
        if (
          !stat.isFile() ||
          !/^(index\.html|THIRD_PARTY_NOTICES\.md|assets\/[\w-]+\.(js|css))$/.test(
            name,
          )
        )
          throw new Error(`Unexpected distribution file: ${name}`);
        files.push(name);
      }
    }
  };
  walk('');
  if (readFileSync(resolve(directory, NOTICE), 'utf8') !== notice)
    throw new Error('Distribution notice differs');
  const html = readFileSync(resolve(directory, 'index.html'), 'utf8');
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => !url.startsWith('data:'));
  for (const url of urls) {
    if (!url.startsWith(base) || !files.includes(url.slice(base.length)))
      throw new Error(`Invalid asset URL: ${url}`);
  }
  if (
    !files.some((file) => file.endsWith('.js')) ||
    !files.some((file) => file.endsWith('.css'))
  )
    throw new Error('Missing JS/CSS');
  const scripts = files
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(resolve(directory, file), 'utf8'))
    .join('\n');
  if (!scripts.includes(`${base}${NOTICE}`))
    throw new Error('Missing site notice URL');
  const allowedEmails = new Set(
    [...notice.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)].map(
      (match) => match[0],
    ),
  );
  for (const file of files) {
    const content = readFileSync(resolve(directory, file), 'utf8');
    if (
      /sourceMappingURL|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})|AKIA[A-Z0-9]{16}|[A-Za-z]:[\\/](?:Users|src)[\\/]|\/(?:Users|home)\/[\w.-]+\//.test(
        content,
      )
    )
      throw new Error(`Private data or source map: ${file}`);
    for (const match of content.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)) {
      if (file !== NOTICE || !allowedEmails.has(match[0]))
        throw new Error(`Unexpected email: ${file}`);
    }
  }
  return files.sort();
}
