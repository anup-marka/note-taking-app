export type AIAction =
  | 'improve'
  | 'expand'
  | 'summarize'
  | 'simplify'
  | 'fix-grammar'
  | 'translate'
  | 'continue'
  | 'custom';

export interface AIRequest {
  action: AIAction;
  text: string;
  context?: string;
  customPrompt?: string;
}

export interface AIResponse {
  result: string;
  tokensUsed?: number;
}

export interface AISearchRequest {
  query: string;
  noteIds?: string[];
}

export interface AISearchResponse {
  answer: string;
  sourceNotes: Array<{
    id: string;
    title: string;
    relevantExcerpt: string;
  }>;
  followUpQuestions: string[];
}

export interface AITagSuggestion {
  noteId: string;
  suggestedTags: string[];
  confidence: number;
}
