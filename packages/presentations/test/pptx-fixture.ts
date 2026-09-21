import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { sha256 } from '@coursera-notes/core';

import {
  DEFAULT_NATIVE_PPTX_THEME,
  type DeckSourceRef,
  type DeckSpec,
  type SlideSpec,
} from '../src/index.js';

export const TEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
  <rect x="20" y="20" width="760" height="360" fill="#f5f5f5" stroke="#666666"/>
  <circle cx="220" cy="200" r="70" fill="#eeeeee" stroke="#333333"/>
  <circle cx="580" cy="200" r="70" fill="#eeeeee" stroke="#333333"/>
  <path d="M290 200 L510 200" stroke="#333333" stroke-width="8"/>
</svg>
`;

interface SourceRefOptions {
  title: string;
  heading: string;
  endLine: number;
}

export function createSourceRef(options: SourceRefOptions): DeckSourceRef {
  return {
    path: 'courses/01-test/en/01-test.md',
    heading: options.heading,
    headingPath: [options.title, options.heading],
    blockIds: ['block/test/01'],
    startLine: 1,
    endLine: options.endLine,
  };
}

interface DeckFixtureOptions {
  deckId: string;
  title: string;
  purpose: string;
  hashCharacter: string;
  sourceRef: DeckSourceRef;
  slides: SlideSpec[];
}

export function createDeckSpec(options: DeckFixtureOptions): DeckSpec {
  return {
    schemaVersion: 1,
    status: 'accepted',
    deckId: options.deckId,
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en',
    title: options.title,
    audience: 'Learners reviewing the module',
    purpose: options.purpose,
    themeId: DEFAULT_NATIVE_PPTX_THEME.id,
    moduleContentSha256: options.hashCharacter.repeat(64),
    sourcePath: options.sourceRef.path,
    slides: options.slides,
  };
}

interface ResourceSlideOptions {
  sourceRef: DeckSourceRef;
  diagramTitle: string;
  diagramExplanation: string;
  tableTitle: string;
  tableHeaders: string[];
  tableRows: string[][];
  tableExplanation: string;
  codeTitle: string;
  code: string;
  codeExplanation: string;
}

export function createResourceSlides(options: ResourceSlideOptions): SlideSpec[] {
  return [
    {
      kind: 'diagram',
      slideId: 'diagram',
      title: options.diagramTitle,
      diagramId: 'diagram/test/01',
      explanation: options.diagramExplanation,
      sourceRefs: [options.sourceRef],
    },
    {
      kind: 'table',
      slideId: 'table',
      title: options.tableTitle,
      tableId: 'table/test/01',
      headers: options.tableHeaders,
      rows: options.tableRows,
      explanation: options.tableExplanation,
      sourceRefs: [options.sourceRef],
    },
    {
      kind: 'code',
      slideId: 'code',
      title: options.codeTitle,
      codeExampleId: 'code/test/01',
      language: 'typescript',
      code: options.code,
      explanation: options.codeExplanation,
      sourceRefs: [options.sourceRef],
    },
  ];
}

interface PptxFixtureOptions {
  name: string;
  outputFile: string;
  svg?: string;
}

export interface PptxFixture {
  repositoryRoot: string;
  outputRoot: string;
  outputPath: string;
  svgPath: string;
  diagramAsset: (svgSha256?: string) => {
    diagramId: string;
    svgPath: string;
    svgSha256: string;
  };
  cleanup: () => Promise<void>;
}

export async function createPptxFixture(options: PptxFixtureOptions): Promise<PptxFixture> {
  const repositoryRoot = process.cwd();
  const outputRoot = resolve(repositoryRoot, '.artifacts', options.name);
  const outputPath = resolve(outputRoot, options.outputFile);
  const svgPath = resolve(outputRoot, 'diagram.svg');

  await rm(outputRoot, {
    recursive: true,
    force: true,
  });

  if (options.svg !== undefined) {
    await mkdir(outputRoot, {
      recursive: true,
    });
    await writeFile(svgPath, options.svg, 'utf8');
  }

  return {
    repositoryRoot,
    outputRoot,
    outputPath,
    svgPath,
    diagramAsset: (svgSha256 = sha256(Buffer.from(options.svg ?? '', 'utf8'))) => ({
      diagramId: 'diagram/test/01',
      svgPath: `.artifacts/${options.name}/diagram.svg`,
      svgSha256,
    }),
    cleanup: () =>
      rm(outputRoot, {
        recursive: true,
        force: true,
      }),
  };
}
