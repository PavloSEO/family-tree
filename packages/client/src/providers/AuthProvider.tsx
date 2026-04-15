import type { User } from "@family-tree/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { fetchCurrentUser, loginRequest } from "../api/auth.js";
import { LS_TOKEN_KEY, setMemoryToken } from "../lib/auth-token-store.js";

export type AuthContextValue = {
  /** Сессия восстановлена (в т.ч. без токена в LS). */
  ready: boolean;
  token: string | null;
  user: User | null;
  login: (params: {
    login: string;
    password: string;
    remember: boolean;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMemoryToken(token);
  }, [token]);

  /** Выход из другой вкладки: `removeItem` шлёт `storage` только в прочих вкладках. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) {
        return;
      }
      if (e.key !== LS_TOKEN_KEY) {
        return;
      }
      if (e.newValue !== null) {
        return;
      }
      setMemoryToken(null);
      setToken(null);
      setUser(null);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = localStorage.getItem(LS_TOKEN_KEY);
      if (stored) {
        if (typeof window !== "undefined" && !window.isSecureContext) {
          console.warn(
            "[auth] Токен в localStorage вне HTTPS (не secure context): включите TLS в проде.",
          );
        }
        setMemoryToken(stored);
        setToken(stored);
        try {
          const u = await fetchCurrentUser();
          if (!cancelled) {
            setUser(u);
          }
        } catch {
          if (!cancelled) {
            setMemoryToken(null);
            setToken(null);
            setUser(null);
            localStorage.removeItem(LS_TOKEN_KEY);
          }
        }
      } else {
        setMemoryToken(null);
      }
      if (!cancelled) {
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (params: {
      login: string;
      password: string;
      remember: boolean;
    }) => {
      const { token: newToken, user: newUser } = await loginRequest(params);
      setMemoryToken(newToken);
      setToken(newToken);
      setUser(newUser);
      if (params.remember) {
        localStorage.setItem(LS_TOKEN_KEY, newToken);
      } else {
        localStorage.removeItem(LS_TOKEN_KEY);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setMemoryToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_TOKEN_KEY);
  }, []);

  const value: AuthContextValue = {
    ready,
    token,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const { t } = useTranslation("auth");
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(t("useAuthOutsideProvider"));
  }
  return ctx;
}
