import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { Manifest } from '@coursera-notes/manifest';

import { resolveArtifactTargets, type ResolvedArtifactTarget } from '../src/artifact-target.js';

interface ModuleFixture {
  id: string;
  ordinal: number;
  slug: string;
  source: {
    en: string;
    fr: string;
  };
}

function moduleFixture(
  id: string,
  ordinal: number,
  slug: string,
  sourceRoot: string,
): ModuleFixture {
  const prefix = String(ordinal).padStart(2, '0');

  return {
    id,
    ordinal,
    slug,
    source: {
      en: `${sourceRoot}/en/${prefix}-${slug}.md`,
      fr: `${sourceRoot}/fr/${prefix}-${slug}.md`,
    },
  };
}

function courseFixture(
  id: string,
  ordinal: number,
  slug: string,
  status: 'active' | 'archived',
  modules: ModuleFixture[],
) {
  return {
    id,
    ordinal,
    slug,
    status,
    modules,
  };
}

export const artifactTargetManifest = {
  courses: [
    courseFixture('course_alpha', 1, 'alpha', 'active', [
      moduleFixture('module_intro', 1, 'intro', 'courses/01-alpha'),
      moduleFixture('module_core', 2, 'core', 'courses/01-alpha'),
    ]),
    courseFixture('course_archive', 2, 'archive', 'archived', [
      moduleFixture('module_old', 1, 'old', 'courses/02-archive'),
    ]),
  ],
} as unknown as Manifest;

interface ArtifactFixtureOptions {
  name: string;
  sourceFile: string;
  markdown: string;
}

export interface ArtifactFixture {
  repositoryRoot: string;
  fixtureRoot: string;
  outputRoot: string;
  courseId: string;
  target: ResolvedArtifactTarget;
  cleanup: () => Promise<void>;
}

export async function createArtifactFixture(
  options: ArtifactFixtureOptions,
): Promise<ArtifactFixture> {
  const repositoryRoot = process.cwd();
  const fixtureRoot = resolve(repositoryRoot, '.artifacts', options.name);
  const sourceRoot = resolve(fixtureRoot, 'source');
  const sourcePath = resolve(sourceRoot, options.sourceFile);
  const outputRoot = resolve(fixtureRoot, 'output');
  const id = options.name.replaceAll('-', '_');
  const courseId = `course_${id}`;
  const moduleId = `module_${id}`;
  const manifest = {
    courses: [
      courseFixture(courseId, 1, options.name, 'active', [
        {
          id: moduleId,
          ordinal: 1,
          slug: options.name,
          source: {
            en: `.artifacts/${options.name}/source/${options.sourceFile}`,
            fr: `.artifacts/${options.name}/source/${options.sourceFile.replace('.en.', '.fr.')}`,
          },
        },
      ]),
    ],
  } as unknown as Manifest;

  await rm(fixtureRoot, {
    recursive: true,
    force: true,
  });
  await mkdir(sourceRoot, {
    recursive: true,
  });
  await writeFile(sourcePath, options.markdown, 'utf8');

  const [target] = resolveArtifactTargets(manifest, {
    course: courseId,
    module: moduleId,
    language: 'en',
  });

  if (!target) {
    throw new Error(`Unable to resolve artifact fixture ${options.name}.`);
  }

  return {
    repositoryRoot,
    fixtureRoot,
    outputRoot,
    courseId,
    target,
    cleanup: () =>
      rm(fixtureRoot, {
        recursive: true,
        force: true,
      }),
  };
}
