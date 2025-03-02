import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSession } from '../client/auth-client';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loader?: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthProvider component that handles authentication state and protected routes
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
  // Use get() method to access atom's value
  const sessionState = useSession.get();
  const data = sessionState?.data;
  const isPending = sessionState?.isPending;
  const error = sessionState?.error;
  
  // Subscribe to changes
  const [state, setState] = useState({
    data,
    isPending,
    error
  });
  
  useEffect(() => {
    // Listen for changes to the session atom
    const unsubscribe = useSession.subscribe((newValue) => {
      setState({
        data: newValue?.data,
        isPending: newValue?.isPending,
        error: newValue?.error
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  // Handle authentication checking and redirects
  useEffect(() => {
    if (state.isPending) return;
    
    // Auth is required but user is not authenticated
    if (requireAuth && !state.data?.user) {
      // Save the current location to redirect back after login
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      });
    }
    
    // Handle auth pages (login/register) when user is already authenticated
    if (!requireAuth && 
        state.data?.user && 
        (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/', { replace: true });
    }
    
    setHasChecked(true);
  }, [state.isPending, state.data, requireAuth, navigate, location, redirectTo]);

  // Show loader while checking authentication
  if (state.isPending || !hasChecked) {
    return <>{loader}</>;
  }

  // Handle error state
  if (state.error) {
    console.error('Authentication error:', state.error);
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
 * Returns user data and loading state
 */
export const useAuth = () => {
  // Use get() method to access atom's value
  const sessionState = useSession.get();
  
  // Subscribe to changes
  const [state, setState] = useState({
    data: sessionState?.data,
    isPending: sessionState?.isPending,
    error: sessionState?.error
  });
  
  useEffect(() => {
    // Listen for changes to the session atom
    const unsubscribe = useSession.subscribe((newValue) => {
      setState({
        data: newValue?.data,
        isPending: newValue?.isPending,
        error: newValue?.error
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return {
    user: state.data?.user,
    isAuthenticated: !!state.data?.user,
    isLoading: state.isPending,
    error: state.error,
  };
};
