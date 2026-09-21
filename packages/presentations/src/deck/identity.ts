import { canonicalJson, sha256 } from '@coursera-notes/core';

import type { DeckSpec } from './model.js';

export function serializeDeckSpec(spec: DeckSpec): string {
  return canonicalJson(spec);
}

export function deckSpecSha256(spec: DeckSpec): string {
  return sha256(serializeDeckSpec(spec));
}
