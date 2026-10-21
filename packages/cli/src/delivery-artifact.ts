import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import {
  assertDeliveryCombination,
  buildNarrationChunks,
  estimateNarrationDuration,
  renderDeliveryText,
  supportedDeliveryFormats,
  type DeliveryLanguage,
  type DeliveryOutputFormat,
  type EditorialProfile,
} from '@coursera-notes/artifacts';
import { atomicWrite, canonicalJson, repositoryRoot, sha256 } from '@coursera-notes/core';
import {
  readManifest,
  resolveDeliveryVariant,
  type DeliveryProfile,
  type TeachingSession,
} from '@coursera-notes/manifest';
import {
  AUTHORED_DOCUMENT_RENDERER_VERSION,
  authoredDocumentRenderIdentity,
  createPdfContactSheets,
  renderAuthoredDocumentPdf,
  renderPdfPages,
  serializeAuthoredDocumentPdfRecord,
  serializeAuthoredDocumentPdfVerification,
  verifyAuthoredDocumentPdf,
} from '@coursera-notes/presentations';

import {
  parseDeliveryArtifactArguments,
  type DeliveryArtifactArguments,
} from './delivery-artifact-arguments.js';

interface CanonicalSourceRecord {
  moduleId: string;
  path: string;
  sha256: string;
}

interface DeliveryArtifactRecord {
  schemaVersion: 1;
  target: {
    sessionId: string;
    language: DeliveryLanguage;
    profile: DeliveryProfile;
    format: DeliveryOutputFormat;
  };
  maintainedSource: {
    path: string;
    sha256: string;
    contentRelationship: 'adaptation' | 'translation';
    editorialStatus: 'draft' | 'reviewed';
  };
  canonicalSources: CanonicalSourceRecord[];
  renderer: {
    name: string;
    version: number;
  };
  generatedOutput: {
    path: string;
    sha256: string;
    bytes: number;
  };
}

interface DeliveryTarget {
  session: TeachingSession;
  language: DeliveryLanguage;
  profile: DeliveryProfile;
  format: DeliveryOutputFormat;
  sourcePath: string;
  canonicalSources: CanonicalSourceRecord[];
  contentRelationship: 'adaptation' | 'translation';
  editorialStatus: 'draft' | 'reviewed';
  production?: {
    speakingRateWpm: number;
    pronunciationNotes: string[];
  };
}

const PROFILE_LABELS: Record<DeliveryProfile, EditorialProfile> = {
  document: 'document',
  reference: 'reference',
  narration: 'narration',
};

function absolute(root: string, path: string): string {
  return resolve(root, ...path.split('/'));
}

function repositoryRelativePath(root: string, path: string): string {
  const value = relative(root, path).replaceAll('\\', '/');
  if (value === '..' || value.startsWith('../') || value.startsWith('/')) {
    throw new Error(`Delivery artifact path must remain inside repository: ${path}.`);
  }
  return value;
}

function outputRoot(root: string, target: DeliveryTarget): string {
  return resolve(
    root,
    '.artifacts',
    'delivery-variants',
    target.session.id,
    target.profile,
    target.language,
  );
}

function artifactFileName(profile: DeliveryProfile, format: DeliveryOutputFormat): string {
  return `${profile}.${format}`;
}

function artifactRecordPath(target: DeliveryTarget, root: string): string {
  return resolve(outputRoot(root, target), `${target.profile}.${target.format}.artifact.json`);
}

function outputFilePath(target: DeliveryTarget, root: string): string {
  return resolve(outputRoot(root, target), artifactFileName(target.profile, target.format));
}

function productionManifestPath(target: DeliveryTarget, root: string): string {
  return resolve(outputRoot(root, target), 'production-manifest.json');
}

async function canonicalSourceRecords(
  root: string,
  sources: Array<{ moduleId: string; sourcePath: string }>,
): Promise<CanonicalSourceRecord[]> {
  return Promise.all(
    sources.map(async ({ moduleId, sourcePath }) => ({
      moduleId,
      path: sourcePath,
      sha256: sha256(await readFile(absolute(root, sourcePath))),
    })),
  );
}

async function resolveTargets(
  args: DeliveryArtifactArguments,
  root: string,
): Promise<DeliveryTarget[]> {
  const manifest = await readManifest();
  const sessions = manifest.teachingSessions ?? [];
  const selectedSessions = args.session
    ? sessions.filter((session) => session.id === args.session)
    : sessions;
  if (!selectedSessions.length) {
    throw new Error(`No teaching session matched ${args.session ?? 'manifest'}.`);
  }

  const targets: DeliveryTarget[] = [];
  for (const session of selectedSessions) {
    const languages: DeliveryLanguage[] = args.language ? [args.language] : ['en', 'fr'];
    for (const language of languages) {
      let resolved;
      try {
        resolved = resolveDeliveryVariant(manifest, session, args.profile!, language);
      } catch (error) {
        if (args.session) throw error;
        continue;
      }
      const canonicalSources = await canonicalSourceRecords(root, resolved.canonicalModules);
      const formats = args.format
        ? [args.format]
        : supportedDeliveryFormats(PROFILE_LABELS[args.profile!]);
      for (const format of formats) {
        assertDeliveryCombination(PROFILE_LABELS[args.profile!], format);
        targets.push({
          session,
          language,
          profile: args.profile!,
          format,
          sourcePath: resolved.sourcePath,
          canonicalSources,
          contentRelationship: resolved.contentRelationship,
          editorialStatus: resolved.editorialStatus,
          ...(resolved.production === undefined ? {} : { production: resolved.production }),
        });
      }
    }
  }

  if (!args.session && targets.length === 0) {
    console.log(`No registered ${args.profile} variants are available.`);
  }
  return targets;
}

async function readSource(target: DeliveryTarget, root: string): Promise<string> {
  return readFile(absolute(root, target.sourcePath), 'utf8');
}

async function ensureCanonicalReviewGate(target: DeliveryTarget, root: string): Promise<void> {
  const recordPath = artifactRecordPath(target, root);
  let previous: DeliveryArtifactRecord;
  try {
    previous = JSON.parse(await readFile(recordPath, 'utf8')) as DeliveryArtifactRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }

  if (canonicalJson(previous.canonicalSources) !== canonicalJson(target.canonicalSources)) {
    if (target.editorialStatus !== 'reviewed') {
      throw new Error(
        `${target.session.id}/${target.profile}/${target.language} needs editorial review because a canonical source changed. Update the authored adaptation and mark editorialStatus as reviewed before rebuilding.`,
      );
    }
  }
}

function createProvenance(
  target: DeliveryTarget,
  sourceSha256: string,
  renderer: DeliveryArtifactRecord['renderer'],
  output: DeliveryArtifactRecord['generatedOutput'],
): DeliveryArtifactRecord {
  return {
    schemaVersion: 1,
    target: {
      sessionId: target.session.id,
      language: target.language,
      profile: target.profile,
      format: target.format,
    },
    maintainedSource: {
      path: target.sourcePath,
      sha256: sourceSha256,
      contentRelationship: target.contentRelationship,
      editorialStatus: target.editorialStatus,
    },
    canonicalSources: target.canonicalSources,
    renderer,
    generatedOutput: output,
  };
}

async function buildNarration(
  target: DeliveryTarget,
  root: string,
  source: string,
  text: string,
  chunkLimit: number,
): Promise<DeliveryArtifactRecord['generatedOutput']> {
  if (!target.production) {
    throw new Error(
      `Narration production metadata is missing for ${target.session.id}/${target.language}.`,
    );
  }
  const chunks = buildNarrationChunks(target.session.id, target.language, text, chunkLimit);
  const sourceDigest = sha256(source);
  const chunkDirectory = resolve(outputRoot(root, target), 'chunks', sourceDigest.slice(0, 12));
  const chunkPaths = await Promise.all(
    chunks.map(async (chunk) => {
      const filePath = resolve(
        chunkDirectory,
        `${String(chunk.sequence).padStart(3, '0')}-${chunk.id}.txt`,
      );
      await atomicWrite(filePath, chunk.text);
      return {
        ...chunk,
        path: repositoryRelativePath(root, filePath),
      };
    }),
  );
  const textPath = outputFilePath(target, root);
  await atomicWrite(textPath, text);
  const productionManifest = {
    schemaVersion: 1,
    targetId: target.session.id,
    language: target.language,
    editorialProfile: 'narration',
    sourcePath: target.sourcePath,
    sourceSha256: sourceDigest,
    canonicalSources: target.canonicalSources,
    workflow: {
      name: 'ElevenLabs Web Text to Speech manual input',
      model: null,
      maximumCharactersPerChunk: chunkLimit,
      markup: 'plain text only; no SSML or model-specific controls',
    },
    pronunciationNotes: target.production.pronunciationNotes,
    durationEstimate: estimateNarrationDuration(chunks, target.production.speakingRateWpm),
    chunks: chunkPaths.map((chunk) => ({
      id: chunk.id,
      sequence: chunk.sequence,
      path: chunk.path,
      sha256: chunk.sha256,
      characters: chunk.characters,
      words: chunk.words,
    })),
  };
  await atomicWrite(productionManifestPath(target, root), canonicalJson(productionManifest));
  const bytes = await readFile(textPath);
  return {
    path: repositoryRelativePath(root, textPath),
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
}

async function buildTarget(
  args: DeliveryArtifactArguments,
  target: DeliveryTarget,
  root: string,
): Promise<void> {
  await ensureCanonicalReviewGate(target, root);
  const source = await readSource(target, root);
  const text = renderDeliveryText(source, target.profile, target.language);
  const sourceDigest = sha256(source);
  let output: DeliveryArtifactRecord['generatedOutput'];
  let renderer: DeliveryArtifactRecord['renderer'];

  if (target.format === 'pdf') {
    const pdfOptions = {
      repositoryRoot: root,
      sourcePath: target.sourcePath,
      outputPath: outputFilePath(target, root),
      profile: target.profile as 'document' | 'reference',
      language: target.language,
    };
    const rendered = await renderAuthoredDocumentPdf(source, pdfOptions);
    await atomicWrite(
      resolve(outputRoot(root, target), `${target.profile}.pdf.render.json`),
      serializeAuthoredDocumentPdfRecord(rendered),
    );
    output = {
      path: rendered.pdfPath,
      sha256: rendered.pdfSha256,
      bytes: rendered.bytes,
    };
    renderer = {
      name: rendered.renderer.name,
      version: rendered.renderer.rendererVersion,
    };
  } else {
    if (target.profile === 'narration') {
      output = await buildNarration(target, root, source, text, args.chunkLimit ?? 2400);
      renderer = { name: 'plain-markdown-speech-export', version: 1 };
    } else {
      const path = outputFilePath(target, root);
      await atomicWrite(path, text);
      const bytes = await readFile(path);
      output = {
        path: repositoryRelativePath(root, path),
        sha256: sha256(bytes),
        bytes: bytes.byteLength,
      };
      renderer = { name: 'semantic-markdown-to-text', version: 1 };
    }
  }

  const record = createProvenance(target, sourceDigest, renderer, output);
  await atomicWrite(artifactRecordPath(target, root), canonicalJson(record));
  console.log(
    `WROTE ${target.session.id}/${target.profile}/${target.language}/${target.format} source=${target.sourcePath} sha256=${output.sha256}`,
  );
}

async function loadProvenance(
  target: DeliveryTarget,
  root: string,
): Promise<DeliveryArtifactRecord> {
  try {
    return JSON.parse(
      await readFile(artifactRecordPath(target, root), 'utf8'),
    ) as DeliveryArtifactRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `Missing ${target.profile}/${target.format} artifact for ${target.session.id}/${target.language}; build it first.`,
        { cause: error },
      );
    }
    throw error;
  }
}

async function verifyTarget(target: DeliveryTarget, root: string): Promise<void> {
  const record = await loadProvenance(target, root);
  const source = await readSource(target, root);
  const sourceDigest = sha256(source);
  if (
    record.maintainedSource.path !== target.sourcePath ||
    record.maintainedSource.sha256 !== sourceDigest
  ) {
    throw new Error(`${target.sourcePath} changed since artifact generation.`);
  }
  if (canonicalJson(record.canonicalSources) !== canonicalJson(target.canonicalSources)) {
    throw new Error(
      `${target.session.id}/${target.profile}/${target.language} needs editorial review because a canonical source changed.`,
    );
  }
  if (
    record.target.sessionId !== target.session.id ||
    record.target.language !== target.language ||
    record.target.profile !== target.profile ||
    record.target.format !== target.format
  ) {
    throw new Error(
      `Artifact provenance target mismatch for ${target.session.id}/${target.language}.`,
    );
  }
  const expectedOutputPath = repositoryRelativePath(root, outputFilePath(target, root));
  if (
    record.generatedOutput.path !== expectedOutputPath ||
    record.maintainedSource.contentRelationship !== target.contentRelationship ||
    record.maintainedSource.editorialStatus !== target.editorialStatus
  ) {
    throw new Error(
      `Artifact provenance identity mismatch for ${target.session.id}/${target.language}.`,
    );
  }
  const expectedText = renderDeliveryText(source, target.profile, target.language);
  let actualSha256: string;

  if (target.format === 'pdf') {
    const verification = await verifyAuthoredDocumentPdf(source, {
      repositoryRoot: root,
      sourcePath: target.sourcePath,
      outputPath: outputFilePath(target, root),
      profile: target.profile as 'document' | 'reference',
      language: target.language,
    });
    actualSha256 = verification.pdfSha256;
    const renderer = JSON.parse(
      await readFile(
        resolve(outputRoot(root, target), `${target.profile}.pdf.render.json`),
        'utf8',
      ),
    ) as {
      sourceSha256: string;
      stylesheetSha256: string;
      htmlSha256: string;
      renderer: { rendererVersion: number };
    };
    const pdfOptions = {
      repositoryRoot: root,
      sourcePath: target.sourcePath,
      outputPath: outputFilePath(target, root),
      profile: target.profile as 'document' | 'reference',
      language: target.language,
    };
    const renderIdentity = authoredDocumentRenderIdentity(source, pdfOptions);
    if (
      renderer.sourceSha256 !== sourceDigest ||
      renderer.renderer.rendererVersion !== AUTHORED_DOCUMENT_RENDERER_VERSION ||
      renderer.stylesheetSha256 !== renderIdentity.stylesheetSha256 ||
      renderer.htmlSha256 !== renderIdentity.htmlSha256
    ) {
      throw new Error(`Stale PDF renderer provenance for ${target.session.id}/${target.language}.`);
    }
    await atomicWrite(
      resolve(outputRoot(root, target), `${target.profile}.pdf.verification.json`),
      serializeAuthoredDocumentPdfVerification(verification),
    );
  } else {
    const bytes = await readFile(outputFilePath(target, root));
    actualSha256 = sha256(bytes);
    if (bytes.toString('utf8') !== expectedText) {
      throw new Error(`Stale TXT output for ${target.session.id}/${target.language}.`);
    }
    if (target.profile === 'narration') {
      const production = JSON.parse(
        await readFile(productionManifestPath(target, root), 'utf8'),
      ) as {
        sourceSha256: string;
        canonicalSources: CanonicalSourceRecord[];
        workflow: { maximumCharactersPerChunk: number };
        chunks: Array<{
          id: string;
          sequence: number;
          path: string;
          sha256: string;
          characters: number;
          words: number;
        }>;
        pronunciationNotes: string[];
        durationEstimate: ReturnType<typeof estimateNarrationDuration>;
      };
      if (
        production.sourceSha256 !== sourceDigest ||
        canonicalJson(production.canonicalSources) !== canonicalJson(target.canonicalSources)
      ) {
        throw new Error(
          `Stale narration production manifest for ${target.session.id}/${target.language}.`,
        );
      }
      const limit = production.workflow.maximumCharactersPerChunk;
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 2400 || !target.production) {
        throw new Error(
          `Invalid narration production configuration for ${target.session.id}/${target.language}.`,
        );
      }
      const expectedChunks = buildNarrationChunks(
        target.session.id,
        target.language,
        expectedText,
        limit,
      );
      const chunkDirectory = resolve(outputRoot(root, target), 'chunks', sourceDigest.slice(0, 12));
      const expectedRecords = expectedChunks.map((chunk) => ({
        id: chunk.id,
        sequence: chunk.sequence,
        sha256: chunk.sha256,
        characters: chunk.characters,
        words: chunk.words,
        path: repositoryRelativePath(
          root,
          resolve(chunkDirectory, `${String(chunk.sequence).padStart(3, '0')}-${chunk.id}.txt`),
        ),
      }));
      if (
        canonicalJson(production.chunks) !== canonicalJson(expectedRecords) ||
        canonicalJson(production.pronunciationNotes) !==
          canonicalJson(target.production.pronunciationNotes) ||
        canonicalJson(production.durationEstimate) !==
          canonicalJson(
            estimateNarrationDuration(expectedChunks, target.production.speakingRateWpm),
          )
      ) {
        throw new Error(
          `Stale narration chunk metadata for ${target.session.id}/${target.language}.`,
        );
      }
      for (const chunk of expectedChunks) {
        const path = expectedRecords[chunk.sequence - 1]!.path;
        if ((await readFile(absolute(root, path), 'utf8')) !== chunk.text) {
          throw new Error(`Narration chunk changed: ${path}.`);
        }
      }
    }
  }
  if (record.generatedOutput.sha256 !== actualSha256) {
    throw new Error(
      `Generated ${target.format.toUpperCase()} changed for ${target.session.id}/${target.language}.`,
    );
  }
  const expectedRenderer =
    target.format === 'pdf'
      ? { name: 'chromium-via-puppeteer', version: AUTHORED_DOCUMENT_RENDERER_VERSION }
      : target.profile === 'narration'
        ? { name: 'plain-markdown-speech-export', version: 1 }
        : { name: 'semantic-markdown-to-text', version: 1 };
  if (canonicalJson(record.renderer) !== canonicalJson(expectedRenderer)) {
    throw new Error(
      `Artifact renderer identity mismatch for ${target.session.id}/${target.language}.`,
    );
  }
  console.log(
    `VERIFIED ${target.session.id}/${target.profile}/${target.language}/${target.format} sha256=${actualSha256}`,
  );
}

async function visualQa(target: DeliveryTarget, root: string): Promise<void> {
  await verifyTarget(target, root);
  const pdfPath = outputFilePath(target, root);
  const visualRoot = resolve(outputRoot(root, target), 'visual-qa');
  const pageRender = await renderPdfPages({
    repositoryRoot: root,
    pdfPath,
    outputRoot: resolve(visualRoot, 'pages'),
    dpi: 150,
  });
  const contactSheets = await createPdfContactSheets(pageRender, {
    repositoryRoot: root,
    outputRoot: resolve(visualRoot, 'contact-sheets'),
    documentId: `${target.session.id}.${target.profile}.${target.language}`,
    columns: 2,
    pagesPerSheet: 8,
    thumbnailWidth: 600,
  });
  await atomicWrite(
    resolve(visualRoot, 'visual-qa.json'),
    canonicalJson({
      schemaVersion: 1,
      target: {
        sessionId: target.session.id,
        profile: target.profile,
        language: target.language,
        format: 'pdf',
      },
      pdfSha256: pageRender.pdfSha256,
      pageCount: pageRender.pageCount,
      pageRender,
      contactSheets,
    }),
  );
  console.log(
    `VISUAL-QA ${target.session.id}/${target.profile}/${target.language}/pdf pages=${pageRender.pageCount} sheets=${contactSheets.sheets.length}`,
  );
}

async function planTarget(target: DeliveryTarget, root: string): Promise<void> {
  const targetStatus = `PLAN ${target.session.id}/${target.profile}/${target.language}/${target.format}`;
  const recordPath = artifactRecordPath(target, root);
  let staleState = 'not-built';
  try {
    const record = JSON.parse(await readFile(recordPath, 'utf8')) as DeliveryArtifactRecord;
    staleState =
      canonicalJson(record.canonicalSources) === canonicalJson(target.canonicalSources)
        ? 'current-canonical-sources'
        : 'NEEDS-EDITORIAL-REVIEW';
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  console.log(
    `${targetStatus} status=${staleState} source=${target.sourcePath} output=${repositoryRelativePath(
      root,
      outputFilePath(target, root),
    )}`,
  );
}

async function main(): Promise<void> {
  const args = parseDeliveryArtifactArguments(process.argv.slice(2));
  if (!args.profile) {
    throw new Error('Select an editorial profile explicitly with --profile.');
  }
  if (args.format) assertDeliveryCombination(args.profile, args.format);
  const root = repositoryRoot();
  const targets = await resolveTargets(args, root);
  for (const target of targets) {
    if (args.command === 'plan') {
      await planTarget(target, root);
    } else if (args.command === 'build') {
      await buildTarget(args, target, root);
    } else if (args.command === 'verify') {
      await verifyTarget(target, root);
    } else {
      await visualQa(target, root);
    }
  }
}

await main();
