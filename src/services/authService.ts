import ENDPOINTS from "@/constants/endpoint";
import type {
  AuthResult,
  BackendUser,
  LoginInput,
  TokenResponse,
} from "@/types/authTypes";

export type {
  AuthResult,
  BackendUser,
  LoginInput,
  TokenResponse,
} from "@/types/authTypes";

interface BackendUserMeResponse {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
}

const STORAGE_USER_KEY = "auth_user";
const STORAGE_TOKEN_KEY = "access_token";

export const authService = {
  async login({ username, password }: LoginInput): Promise<AuthResult> {
    return this.backendLogin({ username, password });
  },

  async backendLogin({ username, password }: LoginInput): Promise<AuthResult> {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const loginRes = await fetch(ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!loginRes.ok) {
      const errorData = await loginRes
        .json()
        .catch(() => ({ detail: "Login failed" }));
      throw new Error(errorData.detail || "Invalid email or password");
    }

    const token = (await loginRes.json()) as TokenResponse;

    const userRes = await fetch(ENDPOINTS.USERS_ME, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!userRes.ok) {
      const errorData = await userRes
        .json()
        .catch(() => ({ detail: "Failed to fetch user info" }));
      throw new Error(errorData.detail || "Failed to fetch user information");
    }

    const userData = (await userRes.json()) as BackendUserMeResponse;

    const user: BackendUser = {
      id: userData.id,
      username: userData.email.split("@")[0],
      email: userData.email,
      full_name: userData.full_name,
      is_admin: userData.is_admin,
      is_active: userData.is_active,
    };

    return {
      user,
      access_token: token.access_token,
    };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  },

  getStoredUser(): BackendUser | null {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as BackendUser;
    } catch {
      return null;
    }
  },

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getStoredUser();
  },

  storeAuth(user: BackendUser, token: string): void {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
  },
};
