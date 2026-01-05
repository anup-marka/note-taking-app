import { useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { useNotesStore } from '../stores/notes-store';
import { useAppStore } from '../stores/app-store';
import { getWordCount, getCharCount, getReadingTime } from '@note-app/shared-utils';
import type { Note, NoteCreateInput, NoteUpdateInput, NoteMetadata } from '@note-app/shared-types';

function calculateMetadata(plainText: string): NoteMetadata {
  const wordCount = getWordCount(plainText);
  return {
    wordCount,
    charCount: getCharCount(plainText),
    readingTime: getReadingTime(wordCount),
  };
}

export function useNotes() {
  const { searchQuery, selectedTag, showArchived, showTrashed } = useAppStore();
  const { notes, isLoading, getFilteredNotes, getPinnedNotes, getUnpinnedNotes } =
    useNotesStore();

  const filteredNotes = useMemo(
    () =>
      getFilteredNotes({
        searchQuery,
        tag: selectedTag ?? undefined,
        showArchived,
        showTrashed,
      }),
    [notes, searchQuery, selectedTag, showArchived, showTrashed, getFilteredNotes]
  );

  const pinnedNotes = useMemo(() => getPinnedNotes(), [notes, getPinnedNotes]);
  const unpinnedNotes = useMemo(() => getUnpinnedNotes(), [notes, getUnpinnedNotes]);

  return {
    notes: filteredNotes,
    pinnedNotes,
    unpinnedNotes,
    isLoading,
  };
}

export function useNote(id: string | undefined) {
  const getNoteById = useNotesStore((state) => state.getNoteById);
  const note = useMemo(() => (id ? getNoteById(id) : undefined), [id, getNoteById]);

  return {
    note,
    isLoading: false,
  };
}

export function useNoteActions() {
  const { addNote, updateNote, deleteNote } = useNotesStore();

  const createNote = useCallback(
    async (input: NoteCreateInput): Promise<Note> => {
      const now = new Date();
      const note: Note = {
        id: nanoid(),
        title: input.title || 'Untitled',
        content: input.content,
        plainText: input.plainText,
        tags: input.tags || [],
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        createdAt: now,
        updatedAt: now,
        metadata: calculateMetadata(input.plainText),
      };

      addNote(note);
      // TODO: Sync to server
      return note;
    },
    [addNote]
  );

  const saveNote = useCallback(
    async (id: string, updates: NoteUpdateInput): Promise<void> => {
      const noteUpdates: Partial<Note> = {
        ...updates,
        updatedAt: new Date(),
      };

      if (updates.plainText !== undefined) {
        noteUpdates.metadata = calculateMetadata(updates.plainText);
      }

      updateNote(id, noteUpdates);
      // TODO: Sync to server
    },
    [updateNote]
  );

  const trashNote = useCallback(
    async (id: string): Promise<void> => {
      updateNote(id, {
        isTrashed: true,
        trashedAt: new Date(),
        updatedAt: new Date(),
      });
      // TODO: Sync to server
    },
    [updateNote]
  );

  const restoreNote = useCallback(
    async (id: string): Promise<void> => {
      updateNote(id, {
        isTrashed: false,
        trashedAt: undefined,
        updatedAt: new Date(),
      });
      // TODO: Sync to server
    },
    [updateNote]
  );

  const permanentlyDeleteNote = useCallback(
    async (id: string): Promise<void> => {
      deleteNote(id);
      // TODO: Sync to server
    },
    [deleteNote]
  );

  const togglePinNote = useCallback(
    async (id: string, isPinned: boolean): Promise<void> => {
      updateNote(id, {
        isPinned,
        updatedAt: new Date(),
      });
      // TODO: Sync to server
    },
    [updateNote]
  );

  const archiveNote = useCallback(
    async (id: string): Promise<void> => {
      updateNote(id, {
        isArchived: true,
        isPinned: false,
        updatedAt: new Date(),
      });
      // TODO: Sync to server
    },
    [updateNote]
  );

  const unarchiveNote = useCallback(
    async (id: string): Promise<void> => {
      updateNote(id, {
        isArchived: false,
        updatedAt: new Date(),
      });
      // TODO: Sync to server
    },
    [updateNote]
  );

  return {
    createNote,
    saveNote,
    trashNote,
    restoreNote,
    permanentlyDeleteNote,
    togglePinNote,
    archiveNote,
    unarchiveNote,
  };
}
