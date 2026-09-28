import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { repositoryRoot } from '@coursera-notes/core';

const frame = { widthInches: 11.89 - 0.16, heightInches: 3.0 - 0.16 };

test('bilingual teaching diagrams remain readable in their slide frame', async () => {
  let checked = 0;

  for (const session of ['s01', 's02', 's03']) {
    for (const language of ['en', 'fr']) {
      const directory = resolve(repositoryRoot(), 'teaching', 'visuals', session, language);
      const names = (await readdir(directory)).filter((name) => name.endsWith('.mmd'));
      assert.equal(names.length, 4, `${session}/${language} diagram count`);

      for (const name of names) {
        const source = await readFile(resolve(directory, name), 'utf8');
        assert.match(source, /^flowchart LR\n/u, `${session}/${language}/${name} direction`);

        const svg = await readFile(resolve(directory, name.replace(/\.mmd$/u, '.svg')), 'utf8');
        const viewBox = svg
          .match(/\bviewBox="([^"]+)"/u)?.[1]
          ?.split(/\s+/u)
          .map(Number);
        assert.ok(viewBox && viewBox.length === 4, `${session}/${language}/${name} viewBox`);
        const width = viewBox[2] ?? 0;
        const height = viewBox[3] ?? 0;
        assert.ok(width > 0 && height > 0, `${session}/${language}/${name} dimensions`);

        // Mermaid node labels are 16 SVG pixels. Containing the image preserves that
        // ratio; 96 SVG pixels equal one inch and 72 points equal one inch.
        const scale = Math.min(
          (frame.widthInches * 96) / width,
          (frame.heightInches * 96) / height,
        );
        const displayedFontPoints = 16 * scale * (72 / 96);
        assert.ok(
          displayedFontPoints >= 11,
          `${session}/${language}/${name}: node labels ${displayedFontPoints.toFixed(1)} pt`,
        );
        checked += 1;
      }
    }
  }

  assert.equal(checked, 24);
});
