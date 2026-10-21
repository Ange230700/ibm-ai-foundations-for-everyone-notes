export type TeachingLanguage = 'en' | 'fr';
export type DeliveryProfile = 'document' | 'reference' | 'narration';

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

export function deliveryVariantSourcePath(
  session: TeachingSessionPathIdentity,
  profile: DeliveryProfile,
  language: TeachingLanguage,
): string {
  return `teaching/sessions/${session.id}-${session.slug}/deliveries/${profile}/${language}.md`;
}
