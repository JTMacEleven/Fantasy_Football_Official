import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  loginRequest,
  meRequest,
  signupRequest,
  updateEmailRequest,
  updatePasswordRequest,
  updateProfileDetailsRequest,
  type AuthUser,
} from '@/lib/api';
import { clearSession, loadToken, saveSession } from '@/lib/auth-storage';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfileDetails: (body: {
    displayName?: string;
    phoneNumber?: string | null;
    fplId?: string | null;
  }) => Promise<void>;
  updateEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = await loadToken();
    if (!token) return;
    const { user: currentUser } = await meRequest(token);
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const token = await loadToken();
        if (!token) return;
        const { user: currentUser } = await meRequest(token);
        if (active) setUser(currentUser);
      } catch {
        await clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const { token, user: loggedInUser } = await loginRequest(email, password, rememberMe);
    await saveSession(token, rememberMe);
    setUser(loggedInUser);
  }, []);

  const signup = useCallback(async (email: string, password: string, confirmPassword: string) => {
    const { token, user: newUser } = await signupRequest(email, password, confirmPassword);
    await saveSession(token, true);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const updateProfileDetails = useCallback(
    async (body: { displayName?: string; phoneNumber?: string | null; fplId?: string | null }) => {
      const token = await loadToken();
      if (!token) throw new Error('Not authenticated.');
      const { user: updated } = await updateProfileDetailsRequest(token, body);
      setUser(updated);
    },
    []
  );

  const updateEmail = useCallback(async (currentPassword: string, newEmail: string) => {
    const token = await loadToken();
    if (!token) throw new Error('Not authenticated.');
    const { user: updated } = await updateEmailRequest(token, { currentPassword, newEmail });
    setUser(updated);
  }, []);

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmPassword: string) => {
      const token = await loadToken();
      if (!token) throw new Error('Not authenticated.');
      await updatePasswordRequest(token, { currentPassword, newPassword, confirmPassword });
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      updateProfileDetails,
      updateEmail,
      updatePassword,
    }),
    [
      user,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      updateProfileDetails,
      updateEmail,
      updatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
