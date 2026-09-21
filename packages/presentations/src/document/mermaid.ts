import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { sha256, toPosixPath } from '@coursera-notes/core';

import type { MermaidDiagram, ModuleContent } from '../content/model.js';
import type { MermaidRenderedAssetRecord, MermaidRenderManifest } from '../mermaid/render.js';
import { validateMermaidSvg } from '../mermaid/render.js';

export interface RenderedDocumentMermaidDiagram {
  diagram: MermaidDiagram;
  asset: MermaidRenderedAssetRecord;
  dataUri: string;
}

function normalizeDefinition(value: string): string {
  return value.replaceAll('\r\n', '\n').trimEnd();
}

function repositoryAssetPath(repositoryRoot: string, path: string): string {
  const absolutePath = resolve(repositoryRoot, path);

  const repositoryRelative = toPosixPath(relative(repositoryRoot, absolutePath));

  if (repositoryRelative === '..' || repositoryRelative.startsWith('../')) {
    throw new Error(`Document asset must be inside the repository: ${path}`);
  }

  return absolutePath;
}

export async function prepareDocumentMermaidAssets(
  content: ModuleContent,
  manifest: MermaidRenderManifest,
  repositoryRoot: string,
): Promise<RenderedDocumentMermaidDiagram[]> {
  if (
    manifest.courseId !== content.courseId ||
    manifest.moduleId !== content.moduleId ||
    manifest.language !== content.language
  ) {
    throw new Error('Mermaid render manifest does not belong to the requested module.');
  }

  if (manifest.moduleContentSha256 !== content.moduleContentSha256) {
    throw new Error('Mermaid render manifest is stale relative to canonical module content.');
  }

  if (manifest.assets.length !== content.diagrams.length) {
    throw new Error(
      `Expected ${content.diagrams.length} rendered Mermaid assets; found ${manifest.assets.length}.`,
    );
  }

  const assetsById = new Map<string, MermaidRenderedAssetRecord>();

  for (const asset of manifest.assets) {
    if (assetsById.has(asset.diagramId)) {
      throw new Error(`Duplicate rendered Mermaid asset: ${asset.diagramId}`);
    }

    assetsById.set(asset.diagramId, asset);
  }

  const rendered: RenderedDocumentMermaidDiagram[] = [];

  for (const diagram of content.diagrams) {
    const asset = assetsById.get(diagram.diagramId);

    if (!asset) {
      throw new Error(`Missing rendered Mermaid asset: ${diagram.diagramId}`);
    }

    if (asset.definitionSha256 !== diagram.definitionSha256) {
      throw new Error(`Rendered Mermaid asset is stale: ${diagram.diagramId}`);
    }

    const absolutePath = repositoryAssetPath(repositoryRoot, asset.svgPath);

    const svg = await readFile(absolutePath, 'utf8');

    validateMermaidSvg(svg, diagram.diagramId);

    if (sha256(svg) !== asset.svgSha256) {
      throw new Error(`Rendered Mermaid SVG checksum mismatch: ${diagram.diagramId}`);
    }

    rendered.push({
      diagram,
      asset,
      dataUri: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`,
    });
  }

  return rendered;
}

export function replaceMermaidFences(
  markdown: string,
  rendered: readonly RenderedDocumentMermaidDiagram[],
  language: 'en' | 'fr',
): string {
  const pattern = /^(`{3,}|~{3,})mermaid[^\r\n]*\r?\n([\s\S]*?)^\1[ \t]*$/gm;

  let index = 0;

  const replaced = markdown.replace(pattern, (_match, _fence: string, definition: string) => {
    const entry = rendered[index];

    if (!entry) {
      throw new Error(
        `Markdown contains more Mermaid fences than rendered diagrams; unexpected fence ${index + 1}.`,
      );
    }

    if (normalizeDefinition(definition) !== normalizeDefinition(entry.diagram.definition)) {
      throw new Error(
        `Mermaid fence ${index + 1} does not match extracted diagram ${entry.diagram.diagramId}.`,
      );
    }

    index += 1;

    const label = language === 'fr' ? `Schéma ${index}` : `Diagram ${index}`;

    return `![${label}](${entry.dataUri})`;
  });

  if (index !== rendered.length) {
    throw new Error(`Extracted ${rendered.length} Mermaid diagrams but replaced ${index} fences.`);
  }

  return replaced;
}
