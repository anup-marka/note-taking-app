// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  plainText: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: Date;
  metadata: NoteMetadata;
}

export interface NoteMetadata {
  wordCount: number;
  charCount: number;
  readingTime: number;
  aiSummary?: string;
  aiTags?: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  noteCount: number;
  createdAt: Date;
}

export type NoteCreateInput = Pick<Note, 'title' | 'content' | 'plainText' | 'tags'>;

export type NoteUpdateInput = Partial<Pick<Note, 'title' | 'content' | 'plainText' | 'tags' | 'isPinned' | 'isArchived' | 'isTrashed' | 'metadata'>>;

// AI types
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

// User types (for sync)
export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sync types
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface SyncableNote extends Note {
  userId: string;
  syncStatus: SyncStatus;
  localUpdatedAt: Date;
  serverUpdatedAt?: Date;
  deletedAt?: Date;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'note' | 'tag';
  entityId: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  status: 'pending' | 'synced' | 'failed';
}
