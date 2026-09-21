import { readFile } from 'node:fs/promises';
import { atomicWrite } from '@coursera-notes/core';
import {
  extractCanonicalModule,
  renderModuleMermaidAssets,
  renderNativePptx,
  serializeNativePptxArtifactRecord,
  serializeNativePptxVerification,
  synthesizeDeckSpec,
  verifyNativePptx,
  type NativePptxArtifactRecord,
  type NativePptxVerification,
} from '@coursera-notes/presentations';

import {
  prepareArtifactExecution,
  repositoryRelativeArtifactPath,
  type ArtifactExecutionOptions,
} from './artifact-execution.js';
import type { ResolvedArtifactTarget } from './artifact-target.js';

export type ExecutePptxTargetOptions = ArtifactExecutionOptions;

export interface PptxTargetExecutionResult {
  targetKey: string;
  pptxPath: string;
  artifactRecordPath: string;
  verificationPath: string;
  artifact: NativePptxArtifactRecord;
  verification: NativePptxVerification;
}

export async function executePptxTarget(
  target: ResolvedArtifactTarget,
  options: ExecutePptxTargetOptions = {},
): Promise<PptxTargetExecutionResult> {
  const {
    repositoryRoot,
    sourcePath,
    artifactPath: pptxPath,
    artifactRecordPath,
    verificationPath,
    mermaidAssetRoot,
    markdown,
    content,
  } = await prepareArtifactExecution(target, options, {
    directory: 'native-pptx',
    filename: 'module.pptx',
    label: 'PPTX',
  });

  /*
   * Keep the same source-race protection used by the PDF
   * adapter. The canonical Markdown bytes read here must
   * match the content digest extracted independently.
   */
  if (content.sourceSha256 === undefined) {
    throw new Error(`Canonical source digest is missing for ${target.key}.`);
  }

  const mermaidManifest = await renderModuleMermaidAssets(content, {
    repositoryRoot,
    outputRoot: mermaidAssetRoot,
  });

  const spec = synthesizeDeckSpec(content);

  const artifact = await renderNativePptx(spec, {
    repositoryRoot,
    outputPath: pptxPath,
    diagramAssets: mermaidManifest.assets.map((asset) => ({
      diagramId: asset.diagramId,
      svgPath: asset.svgPath,
      svgSha256: asset.svgSha256,
    })),
  });

  const verification = await verifyNativePptx(spec, repositoryRoot, pptxPath);

  if (verification.pptxSha256 !== artifact.pptxSha256) {
    throw new Error(
      [
        'PPTX verification checksum does not match the generated artifact.',
        `generated=${artifact.pptxSha256}`,
        `verified=${verification.pptxSha256}`,
      ].join(' '),
    );
  }

  if (verification.deckSpecSha256 !== artifact.deckSpecSha256) {
    throw new Error(
      [
        'PPTX verification DeckSpec checksum does not match the generated artifact.',
        `generated=${artifact.deckSpecSha256}`,
        `verified=${verification.deckSpecSha256}`,
      ].join(' '),
    );
  }

  if (
    artifact.sourceSha256 !== verification.sourceSha256 ||
    artifact.moduleContentSha256 !== verification.moduleContentSha256
  ) {
    throw new Error(
      [
        'PPTX artifact provenance does not match structural verification provenance.',
        `artifact-source=${artifact.sourceSha256}`,
        `verified-source=${verification.sourceSha256}`,
        `artifact-content=${artifact.moduleContentSha256}`,
        `verified-content=${verification.moduleContentSha256}`,
      ].join(' '),
    );
  }

  if (verification.slideCount !== artifact.slides) {
    throw new Error(
      [
        'PPTX verification slide count does not match the generated artifact.',
        `generated=${artifact.slides}`,
        `verified=${verification.slideCount}`,
      ].join(' '),
    );
  }

  /*
   * Ensure the separately-read Markdown has not drifted
   * from the canonical ModuleContent used to synthesize
   * the deck.
   */
  const extractedAgain = await extractCanonicalModule({
    courseId: target.course.id,
    moduleId: target.module.id,
    language: target.language,
    sourcePath,
    repositoryRoot,
  });

  if (
    extractedAgain.sourceSha256 !== content.sourceSha256 ||
    markdown !== (await readFile(sourcePath, 'utf8'))
  ) {
    throw new Error(`Canonical Markdown changed while generating ${target.key}.`);
  }

  await Promise.all([
    atomicWrite(artifactRecordPath, serializeNativePptxArtifactRecord(artifact)),
    atomicWrite(verificationPath, serializeNativePptxVerification(verification)),
  ]);

  return {
    targetKey: target.key,
    pptxPath: repositoryRelativeArtifactPath(repositoryRoot, pptxPath, 'PPTX'),
    artifactRecordPath: repositoryRelativeArtifactPath(repositoryRoot, artifactRecordPath, 'PPTX'),
    verificationPath: repositoryRelativeArtifactPath(repositoryRoot, verificationPath, 'PPTX'),
    artifact,
    verification,
  };
}
