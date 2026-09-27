import type { TeachingSessionContent } from '@coursera-notes/presentations';

type SlidePlan =
  | { number: number; title: string; kind: 'cover'; subtitle: string; context: string }
  | { number: number; title: string; kind: 'table'; headers: string[]; rows: string[][] }
  | {
      number: number;
      title: string;
      kind: 'rows';
      rows: Array<{ text: string; label: string }>;
    };

export interface TeachingAnimationPlan {
  schemaVersion: 2;
  sessionId: 's01' | 's02';
  language: 'en' | 'fr';
  sourceSha256: string;
  slideCount: 30 | 26;
  slides: SlidePlan[];
}

export function animationCounts(plan: TeachingAnimationPlan): {
  animatedSlides: number;
  clicks: number;
  effects: number;
} {
  return plan.slides.reduce(
    (counts, slide) => {
      const clicks = slide.kind === 'rows' ? slide.rows.length - 1 : 1;
      return {
        animatedSlides: counts.animatedSlides + 1,
        clicks: counts.clicks + clicks,
        effects:
          counts.effects + (slide.kind === 'rows' ? clicks * 3 : slide.kind === 'cover' ? 2 : 1),
      };
    },
    { animatedSlides: 0, clicks: 0, effects: 0 },
  );
}

function createAnimationPlan(
  content: TeachingSessionContent,
  sessionId: 's01' | 's02',
  slideCount: 30 | 26,
): TeachingAnimationPlan {
  const label = sessionId.toUpperCase();
  if (
    content.id !== sessionId ||
    content.slides.length !== slideCount ||
    content.durationMinutes !== 60
  ) {
    throw new Error(`${label} animation requires ${slideCount} slides and a 60-minute session.`);
  }

  const slides: SlidePlan[] = content.slides.map((slide, index) => {
    const number = index + 1;
    if (slide.id !== `${label}-${String(number).padStart(2, '0')}`) {
      throw new Error(`${label} animation slide ${number} is missing or out of order.`);
    }
    if (number === 1) {
      if (slide.role !== 'course-title' || slide.table || slide.items.length < 2)
        throw new Error(`${label} cover has an unexpected layout.`);
      return {
        kind: 'cover',
        number,
        title: slide.title,
        subtitle: slide.items[0]!,
        context: slide.items.slice(1).join(' '),
      };
    }
    if (sessionId === 's01' && number === 19) {
      if (!slide.table || slide.items.length)
        throw new Error('S01 table slide has an unexpected layout.');
      return { kind: 'table', number, title: slide.title, ...slide.table };
    }
    if (slide.table || slide.items.length < 2 || slide.itemKinds.length !== slide.items.length) {
      throw new Error(`${label} animation slide ${number} has an unexpected list layout.`);
    }
    return {
      kind: 'rows',
      number,
      title: slide.title,
      rows: slide.items.map((text, rowIndex) => ({
        text,
        label:
          slide.itemKinds[rowIndex] === 'ordered'
            ? String(rowIndex + 1).padStart(2, '0')
            : slide.itemKinds[rowIndex] === 'bullet'
              ? '•'
              : '',
      })),
    };
  });

  return {
    schemaVersion: 2,
    sessionId,
    language: content.language,
    sourceSha256: content.sourceSha256,
    slideCount,
    slides,
  };
}

export function createS01AnimationPlan(content: TeachingSessionContent): TeachingAnimationPlan {
  return createAnimationPlan(content, 's01', 30);
}

export function createS02AnimationPlan(content: TeachingSessionContent): TeachingAnimationPlan {
  return createAnimationPlan(content, 's02', 26);
}
