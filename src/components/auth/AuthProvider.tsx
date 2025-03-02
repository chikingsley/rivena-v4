import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSession } from '../../auth/client/auth-client';
import { authService } from '../../auth/client/auth-service';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/client/auth-store';

interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loader?: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthProvider component that handles authentication state and protected routes
 * Enhanced with Zustand store for instant and persistent authentication
 * 
 * @param children - The components to render
 * @param requireAuth - Whether authentication is required to access this route
 * @param redirectTo - Where to redirect if authentication is required but user is not authenticated
 * @param loader - Component to show while checking authentication
 * @param fallback - Component to show if there's an error
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  requireAuth = false,
  redirectTo = '/login',
  loader = <DefaultLoader />,
  fallback = <DefaultError />
}) => {
  // Use Zustand store for instant auth state
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // Also subscribe to session for Better Auth updates
  const sessionState = useSession.get();
  const error = sessionState?.error;
  
  const navigate = useNavigate();
  const location = useLocation();

  // Handle authentication checking and redirects
  useEffect(() => {
    if (isLoading) return;
    
    // Auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      // Save the current location to redirect back after login
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      });
    }
    
    // Handle auth pages (login/register) when user is already authenticated
    if (!requireAuth && 
        isAuthenticated && 
        (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, requireAuth, navigate, location, redirectTo]);

  // Show loader while checking authentication
  if (isLoading) {
    return <>{loader}</>;
  }

  // Handle error state
  if (error) {
    console.error('Authentication error:', error);
    return <>{fallback}</>;
  }

  // Authentication check passed or not required
  return <>{children}</>;
};

// Default loader component
const DefaultLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Default error component
const DefaultError = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <h3 className="text-red-800 text-lg font-medium">Authentication Error</h3>
      <p className="text-red-600">There was an error with authentication. Please try again later.</p>
    </div>
  </div>
);

/**
 * Higher-order component to protect routes that require authentication
 */
export const withAuth = (Component: React.ComponentType) => {
  return (props: any) => (
    <AuthProvider requireAuth={true}>
      <Component {...props} />
    </AuthProvider>
  );
};

/**
 * Hook to check if the current user is authenticated
 * Uses Zustand store for instant auth validation
 */
export const useAuth = () => {
  const authState = useAuthStore();
  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading
  };
};
