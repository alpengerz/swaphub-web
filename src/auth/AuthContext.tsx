import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Profile } from "../types/database";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profileComplete: boolean;
  refreshProfile: () => Promise<Profile | null>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ needsVerification: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<Profile | null>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function isProfileComplete(p: Profile | null | undefined): boolean {
  if (!p) return false;
  return Boolean(
    p.username &&
      p.username.trim().length >= 3 &&
      p.city &&
      p.city.trim().length >= 2
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!isSupabaseConfigured) {
      setProfile(null);
      return null;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("loadProfile", error);
      setProfile(null);
      return null;
    }
    const row = (data as Profile | null) ?? null;
    setProfile(row);
    return row;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured) return null;
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    const id = current?.user?.id ?? session?.user?.id;
    if (!id) return null;
    return loadProfile(id);
  }, [loadProfile, session?.user?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        // Defer DB calls so we don't deadlock the auth lock
        window.setTimeout(() => {
          void loadProfile(data.session!.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        }, 0);
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (next?.user) {
        window.setTimeout(() => {
          void loadProfile(next.user.id).finally(() => {
            if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
              if (mounted) setLoading(false);
            }
          });
        }, 0);
      } else {
        setProfile(null);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      profileComplete: isProfileComplete(profile),
      refreshProfile,
      async signUpWithEmail(email, password) {
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        return { needsVerification: !data.session };
      },
      async signInWithEmail(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSession(data.session);
        if (data.user) {
          // Explicit load after password login (don't rely only on the listener)
          return await loadProfile(data.user.id);
        }
        return null;
      },
      async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
      },
      async resendVerification(email) {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      },
      async updateProfile(patch) {
        if (!session?.user) throw new Error("Not signed in");
        const payload = {
          id: session.user.id,
          ...patch,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from("profiles").upsert(payload);
        if (error) throw error;
        return loadProfile(session.user.id);
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setProfile(null);
        setSession(null);
      },
    }),
    [loading, session, profile, refreshProfile, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
