import assert from 'node:assert/strict';
import test from 'node:test';

import { wrapCodeForNativePptx } from '../src/pptx/render.js';

const longPrompt = [
  'Act as a customer service representative for a small online business.',
  'Write a professional and empathetic response to a customer whose shipment is five days late.',
  'Apologize for the delay, acknowledge their frustration, explain that the order is still in transit, and offer to provide updated tracking information.',
  'Keep the message concise, polite, and reassuring, and do not make promises about an exact delivery date unless confirmed.',
  'Format the response as a customer email of about 100–150 words.',
].join(' ');

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

test('native PPTX code wrapping preserves long prompt semantics', () => {
  const wrapped = wrapCodeForNativePptx(longPrompt);
  const lines = wrapped.split('\n');

  assert.ok(lines.length > 1);
  assert.ok(lines.every((line) => line.length <= 96));
  assert.equal(normalizeWhitespace(wrapped), normalizeWhitespace(longPrompt));
});
