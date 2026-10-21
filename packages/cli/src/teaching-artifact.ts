import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { atomicWrite, canonicalJson, repositoryRoot, sha256 } from '@coursera-notes/core';
import { renderMarkdownText, validatePlainText } from '@coursera-notes/artifacts';
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
  createS04AnimationPlan,
  createS05AnimationPlan,
  createS06AnimationPlan,
  createS07AnimationPlan,
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
  sessionId: 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07',
  language: Language,
  planPath: string,
): Promise<string> {
  if (process.platform !== 'win32') {
    throw new Error('Native teaching animations require desktop PowerPoint on Windows.');
  }
  const systemRoot = process.env.SystemRoot;
  if (!systemRoot) throw new Error('SystemRoot is required to locate Windows PowerShell.');
  const powershell = resolve(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  return new Promise<string>((resolvePromise, rejectPromise) => {
    let stdout = '';
    const child = spawn(
      powershell,
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
          resolvePromise(animatedOutputFile(stdout, sessionId !== 's01' && sessionId !== 's02'));
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

type TeachingArgs = ReturnType<typeof parseTeachingArtifactArguments>;
type AnimationSessionId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07';
type PptxRecord = {
  editorialProfile: string;
  outputFormat: string;
  pptxSha256: string;
  sourceSha256: string;
  moduleContentSha256: string;
  deckSpecSha256: string;
  visualAssets: Array<{ slideId: string; path: string; sha256: string }>;
};

function animationPlan(sessionId: AnimationSessionId, content: TeachingSessionContent) {
  if (sessionId === 's01') return createS01AnimationPlan(content);
  if (sessionId === 's02') return createS02AnimationPlan(content);
  if (sessionId === 's03') return createS03AnimationPlan(content);
  if (sessionId === 's04') return createS04AnimationPlan(content);
  if (sessionId === 's05') return createS05AnimationPlan(content);
  if (sessionId === 's06') return createS06AnimationPlan(content);
  return createS07AnimationPlan(content);
}

async function assertCurrentPptx(
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
  outputRoot: string,
  staleMessage?: string,
) {
  const spec = teachingDeckSpec(content);
  const record = JSON.parse(
    await readFile(resolve(outputRoot, 'pptx-artifact.json'), 'utf8'),
  ) as PptxRecord;
  const verification = await verifyNativePptx(spec, root, resolve(outputRoot, 'session.pptx'));
  const expectedVisuals = await currentVisualAssets(spec, root);
  if (
    record.editorialProfile !== 'presentation' ||
    record.outputFormat !== 'pptx' ||
    record.pptxSha256 !== verification.pptxSha256 ||
    record.sourceSha256 !== content.sourceSha256 ||
    record.moduleContentSha256 !== content.contentSha256 ||
    record.deckSpecSha256 !== verification.deckSpecSha256 ||
    canonicalJson(record.visualAssets) !== canonicalJson(expectedVisuals)
  ) {
    throw new Error(staleMessage ?? `Stale teaching PPTX: ${session.id}/${language}.`);
  }
  return { spec, verification };
}

async function animateSession(
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
  outputRoot: string,
): Promise<void> {
  if (
    session.id !== 's01' &&
    session.id !== 's02' &&
    session.id !== 's03' &&
    session.id !== 's04' &&
    session.id !== 's05' &&
    session.id !== 's06' &&
    session.id !== 's07'
  ) {
    throw new Error('Native animations currently support S01/S02/S03/S04/S05/S06/S07 PPTX only.');
  }
  const { spec, verification: source } = await assertCurrentPptx(
    session,
    language,
    content,
    root,
    outputRoot,
    `Stale ${session.id.toUpperCase()} PPTX: rebuild ${language} before animating.`,
  );
  const plan = animationPlan(session.id, content);
  const counts = animationCounts(plan);
  const planPath = resolve(outputRoot, 'animation-plan.json');
  await atomicWrite(planPath, canonicalJson(plan));
  const animatedFile = await animateWithPowerPoint(root, session.id, language, planPath);
  const animated = await verifyNativePptx(spec, root, resolve(outputRoot, animatedFile));
  await atomicWrite(
    resolve(outputRoot, 'pptx-animation.json'),
    canonicalJson({
      schemaVersion: 2,
      editorialProfile: 'presentation',
      outputFormat: 'pptx',
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
}

async function createPdfVisualQa(
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
  outputRoot: string,
  visualRoot: string,
): Promise<void> {
  const pdfPath = resolve(outputRoot, 'session.pdf');
  const verification = await verifyTeachingPdf(content, pdfPath);
  const pageRender = await renderPdfPages({
    repositoryRoot: root,
    pdfPath,
    outputRoot: resolve(visualRoot, 'pages'),
    dpi: 150,
  });
  if (verification.pdfSha256 !== pageRender.pdfSha256) {
    throw new Error('PDF visual-QA checksum mismatch.');
  }
  const contactSheets = await createPdfContactSheets(pageRender, {
    repositoryRoot: root,
    outputRoot: resolve(visualRoot, 'contact-sheets'),
    documentId: `${session.id}.${language}`,
    columns: 3,
    pagesPerSheet: 12,
    thumbnailWidth: 400,
  });
  await atomicWrite(resolve(visualRoot, 'pages.json'), serializePdfPageRenderManifest(pageRender));
  await atomicWrite(
    resolve(visualRoot, 'contact-sheets.json'),
    serializePdfContactSheetManifest(contactSheets),
  );
}

async function createPptxVisualQa(
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
  outputRoot: string,
  visualRoot: string,
): Promise<void> {
  const visualQa = await renderNativePptxVisualQa(teachingDeckSpec(content), {
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

async function createVisualQa(
  format: Format,
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
  outputRoot: string,
): Promise<void> {
  const visualRoot = resolve(outputRoot, 'visual-qa', format);
  if (format === 'pdf') {
    await createPdfVisualQa(session, language, content, root, outputRoot, visualRoot);
  } else {
    await createPptxVisualQa(session, language, content, root, outputRoot, visualRoot);
  }
  console.log(`VISUAL-QA ${session.id}/${language}/${format} slides=${content.slides.length}`);
}

async function buildPdf(content: TeachingSessionContent, root: string, outputRoot: string) {
  const path = resolve(outputRoot, 'session.pdf');
  const artifact = await renderTeachingPdf(content, root, path);
  const verification = await verifyTeachingPdf(content, path);
  if (artifact.pdfSha256 !== verification.pdfSha256) {
    throw new Error('Teaching PDF checksum mismatch.');
  }
  await atomicWrite(resolve(outputRoot, 'pdf-artifact.json'), serializeTeachingPdfRecord(artifact));
  await atomicWrite(
    resolve(outputRoot, 'pdf-verification.json'),
    serializeTeachingPdfRecord(verification),
  );
}

async function verifyPdf(
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
  outputRoot: string,
) {
  const record = JSON.parse(await readFile(resolve(outputRoot, 'pdf-artifact.json'), 'utf8')) as {
    editorialProfile: string;
    outputFormat: string;
    pdfSha256: string;
    sourceSha256: string;
    contentSha256: string;
    brandLogoSha256: string;
    htmlSha256: string;
  };
  const verification = await verifyTeachingPdf(content, resolve(outputRoot, 'session.pdf'));
  const logo = await readFile(
    resolve(root, 'packages/presentations/assets/brand/kraak/kraak-logo.png'),
  );
  const visuals = await resolveTeachingPdfVisuals(content, root);
  const logoUrl = `data:image/png;base64,${logo.toString('base64')}`;
  const html = renderTeachingPdfHtml(content, logoUrl, visuals);
  if (
    record.editorialProfile !== 'presentation' ||
    record.outputFormat !== 'pdf' ||
    record.pdfSha256 !== verification.pdfSha256 ||
    record.sourceSha256 !== content.sourceSha256 ||
    record.contentSha256 !== content.contentSha256 ||
    record.brandLogoSha256 !== sha256(logo) ||
    record.htmlSha256 !== sha256(html)
  ) {
    throw new Error(`Stale teaching PDF: ${session.id}/${language}.`);
  }
}

async function buildPptx(content: TeachingSessionContent, root: string, outputRoot: string) {
  const path = resolve(outputRoot, 'session.pptx');
  const spec = teachingDeckSpec(content);
  const artifact = await renderNativePptx(spec, { repositoryRoot: root, outputPath: path });
  const verification = await verifyNativePptx(spec, root, path);
  if (
    artifact.pptxSha256 !== verification.pptxSha256 ||
    artifact.deckSpecSha256 !== verification.deckSpecSha256
  ) {
    throw new Error('Teaching PPTX checksum mismatch.');
  }
  await atomicWrite(
    resolve(outputRoot, 'pptx-artifact.json'),
    canonicalJson({
      ...JSON.parse(serializeNativePptxArtifactRecord(artifact)),
      editorialProfile: 'presentation',
      outputFormat: 'pptx',
    }),
  );
  await atomicWrite(
    resolve(outputRoot, 'pptx-verification.json'),
    canonicalJson({
      ...JSON.parse(serializeNativePptxVerification(verification)),
      editorialProfile: 'presentation',
      outputFormat: 'pptx',
    }),
  );
}

async function processFormat(
  args: TeachingArgs,
  format: Format,
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
  outputRoot: string,
) {
  if (args.command === 'visual-qa') {
    await createVisualQa(format as 'pdf' | 'pptx', session, language, content, root, outputRoot);
    return;
  }
  if (format === 'txt') {
    const source = await readFile(teachingSourcePath(root, session, language), 'utf8');
    const text = renderMarkdownText(source, {
      language,
      includeLinkDestinations: false,
      documentCodeLabels: true,
      documentTableText: true,
    });
    const errors = validatePlainText(Buffer.from(text, 'utf8'));
    if (errors.length) throw new Error(errors.join('\n'));
    const outputPath = resolve(outputRoot, 'session.txt');
    const recordPath = resolve(outputRoot, 'txt-artifact.json');
    if (args.command === 'build') {
      await atomicWrite(outputPath, text);
      await atomicWrite(
        recordPath,
        canonicalJson({
          schemaVersion: 1,
          targetId: session.id,
          language,
          editorialProfile: 'presentation',
          outputFormat: 'txt',
          sourcePath: content.sourcePath,
          sourceSha256: content.sourceSha256,
          outputPath: `.artifacts/teaching-sessions/${session.id}/${language}/session.txt`,
          outputSha256: sha256(text),
        }),
      );
    } else {
      const record = JSON.parse(await readFile(recordPath, 'utf8')) as {
        editorialProfile: string;
        outputFormat: string;
        sourceSha256: string;
        outputSha256: string;
      };
      const actual = await readFile(outputPath);
      if (
        record.editorialProfile !== 'presentation' ||
        record.outputFormat !== 'txt' ||
        record.sourceSha256 !== content.sourceSha256 ||
        record.outputSha256 !== sha256(actual) ||
        actual.toString('utf8') !== text
      ) {
        throw new Error(`Stale teaching TXT: ${session.id}/${language}.`);
      }
    }
    console.log(
      `${args.command === 'build' ? 'WROTE' : 'VERIFIED'} ${session.id}/${language}/presentation/txt`,
    );
    return;
  }
  if (format === 'pdf') {
    if (args.command === 'build') await buildPdf(content, root, outputRoot);
    else await verifyPdf(session, language, content, root, outputRoot);
  } else if (args.command === 'build') {
    await buildPptx(content, root, outputRoot);
  } else {
    await assertCurrentPptx(session, language, content, root, outputRoot);
  }
  const action = args.command === 'build' ? 'WROTE' : 'VERIFIED';
  console.log(
    `${action} ${session.id}/presentation/${language}/${format} slides=${content.slides.length} minutes=${content.durationMinutes}`,
  );
}

async function processLanguage(
  args: TeachingArgs,
  session: TeachingSession,
  language: Language,
  content: TeachingSessionContent,
  root: string,
): Promise<void> {
  const outputRoot = resolve(root, '.artifacts', 'teaching-sessions', session.id, language);
  if (args.command === 'animate') {
    await animateSession(session, language, content, root, outputRoot);
    return;
  }
  const formats = (args.format ? [args.format] : ['pdf', 'pptx']) as Format[];
  if (args.command === 'plan') {
    console.log(
      `PLAN ${session.id}/presentation/${language} slides=${content.slides.length} minutes=${content.durationMinutes} formats=${formats.join(',')} source=${content.sourcePath}`,
    );
    return;
  }
  const sourceNow = await readFile(teachingSourcePath(root, session, language), 'utf8');
  if (sha256(sourceNow) !== content.sourceSha256) {
    throw new Error(`${content.sourcePath} changed during build.`);
  }
  for (const format of formats) {
    await processFormat(args, format, session, language, content, root, outputRoot);
  }
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
  if (sessions.length === 0) {
    throw new Error(`No teaching session matched ${args.session ?? 'manifest'}.`);
  }
  const languages = (args.language ? [args.language] : ['en', 'fr']) as Language[];
  for (const session of sessions) {
    const sources = resolveTeachingSessionSources(manifest, session);
    const pair = await readPair(session, root, sources);
    for (const language of languages) {
      await processLanguage(args, session, language, pair[language], root);
    }
  }
}

await main();
