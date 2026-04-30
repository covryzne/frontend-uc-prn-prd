import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import type { User } from "@/types";
import type { BackendUser } from "@/types/authTypes";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapBackendUser(user: BackendUser): User {
  return {
    id: user.id,
    nama: user.full_name,
    email: user.email,
    role: user.is_admin ? "Admin" : "Verifikator",
    dibuat: "-",
    login_terakhir: "-",
    avatar_initial: (user.full_name?.[0] ?? "U").toUpperCase(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    authService.getAccessToken(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getAccessToken();

    if (storedUser && storedToken) {
      setUser(mapBackendUser(storedUser));
      setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const result = await authService.login({ username: email, password });
        authService.storeAuth(result.user, result.access_token);
        setToken(result.access_token);
        setUser(mapBackendUser(result.user));
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const authReady = !isLoading;
  const isAuthenticated = !!user;
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      authReady,
      login,
      logout,
      isAdmin: user?.role === "Admin",
    }),
    [authReady, isAuthenticated, isLoading, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
