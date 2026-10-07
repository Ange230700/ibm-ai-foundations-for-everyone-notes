export type TeachingArtifactFormat = 'pdf' | 'pptx';
export type TeachingArtifactLanguage = 'en' | 'fr';

export interface TeachingArtifactArguments {
  command: 'plan' | 'build' | 'verify' | 'visual-qa' | 'animate';
  session?: string;
  language?: TeachingArtifactLanguage;
  format?: TeachingArtifactFormat;
}

export function parseTeachingArtifactArguments(args: readonly string[]): TeachingArtifactArguments {
  const [command, ...options] = args;

  if (
    command !== 'plan' &&
    command !== 'build' &&
    command !== 'verify' &&
    command !== 'visual-qa' &&
    command !== 'animate'
  ) {
    throw new Error(
      'Usage: pnpm teaching:artifact plan|build|verify|visual-qa|animate [--session=sNN] [--lang=en|fr] [--format=pdf|pptx]',
    );
  }

  const result: TeachingArtifactArguments = {
    command,
  };

  for (const option of options) {
    const [key, value, extra] = option.split('=');

    if (!value || extra) {
      throw new Error(`Invalid teaching option: ${option}.`);
    }

    if (key === '--session' && !result.session && /^s\d{2}$/u.test(value)) {
      result.session = value;
    } else if (key === '--lang' && !result.language && (value === 'en' || value === 'fr')) {
      result.language = value;
    } else if (key === '--format' && !result.format && (value === 'pdf' || value === 'pptx')) {
      result.format = value;
    } else {
      throw new Error(`Unknown or duplicate teaching option: ${option}.`);
    }
  }

  return result;
}
