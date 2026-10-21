import type { Nodes, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

import { sha256 } from '@coursera-notes/core';

import { renderMarkdownText, validatePlainText } from './render-markdown-text.js';

export type EditorialProfile = 'presentation' | 'document' | 'reference' | 'narration';
export type DeliveryOutputFormat = 'pdf' | 'pptx' | 'txt';
export type DeliveryLanguage = 'en' | 'fr';

const allowedFormats: Record<EditorialProfile, readonly DeliveryOutputFormat[]> = {
  presentation: ['pptx', 'pdf', 'txt'],
  document: ['pdf', 'txt'],
  reference: ['txt', 'pdf'],
  narration: ['txt'],
};

export function supportedDeliveryFormats(
  profile: EditorialProfile,
): readonly DeliveryOutputFormat[] {
  return allowedFormats[profile];
}

export function assertDeliveryCombination(
  profile: EditorialProfile,
  format: DeliveryOutputFormat,
): void {
  if (!allowedFormats[profile].includes(format)) {
    throw new Error(
      `Unsupported delivery combination ${profile}/${format}. Supported formats: ${allowedFormats[profile].join(', ')}.`,
    );
  }
}

function parseMarkdown(markdown: string): Root {
  return fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
}

function textContent(node: Nodes): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return ' ';
  return 'children' in node ? node.children.map(textContent).join('') : '';
}

function hasLink(node: Nodes): boolean {
  if (node.type === 'link' || node.type === 'linkReference') return true;
  return 'children' in node && node.children.some(hasLink);
}

export function validateDeliveryMarkdown(profile: EditorialProfile, markdown: string): string[] {
  const errors: string[] = [];
  let root: Root;

  try {
    root = parseMarkdown(markdown);
    const text = renderMarkdownText(markdown, {
      includeLinkDestinations: profile !== 'narration',
      documentCodeLabels: true,
      documentTableText: true,
      language: 'en',
    });
    errors.push(...validatePlainText(Buffer.from(text, 'utf8')));
  } catch (error) {
    return [String(error)];
  }

  const headings = root.children.filter((node) => node.type === 'heading');
  if (
    profile !== 'narration' &&
    (root.children[0]?.type !== 'heading' || root.children[0].depth !== 1)
  ) {
    errors.push(`${profile} source must begin with a level-one title heading.`);
  }

  if (profile === 'document' && headings.filter((node) => node.depth === 2).length < 2) {
    errors.push('Document source must use at least two level-two section headings.');
  }

  if (profile === 'reference' && headings.length < 2) {
    errors.push('Reference source must include a title and at least one lookup heading.');
  }

  if (profile === 'narration') {
    const paragraphs = root.children.filter((node) => node.type === 'paragraph');
    const hasNonSpokenBlocks = root.children.some((node) => node.type !== 'paragraph');

    if (hasNonSpokenBlocks) {
      errors.push(
        'Narration source must contain spoken paragraphs only; keep production metadata in the manifest.',
      );
    }
    if (paragraphs.length < 2) {
      errors.push('Narration source must contain at least two spoken paragraphs.');
    }
    if (root.children.some(hasLink)) {
      errors.push('Narration source must not contain links or raw URLs.');
    }

    const spokenText = root.children.map(textContent).join(' ');
    if (/https?:\/\/|www\./iu.test(spokenText)) {
      errors.push('Narration source must not speak raw URLs.');
    }
    if (/\bas you can see\b|\bsee the slide\b|\bshown on this slide\b/iu.test(spokenText)) {
      errors.push(
        'Narration must explain essential visual information without referring to a slide.',
      );
    }
  }

  return [...new Set(errors)];
}

export function renderDeliveryText(
  markdown: string,
  profile: Exclude<EditorialProfile, 'presentation'>,
  language: DeliveryLanguage,
): string {
  const errors = validateDeliveryMarkdown(profile, markdown);
  if (errors.length) throw new Error(errors.join('\n'));

  const text = renderMarkdownText(markdown, {
    includeLinkDestinations: profile !== 'narration',
    documentCodeLabels: true,
    documentTableText: true,
    language,
  });
  return text;
}

export interface NarrationChunk {
  id: string;
  sequence: number;
  text: string;
  characters: number;
  words: number;
  sha256: string;
}

function characterCount(value: string): number {
  return Array.from(value).length;
}

function splitOversizedParagraph(paragraph: string, limit: number): string[] {
  const sentences = paragraph.split(/(?<=[.!?…])\s+/u).filter(Boolean);
  const fragments: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (characterCount(sentence) > limit) {
      throw new Error(
        `Narration sentence exceeds the ${limit}-character chunk limit and needs editorial splitting.`,
      );
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (characterCount(candidate) > limit) {
      if (current) fragments.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) fragments.push(current);
  return fragments;
}

export function buildNarrationChunks(
  sessionId: string,
  language: DeliveryLanguage,
  spokenText: string,
  maximumCharacters = 2400,
): NarrationChunk[] {
  if (!Number.isSafeInteger(maximumCharacters) || maximumCharacters < 1) {
    throw new Error('Narration chunk limit must be a positive safe integer.');
  }

  const paragraphs = spokenText
    .trim()
    .split(/\n{2,}/u)
    .map((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => line.trim())
        .join(' ')
        .trim(),
    )
    .filter(Boolean);
  const segments = paragraphs.flatMap((paragraph) =>
    characterCount(paragraph) > maximumCharacters
      ? splitOversizedParagraph(paragraph, maximumCharacters)
      : [paragraph],
  );

  const texts: string[] = [];
  let current = '';
  for (const segment of segments) {
    const candidate = current ? `${current}\n\n${segment}` : segment;
    if (characterCount(candidate) > maximumCharacters) {
      if (current) texts.push(current);
      current = segment;
    } else {
      current = candidate;
    }
  }
  if (current) texts.push(current);

  const seenIds = new Map<string, number>();
  return texts.map((text, index) => {
    const digest = sha256(text);
    const baseId = `${sessionId}.${language}.narration.${digest.slice(0, 12)}`;
    const occurrence = (seenIds.get(baseId) ?? 0) + 1;
    seenIds.set(baseId, occurrence);

    return {
      id: occurrence === 1 ? baseId : `${baseId}.${occurrence}`,
      sequence: index + 1,
      text,
      characters: characterCount(text),
      words: text.split(/\s+/u).filter(Boolean).length,
      sha256: digest,
    };
  });
}

export function estimateNarrationDuration(
  chunks: readonly NarrationChunk[],
  speakingRateWpm: number,
): { words: number; speakingRateWpm: number; estimatedSeconds: number } {
  if (!Number.isSafeInteger(speakingRateWpm) || speakingRateWpm <= 0) {
    throw new Error('Narration speaking rate must be a positive whole number of words per minute.');
  }

  const words = chunks.reduce((total, chunk) => total + chunk.words, 0);
  return {
    words,
    speakingRateWpm,
    estimatedSeconds: Math.ceil((words / speakingRateWpm) * 60),
  };
}

export function renderSpokenParagraphs(markdown: string): string[] {
  const root = parseMarkdown(markdown);
  if (root.children.some((node) => node.type !== 'paragraph')) {
    throw new Error(
      'Narration source must contain spoken paragraphs only; production metadata is not spoken.',
    );
  }
  return root.children
    .map((paragraph) => textContent(paragraph).replace(/\s+/gu, ' ').trim())
    .filter(Boolean);
}
