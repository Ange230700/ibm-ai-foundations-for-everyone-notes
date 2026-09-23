import assert from 'node:assert/strict';
import test from 'node:test';

import { createMermaidConfiguration, DEFAULT_MERMAID_THEME } from '../src/index.js';

test('default Mermaid configuration is deterministic', () => {
  const first = createMermaidConfiguration();
  const second = createMermaidConfiguration();

  assert.deepEqual(first, second);

  assert.match(first.configurationSha256, /^[a-f0-9]{64}$/);

  assert.equal(first.configuration.securityLevel, 'strict');

  assert.equal(first.configuration.htmlLabels, false);

  assert.equal(DEFAULT_MERMAID_THEME.fontFamily, 'Segoe UI, Arial, sans-serif');

  assert.equal(DEFAULT_MERMAID_THEME.background, '#F3F3F3');

  assert.equal(DEFAULT_MERMAID_THEME.foreground, '#122B4A');

  assert.equal(DEFAULT_MERMAID_THEME.surface, '#EAF7FA');

  assert.equal(DEFAULT_MERMAID_THEME.accent, '#4CC3D9');
});

test('Mermaid theme changes configuration identity', () => {
  const first = createMermaidConfiguration();

  const second = createMermaidConfiguration({
    ...DEFAULT_MERMAID_THEME,
    accent: '#000000',
  });

  assert.notEqual(first.configurationSha256, second.configurationSha256);
});
