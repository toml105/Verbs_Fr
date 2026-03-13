import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

/**
 * Upsert a row in the `profiles` table on first sign-in.
 */
async function upsertProfile(user: User) {
  if (!supabase) return;
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      display_name: user.email?.split('@')[0] ?? null,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If supabase is not configured, immediately mark as loaded (guest mode)
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Upsert profile on sign-in
      if (newSession?.user) {
        upsertProfile(newSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: 'Authentication is not configured.' };

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: friendlyAuthError(error.message) };
      return { error: null };
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: 'Authentication is not configured.' };

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: friendlyAuthError(error.message) };
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Map raw Supabase error messages to user-friendly strings.
 */
function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials'))
    return 'Incorrect email or password. Please try again.';
  if (lower.includes('user already registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (lower.includes('password') && lower.includes('least'))
    return 'Password must be at least 6 characters.';
  if (lower.includes('email') && lower.includes('valid'))
    return 'Please enter a valid email address.';
  if (lower.includes('rate') || lower.includes('too many'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (lower.includes('email not confirmed'))
    return 'Please check your email to confirm your account before signing in.';
  return message;
}
