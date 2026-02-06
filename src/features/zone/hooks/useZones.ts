import { useState, useCallback, useEffect } from 'react';
import { zoneService } from '../services/zoneService';
import type { ZoneModel } from '../../coli/types/component.response';
import type { ZoneRequest } from '../types/zone.request';

interface UseZonesReturn {
  zones: ZoneModel[];
  selectedZone: ZoneModel | null;
  isLoading: boolean;
  error: string | null;
  fetchZones: () => Promise<void>;
  fetchZoneById: (id: string) => Promise<void>;
  createZone: (dto: ZoneRequest) => Promise<ZoneModel | null>;
  updateZone: (id: string, dto: ZoneRequest) => Promise<ZoneModel | null>;
  deleteZone: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelectedZone: () => void;
}

export function useZones(): UseZonesReturn {
  const [zones, setZones] = useState<ZoneModel[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelectedZone = useCallback(() => {
    setSelectedZone(null);
  }, []);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await zoneService.getAll();
      // Handle both array and wrapped response
      const data = Array.isArray(response)
        ? response
        : (response as unknown as { content?: ZoneModel[]; data?: ZoneModel[] }).content
          ?? (response as unknown as { content?: ZoneModel[]; data?: ZoneModel[] }).data
          ?? [];
      setZones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchZoneById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const zone = await zoneService.getById(id);
      setSelectedZone(zone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zone');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createZone = useCallback(async (dto: ZoneRequest): Promise<ZoneModel | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newZone = await zoneService.create(dto);
      setZones(prev => [...prev, newZone]);
      return newZone;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create zone');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateZone = useCallback(async (id: string, dto: ZoneRequest): Promise<ZoneModel | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedZone = await zoneService.update(id, dto);
      setZones(prev => prev.map(z => z.id === id ? updatedZone : z));
      if (selectedZone?.id === id) {
        setSelectedZone(updatedZone);
      }
      return updatedZone;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update zone');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedZone?.id]);

  const deleteZone = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await zoneService.delete(id);
      setZones(prev => prev.filter(z => z.id !== id));
      if (selectedZone?.id === id) {
        setSelectedZone(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete zone');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedZone?.id]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return {
    zones,
    selectedZone,
    isLoading,
    error,
    fetchZones,
    fetchZoneById,
    createZone,
    updateZone,
    deleteZone,
    clearError,
    clearSelectedZone,
  };
}
