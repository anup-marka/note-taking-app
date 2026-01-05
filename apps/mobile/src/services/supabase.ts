import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { config } from '../lib/config';

// Custom storage adapter using expo-secure-store
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize the Supabase client
 * Should be called once when the app starts
 */
export function initializeSupabase(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { url, anonKey } = config.supabase;

  if (!url || !anonKey) {
    console.warn('Supabase credentials not configured. Running in offline mode.');
    return null;
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}

/**
 * Get the Supabase client instance
 * Returns null if not initialized or credentials missing
 */
export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseAvailable(): boolean {
  return supabaseClient !== null;
}

// Auth helpers
export async function signInWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signUp({ email, password });
}

export async function signOut() {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signOut();
}

export async function getSession() {
  const client = getSupabase();
  if (!client) return { data: { session: null }, error: null };
  return client.auth.getSession();
}

export async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return { data: { user: null }, error: null };
  return client.auth.getUser();
}

// Auth state listener
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const client = getSupabase();
  if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
  return client.auth.onAuthStateChange(callback);
}

// Database operations for notes
export async function fetchNotesFromServer(userId: string, since?: Date) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');

  let query = client
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (since) {
    query = query.gt('updated_at', since.toISOString());
  }

  return query.order('updated_at', { ascending: false });
}

export async function upsertNoteToServer(note: Record<string, unknown>) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  return client.from('notes').upsert(note).select().single();
}

export async function deleteNoteOnServer(noteId: string, userId: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  return client
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', userId);
}

// Real-time subscriptions
export function subscribeToNoteChanges(
  userId: string,
  callbacks: {
    onInsert?: (note: any) => void;
    onUpdate?: (note: any) => void;
    onDelete?: (noteId: string) => void;
  }
) {
  const client = getSupabase();
  if (!client) return null;

  const channel = client
    .channel('notes-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callbacks.onInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callbacks.onUpdate?.(payload.new)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callbacks.onDelete?.((payload.old as { id: string }).id)
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromChannel(channel: any) {
  const client = getSupabase();
  if (!client || !channel) return;
  client.removeChannel(channel);
}
