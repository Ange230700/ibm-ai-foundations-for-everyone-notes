import assert from 'node:assert/strict';
import test from 'node:test';

import { createDocumentStylesheet, DEFAULT_DOCUMENT_THEME } from '../src/index.js';

test('document stylesheet is deterministic and A4-ready', () => {
  const first = createDocumentStylesheet();

  const second = createDocumentStylesheet();

  assert.deepEqual(first, second);

  assert.match(first.stylesheetSha256, /^[a-f0-9]{64}$/);

  assert.match(first.stylesheet, /size: A4/);

  assert.match(first.stylesheet, /document-cover/);

  assert.match(first.stylesheet, /document-section--terminal/);
});

test('document theme changes stylesheet identity', () => {
  const first = createDocumentStylesheet();

  const second = createDocumentStylesheet({
    ...DEFAULT_DOCUMENT_THEME,
    accent: '#000000',
    surface: '#EFEFEF',
  });

  assert.notEqual(first.stylesheetSha256, second.stylesheetSha256);
});
