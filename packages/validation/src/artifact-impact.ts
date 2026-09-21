import { posix } from 'node:path';

import { toPosixPath } from '@coursera-notes/core';
import type { Manifest } from '@coursera-notes/manifest';

const LANGUAGES = ['en', 'fr'] as const;

export type ArtifactImpactLanguage = (typeof LANGUAGES)[number];

export interface ArtifactImpactTarget {
  courseId: string;
  courseOrdinal: number;
  moduleId: string;
  moduleOrdinal: number;
  language: ArtifactImpactLanguage;
  sourcePath: string;
}

export interface ArtifactImpactReport {
  scope: 'none' | 'targeted' | 'all';
  targets: ArtifactImpactTarget[];
  reasons: string[];
}

function activeTargets(manifest: Manifest): ArtifactImpactTarget[] {
  return manifest.courses
    .filter((course) => course.status !== 'archived')
    .flatMap((course) =>
      course.modules.flatMap((module) =>
        LANGUAGES.map((language) => ({
          courseId: course.id,
          courseOrdinal: course.ordinal,
          moduleId: module.id,
          moduleOrdinal: module.ordinal,
          language,
          sourcePath: toPosixPath(module.source[language]),
        })),
      ),
    )
    .sort(
      (left, right) =>
        left.courseOrdinal - right.courseOrdinal ||
        left.moduleOrdinal - right.moduleOrdinal ||
        left.language.localeCompare(right.language),
    );
}

function isGlobalArtifactInput(path: string): boolean {
  return (
    path === 'manifest.json' ||
    path === 'pnpm-lock.yaml' ||
    path === 'packages/core/package.json' ||
    path === 'packages/manifest/package.json' ||
    path === 'packages/presentations/package.json' ||
    path === 'packages/cli/package.json' ||
    path.startsWith('packages/core/src/') ||
    path.startsWith('packages/manifest/src/') ||
    path.startsWith('packages/presentations/src/') ||
    path === 'packages/cli/src/artifact.ts' ||
    path === 'packages/cli/src/artifact-target.ts' ||
    path === 'packages/cli/src/artifact-pdf.ts' ||
    path === 'packages/cli/src/artifact-pptx.ts' ||
    path === 'packages/cli/src/artifact-verify.ts' ||
    path === 'packages/cli/src/artifact-visual-qa.ts'
  );
}

function targetKey(target: ArtifactImpactTarget): string {
  return [target.courseId, target.moduleId, target.language].join('/');
}

interface FileImpact {
  targets: ArtifactImpactTarget[];
  reason: string;
}

function addTargets(
  affected: Map<string, ArtifactImpactTarget>,
  targets: readonly ArtifactImpactTarget[],
): void {
  for (const target of targets) {
    affected.set(targetKey(target), target);
  }
}

function courseFileImpact(
  file: string,
  targets: readonly ArtifactImpactTarget[],
): FileImpact | undefined {
  if (!file.startsWith('courses/')) {
    return undefined;
  }

  const exact = targets.filter((target) => target.sourcePath === file);

  if (exact.length > 0) {
    return {
      targets: exact,
      reason: `canonical module source changed: ${file}`,
    };
  }

  const languageTargets = targets.filter((target) => {
    const languageRoot = posix.dirname(target.sourcePath);
    return file.startsWith(`${languageRoot}/`);
  });

  if (languageTargets.length > 0) {
    return {
      targets: languageTargets,
      reason: `course-language dependency changed: ${file}`,
    };
  }

  const courseTargets = targets.filter((target) => {
    const languageRoot = posix.dirname(target.sourcePath);
    const courseRoot = posix.dirname(languageRoot);
    return file.startsWith(`${courseRoot}/`);
  });

  if (courseTargets.length === 0) {
    return undefined;
  }

  return {
    targets: courseTargets,
    reason: `course dependency changed: ${file}`,
  };
}

export function analyzeArtifactImpact(
  manifest: Manifest,
  changedFiles: readonly string[],
  full = false,
): ArtifactImpactReport {
  const targets = activeTargets(manifest);

  if (full) {
    return {
      scope: targets.length > 0 ? 'all' : 'none',
      targets,
      reasons: ['full validation requested'],
    };
  }

  if (changedFiles.length === 0) {
    return {
      scope: 'none',
      targets: [],
      reasons: [],
    };
  }

  const files = changedFiles.map((path) => toPosixPath(path));
  const globalInputs = files.filter(isGlobalArtifactInput);

  if (globalInputs.length > 0) {
    return {
      scope: targets.length > 0 ? 'all' : 'none',
      targets,
      reasons: globalInputs
        .map((path) => `artifact engine input changed: ${path}`)
        .sort((left, right) => left.localeCompare(right)),
    };
  }

  const affected = new Map<string, ArtifactImpactTarget>();
  const reasons = new Set<string>();

  for (const file of files) {
    const impact = courseFileImpact(file, targets);

    if (impact) {
      addTargets(affected, impact.targets);
      reasons.add(impact.reason);
    }
  }

  const affectedTargets = targets.filter((target) => affected.has(targetKey(target)));

  return {
    scope: affectedTargets.length > 0 ? 'targeted' : 'none',
    targets: affectedTargets,
    reasons: [...reasons].sort((left, right) => left.localeCompare(right)),
  };
}
