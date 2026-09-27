import type { TeachingSessionContent } from '@coursera-notes/presentations';

const S01_ANIMATED_SLIDES = [2, 3, 8] as const;

export interface TeachingAnimationPlan {
  schemaVersion: 1;
  sessionId: 's01';
  language: 'en' | 'fr';
  sourceSha256: string;
  slideCount: 30;
  slides: Array<{
    number: number;
    title: string;
    rows: Array<{ text: string; label: string }>;
  }>;
}

export function createS01AnimationPlan(content: TeachingSessionContent): TeachingAnimationPlan {
  if (content.id !== 's01' || content.slides.length !== 30 || content.durationMinutes !== 60) {
    throw new Error('S01 animation requires the approved 30-slide, 60-minute teaching session.');
  }

  const slides = S01_ANIMATED_SLIDES.map((number) => {
    const slide = content.slides[number - 1];
    if (!slide || slide.id !== `S01-${String(number).padStart(2, '0')}`) {
      throw new Error(`S01 animation slide ${number} is missing or out of order.`);
    }
    if (slide.table || slide.items.length !== (number === 8 ? 5 : 4)) {
      throw new Error(`S01 animation slide ${number} has an unexpected layout.`);
    }
    return {
      number,
      title: slide.title,
      rows: slide.items.map((text, index) => ({
        text,
        label:
          slide.itemKinds[index] === 'ordered'
            ? String(index + 1).padStart(2, '0')
            : slide.itemKinds[index] === 'bullet'
              ? '•'
              : '',
      })),
    };
  });

  return {
    schemaVersion: 1,
    sessionId: 's01',
    language: content.language,
    sourceSha256: content.sourceSha256,
    slideCount: 30,
    slides,
  };
}
