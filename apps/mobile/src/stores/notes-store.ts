import { create } from 'zustand';
import type { Note, Tag } from '@note-app/shared-types';

interface NotesState {
  notes: Note[];
  tags: Tag[];
  isLoading: boolean;

  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  setLoading: (loading: boolean) => void;

  // Getters
  getNoteById: (id: string) => Note | undefined;
  getPinnedNotes: () => Note[];
  getUnpinnedNotes: () => Note[];
  getFilteredNotes: (options: {
    searchQuery?: string;
    tag?: string;
    showArchived?: boolean;
    showTrashed?: boolean;
  }) => Note[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  tags: [],
  isLoading: false,

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),

  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  updateTag: (id, updates) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  getNoteById: (id) => get().notes.find((n) => n.id === id),

  getPinnedNotes: () =>
    get().notes.filter((n) => n.isPinned && !n.isArchived && !n.isTrashed),

  getUnpinnedNotes: () =>
    get().notes.filter((n) => !n.isPinned && !n.isArchived && !n.isTrashed),

  getFilteredNotes: ({ searchQuery, tag, showArchived, showTrashed }) => {
    let filtered = get().notes;

    // Filter by status
    if (showTrashed) {
      filtered = filtered.filter((n) => n.isTrashed);
    } else if (showArchived) {
      filtered = filtered.filter((n) => n.isArchived && !n.isTrashed);
    } else {
      filtered = filtered.filter((n) => !n.isArchived && !n.isTrashed);
    }

    // Filter by tag
    if (tag) {
      filtered = filtered.filter((n) => n.tags.includes(tag));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.plainText.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by updatedAt
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },
}));
