import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { repositoryRoot } from '@coursera-notes/core';
import { readManifest } from '@coursera-notes/manifest';
import { parseTeachingSession, validateTeachingPair } from '@coursera-notes/presentations';

import {
  animationCounts,
  createS01AnimationPlan,
  createS02AnimationPlan,
  createS03AnimationPlan,
} from '../src/teaching-animation-plan.js';

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
    assert.deepEqual(animationCounts(plan), { animatedSlides: 30, clicks: 93, effects: 276 });
    assert.equal(plan.slides[0]?.kind, 'cover');
    assert.equal(plan.slides[17]?.kind, 'table');
    assert.deepEqual(
      [2, 3, 8].map((number) => {
        const slide = plan.slides[number - 1];
        return slide?.kind === 'rows' ? slide.rows.length : 0;
      }),
      [5, 5, 4],
    );
    const steps = plan.slides[7];
    assert.equal(steps?.kind, 'rows');
    if (steps?.kind === 'rows')
      assert.deepEqual(
        steps.rows.map((row) => row.label),
        ['01', '02', '03', '04'],
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

test('S02 animation plan covers 26 bilingual slides without changing content or timing', async () => {
  const manifest = await readManifest();
  const session = manifest.teachingSessions?.find((entry) => entry.id === 's02');
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
    const current = source[language];
    const plan = createS02AnimationPlan(current);
    assert.equal(plan.sourceSha256, current.sourceSha256);
    assert.equal(plan.sessionId, 's02');
    assert.equal(plan.slideCount, 26);
    assert.deepEqual(animationCounts(plan), { animatedSlides: 26, clicks: 53, effects: 158 });
    assert.deepEqual(
      plan.slides.map((slide) => slide.number),
      Array.from({ length: 26 }, (_, index) => index + 1),
    );
    assert.equal(plan.slides[0]?.kind, 'cover');
    for (const slide of plan.slides) {
      const canonical = current.slides[slide.number - 1];
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
        assert.fail('S02 currently contains no table slides.');
      }
    }
    assert.throws(() => createS02AnimationPlan({ ...current, durationMinutes: 59 }), /60-minute/u);
  }
});

test('S03 animation plan covers 25 bilingual slides without changing content or timing', async () => {
  const manifest = await readManifest();
  const session = manifest.teachingSessions?.find((entry) => entry.id === 's03');
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
    const current = source[language];
    const plan = createS03AnimationPlan(current);
    assert.equal(plan.sourceSha256, current.sourceSha256);
    assert.equal(plan.sessionId, 's03');
    assert.equal(plan.slideCount, 25);
    assert.deepEqual(animationCounts(plan), { animatedSlides: 25, clicks: 52, effects: 155 });
    assert.deepEqual(
      plan.slides.map((slide) => slide.number),
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    assert.equal(plan.slides[0]?.kind, 'cover');
    for (const slide of plan.slides) {
      const canonical = current.slides[slide.number - 1];
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
        assert.fail('S03 currently contains no table slides.');
      }
    }
    assert.throws(() => createS03AnimationPlan({ ...current, durationMinutes: 59 }), /60-minute/u);
  }
});
