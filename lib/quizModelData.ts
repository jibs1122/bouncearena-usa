export interface QuizModelData {
  brandSlug: string;
  model: string;
  springType?: 'traditional' | 'springless';
  quizExclude?: boolean; // true = never surface in quiz results (specialty/trick products)
}

export const QUIZ_MODEL_DATA: QuizModelData[] = [
  {
    brandSlug: 'beast',
    model: 'Beast 9x6 ft Mini Rectangle Trick Tramp',
    quizExclude: true,
  },
  {
    brandSlug: 'vuly',
    model: 'Ultra 2',
    springType: 'traditional',
  },
  {
    brandSlug: 'vuly',
    model: 'Ultra 2 Pro',
    springType: 'traditional',
  },
  {
    brandSlug: 'vuly',
    model: 'Thunder 2',
    springType: 'springless',
  },
  {
    brandSlug: 'vuly',
    model: 'Thunder 2 Pro',
    springType: 'springless',
  },
  {
    brandSlug: 'vuly',
    model: 'Thunder Pro',
    springType: 'springless',
  },
];
