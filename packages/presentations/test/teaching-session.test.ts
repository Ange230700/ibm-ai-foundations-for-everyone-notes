import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import JSZip from 'jszip';

import { repositoryRoot, sha256 } from '@coursera-notes/core';
import { readManifest } from '@coursera-notes/manifest';

import {
  parseTeachingSession,
  teachingDeckSpec,
  validateTeachingPair,
} from '../src/teaching/session.js';
import { renderTeachingPdfHtml } from '../src/teaching/pdf.js';
import { renderNativePptx, verifyNativePptx } from '../src/index.js';

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

test('S01 PPTX embeds six bilingual teaching visuals and legible rich notes on all slides', async () => {
  const { content } = await fixture();
  await mkdir(resolve(repositoryRoot(), '.artifacts'), { recursive: true });
  const output = await mkdtemp(resolve(repositoryRoot(), '.artifacts/s01-visual-test-'));
  try {
    for (const language of ['en', 'fr'] as const) {
      const spec = teachingDeckSpec(content[language]);
      assert.deepEqual(
        spec.slides.filter((slide) => slide.visual).map((slide) => slide.slideId),
        ['S01-08', 'S01-10', 'S01-20', 'S01-21', 'S01-23', 'S01-25'],
      );
      const path = resolve(output, `${language}.pptx`);
      const artifact = await renderNativePptx(spec, {
        repositoryRoot: repositoryRoot(),
        outputPath: path,
      });
      assert.equal(artifact.visualAssets.length, 6);
      const verification = await verifyNativePptx(spec, repositoryRoot(), path);
      assert.deepEqual(
        verification.slides
          .filter((slide) => slide.pictures >= 2 && slide.slideId !== 'S01-01')
          .map((slide) => slide.slideId),
        ['S01-08', 'S01-10', 'S01-20', 'S01-21', 'S01-23', 'S01-25'],
      );
      const zip = await JSZip.loadAsync(await readFile(path));
      if (language === 'fr') {
        const capturePath = 'teaching/visuals/s01/fr/chat-capture.png';
        const capture = spec.slides[22]?.visual;
        assert.equal(capture?.kind, 'capture');
        assert.equal(capture.path, capturePath);
        assert.match(capture.caption, /Échange réel avec ChatGPT/u);
        assert.equal(
          artifact.visualAssets.find((asset) => asset.slideId === 'S01-23')?.sha256,
          sha256(await readFile(resolve(repositoryRoot(), capturePath))),
        );
        const slideXml = await zip.file('ppt/slides/slide23.xml')?.async('string');
        assert.ok(slideXml);
        const imageWidths = [
          ...slideXml.matchAll(/<p:pic>[\s\S]*?<a:ext cx="(\d+)" cy="\d+"/gu),
        ].map((match) => Number(match[1]));
        assert.ok(
          imageWidths.some((width) => width >= 8 * 914400),
          'capture uses the wide slide layout',
        );
      }
      for (let index = 1; index <= 30; index++) {
        const xml = await zip.file(`ppt/notesSlides/notesSlide${index}.xml`)?.async('string');
        assert.ok(xml?.includes(' b="1"'), `bold S01 slide ${index}`);
        assert.ok(xml.includes(' u="sng"'), `underlined cue S01 slide ${index}`);
        assert.ok(xml.includes(' i="1"'), `italic source S01 slide ${index}`);
        assert.doesNotMatch(xml, /\*\*Message|\*\*Key takeaway/u);
      }
    }
  } finally {
    await rm(output, { recursive: true, force: true });
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

test('S02 generates aligned 26-slide decks with readable presenter notes', async () => {
  const manifest = await readManifest();
  const session = manifest.teachingSessions?.find((entry) => entry.id === 's02');
  assert.ok(session);
  const course = manifest.courses.find((entry) => entry.id === session.courseId);
  assert.ok(course);
  const content = {} as Record<'en' | 'fr', ReturnType<typeof parseTeachingSession>>;
  for (const language of ['en', 'fr'] as const) {
    const markdown = await readFile(resolve(repositoryRoot(), session.source[language]), 'utf8');
    content[language] = parseTeachingSession(markdown, {
      id: session.id,
      courseId: session.courseId,
      language,
      sourcePath: session.source[language],
      slideCount: session.slideCount,
      durationMinutes: session.durationMinutes,
      canonicalSources: course.modules.map((module) => module.source[language]),
    });
  }
  validateTeachingPair(content.en, content.fr);
  await mkdir(resolve(repositoryRoot(), '.artifacts'), { recursive: true });
  const output = await mkdtemp(resolve(repositoryRoot(), '.artifacts/s02-artifact-test-'));
  try {
    for (const language of ['en', 'fr'] as const) {
      const current = content[language];
      assert.equal(current.slides.length, 26);
      assert.equal(current.durationMinutes, 60);
      assert.equal(current.slides[0]?.id, 'S02-01');
      assert.equal(current.slides[25]?.id, 'S02-26');
      const spec = teachingDeckSpec(current);
      const visualSlideIds = [
        'S02-06',
        'S02-09',
        'S02-11',
        'S02-12',
        'S02-13',
        'S02-14',
        'S02-17',
        'S02-20',
        'S02-21',
      ];
      assert.deepEqual(
        spec.slides.filter((slide) => slide.visual).map((slide) => slide.slideId),
        visualSlideIds,
      );
      assert.deepEqual(
        spec.slides.slice(0, 2).map((slide) => slide.kind),
        ['title', 'objectives'],
      );
      const html = renderTeachingPdfHtml(current);
      assert.equal((html.match(/<section class="slide/g) ?? []).length, 26);
      assert.doesNotMatch(html, /\*\*Key takeaway|\*\*Message à faire retenir/u);
      const pptxPath = resolve(output, `s02-${language}.pptx`);
      const artifact = await renderNativePptx(spec, {
        repositoryRoot: repositoryRoot(),
        outputPath: pptxPath,
      });
      assert.equal(artifact.visualAssets.length, visualSlideIds.length);
      const verification = await verifyNativePptx(spec, repositoryRoot(), pptxPath);
      assert.equal(verification.slideCount, 26);
      assert.deepEqual(
        verification.slides
          .filter((slide) => slide.pictures >= 2 && slide.slideId !== 'S02-01')
          .map((slide) => slide.slideId),
        visualSlideIds,
      );
      assert.deepEqual(
        verification.slides.map((slide) => slide.slideId),
        current.slides.map((slide) => slide.id),
      );
      const zip = await JSZip.loadAsync(await readFile(pptxPath));
      if (language === 'fr') {
        const capturePath = 'teaching/visuals/s02/fr/chat-capture.png';
        const capture = spec.slides[10]?.visual;
        assert.equal(capture?.kind, 'capture');
        assert.equal(capture.path, capturePath);
        assert.match(capture.caption, /Échange réel avec ChatGPT/u);
        assert.equal(
          artifact.visualAssets.find((asset) => asset.slideId === 'S02-11')?.sha256,
          sha256(await readFile(resolve(repositoryRoot(), capturePath))),
        );
        const slideXml = await zip.file('ppt/slides/slide11.xml')?.async('string');
        assert.ok(slideXml);
        const imageWidths = [
          ...slideXml.matchAll(/<p:pic>[\s\S]*?<a:ext cx="(\d+)" cy="\d+"/gu),
        ].map((match) => Number(match[1]));
        assert.ok(
          imageWidths.some((width) => width >= 8 * 914400),
          'S02 capture uses the wide slide layout',
        );
      }
      for (let number = 1; number <= 26; number += 1) {
        const xml = await zip.file(`ppt/notesSlides/notesSlide${number}.xml`)?.async('string');
        assert.ok(xml?.includes(' b="1"'), `bold S02 ${language} slide ${number}`);
        assert.ok(xml.includes(' u="sng"'), `underlined cue S02 ${language} slide ${number}`);
        assert.ok(xml.includes(' i="1"'), `italic source S02 ${language} slide ${number}`);
      }
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test('S03 produces aligned 25-slide draft decks and keeps presenter notes off projected pages', async () => {
  const manifest = await readManifest();
  const session = manifest.teachingSessions?.find((entry) => entry.id === 's03');
  assert.ok(session);
  const course = manifest.courses.find((entry) => entry.id === session.courseId);
  assert.ok(course);
  const content = {} as Record<'en' | 'fr', ReturnType<typeof parseTeachingSession>>;
  for (const language of ['en', 'fr'] as const) {
    const markdown = await readFile(resolve(repositoryRoot(), session.source[language]), 'utf8');
    content[language] = parseTeachingSession(markdown, {
      id: session.id,
      courseId: session.courseId,
      language,
      sourcePath: session.source[language],
      slideCount: session.slideCount,
      durationMinutes: session.durationMinutes,
      canonicalSources: course.modules.map((module) => module.source[language]),
    });
  }
  validateTeachingPair(content.en, content.fr);
  await mkdir(resolve(repositoryRoot(), '.artifacts'), { recursive: true });
  const output = await mkdtemp(resolve(repositoryRoot(), '.artifacts/s03-artifact-test-'));
  try {
    for (const language of ['en', 'fr'] as const) {
      const current = content[language];
      assert.equal(current.slides.length, 25);
      assert.equal(current.durationMinutes, 60);
      assert.equal(current.slides[0]?.id, 'S03-01');
      assert.equal(current.slides[24]?.id, 'S03-25');
      const spec = teachingDeckSpec(current);
      assert.equal(spec.slides.length, 25);
      const visualSlideIds = [
        'S03-05',
        'S03-08',
        'S03-13',
        'S03-14',
        'S03-16',
        'S03-17',
        'S03-19',
        'S03-20',
        'S03-23',
      ];
      assert.deepEqual(
        spec.slides.filter((slide) => slide.visual).map((slide) => slide.slideId),
        visualSlideIds,
      );
      assert.deepEqual(
        spec.slides.slice(0, 2).map((slide) => slide.kind),
        ['title', 'objectives'],
      );
      const html = renderTeachingPdfHtml(current);
      assert.equal((html.match(/<section class="slide/g) ?? []).length, 25);
      assert.doesNotMatch(html, /\*\*Key takeaway|\*\*Message à faire retenir/u);
      const pptxPath = resolve(output, `s03-${language}.pptx`);
      const artifact = await renderNativePptx(spec, {
        repositoryRoot: repositoryRoot(),
        outputPath: pptxPath,
      });
      assert.equal(artifact.visualAssets.length, visualSlideIds.length);
      const verified = await verifyNativePptx(spec, repositoryRoot(), pptxPath);
      assert.equal(verified.slideCount, 25);
      assert.deepEqual(
        verified.slides
          .filter((slide) => slide.pictures >= 2 && slide.slideId !== 'S03-01')
          .map((slide) => slide.slideId),
        visualSlideIds,
      );
      assert.deepEqual(
        verified.slides.map((slide) => slide.slideId),
        current.slides.map((slide) => slide.id),
      );
      const zip = await JSZip.loadAsync(await readFile(pptxPath));
      if (language === 'fr') {
        const capturePath = 'teaching/visuals/s03/fr/chat-capture.png';
        const capture = spec.slides[7]?.visual;
        assert.equal(capture?.kind, 'capture');
        assert.equal(capture.path, capturePath);
        assert.match(capture.caption, /Échange réel avec ChatGPT/u);
        assert.equal(
          artifact.visualAssets.find((asset) => asset.slideId === 'S03-08')?.sha256,
          sha256(await readFile(resolve(repositoryRoot(), capturePath))),
        );
        const slideXml = await zip.file('ppt/slides/slide8.xml')?.async('string');
        assert.ok(slideXml);
        const imageWidths = [
          ...slideXml.matchAll(/<p:pic>[\s\S]*?<a:ext cx="(\d+)" cy="\d+"/gu),
        ].map((match) => Number(match[1]));
        assert.ok(
          imageWidths.some((width) => width >= 8 * 914400),
          'S03 capture uses the wide slide layout',
        );
      }
      for (let number = 1; number <= 25; number += 1) {
        const xml = await zip.file(`ppt/notesSlides/notesSlide${number}.xml`)?.async('string');
        assert.ok(xml?.includes(' b="1"'), `bold S03 ${language} slide ${number}`);
        assert.ok(xml.includes(' u="sng"'), `underlined cue S03 ${language} slide ${number}`);
      }
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
