import { create } from 'zustand';

interface AppState {
  // UI state
  isOnline: boolean;
  setOnline: (online: boolean) => void;

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  setSyncing: (syncing: boolean) => void;
  setLastSyncedAt: (date: Date | null) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected note
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // Filter state
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  showTrashed: boolean;
  setShowTrashed: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // UI state
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),

  // Sync state
  isSyncing: false,
  lastSyncedAt: null,
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),

  // Search state
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Selected note
  selectedNoteId: null,
  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),

  // Filter state
  selectedTag: null,
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  showArchived: false,
  setShowArchived: (showArchived) => set({ showArchived }),
  showTrashed: false,
  setShowTrashed: (showTrashed) => set({ showTrashed }),
}));
