import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertDeliveryCombination,
  buildNarrationChunks,
  estimateNarrationDuration,
  renderDeliveryText,
  renderSpokenParagraphs,
  validateDeliveryMarkdown,
} from '../src/delivery-variants.js';

test('supported editorial profile and output combinations are explicit', () => {
  assertDeliveryCombination('document', 'pdf');
  assertDeliveryCombination('document', 'txt');
  assertDeliveryCombination('reference', 'txt');
  assertDeliveryCombination('narration', 'txt');
  assertDeliveryCombination('presentation', 'pptx');
  assert.throws(
    () => assertDeliveryCombination('narration', 'pdf'),
    /Unsupported delivery combination/,
  );
  assert.throws(
    () => assertDeliveryCombination('reference', 'pptx'),
    /Supported formats: txt, pdf/,
  );
});

test('document and reference profiles export readable UTF-8 with headings and lists', () => {
  const document =
    '# A document\n\n## Context\n\nA connected explanation.\n\n## Practice\n\n- Check the source.';
  assert.deepEqual(validateDeliveryMarkdown('document', document), []);
  const txt = renderDeliveryText(document, 'document', 'en');
  assert.match(txt, /A document\n={10}/);
  assert.match(txt, /- Check the source\./);

  const reference = '# Quick notes\n\n## Steps\n\n1. Check permission.\n2. Preserve unknowns.';
  assert.deepEqual(validateDeliveryMarkdown('reference', reference), []);
  assert.match(renderDeliveryText(reference, 'reference', 'fr'), /1\. Check permission\./);
});

test('narration excludes production metadata, links, and slide-dependent wording', () => {
  const spoken = 'Begin with the evidence.\n\nThen preserve what the source does not say.';
  assert.deepEqual(validateDeliveryMarkdown('narration', spoken), []);
  assert.equal(renderDeliveryText(spoken, 'narration', 'en'), `${spoken}\n`);
  assert.match(
    validateDeliveryMarkdown('narration', '# Production note\n\nSpeak slowly.').join('\n'),
    /spoken paragraphs only/,
  );
  assert.match(
    validateDeliveryMarkdown(
      'narration',
      'Visit https://example.invalid for details.\n\nContinue safely.',
    ).join('\n'),
    /raw URLs/,
  );
  assert.match(
    validateDeliveryMarkdown(
      'narration',
      'As you can see, the chart is useful.\n\nContinue safely.',
    ).join('\n'),
    /without referring to a slide/,
  );
});

test('narration chunks preserve paragraph order, respect character limits, and have stable IDs', () => {
  const text = 'First sentence. Another sentence.\n\nA second part. Then it ends.';
  const chunks = buildNarrationChunks('s06', 'en', text, 20);
  assert.deepEqual(
    chunks.map((chunk) => chunk.sequence),
    [1, 2, 3, 4],
  );
  assert.ok(chunks.every((chunk) => chunk.characters <= 20));
  assert.equal(chunks.map((chunk) => chunk.text).join(' '), text.replace(/\n\n/u, ' '));
  assert.deepEqual(
    buildNarrationChunks('s06', 'en', text, 20).map((chunk) => chunk.id),
    chunks.map((chunk) => chunk.id),
  );
  assert.throws(
    () => buildNarrationChunks('s06', 'en', 'A verylongsentencewithoutspaces.', 8),
    /needs editorial splitting/,
  );
  assert.throws(() => buildNarrationChunks('s06', 'en', text, 0), /positive safe integer/);
});

test('duration is an estimate labeled by its assumed speaking rate', () => {
  const chunks = buildNarrationChunks('s06', 'fr', 'Un texte assez court.', 100);
  assert.deepEqual(estimateNarrationDuration(chunks, 130), {
    words: 4,
    speakingRateWpm: 130,
    estimatedSeconds: 2,
  });
  assert.throws(() => estimateNarrationDuration(chunks, 0), /positive whole number/);
});

test('authoring contracts reject incomplete documents and unsupported spoken structures', () => {
  for (const [profile, markdown, message] of [
    ['document', 'No title.', /level-one/],
    ['document', '# Title', /two level-two/],
    ['reference', '# Title', /lookup heading/],
    ['narration', 'One paragraph.', /two spoken paragraphs/],
    ['narration', '[A link](https://example.invalid).\n\nContinue.', /links or raw URLs/],
    [
      'narration',
      '[A reference][id].\n\nContinue.\n\n[id]: https://example.invalid',
      /links or raw URLs/,
    ],
  ] as const)
    assert.match(validateDeliveryMarkdown(profile, markdown).join('\n'), message);
  assert.throws(() => renderDeliveryText('No title.', 'document', 'en'), /level-one/);
  assert.deepEqual(
    renderSpokenParagraphs('A **clear** phrase.  \nNext line.\n\nThen `check` it.'),
    ['A clear phrase. Next line.', 'Then check it.'],
  );
  assert.throws(() => renderSpokenParagraphs('# Heading'), /spoken paragraphs only/);
  assert.deepEqual(renderSpokenParagraphs(''), []);
  assert.ok(
    validateDeliveryMarkdown('narration', '---\n\n![Image](missing.png)\n\nContinue.').length,
  );
  const repeated = buildNarrationChunks('s06', 'en', 'Same.\n\nSame.', 5);
  assert.equal(repeated[1]!.id, `${repeated[0]!.id}.2`);
  assert.deepEqual(buildNarrationChunks('s06', 'fr', ''), []);
  assert.equal(buildNarrationChunks('s06', 'en', 'One. Two. Three.', 10)[0]!.text, 'One. Two.');
});

test('invalid raw HTML is reported as an authoring diagnostic', () => {
  assert.match(
    validateDeliveryMarkdown('document', '# Title\n\n<div>Unsupported</div>').join('\n'),
    /Unsupported|HTML/,
  );
});
