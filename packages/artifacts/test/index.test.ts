import assert from 'node:assert/strict';
import test from 'node:test';

import { renderMarkdownText, validatePlainText } from '../src/index.js';

test('artifacts public entrypoint exports the text artifact API', () => {
  assert.equal(typeof renderMarkdownText, 'function');
  assert.equal(typeof validatePlainText, 'function');
});
