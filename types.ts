
export interface Question {
  id: number;
  text: string;
  category: 'General' | 'Passion' | 'Sentimental' | 'Future';
}

export interface AnswerPair {
  questionId: number;
  userAnswer: string;
  amaliaAnswer: string;
}

export enum AppState {
  START = 'START',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  ANALYSIS = 'ANALYSIS'
}
