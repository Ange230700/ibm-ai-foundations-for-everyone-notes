import assert from 'node:assert/strict';
import test from 'node:test';

import { parseDeliveryArtifactArguments } from '../src/delivery-artifact-arguments.js';

test('parses profile-aware delivery artifact targets', () => {
  assert.deepEqual(
    parseDeliveryArtifactArguments([
      'build',
      '--session=s06',
      '--profile=document',
      '--format=pdf',
      '--lang=fr',
    ]),
    {
      command: 'build',
      session: 's06',
      profile: 'document',
      format: 'pdf',
      language: 'fr',
    },
  );
  assert.deepEqual(
    parseDeliveryArtifactArguments([
      'build',
      '--session=s06',
      '--profile=narration',
      '--format=txt',
      '--chunk-limit=1200',
    ]),
    {
      command: 'build',
      session: 's06',
      profile: 'narration',
      format: 'txt',
      chunkLimit: 1200,
    },
  );
});

test('rejects unsupported variants, formats, and workflow options', () => {
  assert.throws(
    () => parseDeliveryArtifactArguments(['build', '--profile=document']),
    /requires --format/,
  );
  assert.throws(
    () => parseDeliveryArtifactArguments(['build', '--profile=narration', '--format=pdf']),
    /Unsupported delivery combination/,
  );
  assert.throws(
    () => parseDeliveryArtifactArguments(['visual-qa', '--profile=document', '--format=txt']),
    /visual-qa requires --format=pdf/,
  );
  assert.throws(
    () =>
      parseDeliveryArtifactArguments([
        'build',
        '--profile=document',
        '--format=txt',
        '--chunk-limit=2000',
      ]),
    /only valid for the narration profile/,
  );
  assert.throws(
    () =>
      parseDeliveryArtifactArguments([
        'build',
        '--profile=narration',
        '--format=txt',
        '--chunk-limit=2501',
      ]),
    /no greater than 2400/,
  );
});
