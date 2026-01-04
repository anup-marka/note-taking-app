import Dexie, { type Table } from 'dexie';
import type { Note, Tag } from '@/types/note';

export class NotesDatabase extends Dexie {
  notes!: Table<Note>;
  tags!: Table<Tag>;

  constructor() {
    super('NotesDB');

    this.version(1).stores({
      notes: 'id, title, *tags, createdAt, updatedAt, isPinned, isArchived, isTrashed',
      tags: 'id, name, color',
    });
  }
}

export const db = new NotesDatabase();

export async function clearDatabase() {
  await db.notes.clear();
  await db.tags.clear();
}
