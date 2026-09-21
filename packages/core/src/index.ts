import { createHash, randomUUID } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortValue(item)]),
    );
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

export function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  const start = slug.startsWith('-') ? 1 : 0;
  const end = slug.endsWith('-') ? -1 : undefined;
  return slug.slice(start, end) || 'untitled';
}

export function prefixedId(prefix: 'program' | 'course' | 'module'): string {
  return `${prefix}_${randomUUID()}`;
}

export function padOrdinal(value: number): string {
  return String(value).padStart(2, '0');
}

export function repositoryRoot(): string {
  const override = process.env.COURSERA_NOTES_REPOSITORY_ROOT;

  return override ? resolve(override) : fileURLToPath(new URL('../../../', import.meta.url));
}

export async function atomicWrite(path: string, content: string | Uint8Array): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, path);
}

export function fromRoot(...parts: string[]): string {
  return resolve(repositoryRoot(), ...parts);
}

export function toPosixPath(path: string): string {
  return path.replaceAll('\\', '/');
}

export function occurrenceId(prefix: string, headingPath: string[], ordinal: number): string {
  const path = headingPath.map(slugify).join('/');
  return `${prefix}/${path}/${String(ordinal).padStart(2, '0')}`;
}
