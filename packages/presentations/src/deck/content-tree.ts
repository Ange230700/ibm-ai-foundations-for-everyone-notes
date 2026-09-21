import type { ContentBlock, Section } from '../content/model.js';

function nestedBlocks(block: ContentBlock): ContentBlock[] {
  if (block.kind === 'blockquote') {
    return block.blocks;
  }

  if (block.kind === 'list') {
    return block.items.flatMap((item) => item.blocks ?? item.children.flatMap(nestedBlocks));
  }

  return [];
}

export function descendantBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.flatMap((block) => [block, ...descendantBlocks(nestedBlocks(block))]);
}

export function descendantSections(sections: Section[]): Section[] {
  return sections.flatMap((section) => [section, ...descendantSections(section.children)]);
}
