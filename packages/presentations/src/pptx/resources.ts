import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { DOMParser } from '@xmldom/xmldom';

import { sha256, toPosixPath } from '@coursera-notes/core';

import type { DeckSpec } from '../deck/model.js';

export interface NativePptxDiagramAsset {
  diagramId: string;
  svgPath: string;
  svgSha256: string;
}

export interface ResolvedNativePptxDiagramAsset extends NativePptxDiagramAsset {
  absolutePath: string;
  aspectRatio: number;
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PPTX resource must remain inside the repository: ${absolutePath}`);
  }

  return value;
}

function svgAspectRatio(bytes: Uint8Array, label: string): number {
  const xml = Buffer.from(bytes).toString('utf8');

  if (!/<svg[\s>]/u.test(xml)) {
    throw new Error(`Diagram asset is not SVG: ${label}`);
  }

  const document = new DOMParser().parseFromString(xml, 'image/svg+xml');

  const root = document.documentElement;

  const viewBox = (root.getAttribute('viewBox') ?? '').trim().split(/\s+/u).map(Number);

  if (viewBox.length === 4) {
    const width = viewBox[2];

    const height = viewBox[3];

    if (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width !== undefined &&
      height !== undefined &&
      width > 0 &&
      height > 0
    ) {
      return width / height;
    }
  }

  const width = Number.parseFloat(root.getAttribute('width') ?? '');

  const height = Number.parseFloat(root.getAttribute('height') ?? '');

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return width / height;
  }

  return 1;
}

export async function resolveNativePptxDiagramAssets(
  repositoryRootInput: string,
  spec: DeckSpec,
  assets: readonly NativePptxDiagramAsset[],
): Promise<Map<string, ResolvedNativePptxDiagramAsset>> {
  const repositoryRoot = resolve(repositoryRootInput);

  const provided = new Map<string, NativePptxDiagramAsset>();

  for (const asset of assets) {
    if (provided.has(asset.diagramId)) {
      throw new Error(`Duplicate PPTX diagram asset: ${asset.diagramId}.`);
    }

    if (!/^[a-f0-9]{64}$/u.test(asset.svgSha256)) {
      throw new Error(`Invalid SVG checksum for ${asset.diagramId}.`);
    }

    provided.set(asset.diagramId, asset);
  }

  const requiredIds = spec.slides
    .filter((slide) => slide.kind === 'diagram')
    .map((slide) => slide.diagramId);

  const resolved = new Map<string, ResolvedNativePptxDiagramAsset>();

  for (const diagramId of requiredIds) {
    const asset = provided.get(diagramId);

    if (!asset) {
      throw new Error(`Missing PPTX diagram asset for ${diagramId}.`);
    }

    const absolutePath = resolve(repositoryRoot, asset.svgPath);

    const relativePath = repositoryRelativePath(repositoryRoot, absolutePath);

    const bytes = await readFile(absolutePath);

    const actualSha256 = sha256(bytes);

    if (actualSha256 !== asset.svgSha256) {
      throw new Error(
        `PPTX diagram checksum mismatch for ${diagramId}: expected ${asset.svgSha256}, found ${actualSha256}.`,
      );
    }

    resolved.set(diagramId, {
      ...asset,
      svgPath: relativePath,
      absolutePath,
      aspectRatio: svgAspectRatio(bytes, relativePath),
    });
  }

  return resolved;
}
