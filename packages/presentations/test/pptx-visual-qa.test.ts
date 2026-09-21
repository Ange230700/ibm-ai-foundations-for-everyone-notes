import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import { resolveLibreOfficeExecutable } from '../src/index.js';

test('PPTX visual QA rejects an unavailable explicit LibreOffice executable', async () => {
  const missing = resolve(
    process.cwd(),
    '.artifacts',
    'definitely-missing-libreoffice',
    'soffice.exe',
  );

  await assert.rejects(
    () => resolveLibreOfficeExecutable(missing),
    /Configured LibreOffice executable is unavailable/,
  );
});
