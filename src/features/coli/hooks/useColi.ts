import { useState, useCallback } from 'react';
import { coliService, type PageResponse, type PaginationParams } from '../services/coliService';
import type { ColiModel } from '../types/component.response';
import type { ColisRequest } from '../types/component.request';

interface UseColiState {
  colis: ColiModel[];
  selectedColi: ColiModel | null;
  isLoading: boolean;
  error: string | null;
  // Pagination state
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface UseColiReturn extends UseColiState {
  fetchColis: (params?: PaginationParams) => Promise<void>;
  fetchColiById: (id: string) => Promise<void>;
  createColi: (data: ColisRequest) => Promise<ColiModel | null>;
  updateColi: (id: string, data: Partial<ColisRequest>) => Promise<ColiModel | null>;
  deleteColi: (id: string) => Promise<boolean>;
  updateColiStatus: (id: string, statut: string) => Promise<ColiModel | null>;
  // New methods
  fetchColisByStatus: (status: string) => Promise<void>;
  fetchColisByZone: (zoneId: string) => Promise<void>;
  fetchColisByLivreur: (livreurId: string) => Promise<void>;
  fetchColisByClient: (clientId: string) => Promise<void>;
  searchColis: (searchTerm: string) => Promise<void>;
  assignColis: (colisId: string, livreurId: string) => Promise<ColiModel | null>;
  clearError: () => void;
  clearSelectedColi: () => void;
}

export function useColi(): UseColiReturn {
  const [state, setState] = useState<UseColiState>({
    colis: [],
    selectedColi: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  };

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSelectedColi = useCallback(() => {
    setState(prev => ({ ...prev, selectedColi: null }));
  }, []);

  const fetchColis = useCallback(async (params: PaginationParams = {}) => {
    setLoading(true);
    try {
      const response = await coliService.getAll(params);
      // Handle paginated response
      const pageResponse = response as PageResponse<ColiModel>;
      setState(prev => ({
        ...prev,
        colis: pageResponse.content || [],
        totalElements: pageResponse.totalElements || 0,
        totalPages: pageResponse.totalPages || 0,
        currentPage: pageResponse.number || 0,
        pageSize: pageResponse.size || 10,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colis');
    }
  }, []);

  const fetchColiById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const coli = await coliService.getById(id);
      setState(prev => ({ ...prev, selectedColi: coli, isLoading: false, error: null }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coli');
    }
  }, []);

  const createColi = useCallback(async (data: ColisRequest): Promise<ColiModel | null> => {
    setLoading(true);
    try {
      const newColi = await coliService.create(data);
      setState(prev => ({
        ...prev,
        colis: [...prev.colis, newColi],
        totalElements: prev.totalElements + 1,
        isLoading: false,
        error: null,
      }));
      return newColi;
    } catch (err: unknown) {
      // Enhanced error handling for debugging
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { message?: string })?.message || 'Failed to create coli';
      console.error('[useColi] Create error:', err);
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateColi = useCallback(async (id: string, data: Partial<ColisRequest>): Promise<ColiModel | null> => {
    setLoading(true);
    try {
      const updatedColi = await coliService.update(id, data);
      setState(prev => ({
        ...prev,
        colis: prev.colis.map(c => c.id === id ? updatedColi : c),
        selectedColi: prev.selectedColi?.id === id ? updatedColi : prev.selectedColi,
        isLoading: false,
        error: null,
      }));
      return updatedColi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update coli');
      return null;
    }
  }, []);

  const deleteColi = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await coliService.delete(id);
      setState(prev => ({
        ...prev,
        colis: prev.colis.filter(c => c.id !== id),
        selectedColi: prev.selectedColi?.id === id ? null : prev.selectedColi,
        totalElements: prev.totalElements - 1,
        isLoading: false,
        error: null,
      }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete coli');
      return false;
    }
  }, []);

  const updateColiStatus = useCallback(async (id: string, statut: string): Promise<ColiModel | null> => {
    setLoading(true);
    try {
      const updatedColi = await coliService.updateStatus(id, statut);
      setState(prev => ({
        ...prev,
        colis: prev.colis.map(c => c.id === id ? updatedColi : c),
        selectedColi: prev.selectedColi?.id === id ? updatedColi : prev.selectedColi,
        isLoading: false,
        error: null,
      }));
      return updatedColi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      return null;
    }
  }, []);

  const fetchColisByStatus = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const colis = await coliService.getByStatus(status);
      setState(prev => ({
        ...prev,
        colis: Array.isArray(colis) ? colis : [],
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colis by status');
    }
  }, []);

  const fetchColisByZone = useCallback(async (zoneId: string) => {
    setLoading(true);
    try {
      const colis = await coliService.getByZone(zoneId);
      setState(prev => ({
        ...prev,
        colis: Array.isArray(colis) ? colis : [],
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colis by zone');
    }
  }, []);

  const fetchColisByLivreur = useCallback(async (livreurId: string) => {
    setLoading(true);
    try {
      const colis = await coliService.getByLivreur(livreurId);
      setState(prev => ({
        ...prev,
        colis: Array.isArray(colis) ? colis : [],
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colis by livreur');
    }
  }, []);

  const fetchColisByClient = useCallback(async (clientId: string) => {
    setLoading(true);
    try {
      const colis = await coliService.getByClientExpediteur(clientId);
      setState(prev => ({
        ...prev,
        colis: Array.isArray(colis) ? colis : [],
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colis by client');
    }
  }, []);

  const searchColis = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const colis = await coliService.search(searchTerm);
      setState(prev => ({
        ...prev,
        colis: Array.isArray(colis) ? colis : [],
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search colis');
    }
  }, []);

  const assignColis = useCallback(async (colisId: string, livreurId: string): Promise<ColiModel | null> => {
    setLoading(true);
    try {
      const updatedColi = await coliService.assign(colisId, livreurId);
      setState(prev => ({
        ...prev,
        colis: prev.colis.map(c => c.id === colisId ? updatedColi : c),
        selectedColi: prev.selectedColi?.id === colisId ? updatedColi : prev.selectedColi,
        isLoading: false,
        error: null,
      }));
      return updatedColi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign colis');
      return null;
    }
  }, []);

  return {
    ...state,
    fetchColis,
    fetchColiById,
    createColi,
    updateColi,
    deleteColi,
    updateColiStatus,
    fetchColisByStatus,
    fetchColisByZone,
    fetchColisByLivreur,
    fetchColisByClient,
    searchColis,
    assignColis,
    clearError,
    clearSelectedColi,
  };
}
