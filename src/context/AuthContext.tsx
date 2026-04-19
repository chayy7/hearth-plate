import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, supabaseConfigError } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  loyalty_points: number;
}

type AppRole = "consumer" | "merchant" | "courier";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_MERCHANT_EMAIL = "merchant@dineverse.com";

const getFallbackRoles = (email?: string | null): AppRole[] => {
  if (email?.toLowerCase() === DEMO_MERCHANT_EMAIL) {
    return ["merchant"];
  }
  return [];
};

const resolveAuthError = (error: unknown): Error => {
  if (supabaseConfigError) {
    return new Error(
      `Supabase configuration issue: ${supabaseConfigError}. Update VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.`
    );
  }

  if (error instanceof Error) {
    const lowered = error.message.toLowerCase();
    if (lowered.includes("failed to fetch") || lowered.includes("fetch failed") || lowered.includes("network")) {
      return new Error(
        "Cannot reach Supabase right now. Check your internet connection and verify your Supabase project URL is active."
      );
    }
    return error;
  }

  return new Error("Authentication request failed due to an unexpected error.");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      setProfile(data as Profile | null);
    } catch {
      setProfile(null);
    }
  }, []);

  const fetchRoles = useCallback(async (userId: string, userEmail?: string | null) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const dbRoles = (data ?? []).map((r: any) => r.role as AppRole);
      setRoles(dbRoles.length > 0 ? dbRoles : getFallbackRoles(userEmail));
    } catch {
      setRoles(getFallbackRoles(userEmail));
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await Promise.all([fetchProfile(user.id), fetchRoles(user.id, user.email)]);
    }
  }, [user, fetchProfile, fetchRoles]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchRoles(session.user.id, session.user.email);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRoles(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRoles]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin,
        },
      });
      return { error: error ? resolveAuthError(error) : null };
    } catch (error) {
      return { error: resolveAuthError(error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? resolveAuthError(error) : null };
    } catch (error) {
      return { error: resolveAuthError(error) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, signUp, signIn, signOut, refreshProfile, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
