import { canonicalJson, sha256 } from '@coursera-notes/core';

import type { MermaidDiagram } from '../content/model.js';

export const MERMAID_RENDERER_VERSION = 1;

export const MERMAID_CLI_ARGUMENTS = {
  backgroundColor: 'transparent',
  outputFormat: 'svg',
  fallbackPngScale: 2,
} as const;

export interface MermaidRenderContext {
  cliVersion: string;
  configuration: Record<string, unknown>;
}

export interface MermaidRenderIdentity {
  seed: string;
  renderHash: string;
  effectiveConfiguration: Record<string, unknown>;
}

export function mermaidRenderIdentity(
  diagram: Pick<MermaidDiagram, 'definition'>,
  context: MermaidRenderContext,
): MermaidRenderIdentity {
  const seed = sha256(
    canonicalJson({
      definition: diagram.definition,
      configuration: context.configuration,
      cli: {
        name: '@mermaid-js/mermaid-cli',
        version: context.cliVersion,
      },
      cliArguments: MERMAID_CLI_ARGUMENTS,
      rendererVersion: MERMAID_RENDERER_VERSION,
    }),
  );

  const effectiveConfiguration = {
    ...context.configuration,
    deterministicIds: true,
    deterministicIDSeed: seed,
  };

  const renderHash = sha256(
    canonicalJson({
      definition: diagram.definition,
      configuration: effectiveConfiguration,
      cli: {
        name: '@mermaid-js/mermaid-cli',
        version: context.cliVersion,
      },
      cliArguments: MERMAID_CLI_ARGUMENTS,
      rendererVersion: MERMAID_RENDERER_VERSION,
    }),
  );

  return {
    seed,
    renderHash,
    effectiveConfiguration,
  };
}
