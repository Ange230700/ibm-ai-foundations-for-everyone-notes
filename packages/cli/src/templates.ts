import type { Course, Module } from '@coursera-notes/manifest';

type Language = 'en' | 'fr';

const localizedCopy = {
  noModules: {
    en: '- No modules added yet.',
    fr: '- Aucun module ajouté pour le moment.',
  },
  courseOverview: {
    en: 'Course overview',
    fr: 'Présentation du cours',
  },
  courseOverviewPrompt: {
    en: 'Describe the course scope, audience, and source basis.',
    fr: 'Décrire le périmètre du cours, son public cible et les sources utilisées.',
  },
  learningOutcomes: {
    en: 'Learning outcomes',
    fr: 'Objectifs d’apprentissage',
  },
  learningOutcomesPrompt: {
    en: '- Add course learning outcomes.',
    fr: '- Ajouter les objectifs d’apprentissage du cours.',
  },
  modules: {
    en: 'Modules',
    fr: 'Modules',
  },
  skillsCovered: {
    en: 'Skills covered',
    fr: 'Compétences couvertes',
  },
  skillsPrompt: {
    en: '- Add skills when the skill registry is introduced.',
    fr: '- Ajouter les compétences lorsque le registre des compétences sera introduit.',
  },
  assessments: {
    en: 'Assessments',
    fr: 'Évaluations',
  },
  assessmentsPrompt: {
    en: '- Add assessment references when available.',
    fr: '- Ajouter les références aux évaluations lorsqu’elles sont disponibles.',
  },
  resources: {
    en: 'Resources',
    fr: 'Ressources',
  },
  resourcesPrompt: {
    en: '- Add course resources.',
    fr: '- Ajouter les ressources du cours.',
  },
  references: {
    en: 'References',
    fr: 'Références',
  },
  referencesPrompt: {
    en: '- Add source references and official Coursera links.',
    fr: '- Ajouter les sources et les liens Coursera officiels.',
  },
  status: {
    en: 'Status',
    fr: 'Statut',
  },
  complete: {
    en: 'Complete',
    fr: 'Terminé',
  },
  reviewed: {
    en: 'Reviewed',
    fr: 'Révisé',
  },
  learningObjectives: {
    en: 'Learning Objectives',
    fr: 'Objectifs d’apprentissage',
  },
  explain: {
    en: 'Explain ...',
    fr: 'Expliquer ...',
  },
  distinguish: {
    en: 'Distinguish ...',
    fr: 'Distinguer ...',
  },
  apply: {
    en: 'Apply ...',
    fr: 'Appliquer ...',
  },
  moduleSkillsPrompt: {
    en: '- Add skill references when the skill registry is introduced.',
    fr: '- Ajouter les références aux compétences lorsque le registre des compétences sera introduit.',
  },
  conceptMap: {
    en: 'Concept Map',
    fr: 'Carte conceptuelle',
  },
  concept: {
    en: 'Concept',
    fr: 'Concept',
  },
  relatedConcept: {
    en: 'Related concept',
    fr: 'Concept associé',
  },
  conceptMapPrompt: {
    en: 'Explain the relationship shown in the diagram.',
    fr: 'Expliquer la relation représentée dans le diagramme.',
  },
  coreConcepts: {
    en: 'Core Concepts',
    fr: 'Concepts clés',
  },
  concept1: {
    en: 'Concept 1',
    fr: 'Concept 1',
  },
  definition: {
    en: 'Definition',
    fr: 'Définition',
  },
  definitionPrompt: {
    en: 'Define the concept in your own words.',
    fr: 'Définir le concept avec vos propres mots.',
  },
  whyItMatters: {
    en: 'Why it matters',
    fr: 'Pourquoi c’est important',
  },
  practicalConsequence: {
    en: '- Practical consequence.',
    fr: '- Conséquence pratique.',
  },
  example: {
    en: 'Example',
    fr: 'Exemple',
  },
  examplePrompt: {
    en: 'Add a concrete example.',
    fr: 'Ajouter un exemple concret.',
  },
  commonMistake: {
    en: 'Common mistake',
    fr: 'Erreur fréquente',
  },
  commonMistakePrompt: {
    en: 'Describe a likely misunderstanding.',
    fr: 'Décrire une mauvaise compréhension probable.',
  },
  practicalApplication: {
    en: 'Practical Application',
    fr: 'Application pratique',
  },
  situation: {
    en: 'Situation',
    fr: 'Situation',
  },
  action: {
    en: 'Action',
    fr: 'Action',
  },
  result: {
    en: 'Result',
    fr: 'Résultat',
  },
  labsAndActivities: {
    en: 'Labs and Activities',
    fr: 'Travaux pratiques et activités',
  },
  activity: {
    en: 'Activity',
    fr: 'Activité',
  },
  practiced: {
    en: 'What I practiced',
    fr: 'Ce que j’ai pratiqué',
  },
  learned: {
    en: 'What I learned',
    fr: 'Ce que j’ai appris',
  },
  quizReview: {
    en: 'Quiz Review',
    fr: 'Révision du quiz',
  },
  quizReviewPrompt: {
    en: 'Record concepts that need review without copying answer dumps.',
    fr: 'Noter les concepts à revoir sans reproduire les réponses complètes du quiz.',
  },
  questionsToRevisit: {
    en: 'Questions to Revisit',
    fr: 'Questions à revoir',
  },
  finalSummary: {
    en: 'Final Summary',
    fr: 'Synthèse finale',
  },
  finalSummaryPrompt: {
    en: 'Write a concise synthesis of the module.',
    fr: 'Rédiger une synthèse concise du module.',
  },
} as const;

type TemplateCopy = {
  [Key in keyof typeof localizedCopy]: string;
};

function copyFor(language: Language): TemplateCopy {
  return Object.fromEntries(
    Object.entries(localizedCopy).map(([key, value]) => [key, value[language]]),
  ) as TemplateCopy;
}

export function courseReadme(course: Course, language: Language): string {
  const text = copyFor(language);
  const title = course.title[language];

  const moduleLines = course.modules.length
    ? course.modules
        .map(
          (module) =>
            `${module.ordinal}. [${module.title[language]}](./${module.source[language].split('/').at(-1)})`,
        )
        .join('\n')
    : text.noModules;

  return `# ${title}

## ${text.courseOverview}

${text.courseOverviewPrompt}

## ${text.learningOutcomes}

${text.learningOutcomesPrompt}

## ${text.modules}

${moduleLines}

## ${text.skillsCovered}

${text.skillsPrompt}

## ${text.assessments}

${text.assessmentsPrompt}

## ${text.resources}

${text.resourcesPrompt}

## ${text.references}

${text.referencesPrompt}
`;
}

export function moduleMarkdown(module: Module, language: Language): string {
  const text = copyFor(language);
  const title = module.title[language];

  return `# ${title}

## ${text.status}

- [ ] ${text.complete}
- [ ] ${text.reviewed}

## ${text.learningObjectives}

- ${text.explain}
- ${text.distinguish}
- ${text.apply}

## ${text.skillsCovered}

${text.moduleSkillsPrompt}

## ${text.conceptMap}

\`\`\`mermaid
flowchart LR
    A[${text.concept}] --> B[${text.relatedConcept}]
\`\`\`

${text.conceptMapPrompt}

## ${text.coreConcepts}

### ${text.concept1}

#### ${text.definition}

${text.definitionPrompt}

#### ${text.whyItMatters}

${text.practicalConsequence}

#### ${text.example}

${text.examplePrompt}

#### ${text.commonMistake}

${text.commonMistakePrompt}

## ${text.practicalApplication}

- ${text.situation}:
- ${text.action}:
- ${text.result}:

## ${text.labsAndActivities}

- ${text.activity}:
- ${text.practiced}:
- ${text.learned}:

## ${text.quizReview}

${text.quizReviewPrompt}

## ${text.questionsToRevisit}

- ...

## ${text.finalSummary}

${text.finalSummaryPrompt}
`;
}
