import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './authContextDef';

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}
