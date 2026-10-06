import assert from 'node:assert/strict';
import test from 'node:test';

import { teachingNoteParts } from '../src/pptx/teaching-notes.js';

test('teaching notes accept a soft-wrapped bold key takeaway', () => {
  const parts = teachingNoteParts(`**Key takeaway:** A professional workflow may contain a takeaway
that wraps across multiple Markdown source lines.

Explain the workflow to the learner.`);

  assert.equal(parts.label, 'Key takeaway:');
  assert.equal(
    parts.takeaway,
    'A professional workflow may contain a takeaway that wraps across multiple Markdown source lines.',
  );
  assert.deepEqual(parts.cues, ['Explain the workflow to the learner.']);
});

test('French teaching notes accept a soft-wrapped key takeaway', () => {
  const parts = teachingNoteParts(`**Message à faire retenir :** Un workflow professionnel peut
occuper plusieurs lignes Markdown.

Présenter ensuite le point de contrôle.`);

  assert.equal(parts.label, 'Message à faire retenir :');
  assert.equal(parts.takeaway, 'Un workflow professionnel peut occuper plusieurs lignes Markdown.');
  assert.deepEqual(parts.cues, ['Présenter ensuite le point de contrôle.']);
});
