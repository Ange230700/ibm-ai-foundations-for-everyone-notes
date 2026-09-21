import { mkdir, rm } from 'node:fs/promises';

import { atomicWrite, fromRoot, padOrdinal, prefixedId, slugify } from '@coursera-notes/core';
import { type Course, readManifest, writeManifest } from '@coursera-notes/manifest';

import { withPrompts } from './prompts.js';
import { courseReadme } from './templates.js';

const manifest = await readManifest();
if (manifest.repository.status !== 'configured') {
  throw new Error('Run pnpm setup before adding courses.');
}

await withPrompts(async (ask) => {
  const titleEn = await ask('Course title (English)');
  const titleFr = await ask('Course title (French)');
  if (!titleEn || !titleFr) throw new Error('Both English and French course titles are required.');
  const ordinal = manifest.courses.length + 1;
  const slug = slugify(await ask('Course slug', slugify(titleEn)));
  if (manifest.courses.some((course) => course.slug === slug)) {
    throw new Error(`Course slug already exists: ${slug}`);
  }
  const course: Course = {
    id: prefixedId('course'),
    ordinal,
    slug,
    title: { en: titleEn, fr: titleFr },
    status: 'planned',
    modules: [],
  };
  const directory = fromRoot('courses', `${padOrdinal(ordinal)}-${slug}`);
  await mkdir(fromRoot('.artifacts', 'generator'), { recursive: true });
  try {
    await mkdir(fromRoot(directory, 'en'), { recursive: true });
    await mkdir(fromRoot(directory, 'fr'), { recursive: true });
    await atomicWrite(fromRoot(directory, 'en', 'README.md'), courseReadme(course, 'en'));
    await atomicWrite(fromRoot(directory, 'fr', 'README.md'), courseReadme(course, 'fr'));
    await writeManifest({ ...manifest, courses: [...manifest.courses, course] });
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
  console.log(`Added course-${padOrdinal(ordinal)}: ${titleEn}`);
});
