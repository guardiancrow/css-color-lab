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
  PROJECT_LICENSE,
  verifyProjectLicense,
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
    `const notice="${base}${NOTICE}"; const license="${base}${PROJECT_LICENSE}";`,
  );
  writeFileSync(join(directory, 'assets/app.css'), 'body{color:red}');
  writeFileSync(join(directory, NOTICE), readFileSync(NOTICE));
  writeFileSync(
    join(directory, PROJECT_LICENSE),
    readFileSync(PROJECT_LICENSE),
  );
  return directory;
}
describe('distribution audit', () => {
  it.each(['/', '/css-color-lab/'])(
    'accepts complete artifacts at %s',
    (base) => {
      expect(auditDistribution(fixture(base), base)).toHaveLength(5);
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
  it.each(['.env', 'assets/app.js.map', 'LICENSE.bak', 'audit.json'])(
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
      `const notice="/${NOTICE}"; const license="/${PROJECT_LICENSE}"; /* ${content} */`,
    );
    expect(() => auditDistribution(directory, '/')).toThrow();
  });
  it.each(['/repo/node_modules/unreviewed/index.js', '\0unknown/helper.js'])(
    'rejects unreviewed module %s',
    (id) => {
      expect(() => verifyModule(id)).toThrow('Unreviewed');
    },
  );
  it('rejects a missing project license', () => {
    const directory = fixture();
    rmSync(join(directory, PROJECT_LICENSE));
    expect(() => auditDistribution(directory, '/')).toThrow(/LICENSE/);
  });
  it('rejects a changed distributed project license', () => {
    const directory = fixture();
    writeFileSync(join(directory, PROJECT_LICENSE), 'changed license');
    expect(() => auditDistribution(directory, '/')).toThrow(
      'Distribution project license differs',
    );
  });
  it.each(['/', '/css-color-lab/'])(
    'rejects missing project license link at %s',
    (base) => {
      const directory = fixture(base);
      writeFileSync(
        join(directory, 'assets/app.js'),
        `const notice="${base}${NOTICE}";`,
      );
      expect(() => auditDistribution(directory, base)).toThrow(
        'Missing site project license URL',
      );
    },
  );
  it.each([
    ['Copyright (c) 2026 guardiancrow', 'Copyright (c) 2025 guardiancrow'],
    ['Copyright (c) 2026 guardiancrow', 'Copyright (c) 2026 another-holder'],
    ['Permission is hereby granted', 'Permission removed'],
    ['THE SOFTWARE IS PROVIDED', 'WARRANTY REMOVED'],
  ])('rejects altered canonical license: %s', (before, after) => {
    const directory = fixture();
    writeFileSync(
      join(directory, PROJECT_LICENSE),
      readFileSync(PROJECT_LICENSE, 'utf8').replace(before, after),
    );
    expect(() => verifyProjectLicense(directory)).toThrow(
      'Project MIT license differs',
    );
  });
});
