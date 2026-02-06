import { apiClient } from '../../../lib/api';
import type { UserResponse } from '../types/user/user.response';

/**
 * User Service - Handles user operations
 * Uses /users API endpoint and filters by role on client side
 */
export const userService = {
  async getAll(): Promise<UserResponse[]> {
    return apiClient.get<UserResponse[]>('/users');
  },

  async getById(id: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/users/${id}`);
  },

  // Get users filtered by role - filters on client side
  async getByRole(roleName: string): Promise<UserResponse[]> {
    const users = await this.getAll();
    return users.filter(user => user.role?.roleName === roleName);
  },

  async getExpéditeurs(): Promise<UserResponse[]> {
    return this.getByRole('EXPEDITEUR');
  },

  async getDestinataires(): Promise<UserResponse[]> {
    return this.getByRole('DESTINATAIRE');
  },

  async getLivreurs(): Promise<UserResponse[]> {
    return this.getByRole('LIVREUR');
  },

  async getGestionnaires(): Promise<UserResponse[]> {
    return this.getByRole('GESTIONNAIRE');
  },
};
