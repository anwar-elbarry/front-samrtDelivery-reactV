import { apiClient } from '../../../lib/api';
import type { ColisRequest } from '../types/component.request';
import type { ColiModel } from '../types/component.response';

// Pagination response interface
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Pagination params interface
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Coli Service - Handles package/colis operations
 * Uses the centralized API client with JWT interceptor
 */
export const coliService = {
  // Create a new colis
  async create(data: ColisRequest): Promise<ColiModel> {
    return apiClient.post<ColiModel>('/colis', data);
  },

  // Get all colis with pagination
  async getAll(params: PaginationParams = {}): Promise<PageResponse<ColiModel>> {
    const {
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDir = 'asc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    return apiClient.get<PageResponse<ColiModel>>(`/colis?${queryParams.toString()}`);
  },

  // Get colis by ID
  async getById(id: string): Promise<ColiModel> {
    return apiClient.get<ColiModel>(`/colis/${id}`);
  },

  // Update colis
  async update(id: string, data: Partial<ColisRequest>): Promise<ColiModel> {
    return apiClient.put<ColiModel>(`/colis/${id}`, data);
  },

  // Delete colis
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/colis/${id}`);
  },

  // Update colis status
  async updateStatus(id: string, status: string): Promise<ColiModel> {
    return apiClient.patch<ColiModel>(`/colis/${id}/status?status=${encodeURIComponent(status)}`);
  },

  // Get colis by status
  async getByStatus(status: string): Promise<ColiModel[]> {
    const queryParams = new URLSearchParams({ status });
    return apiClient.get<ColiModel[]>(`/colis/status?${queryParams.toString()}`);
  },

  // Get colis by zone
  async getByZone(zoneId: string): Promise<ColiModel[]> {
    return apiClient.get<ColiModel[]>(`/colis/zone/${zoneId}`);
  },

  // Get colis by livreur
  async getByLivreur(livreurId: string): Promise<ColiModel[]> {
    return apiClient.get<ColiModel[]>(`/colis/livreur/${livreurId}`);
  },

  // Get colis by client expediteur
  async getByClientExpediteur(clientId: string): Promise<ColiModel[]> {
    return apiClient.get<ColiModel[]>(`/colis/client/${clientId}`);
  },

  // Search colis
  async search(searchTerm: string): Promise<ColiModel[]> {
    const queryParams = new URLSearchParams({ search: searchTerm });
    return apiClient.get<ColiModel[]>(`/colis/search?${queryParams.toString()}`);
  },

  // Assign colis to livreur
  async assign(colisId: string, livreurId: string): Promise<ColiModel> {
    const queryParams = new URLSearchParams({
      colisId,
      livreurId
    });
    return apiClient.put<ColiModel>(`/colis/assign?${queryParams.toString()}`);
  },
};
