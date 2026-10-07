import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import JSZip from 'jszip';
import { renderNativePptx, verifyNativePptx } from '../src/index.js';
import { formatTeachingNotes, teachingNoteParts } from '../src/pptx/teaching-notes.js';
import { createDeckSpec, createPptxFixture, createSourceRef } from './pptx-fixture.js';

test('OOXML verification rejects missing parts, broken relationships, notes and object bounds', async () => {
  const fixture = await createPptxFixture({ name: 'pptx-package-errors', outputFile: 'test.pptx' });
  const sourceRef = createSourceRef({ title: 'Test', heading: 'Test', endLine: 3 });
  const spec = createDeckSpec({
    deckId: 'test',
    title: 'Test',
    purpose: 'Verify',
    hashCharacter: 'a',
    sourceRef,
    slides: [
      {
        kind: 'title',
        slideId: 'title',
        title: 'Test title',
        subtitle: 'Subtitle',
        items: ['Detail'],
        teachingNotes: 'Facilitator note',
        sourceRefs: [sourceRef],
      },
    ],
  });
  try {
    await renderNativePptx(spec, {
      repositoryRoot: fixture.repositoryRoot,
      outputPath: fixture.outputPath,
    });
    const original = await readFile(fixture.outputPath);
    await assert.rejects(
      verifyNativePptx({ ...spec, slides: [] }, fixture.repositoryRoot, fixture.outputPath),
      /slide count mismatch/,
    );
    const edit = async (path: string, transform: (xml: string) => string) => {
      const zip = await JSZip.loadAsync(original);
      zip.file(path, transform(await zip.file(path)!.async('string')));
      await writeFile(fixture.outputPath, await zip.generateAsync({ type: 'nodebuffer' }));
    };
    const reject = (pattern: RegExp) =>
      assert.rejects(verifyNativePptx(spec, fixture.repositoryRoot, fixture.outputPath), pattern);
    const remove = async (path: string, pattern: RegExp) => {
      const zip = await JSZip.loadAsync(original);
      zip.remove(path);
      await writeFile(fixture.outputPath, await zip.generateAsync({ type: 'nodebuffer' }));
      await reject(pattern);
    };
    for (const path of [
      resolve(fixture.repositoryRoot, '..'),
      resolve(fixture.repositoryRoot, '../escape.pptx'),
    ])
      await assert.rejects(
        verifyNativePptx(spec, fixture.repositoryRoot, path),
        /inside the repository/,
      );
    for (const bytes of [Buffer.from('invalid'), Buffer.from([0x50, 0])]) {
      await writeFile(fixture.outputPath, bytes);
      await reject(/not an OOXML ZIP/);
    }
    for (const path of [
      'ppt/presentation.xml',
      'ppt/_rels/presentation.xml.rels',
      'ppt/slides/slide1.xml',
    ])
      await remove(path, /missing required OOXML part/);
    await edit('ppt/presentation.xml', () => '<parsererror/>');
    await reject(/Invalid OOXML XML/);
    await edit('ppt/presentation.xml', (xml) => xml.replace(/<p:sldId\b[^>]*\/>/, '<p:sldId/>'));
    await reject(/without a relationship id/);
    await edit('ppt/presentation.xml', (xml) =>
      xml.replace(/<p:sldId\b[^>]*\/>/, '<p:sldId r:id="unknown"/>'),
    );
    await reject(/Missing presentation relationship/);
    await edit('ppt/presentation.xml', (xml) =>
      xml.replace(/<p:sldId\b[^>]*r:id="([^"]+)"[^>]*\/>/, '<p:sldId id="$1"/>'),
    );
    await verifyNativePptx(spec, fixture.repositoryRoot, fixture.outputPath);
    await edit('ppt/_rels/presentation.xml.rels', (xml) =>
      xml.replace(/Target="slides\/slide1.xml"/, 'Target="/ppt/slides/slide1.xml"'),
    );
    await verifyNativePptx(spec, fixture.repositoryRoot, fixture.outputPath);
    for (const target of ['./slides//slide1.xml', '../ppt/slides/slide1.xml']) {
      await edit('ppt/_rels/presentation.xml.rels', (xml) =>
        xml.replace('Target="slides/slide1.xml"', `Target="${target}"`),
      );
      await verifyNativePptx(spec, fixture.repositoryRoot, fixture.outputPath);
    }
    await edit('ppt/_rels/presentation.xml.rels', (xml) =>
      xml.replace('</Relationships>', '<Relationship Id="" Target="" Type=""/></Relationships>'),
    );
    await verifyNativePptx(spec, fixture.repositoryRoot, fixture.outputPath);
    await edit('ppt/slides/slide1.xml', (xml) => xml.replace('Test title', 'Missing title'));
    await reject(/missing canonical text/);
    await edit('ppt/slides/slide1.xml', (xml) => xml.replace('01 / 01', '01 / 99'));
    await reject(/missing pagination/);
    await remove('ppt/slides/_rels/slide1.xml.rels', /missing source notes/);
    await edit('ppt/slides/_rels/slide1.xml.rels', (xml) => xml.replace('/notesSlide', '/other'));
    await reject(/missing source notes/);
    await remove('ppt/notesSlides/notesSlide1.xml', /references missing notes part/);
    await edit('ppt/notesSlides/notesSlide1.xml', (xml) => xml.replace('[Sources]', '[Other]'));
    await reject(/missing source notes/);
    for (const value of ['[Teaching Notes]', 'Facilitator note', '[/Teaching Notes]']) {
      await edit('ppt/notesSlides/notesSlide1.xml', (xml) => xml.replace(value, 'removed'));
      await reject(/missing teaching notes/);
    }
    for (const [tag, field, value] of [
      ['off', 'x', '-1'],
      ['off', 'y', '-1'],
      ['ext', 'cx', '-1'],
      ['ext', 'cy', '-1'],
      ['ext', 'cx', '999999999'],
      ['ext', 'cy', '999999999'],
    ] as const) {
      await edit('ppt/slides/slide1.xml', (xml) =>
        xml.replace(
          '</p:spTree>',
          `<p:sp><a:xfrm><a:off x="${tag === 'off' && field === 'x' ? value : 0}" y="${tag === 'off' && field === 'y' ? value : 0}"/><a:ext cx="${tag === 'ext' && field === 'cx' ? value : 1}" cy="${tag === 'ext' && field === 'cy' ? value : 1}"/></a:xfrm></p:sp></p:spTree>`,
        ),
      );
      await reject(/out-of-bounds/);
    }
    for (const transform of [
      '<a:xfrm/>',
      '<a:xfrm><a:off/></a:xfrm>',
      '<a:xfrm><a:off/><a:ext/></a:xfrm>',
      '<a:xfrm><a:off x="NaN" y="0"/><a:ext cx="1" cy="1"/></a:xfrm>',
      '<a:xfrm><a:off x="0" y="NaN"/><a:ext cx="1" cy="1"/></a:xfrm>',
      '<a:xfrm><a:off x="0" y="0"/><a:ext cx="NaN" cy="1"/></a:xfrm>',
      '<a:xfrm><a:off x="0" y="0"/><a:ext cx="1" cy="NaN"/></a:xfrm>',
    ]) {
      await edit('ppt/slides/slide1.xml', (xml) =>
        xml.replace('</p:spTree>', `<p:sp>${transform}</p:sp></p:spTree>`),
      );
      await verifyNativePptx(spec, fixture.repositoryRoot, fixture.outputPath);
    }
    await writeFile(fixture.outputPath, original);
    const first = spec.slides[0]!;
    delete spec.slides[0];
    await assert.rejects(
      verifyNativePptx(spec, fixture.repositoryRoot, fixture.outputPath),
      /slide order is incomplete/,
    );
    spec.slides[0] = first;
    for (const kind of ['table', 'diagram'] as const) {
      if (kind === 'diagram')
        await edit('ppt/slides/slide1.xml', (xml) => xml.replace(/<p:pic>[\s\S]*?<\/p:pic>/g, ''));
      const slide =
        kind === 'table'
          ? { ...first, kind, tableId: 'table', headers: [], rows: [], explanation: '' }
          : { ...first, kind, diagramId: 'diagram', explanation: '' };
      await assert.rejects(
        verifyNativePptx({ ...spec, slides: [slide] }, fixture.repositoryRoot, fixture.outputPath),
        /exactly one native table|embedded diagram image/,
      );
    }
    await assert.rejects(
      verifyNativePptx(
        {
          ...spec,
          slides: [
            {
              ...first,
              visual: {
                kind: 'capture',
                path: 'teaching/visuals/s01/en/test.png',
                caption: 'Test',
              },
            },
          ],
        },
        fixture.repositoryRoot,
        fixture.outputPath,
      ),
      /missing its teaching visual/,
    );
    await writeFile(fixture.outputPath, original);
    const teachingSpec = {
      ...spec,
      scope: {
        kind: 'teaching-session' as const,
        sessionId: 's01',
        canonicalModuleIds: ['module_test'],
      },
      slides: [
        {
          ...first,
          teachingNotes: '**Key takeaway:** Main point.\n\nSay this. Do this.',
          durationMinutes: 1,
        },
      ],
    };
    await assert.rejects(
      verifyNativePptx(teachingSpec, fixture.repositoryRoot, fixture.outputPath),
      /formatted presenter cues/,
    );
    const formatted = await formatTeachingNotes(original, teachingSpec);
    await writeFile(fixture.outputPath, formatted);
    await verifyNativePptx(teachingSpec, fixture.repositoryRoot, fixture.outputPath);
    const zip = await JSZip.loadAsync(formatted);
    zip.file(
      'ppt/notesSlides/notesSlide1.xml',
      (await zip.file('ppt/notesSlides/notesSlide1.xml')!.async('string')).replace(
        'Main point.',
        'removed',
      ),
    );
    await writeFile(fixture.outputPath, await zip.generateAsync({ type: 'nodebuffer' }));
    await assert.rejects(
      verifyNativePptx(teachingSpec, fixture.repositoryRoot, fixture.outputPath),
      /missing teaching notes/,
    );
    const noNotes = new JSZip();
    await assert.rejects(
      formatTeachingNotes(await noNotes.generateAsync({ type: 'uint8array' }), teachingSpec),
      /Missing notes part/,
    );
    noNotes.file('ppt/notesSlides/notesSlide1.xml', '<root/>');
    await assert.rejects(
      formatTeachingNotes(await noNotes.generateAsync({ type: 'uint8array' }), teachingSpec),
      /Missing body notes placeholder/,
    );
    const withoutHeading = {
      ...teachingSpec,
      slides: [
        {
          ...teachingSpec.slides[0]!,
          sourceRefs: [{ ...sourceRef, headingPath: [] }],
          teachingNotes: '**Takeaway:** Main point.',
        },
        { ...first, teachingNotes: '' },
      ],
    };
    const concise = await formatTeachingNotes(original, withoutHeading);
    const conciseZip = await JSZip.loadAsync(concise);
    const conciseNotes = await conciseZip.file('ppt/notesSlides/notesSlide1.xml')!.async('string');
    assert.doesNotMatch(conciseNotes, /SAY \/ DO| — /);
    assert.match(conciseNotes, /1-3/);
    assert.throws(() => teachingNoteParts('No bold takeaway'), /bold key takeaway/);
    assert.deepEqual(teachingNoteParts('**Takeaway:** Main point.'), {
      label: 'Takeaway:',
      takeaway: 'Main point.',
      cues: [],
    });
  } finally {
    await fixture.cleanup();
  }
});
