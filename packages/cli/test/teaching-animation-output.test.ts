import assert from 'node:assert/strict';
import test from 'node:test';

import { animatedOutputFile } from '../src/teaching-animation-output.js';

test('animation verifier selects the PowerPoint review copy when the normal output is locked', () => {
  assert.equal(
    animatedOutputFile('PASS en sortie=C:\\deck\\session-animated.pptx\n'),
    'session-animated.pptx',
  );
  assert.equal(
    animatedOutputFile(
      'REVUE en sortie=C:\\deck\\session-animated-review-9cb572d0e0ee419f8c1e4e95ada4de41.pptx\r\n' +
        'ANIMATION_OUTPUT_FILE=session-animated-review-9cb572d0e0ee419f8c1e4e95ada4de41.pptx\r\n',
    ),
    'session-animated-review-9cb572d0e0ee419f8c1e4e95ada4de41.pptx',
  );
  assert.throws(() => animatedOutputFile('ANIMATION_OUTPUT_FILE=../other.pptx\n'));
  assert.throws(() => animatedOutputFile('REVUE en sortie=review.pptx\n', true));
  assert.throws(() =>
    animatedOutputFile(
      'ANIMATION_OUTPUT_FILE=session-animated.pptx\nANIMATION_OUTPUT_FILE=session-animated.pptx\n',
    ),
  );
});
