import { useEffect } from 'react';
import { authService } from './auth-service';
import { useAuthStore } from './auth-store';

/**
 * Component that initializes authentication from cached JWT
 * and listens for auth:change events
 */
export function AuthInitializer() {
  useEffect(() => {
    // Initialize auth from cached data
    initializeAuth();
    
    // Listen for auth change events
    window.addEventListener('auth:change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth:change', handleAuthChange);
    };
  }, []);
  
  // Initialize auth from cached data
  const initializeAuth = () => {
    // Set loading state while we check
    useAuthStore.getState().setLoading(true);
    
    // Check for cached authentication
    const user = authService.getCurrentUser();
    const token = authService.getAuthToken();
    
    if (user && token) {
      // We have cached auth, update the store
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setAuthenticated(true);
    }
    
    // Set loading to false regardless of result
    useAuthStore.getState().setLoading(false);
  };
  
  // Handle auth change events
  const handleAuthChange = (event: CustomEvent<{ isAuthenticated: boolean }>) => {
    if (event.detail.isAuthenticated) {
      // User is authenticated, update store with latest data
      const user = authService.getCurrentUser();
      const token = authService.getAuthToken();
      
      if (user && token) {
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().setToken(token);
        useAuthStore.getState().setAuthenticated(true);
      }
    } else {
      // User is not authenticated, clear store
      useAuthStore.getState().logout();
    }
    
    // Always update loading state
    useAuthStore.getState().setLoading(false);
  };
  
  // This component doesn't render anything
  return null;
} 