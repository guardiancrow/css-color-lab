// @vitest-environment node
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  auditDistribution,
  NOTICE,
  verifyModule,
  verifyNotices,
} from './distribution.mjs';

const directories = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});
function fixture(base = '/') {
  const directory = mkdtempSync(join(tmpdir(), 'color-distribution-test-'));
  directories.push(directory);
  mkdirSync(join(directory, 'assets'));
  writeFileSync(
    join(directory, 'index.html'),
    `<script src="${base}assets/app.js"></script><link href="${base}assets/app.css">`,
  );
  writeFileSync(
    join(directory, 'assets/app.js'),
    `const notice="${base}${NOTICE}";`,
  );
  writeFileSync(join(directory, 'assets/app.css'), 'body{color:red}');
  writeFileSync(join(directory, NOTICE), readFileSync(NOTICE));
  return directory;
}
describe('distribution audit', () => {
  it.each(['/', '/css-color-lab/'])(
    'accepts complete artifacts at %s',
    (base) => {
      expect(auditDistribution(fixture(base), base)).toHaveLength(4);
    },
  );
  it('rejects a modified license permission', () => {
    const notice = readFileSync(NOTICE, 'utf8').replace(
      'Permission is hereby granted',
      'Permission removed',
    );
    expect(() => verifyNotices(resolve('.'), notice)).toThrow(
      'License differs',
    );
  });
  it('rejects outdated version attribution', () => {
    const notice = readFileSync(NOTICE, 'utf8').replace('19.2.8', '0.0.0');
    expect(() => verifyNotices(resolve('.'), notice)).toThrow(
      'Notice version differs',
    );
  });
  it('rejects a different distributed notice', () => {
    const directory = fixture();
    writeFileSync(join(directory, NOTICE), 'missing licenses');
    expect(() => auditDistribution(directory, '/')).toThrow(
      'Distribution notice differs',
    );
  });
  it.each(['.env', 'assets/app.js.map', 'LICENSE', 'audit.json'])(
    'rejects unexpected file %s',
    (file) => {
      const directory = fixture();
      writeFileSync(join(directory, file), 'unexpected');
      expect(() => auditDistribution(directory, '/')).toThrow(
        'Unexpected distribution file',
      );
    },
  );
  it('rejects assets using the wrong base', () => {
    expect(() => auditDistribution(fixture(), '/css-color-lab/')).toThrow(
      'Invalid asset URL',
    );
  });
  it('rejects a missing site link', () => {
    const directory = fixture();
    writeFileSync(join(directory, 'assets/app.js'), 'console.log("app")');
    expect(() => auditDistribution(directory, '/')).toThrow(
      'Missing site notice URL',
    );
  });
  it.each([
    'sourceMappingURL=app.js.map',
    'someone@example.invalid',
    'ghp_' + 'a'.repeat(36),
  ])('rejects sensitive bundle content %s', (content) => {
    const directory = fixture();
    writeFileSync(
      join(directory, 'assets/app.js'),
      `const notice="/${NOTICE}"; /* ${content} */`,
    );
    expect(() => auditDistribution(directory, '/')).toThrow();
  });
  it.each(['/repo/node_modules/unreviewed/index.js', '\0unknown/helper.js'])(
    'rejects unreviewed module %s',
    (id) => {
      expect(() => verifyModule(id)).toThrow('Unreviewed');
    },
  );
});
