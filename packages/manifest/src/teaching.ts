import type { Manifest, Module, TeachingSession } from './schema.js';
import type { DeliveryProfile, TeachingLanguage } from './teaching-path.js';

export interface ResolvedTeachingCanonicalModule {
  courseId: string;
  module: Module;
}

export interface ResolvedTeachingSessionSources {
  canonicalModuleIds: string[];
  en: string[];
  fr: string[];
}

export interface ResolvedDeliveryVariant {
  sourcePath: string;
  contentRelationship: 'adaptation' | 'translation';
  editorialStatus: 'draft' | 'reviewed';
  production?: {
    speakingRateWpm: number;
    pronunciationNotes: string[];
  };
  canonicalModules: Array<{
    moduleId: string;
    sourcePath: string;
  }>;
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

export function resolveDeliveryVariant(
  manifest: Manifest,
  session: TeachingSession,
  profile: DeliveryProfile,
  language: TeachingLanguage,
): ResolvedDeliveryVariant {
  const variant = session.deliveryVariants?.[profile]?.[language];
  if (!variant) {
    throw new Error(`Teaching session ${session.id} has no ${profile} variant for ${language}.`);
  }

  const canonicalModules = variant.canonicalModuleIds.map((moduleId) => {
    const matches = manifest.courses.flatMap((course) =>
      course.modules
        .filter((module) => module.id === moduleId)
        .map((module) => ({
          moduleId: module.id,
          sourcePath: module.source[language],
        })),
    );

    if (matches.length !== 1) {
      throw new Error(
        `Teaching session ${session.id}/${profile}/${language}: canonical module ${moduleId} resolved ${matches.length} times.`,
      );
    }

    return matches[0]!;
  });

  return {
    sourcePath: variant.source,
    contentRelationship: variant.contentRelationship,
    editorialStatus: variant.editorialStatus,
    ...(variant.production === undefined ? {} : { production: variant.production }),
    canonicalModules,
  };
}
