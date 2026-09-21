import { readFile } from 'node:fs/promises';

import { atomicWrite, fromRoot, prefixedId, slugify } from '@coursera-notes/core';
import { readManifest, writeManifest } from '@coursera-notes/manifest';

import { withPrompts } from './prompts.js';

const reconfigure = process.argv.includes('--reconfigure');
const manifest = await readManifest();

if (manifest.repository.status === 'configured' && !reconfigure) {
  throw new Error(
    'Repository is already configured. Re-run with --reconfigure to update program metadata.',
  );
}

await withPrompts(async (ask) => {
  const title = await ask(
    'Program title',
    manifest.program.title === 'Coursera Program Notes' ? undefined : manifest.program.title,
  );
  if (!title) throw new Error('Program title is required.');
  const provider = await ask(
    'Provider',
    manifest.program.provider === 'Provider' ? undefined : manifest.program.provider,
  );
  if (!provider) throw new Error('Provider is required.');
  const slug = slugify(await ask('Program slug', slugify(title)));
  const holder = await ask('MIT license holder', manifest.program.license.holder ?? undefined);
  if (!holder) throw new Error('License holder is required.');
  const currentYear = String(new Date().getUTCFullYear());
  const yearText = await ask(
    'MIT initial year',
    manifest.program.license.initialYear
      ? String(manifest.program.license.initialYear)
      : currentYear,
  );
  const initialYear = Number(yearText);
  if (!Number.isInteger(initialYear) || initialYear < 2000 || initialYear > 2200) {
    throw new Error('Initial year must be an integer between 2000 and 2200.');
  }

  await writeManifest({
    ...manifest,
    repository: { status: 'configured' },
    program: {
      ...manifest.program,
      id: manifest.program.id ?? prefixedId('program'),
      title,
      provider,
      slug,
      license: { spdx: 'MIT', holder, initialYear },
    },
  });

  const licenseTemplate = await readFile(fromRoot('LICENSE.template'), 'utf8');
  await atomicWrite(
    fromRoot('LICENSE'),
    licenseTemplate.replace('{{YEAR}}', String(initialYear)).replace('{{HOLDER}}', holder),
  );
  console.log(`Configured ${title}. Add courses with pnpm course:add.`);
});
