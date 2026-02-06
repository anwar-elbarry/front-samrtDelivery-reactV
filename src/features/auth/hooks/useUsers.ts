import { useState, useCallback, useEffect, useMemo } from 'react';
import { userService } from '../services/userService';
import type { UserResponse } from '../types/user/user.response';

interface UseUsersReturn {
  users: UserResponse[];
  expediteurs: UserResponse[];
  destinataires: UserResponse[];
  livreurs: UserResponse[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getAll();
      // Handle both array and wrapped response
      const data = Array.isArray(response)
        ? response
        : (response as unknown as { content?: UserResponse[]; data?: UserResponse[] }).content
          ?? (response as unknown as { content?: UserResponse[]; data?: UserResponse[] }).data
          ?? [];
      setUsers(data);
    } catch (err) {
      console.error('[useUsers] Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter users by role - computed values
  const expediteurs = useMemo(() => 
    users.filter(user => user.role?.roleName === 'EXPEDITEUR'),
    [users]
  );

  const destinataires = useMemo(() => 
    users.filter(user => user.role?.roleName === 'DESTINATAIRE'),
    [users]
  );

  const livreurs = useMemo(() => 
    users.filter(user => user.role?.roleName === 'LIVREUR'),
    [users]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, expediteurs, destinataires, livreurs, isLoading, error, fetchUsers };
}

// Alias for backward compatibility
export function useClients(): UseUsersReturn {
  return useUsers();
}
