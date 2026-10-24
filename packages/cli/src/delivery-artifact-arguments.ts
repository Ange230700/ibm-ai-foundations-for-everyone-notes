import {
  assertDeliveryCombination,
  type DeliveryOutputFormat,
  type DeliveryLanguage,
} from '@coursera-notes/artifacts';
import type { DeliveryProfile } from '@coursera-notes/manifest';

export type DeliveryArtifactCommand = 'plan' | 'build' | 'verify' | 'visual-qa';

export interface DeliveryArtifactArguments {
  command: DeliveryArtifactCommand;
  session?: string;
  language?: DeliveryLanguage;
  profile?: DeliveryProfile;
  format?: DeliveryOutputFormat;
  chunkLimit?: number;
}

const commands = new Set<DeliveryArtifactCommand>(['plan', 'build', 'verify', 'visual-qa']);
const allowedOptions = new Set(['--session', '--lang', '--profile', '--format', '--chunk-limit']);

function isDeliveryCommand(value: string | undefined): value is DeliveryArtifactCommand {
  return value !== undefined && commands.has(value as DeliveryArtifactCommand);
}

function optionValue(args: readonly string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  const matches = args.filter((arg) => arg.startsWith(prefix));
  if (matches.length > 1) throw new Error(`Duplicate delivery option: --${name}.`);
  return matches[0]?.slice(prefix.length);
}

function validateOptionSyntax(options: readonly string[]): void {
  for (const option of options) {
    const name = option.slice(0, option.indexOf('='));
    if (!option.includes('=') || !allowedOptions.has(name)) {
      throw new Error(`Unknown or malformed delivery option: ${option}.`);
    }
  }
}

interface ParsedOptions {
  session: string | undefined;
  language: string | undefined;
  profile: string | undefined;
  format: string | undefined;
  chunkLimit: string | undefined;
}

interface ValidatedOptions {
  session: string | undefined;
  language: DeliveryLanguage | undefined;
  profile: DeliveryProfile | undefined;
  format: DeliveryOutputFormat | undefined;
  chunkLimit: number | undefined;
}

function readOptions(options: readonly string[]): ParsedOptions {
  validateOptionSyntax(options);
  return {
    session: optionValue(options, 'session'),
    language: optionValue(options, 'lang'),
    profile: optionValue(options, 'profile'),
    format: optionValue(options, 'format'),
    chunkLimit: optionValue(options, 'chunk-limit'),
  };
}

function parseLanguage(value: string | undefined): DeliveryLanguage | undefined {
  if (value === undefined) return undefined;
  if (value !== 'en' && value !== 'fr') {
    throw new Error(`Unsupported language: ${value}. Expected en or fr.`);
  }
  return value;
}

function parseProfile(value: string | undefined): DeliveryProfile | undefined {
  if (value === undefined) return undefined;
  if (value !== 'document' && value !== 'reference' && value !== 'narration') {
    throw new Error(`Unsupported editorial profile: ${value}.`);
  }
  return value;
}

function parseFormat(value: string | undefined): DeliveryOutputFormat | undefined {
  if (value === undefined) return undefined;
  if (value !== 'pdf' && value !== 'pptx' && value !== 'txt') {
    throw new Error(`Unsupported output format: ${value}.`);
  }
  return value;
}

function validateOptions(
  command: DeliveryArtifactCommand,
  options: ParsedOptions,
): ValidatedOptions {
  const { session, language, profile, format, chunkLimit } = options;
  if (session !== undefined && !/^s\d{2}$/u.test(session)) {
    throw new Error(`Invalid session selector: ${session}.`);
  }
  const validatedLanguage = parseLanguage(language);
  const validatedProfile = parseProfile(profile);
  const validatedFormat = parseFormat(format);
  if (command !== 'plan' && validatedFormat === undefined) {
    throw new Error(`${command} requires --format=pdf or --format=txt.`);
  }
  if (command === 'visual-qa' && validatedFormat !== 'pdf') {
    throw new Error('visual-qa requires --format=pdf.');
  }
  if (
    chunkLimit !== undefined &&
    (!/^\d+$/u.test(chunkLimit) || Number(chunkLimit) < 1 || Number(chunkLimit) > 2400)
  ) {
    throw new Error('--chunk-limit must be a positive whole number no greater than 2400.');
  }
  if (validatedProfile && validatedFormat) {
    assertDeliveryCombination(validatedProfile, validatedFormat);
  }
  if (chunkLimit !== undefined && validatedProfile !== 'narration') {
    throw new Error('--chunk-limit is only valid for the narration profile.');
  }
  return {
    session,
    language: validatedLanguage,
    profile: validatedProfile,
    format: validatedFormat,
    chunkLimit: chunkLimit === undefined ? undefined : Number(chunkLimit),
  };
}

export function parseDeliveryArtifactArguments(args: readonly string[]): DeliveryArtifactArguments {
  const [commandValue, ...rawOptions] = args;
  if (!isDeliveryCommand(commandValue)) {
    throw new Error(
      'Usage: pnpm delivery:artifact plan|build|verify|visual-qa --profile=document|reference|narration [--format=pdf|txt] [--session=sNN] [--lang=en|fr] [--chunk-limit=2400]',
    );
  }
  const command = commandValue;
  const { session, language, profile, format, chunkLimit } = validateOptions(
    command,
    readOptions(rawOptions),
  );

  const result: DeliveryArtifactArguments = { command };
  if (session !== undefined) result.session = session;
  if (language !== undefined) result.language = language;
  if (profile !== undefined) result.profile = profile;
  if (format !== undefined) result.format = format;
  if (chunkLimit !== undefined) result.chunkLimit = chunkLimit;
  return result;
}
