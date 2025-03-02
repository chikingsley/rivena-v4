import { signIn, signUp, signOut, useSession } from './auth-client';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from './auth-store';

/**
 * Type definition for decoded JWT payload
 */
interface DecodedJwt {
  id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Type for the cached authentication state
 */
interface CachedAuth {
  jwt: string;
  user: {
    id: string;
    email: string;
    name: string;
    [key: string]: any;
  };
  expiresAt: number;
}

/**
 * Auth service that extends Better Auth with JWT caching for instant auth
 */
class AuthService {
  // Initialize with cached values from localStorage if available
  private cachedAuth: CachedAuth | null = null;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Load cached authentication immediately during construction
    this.loadCachedAuth();
    
    // Subscribe to session changes from Better Auth
    if (typeof window !== 'undefined') {
      // Notify listeners that we may have a user from cache
      if (this.cachedAuth) {
        this.emitAuthChange(true);
      }
      
      // Subscribe to session changes with the API we already have
      useSession.subscribe(this.handleSessionChange);
    }
  }

  /**
   * Load cached authentication from localStorage
   */
  private loadCachedAuth() {
    try {
      const cached = localStorage.getItem('cached_auth');
      if (cached) {
        const auth = JSON.parse(cached) as CachedAuth;
        
        // Check if token is expired
        if (auth.expiresAt > Date.now()) {
          this.cachedAuth = auth;
          
          // Schedule refresh before token expires
          this.scheduleTokenRefresh(auth.expiresAt);
          
          console.log('Loaded cached authentication');
        } else {
          // Clear expired token
          console.log('Cached token is expired, clearing');
          localStorage.removeItem('cached_auth');
        }
      }
    } catch (error) {
      console.error('Error loading cached auth:', error);
      localStorage.removeItem('cached_auth');
    }
  }

  /**
   * Handle session changes from Better Auth
   */
  private handleSessionChange = async (session: any) => {
    // If user is logged in, get JWT token and cache it
    if (session?.data?.user) {
      await this.refreshAndCacheToken();
      
      // Update Zustand store with user data
      useAuthStore.getState().setUser(session.data.user);
      useAuthStore.getState().setAuthenticated(true);
      useAuthStore.getState().setLoading(false);
    } else if (session !== null && session.data === null && !session.isPending) {
      // Only clear cache when we have a definitive logged-out state
      // (not during initial loading or when session state is being determined)
      this.clearCachedAuth();
      this.emitAuthChange(false);
      
      // Update Zustand store to reflect logout
      useAuthStore.getState().logout();
      useAuthStore.getState().setLoading(false);
    } else {
      // Update loading state in store
      useAuthStore.getState().setLoading(session?.isPending ?? false);
    }
  };

  /**
   * Refreshes the JWT token and caches it
   */
  private async refreshAndCacheToken() {
    try {
      // Fetch JWT token from auth endpoint
      const response = await fetch('/api/auth/token');
      
      if (!response.ok) {
        throw new Error('Failed to get JWT token');
      }
      
      const { token } = await response.json();
      
      // Decode token to get user info and expiration
      const decoded = jwtDecode<DecodedJwt>(token);
      
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      
      // Store in memory cache
      this.cachedAuth = {
        jwt: token,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        },
        expiresAt,
      };
      
      // Store in localStorage for persistence across refreshes
      localStorage.setItem('cached_auth', JSON.stringify(this.cachedAuth));
      
      // Schedule token refresh
      this.scheduleTokenRefresh(expiresAt);
      
      // Store token in Zustand
      useAuthStore.getState().setToken(token);
      
      // After successful refresh, emit authentication change
      this.emitAuthChange(true);
      
      console.log('JWT token cached successfully');
    } catch (error) {
      console.error('Error refreshing JWT token:', error);
    }
  }

  /**
   * Schedule a token refresh before the current token expires
   */
  private scheduleTokenRefresh(expiresAt: number) {
    // Clear any existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    // Calculate time to refresh (5 minutes before expiry)
    const refreshTime = expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimeout = setTimeout(() => {
        this.refreshAndCacheToken();
      }, refreshTime);
      
      console.log(`Token refresh scheduled in ${refreshTime / 1000} seconds`);
    } else {
      // Token is about to expire, refresh immediately
      this.refreshAndCacheToken();
    }
  }

  /**
   * Clear cached authentication data
   */
  private clearCachedAuth() {
    this.cachedAuth = null;
    localStorage.removeItem('cached_auth');
    console.log('Cached authentication cleared');
    
    // Also update Zustand store
    useAuthStore.getState().logout();
    
    // Clear any pending refresh timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser() {
    // First check Zustand store for most up-to-date info
    const storeUser = useAuthStore.getState().user;
    if (storeUser) return storeUser;
    
    // Fall back to cached auth if available
    return this.cachedAuth?.user || null;
  }

  /**
   * Get the JWT auth token
   */
  getAuthToken() {
    // First check Zustand store
    const storeToken = useAuthStore.getState().token;
    if (storeToken) return storeToken;
    
    // Fall back to cached JWT
    return this.cachedAuth?.jwt || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    // First check Zustand store
    if (useAuthStore.getState().isAuthenticated) return true;
    
    // Fall back to cached auth check
    return this.cachedAuth !== null;
  }

  // Add this method to emit authentication changes
  private emitAuthChange(isAuthenticated: boolean) {
    // Dispatch a custom event that components can listen to
    const event = new CustomEvent('auth:change', { 
      detail: { isAuthenticated } 
    });
    window.dispatchEvent(event);
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Re-export Better Auth functions for convenience
export { signIn, signUp, signOut, useSession }; 