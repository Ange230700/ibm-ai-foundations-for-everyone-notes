import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { repositoryRoot } from '@coursera-notes/core';
import { readManifest } from '@coursera-notes/manifest';

import {
  parseTeachingSession,
  teachingDeckSpec,
  validateTeachingPair,
} from '../src/teaching/session.js';
import { renderTeachingPdfHtml } from '../src/teaching/pdf.js';

async function fixture() {
  const manifest = await readManifest();
  const session = manifest.teachingSessions?.find((entry) => entry.id === 's01');
  assert.ok(session);
  const course = manifest.courses.find((entry) => entry.id === session.courseId);
  assert.ok(course);
  const markdown = {} as Record<'en' | 'fr', string>;
  const content = {} as Record<'en' | 'fr', ReturnType<typeof parseTeachingSession>>;
  for (const language of ['en', 'fr'] as const) {
    markdown[language] = await readFile(
      resolve(repositoryRoot(), session.source[language]),
      'utf8',
    );
    content[language] = parseTeachingSession(markdown[language], {
      id: session.id,
      courseId: session.courseId,
      language,
      sourcePath: session.source[language],
      slideCount: session.slideCount,
      durationMinutes: session.durationMinutes,
      canonicalSources: course.modules.map((module) => module.source[language]),
    });
  }
  return { session, course, markdown, content };
}

test('S01 teaching sources preserve 30 aligned slides and exactly 60 minutes', async () => {
  const { content } = await fixture();
  validateTeachingPair(content.en, content.fr);
  assert.equal(content.en.slides.length, 30);
  assert.equal(content.fr.slides.length, 30);
  assert.equal(content.en.durationMinutes, 60);
  assert.equal(content.fr.durationMinutes, 60);
  assert.deepEqual(content.en.slides[7]?.itemKinds, [
    'ordered',
    'ordered',
    'ordered',
    'ordered',
    'bullet',
  ]);
  for (const language of ['en', 'fr'] as const) {
    const spec = teachingDeckSpec(content[language]);
    assert.equal(spec.slides.length, 30);
    assert.deepEqual(
      spec.slides.map((slide) => slide.slideId),
      content[language].slides.map((slide) => slide.id),
    );
    assert.ok(
      spec.slides.every(
        (slide) =>
          slide.teachingNotes && slide.sourceRefs[0]?.path === content[language].sourcePath,
      ),
    );
    assert.equal(spec.slides[18]?.kind, 'table');
  }
});

test('S01 parser rejects changed timing and bilingual divergence', async () => {
  const { session, course, markdown, content } = await fixture();
  const changed = markdown.en.replace('**Duration:** 1 minute', '**Duration:** 2 minutes');
  assert.throws(
    () =>
      parseTeachingSession(changed, {
        id: session.id,
        courseId: session.courseId,
        language: 'en',
        sourcePath: session.source.en,
        slideCount: session.slideCount,
        durationMinutes: session.durationMinutes,
        canonicalSources: course.modules.map((module) => module.source.en),
      }),
    /expected 60 minutes/,
  );
  const divergent = structuredClone(content.fr);
  divergent.slides[18]?.table?.rows.pop();
  assert.throws(() => validateTeachingPair(content.en, divergent), /diverge/);
});

test('projected PDF contains the slide content without facilitator notes', async () => {
  const { content } = await fixture();
  const html = renderTeachingPdfHtml(content.fr);
  assert.equal((html.match(/<section class="slide/g) ?? []).length, 30);
  assert.match(html, /Cas fictif : une coopérative cacaoyère près de Soubré/);
  assert.doesNotMatch(html, /Nawa/);
  assert.match(
    renderTeachingPdfHtml(content.en),
    /Fictional case: a cocoa cooperative near Soubré/,
  );
  assert.doesNotMatch(html, /\*\*Message à faire retenir/);
  assert.doesNotMatch(html, /Notes pédagogiques/);
});
