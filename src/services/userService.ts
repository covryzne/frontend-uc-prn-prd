import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/services/apiClient";
import type { User, UserCreateInput, UserUpdateInput } from "@/types/userTypes";

export type { User, UserCreateInput, UserUpdateInput } from "@/types/userTypes";

class UserService {
  async getAllUsers(): Promise<User[]> {
    return apiClient(ENDPOINTS.USERS);
  }

  async getUserById(userId: string): Promise<User> {
    return apiClient(ENDPOINTS.USER_BY_ID(userId));
  }

  async createUser(user: UserCreateInput): Promise<User> {
    return apiClient(ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUser(userId: string, user: UserUpdateInput): Promise<User> {
    return apiClient(ENDPOINTS.USER_BY_ID(userId), {
      method: "PUT",
      body: JSON.stringify(user),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await apiClient(ENDPOINTS.USER_BY_ID(userId), {
      method: "DELETE",
    });
  }

  async toggleAdminStatus(userId: string, isAdmin: boolean): Promise<User> {
    return apiClient(ENDPOINTS.USER_TOGGLE_ADMIN(userId, isAdmin), {
      method: "PATCH",
    });
  }
}

export const userService = new UserService();
