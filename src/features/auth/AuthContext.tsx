/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../../api/client";
import { loginPlayer } from "../../api/player";
import type { Player } from "../../types";

type AuthContextType = {
  user: Player | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchMe(signal?: AbortSignal): Promise<Player | null> {
  try {
    const res = await api.get<Player>("/players/me", { signal });
    return res.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const me = await fetchMe(ac.signal);
        if (me) setUser(me);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [token]);

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      const { token } = await loginPlayer({ username, password });
      localStorage.setItem("token", token);
      setToken(token);
      const me = await fetchMe();
      if (me) setUser(me);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (!token) return;
    setLoading(true);
    try {
      const me = await fetchMe();
      if (me) setUser(me);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
