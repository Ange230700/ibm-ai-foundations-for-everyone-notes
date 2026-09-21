import { access, readFile, readdir } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';

import { canonicalJson, fromRoot, padOrdinal } from '@coursera-notes/core';
import { manifestJsonSchema, readManifest } from '@coursera-notes/manifest';

import { analyzeArtifactImpact } from './artifact-impact.js';

export interface TaskResult {
  ok: boolean;
  messages: string[];
}

export interface ValidationContext {
  changedFiles: readonly string[];
  full: boolean;
}

export interface ValidationTask {
  id: string;
  description: string;
  inputs: string[];
  dependencies: string[];
  execute: (context: ValidationContext) => Promise<TaskResult>;
}

type RepositoryManifest = Awaited<ReturnType<typeof readManifest>>;
type CourseEntry = RepositoryManifest['courses'][number];
type ModuleEntry = CourseEntry['modules'][number];

async function fileExists(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

async function schemaSync(): Promise<TaskResult> {
  const path = fromRoot('manifest.schema.json');
  const actual = await readFile(path, 'utf8').catch(() => '');
  const expected = canonicalJson(manifestJsonSchema());
  return actual === expected
    ? { ok: true, messages: ['manifest.schema.json matches the Zod schema.'] }
    : { ok: false, messages: ['manifest.schema.json is stale; run pnpm manifest:schema.'] };
}

async function manifestValid(): Promise<TaskResult> {
  try {
    const manifest = await readManifest();
    return { ok: true, messages: [`Manifest valid: ${manifest.courses.length} course(s).`] };
  } catch (error) {
    return { ok: false, messages: [error instanceof Error ? error.message : String(error)] };
  }
}

async function manifestFormat(): Promise<TaskResult> {
  try {
    const manifest = await readManifest();
    const actual = await readFile(fromRoot('manifest.json'), 'utf8');
    const expected = canonicalJson(manifest);

    return actual === expected
      ? { ok: true, messages: ['manifest.json uses canonical JSON formatting.'] }
      : {
          ok: false,
          messages: [
            'manifest.json formatting drift detected; rewrite it through the manifest writer.',
          ],
        };
  } catch (error) {
    return {
      ok: false,
      messages: [error instanceof Error ? error.message : String(error)],
    };
  }
}

function directoryErrors(actual: readonly string[], expected: readonly string[]): string[] {
  return [
    ...expected
      .filter((directory) => !actual.includes(directory))
      .map((directory) => `Missing course directory: courses/${directory}`),
    ...actual
      .filter((directory) => !expected.includes(directory))
      .map((directory) => `Unexpected active course directory: courses/${directory}`),
  ];
}

async function moduleSourceErrors(
  module: ModuleEntry,
  directory: string,
  language: 'en' | 'fr',
): Promise<string[]> {
  const errors: string[] = [];
  const declared = fromRoot(module.source[language]);
  const expectedName = `${padOrdinal(module.ordinal)}-${module.slug}.md`;

  if (basename(declared) !== expectedName) {
    errors.push(
      `Module source filename drift: ${module.source[language]} (expected ${expectedName})`,
    );
  }

  if (dirname(declared) !== resolve(fromRoot('courses', directory, language))) {
    errors.push(
      `Module source path outside canonical language directory: ${module.source[language]}`,
    );
  }

  if (!(await fileExists(declared))) {
    errors.push(`Missing module source: ${module.source[language]}`);
  }

  return errors;
}

async function courseErrors(course: CourseEntry): Promise<string[]> {
  const directory = `${padOrdinal(course.ordinal)}-${course.slug}`;
  const errors: string[] = [];

  for (const language of ['en', 'fr'] as const) {
    const readme = fromRoot('courses', directory, language, 'README.md');

    if (!(await fileExists(readme))) {
      errors.push(`Missing canonical README: ${relative(fromRoot(), readme)}`);
    }

    for (const module of course.modules) {
      errors.push(...(await moduleSourceErrors(module, directory, language)));
    }
  }

  return errors;
}

async function courseStructure(): Promise<TaskResult> {
  const manifest = await readManifest();
  const coursesRoot = fromRoot('courses');
  const actualDirectories = (await readdir(coursesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const activeCourses = manifest.courses.filter((course) => course.status !== 'archived');
  const expectedDirectories = activeCourses
    .map((course) => `${padOrdinal(course.ordinal)}-${course.slug}`)
    .sort((left, right) => left.localeCompare(right));
  const errors = [
    ...directoryErrors(actualDirectories, expectedDirectories),
    ...(await Promise.all(activeCourses.map((course) => courseErrors(course)))).flat(),
  ];

  return errors.length
    ? { ok: false, messages: errors }
    : { ok: true, messages: ['Canonical EN/FR course structure matches manifest.'] };
}

async function designSystem(): Promise<TaskResult> {
  const manifest = await readManifest();
  const errors: string[] = [];
  for (const [name, path] of Object.entries(manifest.designSystem)) {
    if (!(await fileExists(fromRoot(path)))) errors.push(`Missing design-system ${name}: ${path}`);
  }
  return errors.length
    ? { ok: false, messages: errors }
    : { ok: true, messages: ['Design-system paths resolve.'] };
}

async function repositoryStructure(): Promise<TaskResult> {
  const required = [
    'courses',
    'design-system',
    'docs',
    'packages',
    'manifest.json',
    'package.json',
    'pnpm-workspace.yaml',
  ];
  const missing: string[] = [];
  for (const item of required) {
    if (!(await fileExists(fromRoot(item)))) missing.push(`Missing repository entry: ${item}`);
  }
  return missing.length
    ? { ok: false, messages: missing }
    : { ok: true, messages: ['Required repository entries exist.'] };
}

async function artifactImpact(context: ValidationContext): Promise<TaskResult> {
  try {
    const manifest = await readManifest();

    const report = analyzeArtifactImpact(manifest, context.changedFiles, context.full);

    if (report.targets.length === 0) {
      return {
        ok: true,
        messages: [
          context.full
            ? 'Artifact impact: full validation contains 0 active module-language target(s).'
            : 'Artifact impact: no derivative artifact targets are affected by current working-tree changes.',
        ],
      };
    }

    const labels = report.targets.map((target) =>
      [target.courseId, target.moduleId, target.language].join('/'),
    );

    const previewLimit = 12;

    const preview = labels.slice(0, previewLimit);

    const remaining = labels.length - preview.length;

    const targetMessage = [...preview, ...(remaining > 0 ? [`+${remaining} more`] : [])].join(', ');

    return {
      ok: true,
      messages: [
        [
          'Artifact impact:',
          `${report.targets.length} active module-language target(s)`,
          'across PDF/PPTX derivatives;',
          'verification and visual-QA evidence may also need refresh.',
        ].join(' '),
        `Targets: ${targetMessage}`,
      ],
    };
  } catch (error) {
    return {
      ok: false,
      messages: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export const TASKS: ValidationTask[] = [
  {
    id: 'manifest.schema.sync',
    description: 'Check generated JSON Schema drift.',
    inputs: [
      'packages/manifest/src/schema.ts',
      'packages/manifest/src/generate-schema.ts',
      'manifest.schema.json',
    ],
    dependencies: [],
    execute: schemaSync,
  },
  {
    id: 'manifest.validate',
    description: 'Validate manifest.json against the canonical Zod schema.',
    inputs: ['manifest.json', 'packages/manifest/src/**'],
    dependencies: ['manifest.schema.sync'],
    execute: manifestValid,
  },
  {
    id: 'manifest.format',
    description: 'Verify deterministic canonical formatting of manifest.json.',
    inputs: ['manifest.json'],
    dependencies: ['manifest.validate'],
    execute: manifestFormat,
  },
  {
    id: 'courses.structure',
    description: 'Verify canonical bilingual course/module structure.',
    inputs: ['manifest.json', 'courses/**'],
    dependencies: ['manifest.validate'],
    execute: courseStructure,
  },
  {
    id: 'artifacts.impact',
    description:
      'Report derivative artifact targets affected by canonical or artifact-engine changes.',
    inputs: [
      'manifest.json',
      'courses/**',

      'packages/core/src/**',
      'packages/core/package.json',

      'packages/manifest/src/**',
      'packages/manifest/package.json',

      'packages/presentations/src/**',
      'packages/presentations/package.json',

      'packages/cli/src/artifact.ts',
      'packages/cli/src/artifact-target.ts',
      'packages/cli/src/artifact-pdf.ts',
      'packages/cli/src/artifact-pptx.ts',
      'packages/cli/src/artifact-verify.ts',
      'packages/cli/src/artifact-visual-qa.ts',
      'packages/cli/package.json',

      'pnpm-lock.yaml',
    ],
    dependencies: [],
    execute: artifactImpact,
  },
  {
    id: 'design-system.validate',
    description: 'Verify design-system files declared by the manifest.',
    inputs: ['manifest.json', 'design-system/**'],
    dependencies: ['manifest.validate'],
    execute: designSystem,
  },
  {
    id: 'repository.structure',
    description: 'Verify required top-level repository structure.',
    inputs: [
      'package.json',
      'pnpm-workspace.yaml',
      'docs/**',
      'packages/**',
      'courses/**',
      'design-system/**',
      'manifest.json',
    ],
    dependencies: [],
    execute: repositoryStructure,
  },
];
