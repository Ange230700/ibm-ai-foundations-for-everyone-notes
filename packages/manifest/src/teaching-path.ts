export type TeachingLanguage = 'en' | 'fr';

export interface TeachingSessionPathIdentity {
  id: string;
  slug: string;
}

export function teachingSessionSourcePath(
  session: TeachingSessionPathIdentity,
  language: TeachingLanguage,
): string {
  return `teaching/sessions/${session.id}-${session.slug}/${language}/session.md`;
}
