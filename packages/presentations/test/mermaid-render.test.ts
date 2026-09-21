import assert from 'node:assert/strict';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  parseCanonicalModule,
  renderModuleMermaidAssets,
  serializeMermaidRenderManifest,
  validateMermaidPng,
  validateMermaidSvg,
} from '../src/index.js';

import { sha256 } from '@coursera-notes/core';

const markdown = `# Render Test

## Learning Objectives

- Explain the flow.

## Concept Map

\`\`\`mermaid
flowchart LR
    A[Input] --> B[Output]
\`\`\`

Explain the flow.

## Final Summary

- Review the flow.
`;

test(
  'Mermaid renderer produces validated deterministic SVG and PNG assets',
  {
    timeout: 60_000,
  },
  async () => {
    const repositoryRoot = process.cwd();

    const outputRoot = resolve(repositoryRoot, '.artifacts', 'mermaid-render-test');

    await mkdir(resolve(repositoryRoot, '.artifacts'), {
      recursive: true,
    });

    await rm(outputRoot, {
      recursive: true,
      force: true,
    });

    const content = parseCanonicalModule(markdown, {
      courseId: 'course_test',
      moduleId: 'module_test',
      language: 'en',
      repositoryRoot,
      sourcePath: resolve(repositoryRoot, 'courses/01-test/en/01-test.md'),
    });

    try {
      const first = await renderModuleMermaidAssets(content, {
        repositoryRoot,
        outputRoot,
      });

      const second = await renderModuleMermaidAssets(content, {
        repositoryRoot,
        outputRoot,
      });

      assert.equal(first.assets.length, 1);

      assert.equal(serializeMermaidRenderManifest(first), serializeMermaidRenderManifest(second));

      const asset = first.assets[0];

      assert.ok(asset);

      assert.match(asset.renderHash, /^[a-f0-9]{64}$/);

      assert.match(asset.svgSha256, /^[a-f0-9]{64}$/);

      assert.match(asset.pngSha256, /^[a-f0-9]{64}$/);

      const [svg, png] = await Promise.all([
        readFile(resolve(repositoryRoot, asset.svgPath), 'utf8'),
        readFile(resolve(repositoryRoot, asset.pngPath)),
      ]);

      assert.equal(asset.svgSha256, sha256(svg));

      assert.equal(asset.pngSha256, sha256(png));

      validateMermaidSvg(svg, asset.diagramId);

      validateMermaidPng(png, asset.diagramId);

      assert.equal(first.renderer.name, '@mermaid-js/mermaid-cli');

      assert.equal(first.renderer.cliVersion, '11.16.0');
    } finally {
      await rm(outputRoot, {
        recursive: true,
        force: true,
      });
    }
  },
);
