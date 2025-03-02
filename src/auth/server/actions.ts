import { auth } from "./auth";

/**
 * Custom registration with additional validation
 * This extends Better Auth's built-in registration functionality with custom validation
 */
export async function registerWithValidation(data: {
  email: string;
  password: string;
  name: string;
}) {
  // Custom validation
  if (!data.email || !data.email.includes('@')) {
    return { 
      error: { 
        message: "Please provide a valid email address" 
      } 
    };
  }
  
  if (!data.password || data.password.length < 8) {
    return { 
      error: { 
        message: "Password must be at least 8 characters" 
      } 
    };
  }
  
  if (!data.name || data.name.trim().length < 2) {
    return { 
      error: { 
        message: "Name is required (minimum 2 characters)" 
      } 
    };
  }
  
  try {
    // Use Better Auth's registration
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name
      }
    });
    
    // You could add additional logic here, like:
    // - Create a user profile in another database
    // - Send a welcome email
    // - Log the registration
    console.log(`User registered: ${data.email}`);
    
    return result;
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      error: { 
        message: "Registration failed", 
        cause: error instanceof Error ? error.message : String(error)
      } 
    };
  }
}

/**
 * Login with additional logging and security checks
 */
export async function loginWithLogging(data: {
  email: string;
  password: string;
}) {
  console.log(`Login attempt: ${data.email}`);
  
  // Could add security checks here, e.g.:
  // - Check if account is locked
  // - Rate limiting
  // - IP-based restrictions
  
  try {
    // Use Better Auth's login
    const result = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password
      }
    });
    
    // Log the result
    if ('error' in result) {
      console.log(`Login failed: ${data.email}`);
    } else {
      console.log(`Login successful: ${data.email}`);
      
      // You could add additional logic here, like:
      // - Update last login timestamp
      // - Track user sessions
    }
    
    return result;
  } catch (error) {
    console.error("Login error:", error);
    return { 
      error: { 
        message: "Login failed", 
        cause: error instanceof Error ? error.message : String(error)
      } 
    };
  }
}

/**
 * Safe logout with additional cleanup
 */
export async function logoutWithCleanup(req: Request) {
  try {
    // Get session before logout (for cleanup purposes)
    const session = await auth.api.getSession({
      headers: req.headers
    });
    
    // Perform the logout
    const result = await auth.api.signOut({
      headers: req.headers
    });
    
    // Additional cleanup logic could go here
    if (session?.user) {
      console.log(`User logged out: ${session.user.email}`);
      // Example: Update user status, clear sessions, etc.
    }
    
    return result;
  } catch (error) {
    console.error("Logout error:", error);
    return { 
      error: { 
        message: "Logout failed", 
        cause: error instanceof Error ? error.message : String(error)
      } 
    };
  }
} 