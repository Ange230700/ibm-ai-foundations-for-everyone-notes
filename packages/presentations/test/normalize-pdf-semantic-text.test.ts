import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizePdfSemanticText } from '../src/document/verify-pdf.js';

test('PDF semantic normalization canonicalizes apostrophe variants', () => {
  const expected = "Le cours insiste également sur l'intelligence augmentée: une technologie.";

  const variants = [
    "Le cours insiste également sur l'intelligence augmentée : une technologie.",
    "Le cours insiste également sur l' intelligence augmentée : une technologie.",
    'Le cours insiste également sur l\u2019 intelligence augmentée : une technologie.',
    'Le cours insiste également sur l\u2019intelligence augmentée : une technologie.',
    'Le cours insiste également sur l\u2018intelligence augmentée : une technologie.',
    'Le cours insiste également sur l\u201bintelligence augmentée : une technologie.',
    'Le cours insiste également sur l\u02bcintelligence augmentée : une technologie.',
  ];

  for (const variant of variants) {
    assert.equal(normalizePdfSemanticText(variant), expected);
  }
});
