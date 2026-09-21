import { unlink } from 'node:fs/promises';

import { atomicWrite, fromRoot, padOrdinal, prefixedId, slugify } from '@coursera-notes/core';
import { type Module, readManifest, writeManifest } from '@coursera-notes/manifest';

import { withPrompts } from './prompts.js';
import { courseReadme, moduleMarkdown } from './templates.js';

const manifest = await readManifest();
if (manifest.repository.status !== 'configured') {
  throw new Error('Run pnpm setup before adding modules.');
}
if (manifest.courses.length === 0) {
  throw new Error('Add a course first with pnpm course:add.');
}

await withPrompts(async (ask) => {
  const choices = manifest.courses
    .map((course) => `${padOrdinal(course.ordinal)} ${course.title.en}`)
    .join(', ');
  const courseText = await ask(
    `Course number (${choices})`,
    padOrdinal(manifest.courses.at(-1)?.ordinal ?? 1),
  );
  const courseOrdinal = Number(courseText);
  const courseIndex = manifest.courses.findIndex((course) => course.ordinal === courseOrdinal);
  if (courseIndex < 0) throw new Error(`Unknown course number: ${courseText}`);
  const course = manifest.courses[courseIndex];
  if (!course) throw new Error('Course selection failed.');

  const titleEn = await ask('Module title (English)');
  const titleFr = await ask('Module title (French)');
  if (!titleEn || !titleFr) throw new Error('Both English and French module titles are required.');
  const ordinal = course.modules.length + 1;
  const slug = slugify(await ask('Module slug', slugify(titleEn)));
  if (course.modules.some((module) => module.slug === slug)) {
    throw new Error(`Module slug already exists in course: ${slug}`);
  }

  const filename = `${padOrdinal(ordinal)}-${slug}.md`;
  const courseDirectory = `${padOrdinal(course.ordinal)}-${course.slug}`;
  const module: Module = {
    id: prefixedId('module'),
    ordinal,
    slug,
    title: { en: titleEn, fr: titleFr },
    source: {
      en: `courses/${courseDirectory}/en/${filename}`,
      fr: `courses/${courseDirectory}/fr/${filename}`,
    },
  };

  const enPath = fromRoot(module.source.en);
  const frPath = fromRoot(module.source.fr);
  try {
    await atomicWrite(enPath, moduleMarkdown(module, 'en'));
    await atomicWrite(frPath, moduleMarkdown(module, 'fr'));
    const updatedCourse = { ...course, modules: [...course.modules, module] };
    const courses = [...manifest.courses];
    courses[courseIndex] = updatedCourse;
    await writeManifest({ ...manifest, courses });
    await atomicWrite(
      fromRoot('courses', courseDirectory, 'en', 'README.md'),
      courseReadme(updatedCourse, 'en'),
    );
    await atomicWrite(
      fromRoot('courses', courseDirectory, 'fr', 'README.md'),
      courseReadme(updatedCourse, 'fr'),
    );
  } catch (error) {
    await Promise.all([
      unlink(enPath).catch(() => undefined),
      unlink(frPath).catch(() => undefined),
    ]);
    throw error;
  }
  console.log(`Added module-${padOrdinal(ordinal)} to course-${padOrdinal(course.ordinal)}.`);
});
