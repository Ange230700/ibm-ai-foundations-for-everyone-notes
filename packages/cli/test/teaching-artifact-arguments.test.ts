import assert from 'node:assert/strict';
import test from 'node:test';

import { parseTeachingArtifactArguments } from '../src/teaching-artifact-arguments.js';

test('parses every teaching artifact command', () => {
  for (const command of ['plan', 'build', 'verify', 'visual-qa', 'animate'] as const) {
    assert.deepEqual(parseTeachingArtifactArguments([command]), { command });
  }
});

test('parses all supported selectors', () => {
  assert.deepEqual(
    parseTeachingArtifactArguments(['build', '--session=s05', '--lang=fr', '--format=pptx']),
    {
      command: 'build',
      session: 's05',
      language: 'fr',
      format: 'pptx',
    },
  );

  assert.deepEqual(parseTeachingArtifactArguments(['verify', '--lang=en', '--format=pdf']), {
    command: 'verify',
    language: 'en',
    format: 'pdf',
  });
});

test('rejects missing or unknown commands', () => {
  assert.throws(() => parseTeachingArtifactArguments([]), /Usage: pnpm teaching:artifact/);

  assert.throws(() => parseTeachingArtifactArguments(['unknown']), /Usage: pnpm teaching:artifact/);
});

test('rejects malformed options', () => {
  for (const option of ['--session', '--lang', '--format', '--session=s01=extra']) {
    assert.throws(
      () => parseTeachingArtifactArguments(['plan', option]),
      /Invalid teaching option/,
    );
  }
});

test('rejects invalid selector values', () => {
  for (const option of [
    '--session=s1',
    '--session=session01',
    '--lang=de',
    '--format=docx',
    '--other=value',
  ]) {
    assert.throws(
      () => parseTeachingArtifactArguments(['plan', option]),
      /Unknown or duplicate teaching option/,
    );
  }
});

test('rejects duplicate selectors', () => {
  assert.throws(
    () => parseTeachingArtifactArguments(['plan', '--session=s01', '--session=s02']),
    /Unknown or duplicate teaching option/,
  );

  assert.throws(
    () => parseTeachingArtifactArguments(['plan', '--lang=en', '--lang=fr']),
    /Unknown or duplicate teaching option/,
  );

  assert.throws(
    () => parseTeachingArtifactArguments(['plan', '--format=pdf', '--format=pptx']),
    /Unknown or duplicate teaching option/,
  );
});
