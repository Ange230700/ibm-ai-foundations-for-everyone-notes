import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { atomicWrite, canonicalJson, repositoryRoot, sha256 } from '@coursera-notes/core';
import { readManifest, type TeachingSession } from '@coursera-notes/manifest';
import {
  parseTeachingSession,
  createPdfContactSheets,
  renderPdfPages,
  renderNativePptx,
  renderNativePptxVisualQa,
  renderTeachingPdf,
  renderTeachingPdfHtml,
  serializeNativePptxArtifactRecord,
  serializeNativePptxVerification,
  serializeNativePptxVisualQaManifest,
  serializePdfContactSheetManifest,
  serializePdfPageRenderManifest,
  serializeTeachingPdfRecord,
  teachingDeckSpec,
  validateTeachingPair,
  verifyNativePptx,
  verifyTeachingPdf,
  type TeachingSessionContent,
} from '@coursera-notes/presentations';

import { animationCounts, createS01AnimationPlan } from './teaching-animation-plan.js';

type Format = 'pdf' | 'pptx';
type Language = 'en' | 'fr';

async function currentVisualAssets(spec: ReturnType<typeof teachingDeckSpec>, root: string) {
  return Promise.all(
    spec.slides
      .flatMap((slide) =>
        slide.visual ? [{ slideId: slide.slideId, path: slide.visual.path }] : [],
      )
      .map(async (visual) => ({
        ...visual,
        sha256: sha256(await readFile(resolve(root, visual.path))),
      })),
  );
}

interface Arguments {
  command: 'plan' | 'build' | 'verify' | 'visual-qa' | 'animate';
  session?: string;
  language?: Language;
  format?: Format;
}

function parseArguments(args: string[]): Arguments {
  const [command, ...options] = args;
  if (
    command !== 'plan' &&
    command !== 'build' &&
    command !== 'verify' &&
    command !== 'visual-qa' &&
    command !== 'animate'
  ) {
    throw new Error(
      'Usage: pnpm teaching:artifact plan|build|verify|visual-qa|animate [--session=s01|s02] [--lang=en|fr] [--format=pdf|pptx]',
    );
  }
  const result: Arguments = { command };
  for (const option of options) {
    const [key, value, extra] = option.split('=');
    if (!value || extra) throw new Error(`Invalid teaching option: ${option}.`);
    if (key === '--session' && !result.session) result.session = value;
    else if (key === '--lang' && !result.language && (value === 'en' || value === 'fr'))
      result.language = value;
    else if (key === '--format' && !result.format && (value === 'pdf' || value === 'pptx'))
      result.format = value;
    else throw new Error(`Unknown or duplicate teaching option: ${option}.`);
  }
  return result;
}

function safePath(root: string, source: string): string {
  if (!/^(?:teaching|courses)\/[a-z0-9/_-]+\.md$/u.test(source) || source.includes('..')) {
    throw new Error(`Unsafe teaching source path: ${source}.`);
  }
  return resolve(root, source);
}

async function readPair(
  session: TeachingSession,
  root: string,
  courseSources: {
    en: string[];
    fr: string[];
  },
): Promise<Record<Language, TeachingSessionContent>> {
  const content = {} as Record<Language, TeachingSessionContent>;
  for (const language of ['en', 'fr'] as const) {
    const sourcePath = session.source[language];
    const markdown = await readFile(safePath(root, sourcePath), 'utf8');
    content[language] = parseTeachingSession(markdown, {
      id: session.id,
      courseId: session.courseId,
      language,
      sourcePath,
      durationMinutes: session.durationMinutes,
      slideCount: session.slideCount,
      canonicalSources: courseSources[language],
    });
  }
  validateTeachingPair(content.en, content.fr);
  return content;
}

async function animateWithPowerPoint(
  root: string,
  language: Language,
  planPath: string,
): Promise<void> {
  if (process.platform !== 'win32') {
    throw new Error('Native S01 animations require desktop PowerPoint on Windows.');
  }
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        resolve(root, 'scripts/teaching-animate-s01.ps1'),
        '-RepoRoot',
        root,
        '-PlanPath',
        planPath,
        '-Language',
        language,
      ],
      { cwd: root, stdio: 'inherit' },
    );
    child.once('error', rejectPromise);
    child.once('close', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`PowerPoint animation failed for S01/${language}: ${code}.`));
    });
  });
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  const manifest = await readManifest();
  const root = repositoryRoot();
  const requestedSession = args.session ?? (args.command === 'animate' ? 's01' : undefined);
  const sessions =
    manifest.teachingSessions?.filter(
      (session) => !requestedSession || session.id === requestedSession,
    ) ?? [];
  if (sessions.length === 0)
    throw new Error(`No teaching session matched ${args.session ?? 'manifest'}.`);

  for (const session of sessions) {
    const course = manifest.courses.find((candidate) => candidate.id === session.courseId);
    if (!course) throw new Error(`Unknown teaching course: ${session.courseId}.`);
    const pair = await readPair(session, root, {
      en: course.modules.map((module) => module.source.en),
      fr: course.modules.map((module) => module.source.fr),
    });
    for (const language of (args.language ? [args.language] : ['en', 'fr']) as Language[]) {
      const content = pair[language];
      const outputRoot = resolve(root, '.artifacts', 'teaching-sessions', session.id, language);
      if (args.command === 'animate') {
        if (session.id !== 's01' || (args.format && args.format !== 'pptx')) {
          throw new Error('Native animations currently support S01 PPTX only.');
        }
        const path = resolve(outputRoot, 'session.pptx');
        const spec = teachingDeckSpec(content);
        const record = JSON.parse(
          await readFile(resolve(outputRoot, 'pptx-artifact.json'), 'utf8'),
        ) as {
          pptxSha256: string;
          sourceSha256: string;
          moduleContentSha256: string;
          deckSpecSha256: string;
          visualAssets: Array<{ slideId: string; path: string; sha256: string }>;
        };
        const source = await verifyNativePptx(spec, root, path);
        if (
          record.pptxSha256 !== source.pptxSha256 ||
          record.sourceSha256 !== content.sourceSha256 ||
          record.moduleContentSha256 !== content.contentSha256 ||
          record.deckSpecSha256 !== source.deckSpecSha256 ||
          canonicalJson(record.visualAssets) !==
            canonicalJson(await currentVisualAssets(spec, root))
        ) {
          throw new Error(`Stale S01 PPTX: rebuild ${language} before animating.`);
        }
        const plan = createS01AnimationPlan(content);
        const counts = animationCounts(plan);
        const planPath = resolve(outputRoot, 'animation-plan.json');
        await atomicWrite(planPath, canonicalJson(plan));
        await animateWithPowerPoint(root, language, planPath);
        const animatedPath = resolve(outputRoot, 'session-animated.pptx');
        const animated = await verifyNativePptx(spec, root, animatedPath);
        await atomicWrite(
          resolve(outputRoot, 'pptx-animation.json'),
          canonicalJson({
            schemaVersion: 2,
            sessionId: session.id,
            language,
            sourceSha256: content.sourceSha256,
            deckSpecSha256: source.deckSpecSha256,
            inputPptxSha256: source.pptxSha256,
            outputPptxSha256: animated.pptxSha256,
            animationPlanSha256: sha256(canonicalJson(plan)),
            animatedSlideIds: plan.slides.map(
              (slide) => `${session.id.toUpperCase()}-${String(slide.number).padStart(2, '0')}`,
            ),
            slideCount: animated.slideCount,
            ...counts,
          }),
        );
        console.log(
          `ANIMATED ${session.id}/${language}/pptx slides=${counts.animatedSlides} clicks=${counts.clicks} effects=${counts.effects}`,
        );
        continue;
      }
      const formats = (args.format ? [args.format] : ['pdf', 'pptx']) as Format[];
      if (args.command === 'plan') {
        console.log(
          `PLAN ${session.id}/${language} slides=${content.slides.length} minutes=${content.durationMinutes} formats=${formats.join(',')} source=${content.sourcePath}`,
        );
        continue;
      }
      const sourceNow = await readFile(safePath(root, content.sourcePath), 'utf8');
      if (sha256(sourceNow) !== content.sourceSha256)
        throw new Error(`${content.sourcePath} changed during build.`);
      for (const format of formats) {
        if (args.command === 'visual-qa') {
          const visualRoot = resolve(outputRoot, 'visual-qa', format);
          if (format === 'pdf') {
            const pdfPath = resolve(outputRoot, 'session.pdf');
            const verification = await verifyTeachingPdf(content, pdfPath);
            const pageRender = await renderPdfPages({
              repositoryRoot: root,
              pdfPath,
              outputRoot: resolve(visualRoot, 'pages'),
              dpi: 150,
            });
            if (verification.pdfSha256 !== pageRender.pdfSha256)
              throw new Error('PDF visual-QA checksum mismatch.');
            const contactSheets = await createPdfContactSheets(pageRender, {
              repositoryRoot: root,
              outputRoot: resolve(visualRoot, 'contact-sheets'),
              documentId: `${session.id}.${language}`,
              columns: 3,
              pagesPerSheet: 12,
              thumbnailWidth: 400,
            });
            await atomicWrite(
              resolve(visualRoot, 'pages.json'),
              serializePdfPageRenderManifest(pageRender),
            );
            await atomicWrite(
              resolve(visualRoot, 'contact-sheets.json'),
              serializePdfContactSheetManifest(contactSheets),
            );
          } else {
            const spec = teachingDeckSpec(content);
            const visualQa = await renderNativePptxVisualQa(spec, {
              repositoryRoot: root,
              pptxPath: resolve(outputRoot, 'session.pptx'),
              outputRoot: visualRoot,
              documentId: `${session.id}.${language}`,
              columns: 3,
              pagesPerSheet: 12,
              thumbnailWidth: 400,
              dpi: 150,
            });
            await atomicWrite(
              resolve(visualRoot, 'visual-qa.json'),
              serializeNativePptxVisualQaManifest(visualQa),
            );
          }
          console.log(
            `VISUAL-QA ${session.id}/${language}/${format} slides=${content.slides.length}`,
          );
          continue;
        }
        if (format === 'pdf') {
          const path = resolve(outputRoot, 'session.pdf');
          if (args.command === 'build') {
            const artifact = await renderTeachingPdf(content, root, path);
            const verification = await verifyTeachingPdf(content, path);
            if (artifact.pdfSha256 !== verification.pdfSha256)
              throw new Error('Teaching PDF checksum mismatch.');
            await atomicWrite(
              resolve(outputRoot, 'pdf-artifact.json'),
              serializeTeachingPdfRecord(artifact),
            );
            await atomicWrite(
              resolve(outputRoot, 'pdf-verification.json'),
              serializeTeachingPdfRecord(verification),
            );
          } else {
            const record = JSON.parse(
              await readFile(resolve(outputRoot, 'pdf-artifact.json'), 'utf8'),
            ) as {
              pdfSha256: string;
              sourceSha256: string;
              contentSha256: string;
              brandLogoSha256: string;
              htmlSha256: string;
            };
            const verification = await verifyTeachingPdf(content, path);
            const logo = await readFile(
              resolve(root, 'packages/presentations/assets/brand/kraak/kraak-logo.png'),
            );
            const html = renderTeachingPdfHtml(
              content,
              `data:image/png;base64,${logo.toString('base64')}`,
            );
            if (
              record.pdfSha256 !== verification.pdfSha256 ||
              record.sourceSha256 !== content.sourceSha256 ||
              record.contentSha256 !== content.contentSha256 ||
              record.brandLogoSha256 !== sha256(logo) ||
              record.htmlSha256 !== sha256(html)
            ) {
              throw new Error(`Stale teaching PDF: ${session.id}/${language}.`);
            }
          }
        } else {
          const path = resolve(outputRoot, 'session.pptx');
          const spec = teachingDeckSpec(content);
          if (args.command === 'build') {
            const artifact = await renderNativePptx(spec, {
              repositoryRoot: root,
              outputPath: path,
            });
            const verification = await verifyNativePptx(spec, root, path);
            if (
              artifact.pptxSha256 !== verification.pptxSha256 ||
              artifact.deckSpecSha256 !== verification.deckSpecSha256
            ) {
              throw new Error('Teaching PPTX checksum mismatch.');
            }
            await atomicWrite(
              resolve(outputRoot, 'pptx-artifact.json'),
              serializeNativePptxArtifactRecord(artifact),
            );
            await atomicWrite(
              resolve(outputRoot, 'pptx-verification.json'),
              serializeNativePptxVerification(verification),
            );
          } else {
            const record = JSON.parse(
              await readFile(resolve(outputRoot, 'pptx-artifact.json'), 'utf8'),
            ) as {
              pptxSha256: string;
              sourceSha256: string;
              moduleContentSha256: string;
              deckSpecSha256: string;
              visualAssets: Array<{ slideId: string; path: string; sha256: string }>;
            };
            const verification = await verifyNativePptx(spec, root, path);
            if (
              record.pptxSha256 !== verification.pptxSha256 ||
              record.sourceSha256 !== content.sourceSha256 ||
              record.moduleContentSha256 !== content.contentSha256 ||
              record.deckSpecSha256 !== verification.deckSpecSha256 ||
              canonicalJson(record.visualAssets) !==
                canonicalJson(await currentVisualAssets(spec, root))
            ) {
              throw new Error(`Stale teaching PPTX: ${session.id}/${language}.`);
            }
          }
        }
        console.log(
          `${args.command === 'build' ? 'WROTE' : 'VERIFIED'} ${session.id}/${language}/${format} slides=${content.slides.length} minutes=${content.durationMinutes}`,
        );
      }
    }
  }
}

await main();
