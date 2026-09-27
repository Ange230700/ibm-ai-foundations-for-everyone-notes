import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { repositoryRoot } from '@coursera-notes/core';
import { readManifest } from '@coursera-notes/manifest';
import { parseTeachingSession, validateTeachingPair } from '@coursera-notes/presentations';

import { animationCounts, createS01AnimationPlan } from '../src/teaching-animation-plan.js';

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
      Array.from({ length: 30 }, (_, index) => index + 1),
    );
    assert.deepEqual(animationCounts(plan), { animatedSlides: 30, clicks: 90, effects: 267 });
    assert.equal(plan.slides[0]?.kind, 'cover');
    assert.equal(plan.slides[18]?.kind, 'table');
    assert.deepEqual(
      [2, 3, 8].map((number) => {
        const slide = plan.slides[number - 1];
        return slide?.kind === 'rows' ? slide.rows.length : 0;
      }),
      [4, 4, 5],
    );
    const steps = plan.slides[7];
    assert.equal(steps?.kind, 'rows');
    if (steps?.kind === 'rows')
      assert.deepEqual(
        steps.rows.map((row) => row.label),
        ['01', '02', '03', '04', '•'],
      );
    for (const slide of plan.slides) {
      const canonical = source[language].slides[slide.number - 1];
      assert.ok(canonical);
      assert.equal(slide.title, canonical.title);
      if (slide.kind === 'rows') {
        assert.deepEqual(
          slide.rows.map((row) => row.text),
          canonical.items,
        );
      } else if (slide.kind === 'cover') {
        assert.equal(slide.subtitle, canonical.items[0]);
        assert.equal(slide.context, canonical.items.slice(1).join(' '));
      } else {
        assert.deepEqual(slide.headers, canonical.table?.headers);
        assert.deepEqual(slide.rows, canonical.table?.rows);
      }
    }
  }
});
