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

  assert.equal(DEFAULT_DOCUMENT_THEME.fontFamily, '"Segoe UI", Arial, sans-serif');

  assert.equal(DEFAULT_DOCUMENT_THEME.foreground, '#122B4A');

  assert.equal(DEFAULT_DOCUMENT_THEME.accent, '#1673AE');

  assert.equal(DEFAULT_DOCUMENT_THEME.rule, '#4CC3D9');

  assert.equal(DEFAULT_DOCUMENT_THEME.accentSurface, '#EAF7FA');
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
