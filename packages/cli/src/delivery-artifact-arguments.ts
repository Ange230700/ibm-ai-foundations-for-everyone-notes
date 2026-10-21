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

function optionValue(args: readonly string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  const matches = args.filter((arg) => arg.startsWith(prefix));
  if (matches.length > 1) throw new Error(`Duplicate delivery option: --${name}.`);
  return matches[0]?.slice(prefix.length);
}

export function parseDeliveryArtifactArguments(args: readonly string[]): DeliveryArtifactArguments {
  const [commandValue, ...options] = args;
  if (!commandValue || !commands.has(commandValue as DeliveryArtifactCommand)) {
    throw new Error(
      'Usage: pnpm delivery:artifact plan|build|verify|visual-qa --profile=document|reference|narration [--format=pdf|txt] [--session=sNN] [--lang=en|fr] [--chunk-limit=2400]',
    );
  }
  const command = commandValue as DeliveryArtifactCommand;
  const allowedOptions = new Set(['--session', '--lang', '--profile', '--format', '--chunk-limit']);
  for (const option of options) {
    const name = option.slice(0, option.indexOf('='));
    if (!option.includes('=') || !allowedOptions.has(name)) {
      throw new Error(`Unknown or malformed delivery option: ${option}.`);
    }
  }

  const session = optionValue(options, 'session');
  const language = optionValue(options, 'lang');
  const profile = optionValue(options, 'profile');
  const format = optionValue(options, 'format');
  const chunkLimit = optionValue(options, 'chunk-limit');

  if (session !== undefined && !/^s\d{2}$/u.test(session)) {
    throw new Error(`Invalid session selector: ${session}.`);
  }
  if (language !== undefined && language !== 'en' && language !== 'fr') {
    throw new Error(`Unsupported language: ${language}. Expected en or fr.`);
  }
  if (
    profile !== undefined &&
    profile !== 'document' &&
    profile !== 'reference' &&
    profile !== 'narration'
  ) {
    throw new Error(`Unsupported editorial profile: ${profile}.`);
  }
  if (format !== undefined && format !== 'pdf' && format !== 'pptx' && format !== 'txt') {
    throw new Error(`Unsupported output format: ${format}.`);
  }
  if (command !== 'plan' && format === undefined) {
    throw new Error(`${command} requires --format=pdf or --format=txt.`);
  }
  if (command === 'visual-qa' && format !== 'pdf') {
    throw new Error('visual-qa requires --format=pdf.');
  }
  if (
    chunkLimit !== undefined &&
    (!/^\d+$/u.test(chunkLimit) || Number(chunkLimit) < 1 || Number(chunkLimit) > 2400)
  ) {
    throw new Error('--chunk-limit must be a positive whole number no greater than 2400.');
  }
  if (profile && format) {
    assertDeliveryCombination(profile, format as DeliveryOutputFormat);
  }
  if (chunkLimit !== undefined && profile !== 'narration') {
    throw new Error('--chunk-limit is only valid for the narration profile.');
  }

  const result: DeliveryArtifactArguments = { command };
  if (session !== undefined) result.session = session;
  if (language !== undefined) result.language = language as DeliveryLanguage;
  if (profile !== undefined) result.profile = profile;
  if (format !== undefined) result.format = format as DeliveryOutputFormat;
  if (chunkLimit !== undefined) result.chunkLimit = Number(chunkLimit);
  return result;
}
