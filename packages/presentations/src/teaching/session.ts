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
  canonicalModuleIds: string[];
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
  canonicalModuleIds: string[];
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
  if (table && (items.length > 1 || itemKinds.some((kind) => kind !== 'plain'))) {
    throw new Error(`${label}: projected tables allow only one plain-text caption and no lists.`);
  }
  return { items, itemKinds, ...(table ? { table } : {}) };
}

function slideNodes(root: Root, index: number): Nodes[] {
  // Called only for a slide heading discovered in root.children.
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
  const headingSeparator = ' — ';
  const separatorIndex = headingText.indexOf(headingSeparator);
  const headingPrefix = separatorIndex < 0 ? '' : headingText.slice(0, separatorIndex);
  const ordinalMatch = /^(?:Slide|Diapositive)\s+(\d{2})$/u.exec(headingPrefix);
  const title =
    separatorIndex < 0 ? undefined : headingText.slice(separatorIndex + headingSeparator.length);
  if (!ordinalMatch || !title) throw new Error(`Invalid teaching slide heading: ${headingText}.`);
  const ordinal = ordinalMatch[1]!;
  const label = `${sessionId.toUpperCase()}-${ordinal}`;
  const metadata = nodes
    .filter((node) => node.type !== 'heading')
    .slice(0, 1)
    .map(plainText)
    .join(' ');
  const id = /(?:Identifier|Identifiant)\s*:\s*(S\d{2}-\d{2})/iu.exec(metadata)?.[1];
  const duration = Number(/(?:Duration|Durée)\s*:\s*(\d+)\s*minute/iu.exec(metadata)?.[1]);
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
  if (
    options.canonicalModuleIds.length === 0 ||
    new Set(options.canonicalModuleIds).size !== options.canonicalModuleIds.length
  ) {
    throw new Error(
      `${options.sourcePath}: canonical module provenance must be non-empty and unique.`,
    );
  }

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
    canonicalModuleIds: [...options.canonicalModuleIds],
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
    en.canonicalModuleIds.length !== fr.canonicalModuleIds.length ||
    en.canonicalModuleIds.some((moduleId, index) => moduleId !== fr.canonicalModuleIds[index]) ||
    en.slides.length !== fr.slides.length ||
    en.durationMinutes !== fr.durationMinutes
  ) {
    throw new Error('English and French teaching sessions do not align.');
  }
  en.slides.forEach((slide, index) => {
    const other = fr.slides[index];
    if (!other) throw new Error(`Teaching sessions diverge at slide ${slide.id}.`);
    if (
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

interface TeachingVisualDefinition {
  kind: 'mermaid' | 'simulation';
  en: string;
  fr: string;
  name: string;
  enCapture?: { name: string; caption: string };
  frCapture?: { name: string; caption: string };
}

function teachingVisualDefinitions(): Record<string, TeachingVisualDefinition> {
  const records = `
S01-08|mermaid|evolution|Coexisting AI approaches|Approches d’IA complémentaires
S01-10|mermaid|learning|Learning methods|Modes d’apprentissage
S01-19|mermaid|offline|Offline workflow|Travail hors connexion
S01-22|simulation|prompt|Illustrative prompt|Exemple de consigne|chat-capture|Prompt entered in ChatGPT · fictional cocoa cooperative scenario|Consigne saisie dans ChatGPT · scénario de coopérative fictive
S01-24|mermaid|rag|Retrieval then generation|Recherche puis génération
S02-06|mermaid|model-workflow|Training, request, and review|Entraînement, consigne et contrôle
S02-09|mermaid|formats|Audience, format, and check|Public, format et contrôle
S02-11|simulation|prompt|Fictional prompt for the staff notice|Consigne fictive pour l’avis aux agents|chat-capture|Prompt entered in ChatGPT · fictional cooperative instruction|Consigne saisie dans ChatGPT · instruction pour une coopérative fictive
S02-13|mermaid|review|Three checks before sharing|Trois contrôles avant diffusion
S02-14|simulation|revised-output|Revised fictional draft|Brouillon fictif corrigé
S02-17|simulation|poster|Fictional poster for review|Affiche fictive à vérifier
S02-20|simulation|guide|Local HTML guide simulation|Simulation d’un guide HTML local|guide-capture|Browser capture of a local HTML guide · teaching prototype|Capture navigateur d’un guide HTML local · prototype pédagogique
S02-21|mermaid|agents|Drafting and agentic actions|Brouillon et actions agentiques
S03-05|mermaid|workflow|Draft and check against the task|Brouillon et contrôle de la tâche
S03-08|simulation|prompt|Fictional source-grounded prompt|Demande fictive fondée sur la source|chat-capture|Prompt entered in ChatGPT · fictional cooperative source|Consigne saisie dans ChatGPT · source de coopérative fictive
S03-14|mermaid|methods|Choose the prompt method|Choisir la méthode de demande
S03-16|simulation|interview|Fictional interview prompt|Demande fictive en mode entretien|interview-capture|Interview prompt entered in ChatGPT · fictional cocoa cooperative|Consigne d’entretien saisie dans ChatGPT · coopérative cacaoyère fictive
S03-17|mermaid|steps|Observable steps before approval|Étapes observables avant validation
S03-20|simulation|revision|Fictional revised draft|Brouillon fictif corrigé
S03-23|mermaid|checks|Checks before human approval|Contrôles avant validation humaine
S04-07|mermaid|source-grounded-method|Source-grounded method|Méthode fondée sur les sources
S04-15|mermaid|gap-vs-conflict|Missing versus conflicting information|Information manquante ou contradictoire
S04-21|mermaid|verification-loop|Verification process|Processus de vérification
S05-05|mermaid|workflow-canvas|Workflow Canvas|Workflow Canvas
S05-15|mermaid|manual-vs-ai|Manual and AI-assisted workflow|Workflow manuel et assisté par l’IA
S05-16|mermaid|responsibility-model|Human and AI responsibilities|Responsabilités humaines et de l’IA
S05-18|mermaid|exception-path|Exception paths|Chemins d’exception
S05-22|mermaid|improvement-loop|Workflow improvement loop|Boucle d’amélioration du workflow
`
    .trim()
    .split('\n');
  return Object.fromEntries(
    records.map((record) => {
      const [id, kind, name, en, fr, captureName, enCaption, frCaption] = record.split('|') as [
        string,
        TeachingVisualDefinition['kind'],
        string,
        string,
        string,
        string?,
        string?,
        string?,
      ];
      const visual: TeachingVisualDefinition = { kind, name, en, fr };
      if (captureName) {
        visual.enCapture = { name: captureName, caption: enCaption! };
        visual.frCapture = { name: captureName, caption: frCaption! };
      }
      return [id, visual];
    }),
  );
}

function itemLabel(kind: TeachingSlide['itemKinds'][number], index: number): string {
  if (kind === 'ordered') return String(index + 1).padStart(2, '0');
  return kind === 'bullet' ? '•' : '';
}

export function teachingDeckSpec(content: TeachingSessionContent): DeckSpec {
  const visualSlides = teachingVisualDefinitions();
  const slides: SlideSpec[] = content.slides.map((slide) => {
    const visual = visualSlides[slide.id];
    const capture = content.language === 'fr' ? visual?.frCapture : visual?.enCapture;
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
        itemLabels: slide.itemKinds.map((kind, index) => itemLabel(kind, index)),
      };
    if (slide.table)
      return {
        ...base,
        kind: 'table',
        tableId: `${slide.id}-table`,
        headers: slide.table.headers,
        rows: slide.table.rows,
        explanation: slide.items.join('\n'),
      };
    return {
      ...base,
      kind: 'overview',
      items: slide.items,
      itemLabels: slide.itemKinds.map((kind, index) => itemLabel(kind, index)),
    };
  });
  return {
    schemaVersion: 2,
    status: 'accepted',
    deckId: `${content.id.toUpperCase()}.${content.language.toUpperCase()}`,
    scope: {
      kind: 'teaching-session',
      sessionId: content.id,
      canonicalModuleIds: [...content.canonicalModuleIds],
    },
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
