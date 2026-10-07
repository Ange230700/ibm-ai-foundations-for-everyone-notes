import assert from 'node:assert/strict';
import test from 'node:test';
import { NapiCanvasFactory, validateCanvasDimensions } from '../src/document/pdf-canvas.js';

test('canvas factory rounds dimensions, resets, destroys and rejects invalid sizes', () => {
  for (const [width, height] of [
    [NaN, 1],
    [0, 1],
    [1, NaN],
    [1, 0],
    [-1, 1],
    [1, -1],
  ])
    assert.throws(() => validateCanvasDimensions(width!, height!), /Invalid canvas dimensions/);
  const factory = new NapiCanvasFactory();
  const result = factory.create(2.1, 3.1);
  assert.equal(result.canvas.width, 3);
  assert.equal(result.canvas.height, 4);
  factory.reset(result, 4.1, 5.1);
  assert.equal(result.canvas.width, 5);
  assert.equal(result.canvas.height, 6);
  const disposable = { canvas: { width: 5, height: 6 }, context: result.context };
  factory.destroy(disposable as typeof result);
  assert.equal(disposable.canvas.width, 0);
  assert.equal(disposable.canvas.height, 0);
});
