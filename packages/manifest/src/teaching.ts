import type { Manifest, Module, TeachingSession } from './schema.js';

export interface ResolvedTeachingCanonicalModule {
  courseId: string;
  module: Module;
}

export interface ResolvedTeachingSessionSources {
  canonicalModuleIds: string[];
  en: string[];
  fr: string[];
}

export function resolveTeachingSessionModules(
  manifest: Manifest,
  session: TeachingSession,
): ResolvedTeachingCanonicalModule[] {
  return session.canonicalModuleIds.map((moduleId) => {
    const matches = manifest.courses.flatMap((course) =>
      course.modules
        .filter((module) => module.id === moduleId)
        .map((module) => ({
          courseId: course.id,
          module,
        })),
    );

    if (matches.length !== 1) {
      throw new Error(
        `Teaching session ${session.id}: canonical module ${moduleId} resolved ${matches.length} times.`,
      );
    }

    return matches[0]!;
  });
}

export function resolveTeachingSessionSources(
  manifest: Manifest,
  session: TeachingSession,
): ResolvedTeachingSessionSources {
  const modules = resolveTeachingSessionModules(manifest, session);

  return {
    canonicalModuleIds: modules.map(({ module }) => module.id),
    en: modules.map(({ module }) => module.source.en),
    fr: modules.map(({ module }) => module.source.fr),
  };
}
