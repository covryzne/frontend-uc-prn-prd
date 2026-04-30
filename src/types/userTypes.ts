export interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface UserCreateInput {
  full_name: string;
  email: string;
  password: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
}
