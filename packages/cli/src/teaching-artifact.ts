import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { atomicWrite, canonicalJson, repositoryRoot, sha256 } from '@coursera-notes/core';
import {
  readManifest,
  resolveTeachingSessionSources,
  teachingSessionSourcePath,
  type TeachingSession,
} from '@coursera-notes/manifest';
import {
  parseTeachingSession,
  createPdfContactSheets,
  renderPdfPages,
  renderNativePptx,
  renderNativePptxVisualQa,
  renderTeachingPdf,
  renderTeachingPdfHtml,
  resolveTeachingPdfVisuals,
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

import {
  animationCounts,
  createS01AnimationPlan,
  createS02AnimationPlan,
  createS03AnimationPlan,
} from './teaching-animation-plan.js';
import { animatedOutputFile } from './teaching-animation-output.js';
import {
  parseTeachingArtifactArguments,
  type TeachingArtifactFormat as Format,
  type TeachingArtifactLanguage as Language,
} from './teaching-artifact-arguments.js';

function teachingSourcePath(root: string, session: TeachingSession, language: Language): string {
  const source = session.source[language];
  const expected = teachingSessionSourcePath(session, language);

  if (source !== expected) {
    throw new Error(
      `Teaching session ${session.id} ${language} source must be ${expected}; received ${source}.`,
    );
  }

  return resolve(root, source);
}

async function readPair(
  session: TeachingSession,
  root: string,
  courseSources: {
    canonicalModuleIds: string[];
    en: string[];
    fr: string[];
  },
): Promise<Record<Language, TeachingSessionContent>> {
  const content = {} as Record<Language, TeachingSessionContent>;
  for (const language of ['en', 'fr'] as const) {
    const sourcePath = session.source[language];
    const markdown = await readFile(teachingSourcePath(root, session, language), 'utf8');
    content[language] = parseTeachingSession(markdown, {
      id: session.id,
      canonicalModuleIds: courseSources.canonicalModuleIds,
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

async function currentVisualAssets(spec: ReturnType<typeof teachingDeckSpec>, root: string) {
  return Promise.all(
    spec.slides
      .flatMap((slide) =>
        slide.visual
          ? [
              {
                slideId: slide.slideId,
                path: slide.visual.path,
              },
            ]
          : [],
      )
      .map(async (visual) => ({
        ...visual,
        sha256: sha256(await readFile(resolve(root, visual.path))),
      })),
  );
}

async function animateWithPowerPoint(
  root: string,
  sessionId: 's01' | 's02' | 's03',
  language: Language,
  planPath: string,
): Promise<string> {
  if (process.platform !== 'win32') {
    throw new Error('Native teaching animations require desktop PowerPoint on Windows.');
  }
  return new Promise<string>((resolvePromise, rejectPromise) => {
    let stdout = '';
    const child = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        resolve(root, `scripts/teaching-animate-${sessionId}.ps1`),
        '-RepoRoot',
        root,
        '-PlanPath',
        planPath,
        '-Language',
        language,
      ],
      { cwd: root, stdio: ['inherit', 'pipe', 'inherit'] },
    );
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
      process.stdout.write(chunk);
    });
    child.once('error', rejectPromise);
    child.once('close', (code) => {
      if (code === 0) {
        try {
          resolvePromise(animatedOutputFile(stdout, sessionId === 's03'));
        } catch (error) {
          rejectPromise(error);
        }
      } else {
        rejectPromise(
          new Error(`PowerPoint animation failed for ${sessionId}/${language}: ${code}.`),
        );
      }
    });
  });
}

async function main(): Promise<void> {
  const args = parseTeachingArtifactArguments(process.argv.slice(2));
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
    const pair = await readPair(session, root, resolveTeachingSessionSources(manifest, session));
    for (const language of (args.language ? [args.language] : ['en', 'fr']) as Language[]) {
      const content = pair[language];
      const outputRoot = resolve(root, '.artifacts', 'teaching-sessions', session.id, language);
      if (args.command === 'animate') {
        if (
          (session.id !== 's01' && session.id !== 's02' && session.id !== 's03') ||
          (args.format && args.format !== 'pptx')
        ) {
          throw new Error('Native animations currently support S01/S02/S03 PPTX only.');
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
          throw new Error(
            `Stale ${session.id.toUpperCase()} PPTX: rebuild ${language} before animating.`,
          );
        }
        const plan =
          session.id === 's01'
            ? createS01AnimationPlan(content)
            : session.id === 's02'
              ? createS02AnimationPlan(content)
              : createS03AnimationPlan(content);
        const counts = animationCounts(plan);
        const planPath = resolve(outputRoot, 'animation-plan.json');
        await atomicWrite(planPath, canonicalJson(plan));
        const animatedFile = await animateWithPowerPoint(root, session.id, language, planPath);
        const animatedPath = resolve(outputRoot, animatedFile);
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
            outputFile: animatedFile,
            animationPlanSha256: sha256(canonicalJson(plan)),
            animatedSlideIds: plan.slides.map(
              (slide) => `${session.id.toUpperCase()}-${String(slide.number).padStart(2, '0')}`,
            ),
            slideCount: animated.slideCount,
            ...counts,
          }),
        );
        console.log(
          `ANIMATED ${session.id}/${language}/pptx slides=${counts.animatedSlides} clicks=${counts.clicks} effects=${counts.effects} file=${animatedFile}`,
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
      const sourceNow = await readFile(teachingSourcePath(root, session, language), 'utf8');
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
            const visuals = await resolveTeachingPdfVisuals(content, root);
            const html = renderTeachingPdfHtml(
              content,
              `data:image/png;base64,${logo.toString('base64')}`,
              visuals,
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
