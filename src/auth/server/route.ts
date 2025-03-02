import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

/**
 * Auth handler for Bun server routes
 * 
 * This adapter converts between Bun's Request/Response format and the Node.js format
 * that Better Auth expects. It allows us to use Better Auth seamlessly with Bun.
 */
export const authHandler = async (req: Request) => {
  try {
    // Use auth.handler directly with the request
    return await auth.handler(req);
  } catch (error) {
    console.error("Auth handler error:", error);
    return new Response(
      JSON.stringify({ 
        error: { 
          message: "Authentication error occurred", 
          cause: error instanceof Error ? error.message : String(error)
        } 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

/**
 * Helper function to get the current session from a request
 * Can be used in middleware to protect routes
 */
export async function getSessionFromRequest(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}
