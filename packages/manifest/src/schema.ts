import * as z from 'zod';

const prefixedUuid = (prefix: string) =>
  z
    .string()
    .regex(
      new RegExp(
        `^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`,
        'i',
      ),
    );

export const LanguageSchema = z.enum(['en', 'fr']);
export const CourseStateSchema = z.enum([
  'planned',
  'notes-in-progress',
  'notes-complete',
  'teaching-ready',
  'artifacts-generated',
  'visually-verified',
  'released',
  'archived',
]);

export const ModuleSchema = z.strictObject({
  id: prefixedUuid('module'),
  ordinal: z.int().positive(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.strictObject({
    en: z.string().min(1),
    fr: z.string().min(1),
  }),
  source: z.strictObject({
    en: z.string().min(1),
    fr: z.string().min(1),
  }),
});

export const CourseSchema = z.strictObject({
  id: prefixedUuid('course'),
  ordinal: z.int().positive(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.strictObject({
    en: z.string().min(1),
    fr: z.string().min(1),
  }),
  status: CourseStateSchema,
  modules: z.array(ModuleSchema),
});

const ManifestObjectSchema = z.strictObject({
  schemaVersion: z.literal(1),
  templateVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  repository: z.strictObject({
    status: z.enum(['template', 'configured']),
  }),
  program: z.strictObject({
    id: z.union([prefixedUuid('program'), z.null()]),
    provider: z.string().min(1),
    platform: z.literal('Coursera'),
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    languages: z.tuple([z.literal('en'), z.literal('fr')]),
    license: z.strictObject({
      spdx: z.literal('MIT'),
      holder: z.union([z.string().min(1), z.null()]),
      initialYear: z.union([z.int().min(2000).max(2200), z.null()]),
    }),
  }),
  courses: z.array(CourseSchema),
  artifacts: z.strictObject({
    generatedOnDemand: z.literal(true),
    formats: z.tuple([z.literal('txt'), z.literal('pdf'), z.literal('pptx')]),
  }),
  validation: z.strictObject({
    taskAware: z.literal(true),
    canonicalLanguages: z.tuple([z.literal('en'), z.literal('fr')]),
  }),
  designSystem: z.strictObject({
    tokens: z.string().min(1),
    typography: z.string().min(1),
    layouts: z.string().min(1),
  }),
});

type ManifestInput = z.infer<typeof ManifestObjectSchema>;
type CourseInput = ManifestInput['courses'][number];
type UniqueValue = number | string;

interface ManifestValidationIssue {
  path: Array<string | number>;
  message: string;
}

interface UniqueCheck {
  value: UniqueValue;
  label: string;
  seen: Set<UniqueValue>;
}

function duplicateIssues(
  checks: readonly UniqueCheck[],
  path: Array<string | number>,
  entity: 'course' | 'module',
): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];

  for (const { value, label, seen } of checks) {
    if (seen.has(value)) {
      issues.push({
        path: [...path, label],
        message: `Duplicate ${entity} ${label}: ${String(value)}`,
      });
    }

    seen.add(value);
  }

  return issues;
}

function moduleUniquenessIssues(
  course: CourseInput,
  courseIndex: number,
): ManifestValidationIssue[] {
  const seenOrdinals = new Set<UniqueValue>();
  const seenIds = new Set<UniqueValue>();
  const seenSlugs = new Set<UniqueValue>();

  return course.modules.flatMap((module, moduleIndex) =>
    duplicateIssues(
      [
        { value: module.ordinal, label: 'ordinal', seen: seenOrdinals },
        { value: module.id, label: 'id', seen: seenIds },
        { value: module.slug, label: 'slug', seen: seenSlugs },
      ],
      ['courses', courseIndex, 'modules', moduleIndex],
      'module',
    ),
  );
}

function uniquenessIssues(manifest: ManifestInput): ManifestValidationIssue[] {
  const seenOrdinals = new Set<UniqueValue>();
  const seenIds = new Set<UniqueValue>();
  const seenSlugs = new Set<UniqueValue>();

  return manifest.courses.flatMap((course, courseIndex) => [
    ...duplicateIssues(
      [
        { value: course.ordinal, label: 'ordinal', seen: seenOrdinals },
        { value: course.id, label: 'id', seen: seenIds },
        { value: course.slug, label: 'slug', seen: seenSlugs },
      ],
      ['courses', courseIndex],
      'course',
    ),
    ...moduleUniquenessIssues(course, courseIndex),
  ]);
}

function configuredRepositoryIssues(manifest: ManifestInput): ManifestValidationIssue[] {
  if (manifest.repository.status !== 'configured') {
    return [];
  }

  const issues: ManifestValidationIssue[] = [];

  if (manifest.program.id === null) {
    issues.push({
      path: ['program', 'id'],
      message: 'Configured repository requires a program id.',
    });
  }

  if (manifest.program.license.holder === null || manifest.program.license.initialYear === null) {
    issues.push({
      path: ['program', 'license'],
      message: 'Configured repository requires MIT holder and initial year.',
    });
  }

  return issues;
}

export const ManifestSchema = ManifestObjectSchema.superRefine((manifest, context) => {
  const issues = [...uniquenessIssues(manifest), ...configuredRepositoryIssues(manifest)];

  for (const issue of issues) {
    context.addIssue({
      code: 'custom',
      path: issue.path,
      message: issue.message,
    });
  }
});

export type Manifest = z.infer<typeof ManifestSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Module = z.infer<typeof ModuleSchema>;

export function manifestJsonSchema(): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: './manifest.schema.json',
    title: 'Coursera Program Notes Manifest',
    ...z.toJSONSchema(ManifestSchema, { target: 'draft-2020-12' }),
  };
}
