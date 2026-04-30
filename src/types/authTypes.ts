export type AuthRole = "ADMIN" | "USER";

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthResult {
  user: BackendUser;
  access_token: string;
}
