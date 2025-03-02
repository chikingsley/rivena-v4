import { serve } from "bun";
import { auth } from "../auth.ts"; 
import { authHandler, getSessionFromRequest } from "./auth/server/route.ts";
import { registerWithValidation, loginWithLogging, logoutWithCleanup } from "./auth/server/actions.ts";
import { cors } from "./auth/bun-cors.ts";
import index from "./index.html";

// Updated authorization middleware to use our getSessionFromRequest helper
const requireAuth = (handler: (req: Request) => Response | Promise<Response>) => {
  return async (req: Request) => {
    try {
      // Get session from request using our helper function
      const session = await auth.api.getSession({
        headers: req.headers
      });
      
      if (!session || !session.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // If authorized, proceed to the handler
      return handler(req);
    } catch (error) {
      console.error("Auth error:", error);
      return new Response(JSON.stringify({ error: 'Authentication error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
};

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Better Auth routes - now using our authHandler adapter
    "/api/auth/*": {
      GET: async (req) => {
        const handler = await authHandler(req);
        if (handler instanceof Response) {
          return handler;
        }
        // If it's not a Response, it's a Node.js handler which we can't use directly in Bun
        // This should rarely happen with Better Auth + Bun setup
        return new Response("Unsupported response type", { status: 500 });
      },
      POST: async (req) => {
        const handler = await authHandler(req);
        if (handler instanceof Response) {
          return handler;
        }
        // If it's not a Response, it's a Node.js handler which we can't use directly in Bun
        // This should rarely happen with Better Auth + Bun setup
        return new Response("Unsupported response type", { status: 500 });
      }
    },

    // Custom auth endpoints using our action functions
    "/api/custom-auth/register": {
      POST: async (req) => {
        try {
          const data = await req.json();
          const result = await registerWithValidation(data);
          return Response.json(result);
        } catch (error) {
          return Response.json({ error: 'Registration failed' }, { status: 400 });
        }
      }
    },
    
    "/api/custom-auth/login": {
      POST: async (req) => {
        try {
          const data = await req.json();
          const result = await loginWithLogging(data);
          return Response.json(result);
        } catch (error) {
          return Response.json({ error: 'Login failed' }, { status: 400 });
        }
      }
    },
    
    "/api/custom-auth/logout": {
      POST: async (req) => {
        try {
          const result = await logoutWithCleanup(req);
          return Response.json({ success: true });
        } catch (error) {
          return Response.json({ error: 'Logout failed' }, { status: 400 });
        }
      }
    },

    // Protected API routes
    "/api/users": {
      // Public endpoints
      GET: (req) => Response.json([
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" }
      ]),
      
      // Protected endpoints
      POST: requireAuth(async (req) => {
        const body = await req.json();
        return Response.json({ id: 3, ...body }, { status: 201 });
      }),
      
      PUT: requireAuth(async (req) => {
        const body = await req.json();
        return Response.json({ updated: true, ...body });
      }),
      
      DELETE: requireAuth((req) => {
        return new Response(null, { status: 204 });
      })
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  // Apply CORS middleware to all routes
  fetch: cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    maxAge: 600 // 10 minutes
  })((req) => {
    // Fallback for any unmatched routes
    return new Response("Not Found", { status: 404 });
  }),
  
  // Error handler
  error(error) {
    console.error("Server error:", error);
    return new Response(`Internal Server Error: ${error.message}`, { 
      status: 500,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await server.stop();
  process.exit(0);
});