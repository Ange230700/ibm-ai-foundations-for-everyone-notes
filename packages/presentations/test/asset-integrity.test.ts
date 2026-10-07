import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { sha256 } from '@coursera-notes/core';
import { parseCanonicalModule } from '../src/content/extract-markdown.js';
import { prepareDocumentMermaidAssets, replaceMermaidFences } from '../src/document/mermaid.js';
import type { MermaidRenderManifest } from '../src/mermaid/render.js';
import { validateMermaidPng, validateMermaidSvg } from '../src/mermaid/render.js';
import { normalizeMermaidSvgForOffice } from '../src/mermaid/office-svg.js';
import { writeMermaidSources } from '../src/mermaid/source.js';
import { synthesizeDeckSpec } from '../src/deck/synthesize.js';
import { resolveNativePptxDiagramAssets } from '../src/pptx/resources.js';

test('diagram assets validate ownership, uniqueness, definitions, checksums and repository boundaries', async () => {
  const root = process.cwd();
  await mkdir(join(root, '.artifacts'), { recursive: true });
  const directory = await mkdtemp(join(root, '.artifacts/asset-errors-'));
  const markdown =
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Diagram\n\n```mermaid\nflowchart LR\n A-->B\n```\n\nA connects to B.\n\n## Final Summary\n\n- Remember.\n';
  const content = parseCanonicalModule(markdown, {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en',
    repositoryRoot: root,
    sourcePath: resolve(root, 'courses/test.md'),
  });
  const diagram = content.diagrams[0]!;
  const svgPath = join(directory, 'diagram.svg');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"/>';
  const asset = {
    diagramId: diagram.diagramId,
    source: diagram.source,
    definitionSha256: diagram.definitionSha256,
    renderHash: sha256('render'),
    svgSha256: sha256(svg),
    svgPath,
    pngSha256: sha256('png'),
    pngPath: 'diagram.png',
  };
  const manifest: MermaidRenderManifest = {
    schemaVersion: 1,
    courseId: content.courseId,
    moduleId: content.moduleId,
    language: content.language,
    sourcePath: content.sourcePath,
    moduleContentSha256: content.moduleContentSha256,
    renderer: {
      name: '@mermaid-js/mermaid-cli',
      cliVersion: 'test',
      rendererVersion: 1,
      configurationSha256: sha256('config'),
    },
    assets: [asset],
  };
  try {
    await writeFile(svgPath, svg);
    const rendered = await prepareDocumentMermaidAssets(content, manifest, root);
    assert.match(rendered[0]!.dataUri, /^data:image/);
    for (const field of ['courseId', 'moduleId', 'language', 'moduleContentSha256'])
      await assert.rejects(
        prepareDocumentMermaidAssets(content, { ...manifest, [field]: 'wrong' }, root),
        /belong|stale/,
      );
    await assert.rejects(
      prepareDocumentMermaidAssets(content, { ...manifest, assets: [] }, root),
      /Expected/,
    );
    await assert.rejects(
      prepareDocumentMermaidAssets(
        { ...content, diagrams: [diagram, diagram] },
        { ...manifest, assets: [asset, asset] },
        root,
      ),
      /Duplicate/,
    );
    await assert.rejects(
      prepareDocumentMermaidAssets(
        content,
        { ...manifest, assets: [{ ...asset, diagramId: 'missing' }] },
        root,
      ),
      /Missing/,
    );
    await assert.rejects(
      prepareDocumentMermaidAssets(
        content,
        { ...manifest, assets: [{ ...asset, definitionSha256: 'wrong' }] },
        root,
      ),
      /stale/,
    );
    for (const path of ['..', '../escape.svg'])
      await assert.rejects(
        prepareDocumentMermaidAssets(
          content,
          { ...manifest, assets: [{ ...asset, svgPath: path }] },
          root,
        ),
        /inside the repository/,
      );
    await assert.rejects(
      prepareDocumentMermaidAssets(
        content,
        { ...manifest, assets: [{ ...asset, svgSha256: 'wrong' }] },
        root,
      ),
      /checksum mismatch/,
    );
    assert.throws(() => replaceMermaidFences(markdown, [], 'en'), /more Mermaid fences/);
    assert.throws(() => replaceMermaidFences('No diagram', rendered, 'en'), /replaced 0 fences/);
    const spec = synthesizeDeckSpec(content);
    assert.equal(
      (await resolveNativePptxDiagramAssets(root, spec, [asset])).get(diagram.diagramId)!
        .aspectRatio,
      2,
    );
    await assert.rejects(resolveNativePptxDiagramAssets(root, spec, [asset, asset]), /Duplicate/);
    await assert.rejects(
      resolveNativePptxDiagramAssets(root, spec, [{ ...asset, svgSha256: 'bad' }]),
      /Invalid SVG checksum/,
    );
    await assert.rejects(
      resolveNativePptxDiagramAssets(root, spec, []),
      /Missing PPTX diagram asset/,
    );
    for (const path of ['..', '../escape.svg'])
      await assert.rejects(
        resolveNativePptxDiagramAssets(root, spec, [{ ...asset, svgPath: path }]),
        /inside the repository/,
      );
    for (const [value, ratio] of [
      ['<svg width="300" height="100"/>', 3],
      ['<svg/>', 1],
      ['<svg viewBox="0 0 0 100" width="0" height="2"/>', 1],
      ['<svg viewBox="0 0 NaN 100" width="300" height="0"/>', 1],
      ['<svg viewBox="0 0 100 NaN" width="-1" height="1"/>', 1],
      ['<svg viewBox="0 0 100 0" width="NaN" height="1"/>', 1],
    ]) {
      await writeFile(svgPath, value!);
      assert.equal(
        (
          await resolveNativePptxDiagramAssets(root, spec, [
            { ...asset, svgSha256: sha256(value!) },
          ])
        ).get(diagram.diagramId)!.aspectRatio,
        ratio,
      );
    }
    await writeFile(svgPath, 'not SVG');
    await assert.rejects(
      resolveNativePptxDiagramAssets(root, spec, [{ ...asset, svgSha256: sha256('not SVG') }]),
      /not SVG/,
    );
    for (const path of [resolve(root, '..'), resolve(root, '../outside')])
      await assert.rejects(
        writeMermaidSources(content, { repositoryRoot: root, outputRoot: path }),
        /inside the repository/,
      );
    const sources = await writeMermaidSources(content, {
      repositoryRoot: root,
      outputRoot: join(directory, 'sources'),
    });
    assert.match(await readFile(resolve(root, sources.diagrams[0]!.path), 'utf8'), /flowchart/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Office SVG normalization handles empty, nested and multiline labels and rejects invalid XML', () => {
  for (const svg of ['<root/>', '<svg><g></svg>', '<svg><g invalid></g></svg>'])
    assert.throws(() => normalizeMermaidSvgForOffice(svg), /Cannot postprocess/);
  for (const viewBox of ['', '0 0 NaN 10', '0 0 100 100']) {
    const result = normalizeMermaidSvgForOffice(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g class="node"><rect/><g class="label"><text>A-Z 1ijMW_/: lower</text></g></g><g class="node"/><g class="node"><g class="label"/></g><g class="node"><g><g class="label"><text>Nested</text><path/></g></g></g><g class="edgeLabel"/><g class="edgeLabel"><g class="row">First</g><g class="row">Second</g></g><g class="cluster"><rect/></g><g class="marker"><path/></g><path class="arrowMarkerPath"/><rect class="label-container"/><text><tspan>text</tspan></text></svg>`,
    );
    assert.match(result, /A-Z 1ijMW_\/: lower/);
    assert.match(result, /Nested/);
    assert.match(result, /Second/);
  }
  for (const svg of [
    '<script/>',
    '<svg><script/></svg>',
    '<svg><foreignObject/></svg>',
    '<svg><image href="https://example.com/a.png"/></svg>',
    'not XML',
  ])
    assert.throws(() => validateMermaidSvg(svg), /forbidden|not SVG/);
  assert.throws(() => validateMermaidPng(new Uint8Array()), /not PNG/);
});
