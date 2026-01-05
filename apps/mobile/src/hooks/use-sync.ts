import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useNotesStore } from '../stores/notes-store';
import { useAppStore } from '../stores/app-store';
import {
  isSupabaseAvailable,
  fetchNotesFromServer,
  upsertNoteToServer,
  subscribeToNoteChanges,
  unsubscribeFromChannel,
} from '../services/supabase';
import type { Note } from '@note-app/shared-types';

interface SyncQueueItem {
  noteId: string;
  action: 'upsert' | 'delete';
  data?: Partial<Note>;
  timestamp: number;
}

export function useSync() {
  const { user } = useAuthStore();
  const { notes, setNotes, updateNote, addNote, deleteNote } = useNotesStore();
  const { setSyncing, setLastSyncedAt } = useAppStore();
  const channelRef = useRef<any>(null);
  const syncQueueRef = useRef<SyncQueueItem[]>([]);
  const isSyncingRef = useRef(false);

  // Process sync queue
  const processSyncQueue = useCallback(async () => {
    if (isSyncingRef.current || syncQueueRef.current.length === 0 || !user) {
      return;
    }

    isSyncingRef.current = true;
    setSyncing(true);

    try {
      while (syncQueueRef.current.length > 0) {
        const item = syncQueueRef.current.shift();
        if (!item) continue;

        const note = notes.find((n) => n.id === item.noteId);
        if (!note && item.action === 'upsert') continue;

        if (item.action === 'upsert' && note) {
          await upsertNoteToServer({
            id: note.id,
            user_id: user.id,
            title: note.title,
            content: note.content,
            plain_text: note.plainText,
            tags: note.tags,
            is_pinned: note.isPinned,
            is_archived: note.isArchived,
            is_trashed: note.isTrashed,
            metadata: note.metadata,
            created_at: new Date(note.createdAt).toISOString(),
            updated_at: new Date(note.updatedAt).toISOString(),
          });
        }
      }

      setLastSyncedAt(new Date());
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      isSyncingRef.current = false;
      setSyncing(false);
    }
  }, [user, notes, setSyncing, setLastSyncedAt]);

  // Queue a note for sync
  const queueSync = useCallback((noteId: string, action: 'upsert' | 'delete') => {
    // Remove any existing queue items for this note
    syncQueueRef.current = syncQueueRef.current.filter(
      (item) => item.noteId !== noteId
    );

    syncQueueRef.current.push({
      noteId,
      action,
      timestamp: Date.now(),
    });

    // Debounce sync processing
    setTimeout(processSyncQueue, 1000);
  }, [processSyncQueue]);

  // Initial sync - fetch notes from server
  const initialSync = useCallback(async () => {
    if (!user || !isSupabaseAvailable()) return;

    setSyncing(true);

    try {
      const { data, error } = await fetchNotesFromServer(user.id);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      if (data) {
        // Transform server notes to local format
        const serverNotes: Note[] = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          plainText: n.plain_text,
          tags: n.tags || [],
          isPinned: n.is_pinned,
          isArchived: n.is_archived,
          isTrashed: n.is_trashed,
          createdAt: new Date(n.created_at),
          updatedAt: new Date(n.updated_at),
          metadata: n.metadata || {},
        }));

        // Merge with local notes (local changes take precedence if newer)
        const mergedNotes = [...serverNotes];
        for (const localNote of notes) {
          const serverNote = serverNotes.find((n) => n.id === localNote.id);
          if (!serverNote) {
            // Local note doesn't exist on server, queue for sync
            mergedNotes.push(localNote);
            queueSync(localNote.id, 'upsert');
          } else if (new Date(localNote.updatedAt) > new Date(serverNote.updatedAt)) {
            // Local is newer, keep local and queue for sync
            const idx = mergedNotes.findIndex((n) => n.id === localNote.id);
            mergedNotes[idx] = localNote;
            queueSync(localNote.id, 'upsert');
          }
        }

        setNotes(mergedNotes);
        setLastSyncedAt(new Date());
      }
    } catch (error) {
      console.error('Initial sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [user, notes, setNotes, setSyncing, setLastSyncedAt, queueSync]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user || !isSupabaseAvailable()) return;

    channelRef.current = subscribeToNoteChanges(user.id, {
      onInsert: (note) => {
        // Check if we already have this note
        const exists = notes.some((n) => n.id === note.id);
        if (!exists) {
          addNote({
            id: note.id,
            title: note.title,
            content: note.content,
            plainText: note.plain_text,
            tags: note.tags || [],
            isPinned: note.is_pinned,
            isArchived: note.is_archived,
            isTrashed: note.is_trashed,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
            metadata: note.metadata || {},
          });
        }
      },
      onUpdate: (note) => {
        updateNote(note.id, {
          title: note.title,
          content: note.content,
          plainText: note.plain_text,
          tags: note.tags || [],
          isPinned: note.is_pinned,
          isArchived: note.is_archived,
          isTrashed: note.is_trashed,
          updatedAt: new Date(note.updated_at),
          metadata: note.metadata || {},
        });
      },
      onDelete: (noteId) => {
        deleteNote(noteId);
      },
    });

    return () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
      }
    };
  }, [user, notes, addNote, updateNote, deleteNote]);

  // Run initial sync on mount
  useEffect(() => {
    if (user) {
      initialSync();
    }
  }, [user]);

  return {
    queueSync,
    initialSync,
  };
}
