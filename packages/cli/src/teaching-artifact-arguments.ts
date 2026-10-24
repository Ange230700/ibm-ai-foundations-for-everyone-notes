export type TeachingArtifactFormat = 'pdf' | 'pptx' | 'txt';
export type TeachingArtifactLanguage = 'en' | 'fr';

export interface TeachingArtifactArguments {
  command: 'plan' | 'build' | 'verify' | 'visual-qa' | 'animate';
  session?: string;
  language?: TeachingArtifactLanguage;
  format?: TeachingArtifactFormat;
}

type TeachingCommand = TeachingArtifactArguments['command'];

function isTeachingCommand(value: string | undefined): value is TeachingCommand {
  return (
    value === 'plan' ||
    value === 'build' ||
    value === 'verify' ||
    value === 'visual-qa' ||
    value === 'animate'
  );
}

function assignOption(
  result: TeachingArtifactArguments,
  key: string | undefined,
  value: string,
  option: string,
): void {
  if (key === '--session' && !result.session && /^s\d{2}$/u.test(value)) {
    result.session = value;
  } else if (key === '--lang' && !result.language && (value === 'en' || value === 'fr')) {
    result.language = value;
  } else if (
    key === '--format' &&
    !result.format &&
    (value === 'pdf' || value === 'pptx' || value === 'txt')
  ) {
    result.format = value;
  } else {
    throw new Error(`Unknown or duplicate teaching option: ${option}.`);
  }
}

function validateCommandOptions(result: TeachingArtifactArguments): void {
  if (result.command === 'visual-qa' && result.format === 'txt') {
    throw new Error('Visual QA supports PDF or PPTX, not TXT.');
  }
  if (result.command === 'animate' && result.format && result.format !== 'pptx') {
    throw new Error('Native animations currently support S01/S02/S03/S04/S05/S06/S07 PPTX only.');
  }
}

export function parseTeachingArtifactArguments(args: readonly string[]): TeachingArtifactArguments {
  const [command, ...options] = args;
  if (!isTeachingCommand(command)) {
    throw new Error(
      'Usage: pnpm teaching:artifact plan|build|verify|visual-qa|animate [--session=sNN] [--lang=en|fr] [--format=pdf|pptx|txt]',
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
    assignOption(result, key, value, option);
  }

  validateCommandOptions(result);
  return result;
}
