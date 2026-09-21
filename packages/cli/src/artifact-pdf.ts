import { atomicWrite } from '@coursera-notes/core';
import {
  renderModulePdf,
  serializePdfArtifactRecord,
  serializePdfSemanticVerification,
  verifyModulePdf,
  type PdfArtifactRecord,
  type PdfSemanticVerificationRecord,
} from '@coursera-notes/presentations';

import {
  prepareArtifactExecution,
  repositoryRelativeArtifactPath,
  type ArtifactExecutionOptions,
} from './artifact-execution.js';
import type { ResolvedArtifactTarget } from './artifact-target.js';

export type ExecutePdfTargetOptions = ArtifactExecutionOptions;

export interface PdfTargetExecutionResult {
  targetKey: string;
  pdfPath: string;
  artifactRecordPath: string;
  verificationPath: string;
  artifact: PdfArtifactRecord;
  verification: PdfSemanticVerificationRecord;
}

export async function executePdfTarget(
  target: ResolvedArtifactTarget,
  options: ExecutePdfTargetOptions = {},
): Promise<PdfTargetExecutionResult> {
  const {
    repositoryRoot,
    artifactPath: pdfPath,
    artifactRecordPath,
    verificationPath,
    mermaidAssetRoot,
    markdown,
    content,
  } = await prepareArtifactExecution(target, options, {
    directory: 'document-pdf',
    filename: 'module.pdf',
    label: 'PDF',
  });

  /*
   * renderModulePdf() verifies that the Markdown bytes
   * still match ModuleContent.sourceSha256. If the file
   * changed between the two reads above, generation fails
   * rather than producing stale output.
   */
  const artifact = await renderModulePdf(markdown, content, {
    repositoryRoot,
    outputPath: pdfPath,
    mermaidAssetRoot,
  });

  const verification = await verifyModulePdf(markdown, content, {
    repositoryRoot,
    pdfPath,
  });

  if (verification.pdfSha256 !== artifact.pdfSha256) {
    throw new Error(
      [
        'PDF verification checksum does not match the generated artifact.',
        `generated=${artifact.pdfSha256}`,
        `verified=${verification.pdfSha256}`,
      ].join(' '),
    );
  }

  if (
    artifact.sourceSha256 !== verification.sourceSha256 ||
    artifact.moduleContentSha256 !== verification.moduleContentSha256
  ) {
    throw new Error(
      [
        'PDF artifact provenance does not match semantic verification provenance.',
        `artifact-source=${artifact.sourceSha256}`,
        `verified-source=${verification.sourceSha256}`,
        `artifact-content=${artifact.moduleContentSha256}`,
        `verified-content=${verification.moduleContentSha256}`,
      ].join(' '),
    );
  }

  await Promise.all([
    atomicWrite(artifactRecordPath, serializePdfArtifactRecord(artifact)),
    atomicWrite(verificationPath, serializePdfSemanticVerification(verification)),
  ]);

  return {
    targetKey: target.key,
    pdfPath: repositoryRelativeArtifactPath(repositoryRoot, pdfPath, 'PDF'),
    artifactRecordPath: repositoryRelativeArtifactPath(repositoryRoot, artifactRecordPath, 'PDF'),
    verificationPath: repositoryRelativeArtifactPath(repositoryRoot, verificationPath, 'PDF'),
    artifact,
    verification,
  };
}
