const SECTION_DEFINITIONS = {
  status: {
    id: 'status',
    labels: ['Status', 'Statut'],
  },
  learningObjectives: {
    id: 'learning-objectives',
    labels: ['Learning Objectives', 'Objectifs d’apprentissage'],
  },
  skillsCovered: {
    id: 'skills-covered',
    labels: ['Skills covered', 'Compétences couvertes'],
  },
  conceptMap: {
    id: 'concept-map',
    labels: ['Concept Map', 'Carte conceptuelle'],
  },
  coreConcepts: {
    id: 'core-concepts',
    labels: ['Core Concepts', 'Concepts clés'],
  },
  definition: {
    id: 'definition',
    labels: ['Definition', 'Définition'],
  },
  whyItMatters: {
    id: 'why-it-matters',
    labels: ['Why it matters', 'Pourquoi c’est important'],
  },
  example: {
    id: 'example',
    labels: ['Example', 'Exemple'],
  },
  commonMistake: {
    id: 'common-mistake',
    labels: ['Common mistake', 'Erreur fréquente'],
  },
  practicalApplication: {
    id: 'practical-application',
    labels: ['Practical Application', 'Application pratique'],
  },
  labsAndActivities: {
    id: 'labs-and-activities',
    labels: ['Labs and Activities', 'Travaux pratiques et activités'],
  },
  quizReview: {
    id: 'quiz-review',
    labels: ['Quiz Review', 'Révision du quiz'],
  },
  questionsToRevisit: {
    id: 'questions-to-revisit',
    labels: ['Questions to Revisit', 'Questions à revoir'],
  },
  finalSummary: {
    id: 'final-summary',
    labels: ['Final Summary', 'Synthèse finale'],
  },
} as const;

function normalizeLabel(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase();
}

const ID_BY_LABEL = new Map<string, string>(
  Object.values(SECTION_DEFINITIONS).flatMap(({ id, labels }) =>
    labels.map((label) => [normalizeLabel(label), id]),
  ),
);

export function canonicalSectionIdentity(title: string): string {
  return ID_BY_LABEL.get(normalizeLabel(title)) ?? title;
}
