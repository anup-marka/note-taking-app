'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import type { Note, NoteCreateInput, NoteUpdateInput } from '@/types/note';
import { getWordCount, getCharCount, getReadingTime } from '@/lib/utils/text';

export function useNotes(options?: {
  tag?: string;
  search?: string;
  showArchived?: boolean;
  showTrashed?: boolean;
}) {
  const notes = useLiveQuery(async () => {
    let collection = db.notes.orderBy('updatedAt').reverse();

    const allNotes = await collection.toArray();

    return allNotes.filter((note) => {
      // Filter by trash/archive status
      if (!options?.showTrashed && note.isTrashed) return false;
      if (!options?.showArchived && note.isArchived) return false;

      // Filter by tag
      if (options?.tag && !note.tags.includes(options.tag)) return false;

      // Filter by search
      if (options?.search) {
        const search = options.search.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(search);
        const matchesContent = note.plainText.toLowerCase().includes(search);
        if (!matchesTitle && !matchesContent) return false;
      }

      return true;
    });
  }, [options?.tag, options?.search, options?.showArchived, options?.showTrashed]);

  const pinnedNotes = notes?.filter((n) => n.isPinned) ?? [];
  const unpinnedNotes = notes?.filter((n) => !n.isPinned) ?? [];

  return {
    notes: notes ?? [],
    pinnedNotes,
    unpinnedNotes,
    isLoading: notes === undefined,
  };
}

export function useNote(id: string | null) {
  const note = useLiveQuery(
    async () => {
      if (!id || id === 'new') return null;
      return db.notes.get(id);
    },
    [id]
  );

  return {
    note: note ?? null,
    isLoading: note === undefined,
  };
}

export async function createNote(input: NoteCreateInput): Promise<Note> {
  const now = new Date();
  const wordCount = getWordCount(input.plainText);

  const note: Note = {
    id: nanoid(),
    title: input.title || 'Untitled',
    content: input.content,
    plainText: input.plainText,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    metadata: {
      wordCount,
      charCount: getCharCount(input.plainText),
      readingTime: getReadingTime(wordCount),
    },
  };

  await db.notes.add(note);

  // Update tag counts
  for (const tagName of input.tags) {
    const existingTag = await db.tags.where('name').equals(tagName).first();
    if (existingTag) {
      await db.tags.update(existingTag.id, {
        noteCount: existingTag.noteCount + 1,
      });
    } else {
      await db.tags.add({
        id: nanoid(),
        name: tagName,
        color: '#6366f1',
        noteCount: 1,
        createdAt: now,
      });
    }
  }

  return note;
}

export async function updateNote(id: string, input: NoteUpdateInput): Promise<void> {
  const existingNote = await db.notes.get(id);
  if (!existingNote) throw new Error('Note not found');

  const updates: Partial<Note> = {
    ...input,
    updatedAt: new Date(),
  };

  if (input.plainText !== undefined) {
    const wordCount = getWordCount(input.plainText);
    updates.metadata = {
      ...existingNote.metadata,
      ...input.metadata,
      wordCount,
      charCount: getCharCount(input.plainText),
      readingTime: getReadingTime(wordCount),
    };
  }

  // Handle tag changes
  if (input.tags !== undefined) {
    const oldTags = existingNote.tags;
    const newTags = input.tags;

    // Decrement count for removed tags
    for (const tag of oldTags) {
      if (!newTags.includes(tag)) {
        const existingTag = await db.tags.where('name').equals(tag).first();
        if (existingTag) {
          if (existingTag.noteCount <= 1) {
            await db.tags.delete(existingTag.id);
          } else {
            await db.tags.update(existingTag.id, {
              noteCount: existingTag.noteCount - 1,
            });
          }
        }
      }
    }

    // Increment count for added tags
    for (const tag of newTags) {
      if (!oldTags.includes(tag)) {
        const existingTag = await db.tags.where('name').equals(tag).first();
        if (existingTag) {
          await db.tags.update(existingTag.id, {
            noteCount: existingTag.noteCount + 1,
          });
        } else {
          await db.tags.add({
            id: nanoid(),
            name: tag,
            color: '#6366f1',
            noteCount: 1,
            createdAt: new Date(),
          });
        }
      }
    }
  }

  await db.notes.update(id, updates);
}

export async function deleteNote(id: string, permanent = false): Promise<void> {
  const note = await db.notes.get(id);
  if (!note) return;

  if (permanent) {
    // Decrement tag counts
    for (const tag of note.tags) {
      const existingTag = await db.tags.where('name').equals(tag).first();
      if (existingTag) {
        if (existingTag.noteCount <= 1) {
          await db.tags.delete(existingTag.id);
        } else {
          await db.tags.update(existingTag.id, {
            noteCount: existingTag.noteCount - 1,
          });
        }
      }
    }
    await db.notes.delete(id);
  } else {
    await db.notes.update(id, {
      isTrashed: true,
      trashedAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function restoreNote(id: string): Promise<void> {
  await db.notes.update(id, {
    isTrashed: false,
    trashedAt: undefined,
    updatedAt: new Date(),
  });
}

export async function togglePinNote(id: string): Promise<void> {
  const note = await db.notes.get(id);
  if (!note) return;

  await db.notes.update(id, {
    isPinned: !note.isPinned,
    updatedAt: new Date(),
  });
}

export async function archiveNote(id: string): Promise<void> {
  await db.notes.update(id, {
    isArchived: true,
    updatedAt: new Date(),
  });
}

export async function unarchiveNote(id: string): Promise<void> {
  await db.notes.update(id, {
    isArchived: false,
    updatedAt: new Date(),
  });
}
