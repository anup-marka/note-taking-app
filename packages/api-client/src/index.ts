import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Note, Tag, User, SyncableNote, SyncOperation } from '@note-app/shared-types';

export type { SupabaseClient };

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          plain_text: string;
          tags: string[];
          is_pinned: boolean;
          is_archived: boolean;
          is_trashed: boolean;
          trashed_at: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          sync_status: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          note_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['tags']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
    };
  };
}

let supabaseClient: SupabaseClient<Database> | null = null;

export function initSupabase(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient<Database> {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabaseClient;
}

export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initSupabase first.');
  }
  return supabaseClient;
}

// Auth functions
export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = getSupabase();
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = getSupabase();
  return supabase.auth.getUser();
}

export async function getSession() {
  const supabase = getSupabase();
  return supabase.auth.getSession();
}

// Note CRUD operations for sync
export async function fetchNotes(userId: string, since?: Date) {
  const supabase = getSupabase();
  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (since) {
    query = query.gt('updated_at', since.toISOString());
  }

  return query.order('updated_at', { ascending: false });
}

export async function upsertNote(note: Partial<Database['public']['Tables']['notes']['Insert']>) {
  const supabase = getSupabase();
  return supabase.from('notes').upsert(note).select().single();
}

export async function deleteNote(noteId: string, userId: string) {
  const supabase = getSupabase();
  return supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', userId);
}

// Tag operations
export async function fetchTags(userId: string) {
  const supabase = getSupabase();
  return supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name');
}

export async function upsertTag(tag: Partial<Database['public']['Tables']['tags']['Insert']>) {
  const supabase = getSupabase();
  return supabase.from('tags').upsert(tag).select().single();
}

// Real-time subscriptions
export function subscribeToNotes(
  userId: string,
  onInsert: (note: Database['public']['Tables']['notes']['Row']) => void,
  onUpdate: (note: Database['public']['Tables']['notes']['Row']) => void,
  onDelete: (noteId: string) => void
) {
  const supabase = getSupabase();

  return supabase
    .channel('notes-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onInsert(payload.new as Database['public']['Tables']['notes']['Row'])
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onUpdate(payload.new as Database['public']['Tables']['notes']['Row'])
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onDelete((payload.old as { id: string }).id)
    )
    .subscribe();
}
