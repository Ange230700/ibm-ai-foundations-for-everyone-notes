import { readManifest } from '@coursera-notes/manifest';

import {
  resolveArtifactTargets,
  type ArtifactLanguage,
  type ArtifactTargetSelector,
} from './artifact-target.js';

import { executePdfTarget } from './artifact-pdf.js';

import { executePptxTarget } from './artifact-pptx.js';

import { verifyArtifactTarget } from './artifact-verify.js';

import { executeVisualQaTarget } from './artifact-visual-qa.js';

type ArtifactCommand = 'plan' | 'pdf' | 'pptx' | 'verify' | 'visual-qa';

interface ParsedArtifactArguments {
  command: ArtifactCommand;
  selector: ArtifactTargetSelector;
  format?: 'pdf' | 'pptx';
  json: boolean;
}

const COMMANDS = new Set<ArtifactCommand>(['plan', 'pdf', 'pptx', 'verify', 'visual-qa']);

function usage(): string {
  return [
    'Usage:',
    '  pnpm artifact plan [--course=<ordinal|id>] [--module=<ordinal|id>] [--lang=en|fr] [--json]',
    '  pnpm artifact pdf --course=<ordinal|id> [--module=<ordinal|id>] [--lang=en|fr]',
    '  pnpm artifact pptx --course=<ordinal|id> [--module=<ordinal|id>] [--lang=en|fr]',
    '  pnpm artifact verify --format=pdf|pptx --course=<ordinal|id> [--module=<ordinal|id>] [--lang=en|fr]',
    '  pnpm artifact visual-qa --format=pdf|pptx --course=<ordinal|id> [--module=<ordinal|id>] [--lang=en|fr]',
  ].join('\n');
}

function optionValue(args: readonly string[], name: string): string | undefined {
  const prefix = `--${name}=`;

  const matches = args.filter((arg) => arg.startsWith(prefix));

  if (matches.length > 1) {
    throw new Error(`Duplicate option: --${name}`);
  }

  return matches[0]?.slice(prefix.length);
}

function validateOptions(options: readonly string[]): void {
  const flags = new Set(['--json', '--help']);

  for (const option of options) {
    const isValueOption =
      option.startsWith('--course=') ||
      option.startsWith('--module=') ||
      option.startsWith('--lang=') ||
      option.startsWith('--format=');

    if (!isValueOption && !flags.has(option)) {
      throw new Error(`Unknown artifact option: ${option}`);
    }
  }
}

function parseLanguage(options: readonly string[]): ArtifactLanguage | undefined {
  const value = optionValue(options, 'lang');

  if (value === undefined) {
    return undefined;
  }

  if (value !== 'en' && value !== 'fr') {
    throw new Error(`Unsupported language: ${value}. Expected en or fr.`);
  }

  return value;
}

function parseFormat(options: readonly string[]): 'pdf' | 'pptx' | undefined {
  const value = optionValue(options, 'format');

  if (value === undefined) {
    return undefined;
  }

  if (value !== 'pdf' && value !== 'pptx') {
    throw new Error(`Unsupported artifact format: ${value}. Expected pdf or pptx.`);
  }

  return value;
}

function validateFormatOption(command: ArtifactCommand, format: 'pdf' | 'pptx' | undefined): void {
  if ((command === 'verify' || command === 'visual-qa') && !format) {
    throw new Error(`${command} requires --format=pdf or --format=pptx.`);
  }

  if ((command === 'pdf' || command === 'pptx') && format) {
    throw new Error(`${command} does not accept --format; the command already selects the format.`);
  }
}

function parseSelector(
  options: readonly string[],
  language: ArtifactLanguage | undefined,
): ArtifactTargetSelector {
  const selector: ArtifactTargetSelector = {};
  const course = optionValue(options, 'course');
  const module = optionValue(options, 'module');

  if (course !== undefined) {
    selector.course = course;
  }

  if (module !== undefined) {
    selector.module = module;
  }

  if (language !== undefined) {
    selector.language = language;
  }

  return selector;
}

function parseArguments(argv: readonly string[]): ParsedArtifactArguments {
  const [commandValue, ...options] = argv;

  if (!commandValue || !COMMANDS.has(commandValue as ArtifactCommand)) {
    throw new Error(usage());
  }

  validateOptions(options);

  if (options.includes('--help')) {
    console.log(usage());
    process.exit(0);
  }

  const command = commandValue as ArtifactCommand;
  const language = parseLanguage(options);
  const format = parseFormat(options);

  validateFormatOption(command, format);

  const result: ParsedArtifactArguments = {
    command,
    selector: parseSelector(options, language),
    json: options.includes('--json'),
  };

  if (format !== undefined) {
    result.format = format;
  }

  return result;
}

const parsed = parseArguments(process.argv.slice(2));

const manifest = await readManifest();

const targets = resolveArtifactTargets(manifest, parsed.selector);

if (parsed.command === 'plan') {
  const payload = {
    command: parsed.command,
    format: parsed.format ?? null,
    targets: targets.map((target) => ({
      key: target.key,
      courseId: target.course.id,
      courseOrdinal: target.course.ordinal,
      moduleId: target.module.id,
      moduleOrdinal: target.module.ordinal,
      language: target.language,
      sourcePath: target.sourcePath,
    })),
  };

  if (parsed.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`Artifact plan: ${payload.targets.length} target(s)`);

    for (const target of payload.targets) {
      console.log(
        [
          '-',
          target.key,
          target.courseId,
          target.moduleId,
          target.language,
          target.sourcePath,
        ].join(' '),
      );
    }
  }
}

if (parsed.command === 'pdf') {
  if (targets.length === 0 && !parsed.json) {
    console.log('PDF artifacts: 0 target(s)');
  }

  const results = [];

  for (const target of targets) {
    const result = await executePdfTarget(target);

    results.push(result);

    if (!parsed.json) {
      console.log(
        [
          'WROTE',
          result.pdfPath,
          `sha256=${result.artifact.pdfSha256}`,
          `pages=${result.verification.pages}`,
          `blocks=${result.verification.blocks.matched}/${result.verification.blocks.expected}`,
        ].join(' '),
      );
    }
  }

  if (parsed.json) {
    console.log(
      JSON.stringify(
        {
          command: 'pdf',
          results: results.map((result) => ({
            targetKey: result.targetKey,
            pdfPath: result.pdfPath,
            artifactRecordPath: result.artifactRecordPath,
            verificationPath: result.verificationPath,
            pdfSha256: result.artifact.pdfSha256,
            pages: result.verification.pages,
            diagrams: result.verification.diagrams,
            blocks: result.verification.blocks,
          })),
        },
        null,
        2,
      ),
    );
  }
}

if (parsed.command === 'pptx') {
  if (targets.length === 0 && !parsed.json) {
    console.log('PPTX artifacts: 0 target(s)');
  }

  const results = [];

  /*
   * Generate targets sequentially. Mermaid rendering may
   * launch Chromium, and parallel module builds would add
   * avoidable browser and memory contention.
   */
  for (const target of targets) {
    const result = await executePptxTarget(target);

    results.push(result);

    if (!parsed.json) {
      console.log(
        [
          'WROTE',
          result.pptxPath,
          `sha256=${result.artifact.pptxSha256}`,
          `slides=${result.verification.slideCount}`,
        ].join(' '),
      );
    }
  }

  if (parsed.json) {
    console.log(
      JSON.stringify(
        {
          command: 'pptx',
          results: results.map((result) => ({
            targetKey: result.targetKey,
            pptxPath: result.pptxPath,
            artifactRecordPath: result.artifactRecordPath,
            verificationPath: result.verificationPath,
            pptxSha256: result.artifact.pptxSha256,
            deckSpecSha256: result.artifact.deckSpecSha256,
            slides: result.verification.slideCount,
          })),
        },
        null,
        2,
      ),
    );
  }
}

if (parsed.command === 'verify') {
  if (!parsed.format) {
    throw new Error('Artifact verification requires --format=pdf or --format=pptx.');
  }

  if (targets.length === 0 && !parsed.json) {
    console.log(`Verified ${parsed.format.toUpperCase()} artifacts: 0 target(s)`);
  }

  const results = [];

  for (const target of targets) {
    const result = await verifyArtifactTarget(target, parsed.format);

    results.push(result);

    if (!parsed.json) {
      if (result.format === 'pdf') {
        console.log(
          [
            'PASS',
            result.artifactPath,
            `sha256=${result.verification.pdfSha256}`,
            `pages=${result.verification.pages}`,
            `blocks=${result.verification.blocks.matched}/${result.verification.blocks.expected}`,
          ].join(' '),
        );
      } else {
        console.log(
          [
            'PASS',
            result.artifactPath,
            `sha256=${result.verification.pptxSha256}`,
            `slides=${result.verification.slideCount}`,
          ].join(' '),
        );
      }
    }
  }

  if (parsed.json) {
    console.log(
      JSON.stringify(
        {
          command: 'verify',
          format: parsed.format,
          results: results.map((result) =>
            result.format === 'pdf'
              ? {
                  targetKey: result.targetKey,
                  artifactPath: result.artifactPath,
                  verificationPath: result.verificationPath,
                  pdfSha256: result.verification.pdfSha256,
                  pages: result.verification.pages,
                  blocks: result.verification.blocks,
                }
              : {
                  targetKey: result.targetKey,
                  artifactPath: result.artifactPath,
                  verificationPath: result.verificationPath,
                  pptxSha256: result.verification.pptxSha256,
                  deckSpecSha256: result.verification.deckSpecSha256,
                  slides: result.verification.slideCount,
                },
          ),
        },
        null,
        2,
      ),
    );
  }
}

if (parsed.command === 'visual-qa') {
  if (!parsed.format) {
    throw new Error('Artifact visual QA requires --format=pdf or --format=pptx.');
  }

  if (targets.length === 0 && !parsed.json) {
    console.log(`Visual QA ${parsed.format.toUpperCase()}: 0 target(s)`);
  }

  const results = [];

  for (const target of targets) {
    const result = await executeVisualQaTarget(target, parsed.format);

    results.push(result);

    if (!parsed.json) {
      if (result.format === 'pdf') {
        console.log(
          [
            'WROTE',
            result.contactSheetManifestPath,
            `pages=${result.pageRender.pageCount}`,
            `sheets=${result.contactSheets.sheets.length}`,
          ].join(' '),
        );
      } else {
        console.log(
          [
            'WROTE',
            result.manifestPath,
            `slides=${result.manifest.pageRender.pageCount}`,
            `sheets=${result.manifest.contactSheets.sheets.length}`,
            `converter=${result.manifest.converter.version}`,
          ].join(' '),
        );
      }
    }
  }

  if (parsed.json) {
    console.log(
      JSON.stringify(
        {
          command: 'visual-qa',
          format: parsed.format,
          results: results.map((result) =>
            result.format === 'pdf'
              ? {
                  targetKey: result.targetKey,
                  artifactPath: result.artifactPath,
                  pageRenderManifestPath: result.pageRenderManifestPath,
                  contactSheetManifestPath: result.contactSheetManifestPath,
                  pdfSha256: result.pageRender.pdfSha256,
                  pages: result.pageRender.pageCount,
                  sheets: result.contactSheets.sheets.length,
                }
              : {
                  targetKey: result.targetKey,
                  artifactPath: result.artifactPath,
                  manifestPath: result.manifestPath,
                  pptxSha256: result.manifest.pptxSha256,
                  deckSpecSha256: result.manifest.deckSpecSha256,
                  slides: result.manifest.pageRender.pageCount,
                  sheets: result.manifest.contactSheets.sheets.length,
                  converter: result.manifest.converter,
                },
          ),
        },
        null,
        2,
      ),
    );
  }
}
