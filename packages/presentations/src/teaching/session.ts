import type { Nodes, Root, Table } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

import { canonicalJson, sha256 } from '@coursera-notes/core';

import type { DeckSpec, SlideSpec } from '../deck/model.js';
import { DEFAULT_NATIVE_PPTX_THEME } from '../pptx/theme.js';

export interface TeachingSlide {
  id: string;
  title: string;
  durationMinutes: number;
  role?: 'course-title' | 'course-objectives';
  items: string[];
  itemKinds: Array<'plain' | 'bullet' | 'ordered'>;
  table?: { headers: string[]; rows: string[][] };
  notes: string;
  startLine: number;
  endLine: number;
}

export interface TeachingSessionContent {
  id: string;
  courseId: string;
  language: 'en' | 'fr';
  title: string;
  sourcePath: string;
  sourceSha256: string;
  slides: TeachingSlide[];
  durationMinutes: number;
  contentSha256: string;
}

export interface TeachingSourceOptions {
  id: string;
  courseId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  slideCount: number;
  durationMinutes: number;
  canonicalSources: string[];
}

function plainText(node: Nodes): string {
  if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') return node.value;
  if (node.type === 'image' || node.type === 'imageReference') return node.alt ?? '';
  if (node.type === 'break') return ' ';
  return 'children' in node ? node.children.map(plainText).join('') : '';
}

function normalize(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

function slideContent(
  nodes: Nodes[],
  label: string,
): Pick<TeachingSlide, 'items' | 'itemKinds' | 'table'> {
  const items: string[] = [];
  const itemKinds: TeachingSlide['itemKinds'] = [];
  let table: TeachingSlide['table'];

  for (const node of nodes) {
    if (node.type === 'paragraph') {
      items.push(normalize(plainText(node)));
      itemKinds.push('plain');
    } else if (node.type === 'list') {
      items.push(...node.children.map((item) => normalize(plainText(item))));
      itemKinds.push(
        ...node.children.map(() => (node.ordered ? ('ordered' as const) : ('bullet' as const))),
      );
    } else if (node.type === 'table' && !table) {
      const rows = (node as Table).children.map((row) =>
        row.children.map((cell) => normalize(plainText(cell))),
      );
      const [headers, ...body] = rows;
      if (!headers || body.length === 0 || body.some((row) => row.length !== headers.length)) {
        throw new Error(`${label}: invalid projected table.`);
      }
      table = { headers, rows: body };
    } else {
      throw new Error(`${label}: unsupported projected ${node.type}.`);
    }
  }

  if ((items.length === 0 && !table) || items.some((item) => !item) || items.length > 8) {
    throw new Error(`${label}: projected content must contain 1 to 8 non-empty items or a table.`);
  }
  if (table && items.length > 0) {
    throw new Error(`${label}: projected tables cannot contain additional paragraphs or lists.`);
  }
  return { items, itemKinds, ...(table ? { table } : {}) };
}

function slideNodes(root: Root, index: number): Nodes[] {
  const start = root.children[index];
  if (!start) throw new Error('Missing slide heading.');
  let end = index + 1;
  while (end < root.children.length) {
    const node = root.children[end];
    if (node?.type === 'heading' && node.depth <= 2) break;
    end += 1;
  }
  return root.children.slice(index + 1, end);
}

function segment(nodes: Nodes[], heading: string): Nodes[] {
  const index = nodes.findIndex(
    (node) => node.type === 'heading' && node.depth === 3 && plainText(node) === heading,
  );
  if (index < 0) throw new Error(`Missing teaching section: ${heading}.`);
  let end = index + 1;
  while (end < nodes.length && nodes[end]?.type !== 'heading') end += 1;
  return nodes.slice(index + 1, end);
}

function parseSlide(
  nodes: Nodes[],
  heading: Nodes,
  lines: string[],
  language: 'en' | 'fr',
  sessionId: string,
): TeachingSlide {
  const headingText = plainText(heading);
  const match = headingText.match(/^(?:Slide|Diapositive)\s+(\d{2})\s+—\s+(.+)$/u);
  if (!match) throw new Error(`Invalid teaching slide heading: ${headingText}.`);
  const [, ordinal, title] = match;
  if (!ordinal || !title) throw new Error(`Incomplete slide heading: ${headingText}.`);
  const label = `${sessionId.toUpperCase()}-${ordinal}`;
  const metadata = nodes
    .filter((node) => node.type !== 'heading')
    .slice(0, 1)
    .map(plainText)
    .join(' ');
  const id = metadata.match(/(?:Identifier|Identifiant)\s*:\s*(S\d{2}-\d{2})/iu)?.[1];
  const duration = Number(metadata.match(/(?:Duration|Durée)\s*:\s*(\d+)\s*minute/iu)?.[1]);
  if (id !== label || !Number.isInteger(duration) || duration < 1) {
    throw new Error(`${label}: missing or inconsistent identifier/duration.`);
  }

  const labels =
    language === 'en'
      ? { content: 'On-Slide Content', notes: 'Teaching Notes', role: 'Slide Role' }
      : {
          content: 'Contenu de la diapositive',
          notes: 'Notes pédagogiques',
          role: 'Rôle de la diapositive',
        };
  const projected = slideContent(segment(nodes, labels.content), label);
  const noteNodes = segment(nodes, labels.notes);
  if (noteNodes.length === 0 || noteNodes.some((node) => !node.position)) {
    throw new Error(`${label}: missing teaching notes.`);
  }
  const first = noteNodes[0]?.position?.start.line;
  const last = noteNodes.at(-1)?.position?.end.line;
  const notes =
    first && last
      ? lines
          .slice(first - 1, last)
          .join('\n')
          .trim()
      : '';
  if (!notes) throw new Error(`${label}: empty teaching notes.`);
  const roleHeading = nodes.some(
    (node) => node.type === 'heading' && node.depth === 3 && plainText(node) === labels.role,
  );
  const roleValue = roleHeading
    ? normalize(segment(nodes, labels.role).map(plainText).join(' '))
    : undefined;
  if (roleValue && roleValue !== 'course-title' && roleValue !== 'course-objectives') {
    throw new Error(`${label}: unsupported slide role ${roleValue}.`);
  }
  const role = roleValue as TeachingSlide['role'];

  return {
    id: label,
    title,
    durationMinutes: duration,
    ...projected,
    notes,
    ...(role ? { role } : {}),
    startLine: heading.position?.start.line ?? 0,
    endLine: nodes.at(-1)?.position?.end.line ?? 0,
  };
}

export function parseTeachingSession(
  markdown: string,
  options: TeachingSourceOptions,
): TeachingSessionContent {
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const title = root.children[0];
  if (
    title?.type !== 'heading' ||
    title.depth !== 1 ||
    !plainText(title).startsWith(options.id.toUpperCase())
  ) {
    throw new Error(`${options.sourcePath}: invalid session heading.`);
  }
  for (const source of options.canonicalSources) {
    if (!markdown.includes(`\`${source}\``)) {
      throw new Error(`${options.sourcePath}: canonical source missing: ${source}.`);
    }
  }
  const lines = markdown.split(/\r?\n/u);
  const slides = root.children.flatMap((node, index) => {
    if (
      node.type !== 'heading' ||
      node.depth !== 2 ||
      !/^(?:Slide|Diapositive)\s+\d{2}\s+—/u.test(plainText(node))
    ) {
      return [];
    }
    return [parseSlide(slideNodes(root, index), node, lines, options.language, options.id)];
  });
  if (slides.length !== options.slideCount) {
    throw new Error(
      `${options.sourcePath}: expected ${options.slideCount} slides; found ${slides.length}.`,
    );
  }
  slides.forEach((slide, index) => {
    const expected = `${options.id.toUpperCase()}-${String(index + 1).padStart(2, '0')}`;
    if (
      slide.id !== expected ||
      (index === 0 && slide.role !== 'course-title') ||
      (index === 1 && slide.role !== 'course-objectives') ||
      (index > 1 && slide.role)
    ) {
      throw new Error(`${options.sourcePath}: slide identity/role mismatch at ${index + 1}.`);
    }
  });
  const durationMinutes = slides.reduce((total, slide) => total + slide.durationMinutes, 0);
  if (durationMinutes !== options.durationMinutes) {
    throw new Error(
      `${options.sourcePath}: expected ${options.durationMinutes} minutes; found ${durationMinutes}.`,
    );
  }
  const identity = {
    id: options.id,
    courseId: options.courseId,
    language: options.language,
    title: plainText(title),
    sourcePath: options.sourcePath,
    sourceSha256: sha256(markdown),
    slides,
    durationMinutes,
  };
  return { ...identity, contentSha256: sha256(canonicalJson(identity)) };
}

export function validateTeachingPair(en: TeachingSessionContent, fr: TeachingSessionContent): void {
  if (
    en.language !== 'en' ||
    fr.language !== 'fr' ||
    en.id !== fr.id ||
    en.courseId !== fr.courseId ||
    en.slides.length !== fr.slides.length ||
    en.durationMinutes !== fr.durationMinutes
  ) {
    throw new Error('English and French teaching sessions do not align.');
  }
  en.slides.forEach((slide, index) => {
    const other = fr.slides[index];
    if (
      !other ||
      slide.id !== other.id ||
      slide.durationMinutes !== other.durationMinutes ||
      slide.role !== other.role ||
      slide.items.length !== other.items.length ||
      slide.itemKinds.join(',') !== other.itemKinds.join(',') ||
      (slide.table?.headers.length ?? 0) !== (other.table?.headers.length ?? 0) ||
      (slide.table?.rows.length ?? 0) !== (other.table?.rows.length ?? 0)
    ) {
      throw new Error(`Teaching sessions diverge at slide ${slide.id}.`);
    }
  });
}

export function teachingDeckSpec(content: TeachingSessionContent): DeckSpec {
  const visualSlides: Record<
    string,
    {
      kind: 'mermaid' | 'simulation';
      en: string;
      fr: string;
      name: string;
      frCapture?: { name: string; caption: string };
    }
  > = {
    'S01-08': {
      kind: 'mermaid',
      en: 'Coexisting AI approaches',
      fr: 'Approches d’IA complémentaires',
      name: 'evolution',
    },
    'S01-10': {
      kind: 'mermaid',
      en: 'Learning methods',
      fr: 'Modes d’apprentissage',
      name: 'learning',
    },
    'S01-20': {
      kind: 'mermaid',
      en: 'Offline workflow',
      fr: 'Travail hors connexion',
      name: 'offline',
    },
    'S01-21': {
      kind: 'simulation',
      en: 'Illustrative assistant alert',
      fr: 'Alerte simulée de l’assistant',
      name: 'alert',
    },
    'S01-23': {
      kind: 'simulation',
      en: 'Illustrative prompt and draft',
      fr: 'Demande et réponse simulées',
      name: 'prompt',
      frCapture: {
        name: 'chat-capture',
        caption: 'Échange réel avec ChatGPT · scénario de coopérative fictive',
      },
    },
    'S01-25': {
      kind: 'mermaid',
      en: 'Retrieval then generation',
      fr: 'Recherche puis génération',
      name: 'rag',
    },
    'S02-06': {
      kind: 'mermaid',
      en: 'Training, request, and review',
      fr: 'Entraînement, consigne et contrôle',
      name: 'model-workflow',
    },
    'S02-09': {
      kind: 'mermaid',
      en: 'Audience, format, and check',
      fr: 'Public, format et contrôle',
      name: 'formats',
    },
    'S02-11': {
      kind: 'simulation',
      en: 'Fictional prompt for the staff notice',
      fr: 'Consigne fictive pour l’avis aux agents',
      name: 'prompt',
      frCapture: {
        name: 'chat-capture',
        caption: 'Échange réel avec ChatGPT · consigne de coopérative fictive',
      },
    },
    'S02-12': {
      kind: 'simulation',
      en: 'Deliberately wrong draft',
      fr: 'Brouillon volontairement erroné',
      name: 'wrong-output',
    },
    'S02-13': {
      kind: 'mermaid',
      en: 'Three checks before sharing',
      fr: 'Trois contrôles avant diffusion',
      name: 'review',
    },
    'S02-14': {
      kind: 'simulation',
      en: 'Revised fictional draft',
      fr: 'Brouillon fictif corrigé',
      name: 'revised-output',
    },
    'S02-17': {
      kind: 'simulation',
      en: 'Fictional poster for review',
      fr: 'Affiche fictive à vérifier',
      name: 'poster',
    },
    'S02-20': {
      kind: 'simulation',
      en: 'Local HTML guide simulation',
      fr: 'Simulation d’un guide HTML local',
      name: 'guide',
    },
    'S02-21': {
      kind: 'mermaid',
      en: 'Drafting and agentic actions',
      fr: 'Brouillon et actions agentiques',
      name: 'agents',
    },
    'S03-05': {
      kind: 'mermaid',
      en: 'Draft and check against the task',
      fr: 'Brouillon et contrôle de la tâche',
      name: 'workflow',
    },
    'S03-08': {
      kind: 'simulation',
      en: 'Fictional source-grounded prompt',
      fr: 'Demande fictive fondée sur la source',
      name: 'prompt',
    },
    'S03-13': {
      kind: 'simulation',
      en: 'Fictional input-output examples',
      fr: 'Exemples fictifs d’entrée et de sortie',
      name: 'examples',
    },
    'S03-14': {
      kind: 'mermaid',
      en: 'Choose the prompt method',
      fr: 'Choisir la méthode de demande',
      name: 'methods',
    },
    'S03-16': {
      kind: 'simulation',
      en: 'Fictional interview prompt',
      fr: 'Demande fictive en mode entretien',
      name: 'interview',
    },
    'S03-17': {
      kind: 'mermaid',
      en: 'Observable steps before approval',
      fr: 'Étapes observables avant validation',
      name: 'steps',
    },
    'S03-19': {
      kind: 'simulation',
      en: 'Deliberately unsupported draft',
      fr: 'Brouillon volontairement sans fondement',
      name: 'wrong-output',
    },
    'S03-20': {
      kind: 'simulation',
      en: 'Fictional correction and revised draft',
      fr: 'Correction et nouveau brouillon fictifs',
      name: 'revision',
    },
    'S03-23': {
      kind: 'mermaid',
      en: 'Checks before human approval',
      fr: 'Contrôles avant validation humaine',
      name: 'checks',
    },
  };
  const slides: SlideSpec[] = content.slides.map((slide) => {
    const visual = visualSlides[slide.id];
    const capture = content.language === 'fr' ? visual?.frCapture : undefined;
    const base = {
      slideId: slide.id,
      title: slide.title,
      teachingNotes: slide.notes,
      durationMinutes: slide.durationMinutes,
      ...(visual
        ? {
            visual: {
              kind: capture ? ('capture' as const) : visual.kind,
              path: `teaching/visuals/${content.id}/${content.language}/${capture?.name ?? visual.name}.${visual.kind === 'mermaid' ? 'svg' : 'png'}`,
              caption: capture?.caption ?? visual[content.language],
            },
          }
        : {}),
      sourceRefs: [
        {
          path: content.sourcePath,
          heading: slide.title,
          headingPath: [content.title, slide.title],
          blockIds: [slide.id],
          startLine: slide.startLine,
          endLine: slide.endLine,
        },
      ],
    };
    if (slide.role === 'course-title') {
      const [subtitle, ...items] = slide.items;
      if (!subtitle) throw new Error(`Title slide ${slide.id} has no subtitle.`);
      return { ...base, kind: 'title', subtitle, items };
    }
    if (slide.role === 'course-objectives')
      return {
        ...base,
        kind: 'objectives',
        items: slide.items,
        itemLabels: slide.itemKinds.map((kind, index) =>
          kind === 'ordered' ? String(index + 1).padStart(2, '0') : kind === 'bullet' ? '•' : '',
        ),
      };
    if (slide.table)
      return {
        ...base,
        kind: 'table',
        tableId: `${slide.id}-table`,
        headers: slide.table.headers,
        rows: slide.table.rows,
        explanation: '',
      };
    return {
      ...base,
      kind: 'overview',
      items: slide.items,
      itemLabels: slide.itemKinds.map((kind, index) =>
        kind === 'ordered' ? String(index + 1).padStart(2, '0') : kind === 'bullet' ? '•' : '',
      ),
    };
  });
  return {
    schemaVersion: 1,
    status: 'accepted',
    deckId: `${content.id.toUpperCase()}.${content.language.toUpperCase()}`,
    courseId: content.courseId,
    moduleId: content.id,
    language: content.language,
    title: content.title,
    audience:
      content.language === 'fr' ? 'Professionnels et apprenants' : 'Professionals and learners',
    purpose: content.language === 'fr' ? 'Séance de 60 minutes' : '60-minute session',
    themeId: DEFAULT_NATIVE_PPTX_THEME.id,
    sourcePath: content.sourcePath,
    sourceSha256: content.sourceSha256,
    moduleContentSha256: content.contentSha256,
    slides,
  };
}
