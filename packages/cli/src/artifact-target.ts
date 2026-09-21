import { padOrdinal, toPosixPath } from '@coursera-notes/core';

import type { Course, Manifest, Module } from '@coursera-notes/manifest';

export type ArtifactLanguage = 'en' | 'fr';

export interface ArtifactTargetSelector {
  course?: string;
  module?: string;
  language?: ArtifactLanguage;
}

export interface ResolvedArtifactTarget {
  course: Course;
  module: Module;
  language: ArtifactLanguage;
  sourcePath: string;
  key: string;
}

function courseMatches(course: Course, selector: string): boolean {
  return String(course.ordinal) === selector || course.id === selector;
}

function moduleMatches(module: Module, selector: string): boolean {
  return String(module.ordinal) === selector || module.id === selector;
}

function selectedCourses(manifest: Manifest, selector?: string): Course[] {
  if (!selector) {
    return manifest.courses
      .filter((course) => course.status !== 'archived')
      .sort((left, right) => left.ordinal - right.ordinal);
  }

  const courses = manifest.courses.filter((course) => courseMatches(course, selector));

  if (courses.length === 0) {
    throw new Error(`Unknown course: ${selector}`);
  }

  if (courses.length > 1) {
    throw new Error(`Ambiguous course selector: ${selector}`);
  }

  return courses;
}

function selectedModules(course: Course, selector?: string): Module[] {
  if (!selector) {
    return [...course.modules].sort((left, right) => left.ordinal - right.ordinal);
  }

  const modules = course.modules.filter((module) => moduleMatches(module, selector));

  if (modules.length === 0) {
    throw new Error(`Unknown module ${selector} in course ${course.id}.`);
  }

  if (modules.length > 1) {
    throw new Error(`Ambiguous module selector ${selector} in course ${course.id}.`);
  }

  return modules;
}

function selectedLanguages(language?: ArtifactLanguage): ArtifactLanguage[] {
  return language ? [language] : ['en', 'fr'];
}

export function resolveArtifactTargets(
  manifest: Manifest,
  selector: ArtifactTargetSelector = {},
): ResolvedArtifactTarget[] {
  const courses = selectedCourses(manifest, selector.course);

  if (selector.module && !selector.course) {
    throw new Error('--module requires exactly one --course selector.');
  }

  const targets: ResolvedArtifactTarget[] = [];

  for (const course of courses) {
    const modules = selectedModules(course, selector.module);

    for (const module of modules) {
      for (const language of selectedLanguages(selector.language)) {
        targets.push({
          course,
          module,
          language,
          sourcePath: toPosixPath(module.source[language]),
          key: [
            `course-${padOrdinal(course.ordinal)}`,
            `module-${padOrdinal(module.ordinal)}`,
            language,
          ].join('.'),
        });
      }
    }
  }

  return targets;
}
