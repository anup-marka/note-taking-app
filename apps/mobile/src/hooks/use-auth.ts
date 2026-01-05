import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import type { User } from '@note-app/shared-types';

// TODO: Replace with actual Supabase integration
// This is a placeholder implementation for development

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, signOut: storeSignOut } =
    useAuthStore();

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Check Supabase session
      // const { data: { session } } = await supabase.auth.getSession();
      // if (session?.user) {
      //   setUser(mapSupabaseUser(session.user));
      // }

      // For now, simulate no existing session
      setUser(null);
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        // TODO: Implement actual Supabase sign in
        // const { data, error } = await supabase.auth.signInWithPassword({
        //   email,
        //   password,
        // });
        // if (error) throw error;
        // setUser(mapSupabaseUser(data.user));

        // Placeholder: simulate successful sign in
        const mockUser: User = {
          id: '1',
          email,
          displayName: email.split('@')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
      } catch (error) {
        setLoading(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        // TODO: Implement actual Supabase sign up
        // const { data, error } = await supabase.auth.signUp({
        //   email,
        //   password,
        // });
        // if (error) throw error;
        // setUser(mapSupabaseUser(data.user));

        // Placeholder: simulate successful sign up
        const mockUser: User = {
          id: '1',
          email,
          displayName: email.split('@')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
      } catch (error) {
        setLoading(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading]
  );

  const signOut = useCallback(async () => {
    try {
      // TODO: Implement actual Supabase sign out
      // await supabase.auth.signOut();
      storeSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [storeSignOut]);

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    checkSession,
  };
}
