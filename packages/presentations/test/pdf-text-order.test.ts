import assert from 'node:assert/strict';
import test from 'node:test';
import { pageTextInReadingOrder } from '../src/document/verify-pdf.js';

const run = (str: string, x: number, y: number, width?: number, height?: unknown) => ({
  str,
  transform: [1, 0, 0, 10, x, y],
  width,
  height,
});

test('PDF reading order rejoins touching glyphs while preserving word and line gaps', () => {
  assert.equal(
    pageTextInReadingOrder([
      run('veri', 10, 20, 20),
      run('fi', 30, 20, 5),
      run('cation', 35, 20, 30),
      run('works', 70, 20, 30),
      run('next line', 10, 10, 40),
    ]),
    'verification\nworks\nnext line',
  );
  assert.equal(
    pageTextInReadingOrder([run('unknown width', 10, 20), run('next', 30, 20)]),
    'unknown width\nnext',
  );
  assert.equal(pageTextInReadingOrder([]), '');
});

test('PDF reading order discards malformed text items without manufacturing content', () => {
  const invalid = [
    null,
    false,
    {},
    { str: 'x' },
    { transform: [] },
    { str: 3, transform: [1, 0, 0, 1, 0, 0] },
    { str: 'x', transform: {} },
    { str: 'x', transform: [1] },
    run('bad x', NaN, 0),
    run('bad y', 0, Infinity),
  ];
  assert.equal(pageTextInReadingOrder(invalid), '');
  assert.equal(pageTextInReadingOrder([run('valid', 0, 0, 2, Infinity)]), 'valid');
});
