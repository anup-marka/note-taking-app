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
