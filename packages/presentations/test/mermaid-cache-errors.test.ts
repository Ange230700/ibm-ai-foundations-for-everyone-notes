import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { join, resolve } from 'node:path';
import test from 'node:test';
import puppeteer, * as puppeteerApi from 'puppeteer';
import * as cli from '@mermaid-js/mermaid-cli';
import { parseCanonicalModule } from '../src/content/extract-markdown.js';

test('Mermaid rendering refreshes corrupted caches and rejects missing version metadata', async (t) => {
  const root = process.cwd();
  const directory = await fs.mkdtemp(join(root, '.artifacts/mermaid-cache-'));
  const content = parseCanonicalModule(
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Diagram\n\n```mermaid\nflowchart LR\n A-->B\n```\n\nA connects to B.\n\n## Final Summary\n\n- Remember.\n',
    {
      courseId: 'course_test',
      moduleId: 'module_test',
      language: 'en',
      sourcePath: resolve(root, 'test.md'),
      repositoryRoot: root,
    },
  );
  let badVersion = false;
  let calls = 0;
  let closes = 0;
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      readFile: (path: string, encoding?: BufferEncoding) =>
        badVersion && path.endsWith('package.json')
          ? Promise.resolve('{}')
          : fs.readFile(path, encoding),
    },
  });
  t.mock.module('puppeteer', {
    namedExports: Object.fromEntries(
      Object.entries(puppeteerApi).filter(([name]) => name !== 'default'),
    ),
    defaultExport: {
      ...puppeteer,
      launch: async () => ({
        close: async () => {
          closes++;
        },
      }),
    },
  });
  t.mock.module('@mermaid-js/mermaid-cli', {
    namedExports: {
      ...cli,
      run: async (_input: string, output: string) => {
        calls++;
        await fs.writeFile(
          output,
          output.endsWith('.svg')
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text>Diagram</text></svg>'
            : Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        );
      },
    },
  });
  const { renderModuleMermaidAssets, loadMermaidRendererContext } =
    await import('../src/mermaid/render.js?cache-errors');
  const options = { repositoryRoot: root, outputRoot: directory };
  try {
    for (const path of [resolve(root, '..'), resolve(root, '../outside')])
      await assert.rejects(
        renderModuleMermaidAssets(content, { ...options, outputRoot: path }),
        /inside the repository/,
      );
    const first = await renderModuleMermaidAssets(content, options);
    assert.equal(calls, 2);
    await renderModuleMermaidAssets(content, options);
    assert.equal(calls, 2);
    for (const path of [first.assets[0]!.svgPath, first.assets[0]!.pngPath]) {
      await fs.writeFile(`${resolve(root, path)}.sha256`, 'stale');
      await renderModuleMermaidAssets(content, options);
    }
    assert.equal(calls, 6);
    assert.equal(closes, 4);
    badVersion = true;
    await assert.rejects(loadMermaidRendererContext(), /Cannot determine/);
    badVersion = false;
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
