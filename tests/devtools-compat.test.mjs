import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const files = [
  'miniprogram/custom-tab-bar/index.ts',
  'miniprogram/pages/index/index.ts',
  'miniprogram/pages/my/i18n.ts',
  'miniprogram/pages/my/mine.ts',
  'miniprogram/utils/i18n.ts',
];

const forbiddenPatterns = [/\bimport\s+type\b/, /,\s*type\s+[A-Za-z_][A-Za-z0-9_]*/];

test('miniprogram TypeScript sources avoid DevTools-incompatible type-only import syntax', () => {
  for (const relativePath of files) {
    const fullPath = path.resolve(relativePath);
    const source = fs.readFileSync(fullPath, 'utf8');

    for (const pattern of forbiddenPatterns) {
      assert.doesNotMatch(
        source,
        pattern,
        `${relativePath} contains DevTools-incompatible type import syntax`,
      );
    }
  }
});
