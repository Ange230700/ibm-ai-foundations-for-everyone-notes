import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { repositoryRoot as defaultRepositoryRoot, toPosixPath } from '@coursera-notes/core';
import { extractCanonicalModule } from '@coursera-notes/presentations';

import type { ResolvedArtifactTarget } from './artifact-target.js';

export interface ArtifactExecutionOptions {
  repositoryRoot?: string;
  outputRoot?: string;
}

interface ArtifactExecutionLayout {
  directory: string;
  filename: string;
  label: string;
}

export interface ArtifactExecutionContext {
  repositoryRoot: string;
  sourcePath: string;
  outputRoot: string;
  artifactPath: string;
  artifactRecordPath: string;
  verificationPath: string;
  mermaidAssetRoot: string;
  markdown: string;
  content: Awaited<ReturnType<typeof extractCanonicalModule>>;
}

export function repositoryRelativeArtifactPath(
  repositoryRoot: string,
  absolutePath: string,
  label: string,
): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`${label} CLI artifact must remain inside the repository: ${absolutePath}`);
  }

  return value;
}

export async function prepareArtifactExecution(
  target: ResolvedArtifactTarget,
  options: ArtifactExecutionOptions,
  layout: ArtifactExecutionLayout,
): Promise<ArtifactExecutionContext> {
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot());
  const sourcePath = resolve(repositoryRoot, ...target.sourcePath.split('/'));

  repositoryRelativeArtifactPath(repositoryRoot, sourcePath, layout.label);

  const outputRoot = resolve(
    options.outputRoot ??
      resolve(
        repositoryRoot,
        '.artifacts',
        layout.directory,
        target.course.id,
        target.module.id,
        target.language,
      ),
  );

  repositoryRelativeArtifactPath(repositoryRoot, outputRoot, layout.label);

  const artifactPath = resolve(outputRoot, layout.filename);
  const artifactRecordPath = resolve(outputRoot, 'artifact.json');
  const verificationPath = resolve(outputRoot, 'verification.json');
  const mermaidAssetRoot = resolve(outputRoot, 'mermaid');
  const [markdown, content] = await Promise.all([
    readFile(sourcePath, 'utf8'),
    extractCanonicalModule({
      courseId: target.course.id,
      moduleId: target.module.id,
      language: target.language,
      sourcePath,
      repositoryRoot,
    }),
  ]);

  return {
    repositoryRoot,
    sourcePath,
    outputRoot,
    artifactPath,
    artifactRecordPath,
    verificationPath,
    mermaidAssetRoot,
    markdown,
    content,
  };
}
