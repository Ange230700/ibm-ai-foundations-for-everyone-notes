import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { canonicalJson, sha256, slugify, toPosixPath } from '@coursera-notes/core';

import type { MermaidDiagram, ModuleContent, SourceRef } from '../content/model.js';

export interface MermaidSourceRecord {
  diagramId: string;
  source: SourceRef;
  definitionSha256: string;
  mmdSha256: string;
  path: string;
}

export interface MermaidSourceManifest {
  schemaVersion: 1;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  moduleContentSha256: string;
  diagrams: MermaidSourceRecord[];
}

export interface WriteMermaidSourcesOptions {
  repositoryRoot: string;
  outputRoot: string;
}

export function canonicalMermaidSource(definition: string): string {
  return `${definition.replaceAll('\r\n', '\n').trimEnd()}\n`;
}

function diagramFilename(diagram: MermaidDiagram): string {
  const readable = slugify(diagram.diagramId);
  const identity = sha256(diagram.diagramId).slice(0, 12);

  return `${readable}-${identity}.mmd`;
}

export async function writeMermaidSources(
  content: ModuleContent,
  options: WriteMermaidSourcesOptions,
): Promise<MermaidSourceManifest> {
  const outputRoot = resolve(options.outputRoot);

  const relativeOutputRoot = toPosixPath(relative(options.repositoryRoot, outputRoot));

  if (relativeOutputRoot === '..' || relativeOutputRoot.startsWith('../')) {
    throw new Error(`Mermaid output must be inside the repository: ${outputRoot}`);
  }

  await mkdir(outputRoot, { recursive: true });

  const diagrams: MermaidSourceRecord[] = [];

  for (const diagram of content.diagrams) {
    const filename = diagramFilename(diagram);
    const absolutePath = resolve(outputRoot, filename);

    const source = canonicalMermaidSource(diagram.definition);

    await writeFile(absolutePath, source, 'utf8');

    diagrams.push({
      diagramId: diagram.diagramId,
      source: diagram.source,
      definitionSha256: diagram.definitionSha256,
      mmdSha256: sha256(source),
      path: toPosixPath(relative(options.repositoryRoot, absolutePath)),
    });
  }

  return {
    schemaVersion: 1,
    courseId: content.courseId,
    moduleId: content.moduleId,
    language: content.language,
    sourcePath: content.sourcePath,
    moduleContentSha256: content.moduleContentSha256,
    diagrams,
  };
}

export function serializeMermaidSourceManifest(manifest: MermaidSourceManifest): string {
  return canonicalJson(manifest);
}
