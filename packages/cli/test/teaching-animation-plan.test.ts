import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { repositoryRoot } from '@coursera-notes/core';
import { readManifest } from '@coursera-notes/manifest';
import { parseTeachingSession, validateTeachingPair } from '@coursera-notes/presentations';

import { createS01AnimationPlan } from '../src/teaching-animation-plan.js';

test('S01 animation plan follows both teaching sources without adding slides or changing timing', async () => {
  const manifest = await readManifest();
  const session = manifest.teachingSessions?.find((entry) => entry.id === 's01');
  assert.ok(session);
  const course = manifest.courses.find((entry) => entry.id === session.courseId);
  assert.ok(course);
  const source = {} as Record<'en' | 'fr', ReturnType<typeof parseTeachingSession>>;

  for (const language of ['en', 'fr'] as const) {
    const markdown = await readFile(resolve(repositoryRoot(), session.source[language]), 'utf8');
    source[language] = parseTeachingSession(markdown, {
      id: session.id,
      courseId: session.courseId,
      language,
      sourcePath: session.source[language],
      slideCount: session.slideCount,
      durationMinutes: session.durationMinutes,
      canonicalSources: course.modules.map((module) => module.source[language]),
    });
  }
  validateTeachingPair(source.en, source.fr);

  for (const language of ['en', 'fr'] as const) {
    const plan = createS01AnimationPlan(source[language]);
    assert.equal(plan.sourceSha256, source[language].sourceSha256);
    assert.deepEqual(
      plan.slides.map((slide) => slide.number),
      [2, 3, 8],
    );
    assert.deepEqual(
      plan.slides.map((slide) => slide.rows.length),
      [4, 4, 5],
    );
    assert.deepEqual(
      plan.slides[2]?.rows.map((row) => row.label),
      ['01', '02', '03', '04', '•'],
    );
    for (const slide of plan.slides) {
      const canonical = source[language].slides[slide.number - 1];
      assert.ok(canonical);
      assert.equal(slide.title, canonical.title);
      assert.deepEqual(
        slide.rows.map((row) => row.text),
        canonical.items,
      );
    }
  }
});
