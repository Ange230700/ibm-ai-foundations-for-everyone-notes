import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { fromRoot, padOrdinal } from '@coursera-notes/core';
import { readManifest } from '@coursera-notes/manifest';

import { renderMarkdownText, validatePlainText } from './render-markdown-text.js';

const manifest = await readManifest();
const requestedCourse = process.argv
  .find((arg) => arg.startsWith('--course='))
  ?.slice('--course='.length);
const courses = requestedCourse
  ? manifest.courses.filter(
      (course) => String(course.ordinal) === requestedCourse || course.id === requestedCourse,
    )
  : manifest.courses.filter((course) => course.status !== 'archived');

if (requestedCourse && courses.length === 0) throw new Error(`Unknown course: ${requestedCourse}`);

for (const course of courses) {
  const directory = `${padOrdinal(course.ordinal)}-${course.slug}`;
  for (const language of ['en', 'fr'] as const) {
    const sources = [
      fromRoot('courses', directory, language, 'README.md'),
      ...course.modules
        .sort((a, b) => a.ordinal - b.ordinal)
        .map((module) => fromRoot(module.source[language])),
    ];
    const markdown = (await Promise.all(sources.map((path) => readFile(path, 'utf8')))).join(
      '\n\n',
    );
    const bytes = Buffer.from(renderMarkdownText(markdown, { language }), 'utf8');
    const errors = validatePlainText(bytes);
    if (errors.length) throw new Error(errors.join('\n'));
    const target = fromRoot(
      '.artifacts',
      'exports',
      `course-${padOrdinal(course.ordinal)}.${language}.txt`,
    );
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
    console.log(`WROTE ${target}`);
  }
}
