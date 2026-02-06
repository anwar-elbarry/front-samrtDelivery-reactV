import { apiClient } from '../../../lib/api';
import type { ZoneModel } from '../../coli/types/component.response';
import type { ZoneRequest } from '../types/zone.request';

/**
 * Zone Service - Handles zone operations
 */
export const zoneService = {
  // Create a new zone
  async create(dto: ZoneRequest): Promise<ZoneModel> {
    return apiClient.post<ZoneModel>('/zones', dto);
  },

  // Update a zone
  async update(id: string, dto: ZoneRequest): Promise<ZoneModel> {
    return apiClient.put<ZoneModel>(`/zones/${id}`, dto);
  },

  // Get zone by ID
  async getById(id: string): Promise<ZoneModel> {
    return apiClient.get<ZoneModel>(`/zones/${id}`);
  },

  // Get all zones
  async getAll(): Promise<ZoneModel[]> {
    return apiClient.get<ZoneModel[]>('/zones');
  },

  // Delete a zone
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/zones/${id}`);
  },
};
