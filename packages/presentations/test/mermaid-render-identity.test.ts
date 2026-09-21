import assert from 'node:assert/strict';
import test from 'node:test';

import { mermaidRenderIdentity, type MermaidRenderContext } from '../src/index.js';

const diagram = {
  definition: `flowchart LR
    A[Input] --> B[Output]`,
};

const context: MermaidRenderContext = {
  cliVersion: '11.16.0',
  configuration: {
    securityLevel: 'strict',
    theme: 'base',
    htmlLabels: false,
    flowchart: {
      curve: 'linear',
      htmlLabels: false,
    },
  },
};

test('Mermaid render identity is deterministic', () => {
  const first = mermaidRenderIdentity(diagram, context);

  const second = mermaidRenderIdentity(diagram, context);

  assert.deepEqual(first, second);

  assert.equal(first.effectiveConfiguration.deterministicIds, true);

  assert.equal(first.effectiveConfiguration.deterministicIDSeed, first.seed);

  assert.match(first.seed, /^[a-f0-9]{64}$/);
  assert.match(first.renderHash, /^[a-f0-9]{64}$/);
});

test('Mermaid definition changes render identity', () => {
  const first = mermaidRenderIdentity(diagram, context);

  const second = mermaidRenderIdentity(
    {
      definition: `flowchart LR
    A[Input] --> C[Different output]`,
    },
    context,
  );

  assert.notEqual(first.renderHash, second.renderHash);
});

test('Mermaid configuration changes render identity', () => {
  const first = mermaidRenderIdentity(diagram, context);

  const second = mermaidRenderIdentity(diagram, {
    ...context,
    configuration: {
      ...context.configuration,
      theme: 'neutral',
    },
  });

  assert.notEqual(first.renderHash, second.renderHash);
});

test('Mermaid CLI version changes render identity', () => {
  const first = mermaidRenderIdentity(diagram, context);

  const second = mermaidRenderIdentity(diagram, {
    ...context,
    cliVersion: '99.0.0',
  });

  assert.notEqual(first.renderHash, second.renderHash);
});

test('renderer overrides external deterministic seed', () => {
  const result = mermaidRenderIdentity(diagram, {
    ...context,
    configuration: {
      ...context.configuration,
      deterministicIds: false,
      deterministicIDSeed: 'external-seed',
    },
  });

  assert.equal(result.effectiveConfiguration.deterministicIds, true);

  assert.equal(result.effectiveConfiguration.deterministicIDSeed, result.seed);

  assert.notEqual(result.effectiveConfiguration.deterministicIDSeed, 'external-seed');
});
