export interface Vocabulary {
  id: string;
  singular: string;
  dual: string;
  plural: string;
  meaning: string;
  notes: string; // Islahul Lughoh
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// FIX: Added QuizData interface to resolve import error in services/geminiService.ts
export interface QuizData {
  quiz: QuizQuestion[];
}
