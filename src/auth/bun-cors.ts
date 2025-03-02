/**
 * A feature-rich CORS middleware for Bun.serve
 */

/**
 * HTTP method types (identical to Elysia's implementation)
 */
export type HTTPMethod =
  | 'ACL'
  | 'BIND'
  | 'CHECKOUT'
  | 'CONNECT'
  | 'COPY'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'LINK'
  | 'LOCK'
  | 'M-SEARCH'
  | 'MERGE'
  | 'MKACTIVITY'
  | 'MKCALENDAR'
  | 'MKCOL'
  | 'MOVE'
  | 'NOTIFY'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'PURGE'
  | 'PUT'
  | 'REBIND'
  | 'REPORT'
  | 'SEARCH'
  | 'SOURCE'
  | 'SUBSCRIBE'
  | 'TRACE'
  | 'UNBIND'
  | 'UNLINK'
  | 'UNLOCK'
  | 'UNSUBSCRIBE';

type Origin = string | RegExp | ((request: Request) => boolean | void);
type MaybeArray<T> = T | T[];

/**
 * CORS configuration options
 */
export interface CORSConfig {
  /**
   * Configure which origins are allowed
   * @default true (all origins are allowed with '*')
   * 
   * Value can be:
   * - `true` - Allow any origin (sets '*' or mirrors request origin)
   * - `string` - Specific origin to allow
   * - `RegExp` - Pattern to match allowed origins
   * - `Function` - Custom validation function
   * - `Array<string|RegExp|Function>` - List of allowed origins
   */
  origin?: Origin | boolean | Origin[];

  /**
   * Configure which methods are allowed
   * @default true (all methods)
   * 
   * Value can be:
   * - `true` - Allow all methods
   * - `*` - Allow all methods
   * - `HTTPMethod` - Single method or comma-delimited string
   * - `HTTPMethod[]` - Array of allowed methods
   */
  methods?: boolean | undefined | null | '' | '*' | MaybeArray<HTTPMethod | (string & {})>;

  /**
   * Configure which headers clients can include in requests
   * @default true (mirror request headers)
   * 
   * Value can be:
   * - `true` - Mirror the Access-Control-Request-Headers
   * - `string` - Comma-delimited list of headers
   * - `string[]` - Array of allowed headers
   */
  allowedHeaders?: true | string | string[];

  /**
   * Configure which headers are accessible to client scripts
   * @default true (all headers)
   * 
   * Value can be:
   * - `true` - All headers
   * - `string` - Comma-delimited list of headers
   * - `string[]` - Array of exposed headers
   */
  exposeHeaders?: true | string | string[];

  /**
   * Allow credentials (cookies, authorization headers)
   * @default true
   */
  credentials?: boolean;

  /**
   * How long preflight results can be cached (in seconds)
   * @default 5
   */
  maxAge?: number;

  /**
   * Whether to automatically handle OPTIONS preflight requests
   * @default true
   */
  preflight?: boolean;
}

/**
 * Detect if we're running in Bun
 */
const isBun = typeof Bun !== 'undefined' && typeof new Headers()?.toJSON === 'function';

/**
 * Extract header keys from a Headers object
 */
const processHeaders = (headers: Headers): string => {
  if (isBun) {
    // @ts-ignore - Bun-specific API
    return Object.keys(headers.toJSON()).join(', ');
  }

  // Fallback for non-Bun environments
  const keys: string[] = [];
  headers.forEach((_, key) => keys.push(key));
  return keys.join(', ');
};

/**
 * Validate if an origin is allowed based on configuration
 */
const isOriginAllowed = (
  origin: Origin | Origin[],
  request: Request,
  requestOrigin: string
): boolean => {
  if (Array.isArray(origin)) {
    return origin.some(o => isOriginAllowed(o, request, requestOrigin));
  }

  switch (typeof origin) {
    case 'string':
      // Domain-only pattern without protocol
      if (origin.indexOf('://') === -1) return requestOrigin.includes(origin);
      // Exact origin match
      return origin === requestOrigin;

    case 'function':
      return origin(request) === true;

    case 'object':
      if (origin instanceof RegExp) return origin.test(requestOrigin);
  }

  return false;
};

/**
 * Create a CORS middleware for Bun
 */
export const cors = (config?: CORSConfig) => {
  // Default configuration
  const {
    origin = true,
    methods = true,
    allowedHeaders = true,
    exposeHeaders = true,
    credentials = true,
    maxAge = 5,
    preflight = true
  } = config ?? {};

  // Process array configurations
  const allowedHeadersValue = Array.isArray(allowedHeaders) 
    ? allowedHeaders.join(', ') 
    : allowedHeaders;
    
  const exposeHeadersValue = Array.isArray(exposeHeaders) 
    ? exposeHeaders.join(', ') 
    : exposeHeaders;

  // Process methods
  const methodsValue = Array.isArray(methods) ? methods.join(', ') : methods;

  // Normalize origins for easier processing
  const origins = typeof origin === 'boolean'
    ? undefined
    : Array.isArray(origin)
      ? origin
      : [origin];

  const anyOrigin = origins?.some(o => o === '*');

  /**
   * Handle origin validation and set appropriate headers
   */
  const handleOrigin = (headers: Headers, request: Request): void => {
    // If all origins are allowed
    if (origin === true) {
      headers.set('Vary', '*');
      headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') || '*');
      return;
    }

    // If specific wildcard is set
    if (anyOrigin) {
      headers.set('Vary', '*');
      headers.set('Access-Control-Allow-Origin', '*');
      return;
    }

    // If no origins are defined
    if (!origins?.length) return;

    // Check each origin
    const requestOrigin = request.headers.get('Origin') ?? '';
    if (!requestOrigin) return;

    for (const originRule of origins) {
      if (isOriginAllowed(originRule, request, requestOrigin)) {
        headers.set('Vary', 'Origin');
        headers.set('Access-Control-Allow-Origin', requestOrigin);
        return;
      }
    }

    // No matching origin found
    headers.set('Vary', 'Origin');
  };

  /**
   * Handle allowed methods
   */
  const handleMethods = (headers: Headers, method?: string | null): void => {
    if (!method) return;

    if (methods === true) {
      headers.set('Access-Control-Allow-Methods', method ?? '*');
      return;
    }

    if (methods === false || !methods) return;

    if (methods === '*') {
      headers.set('Access-Control-Allow-Methods', '*');
      return;
    }

    headers.set('Access-Control-Allow-Methods', typeof methodsValue === 'string' ? methodsValue : '*');
  };

  /**
   * Handle preflight OPTIONS request
   */
  const handlePreflight = (request: Request): Response => {
    const headers = new Headers();
    
    handleOrigin(headers, request);
    handleMethods(headers, request.headers.get('Access-Control-Request-Method'));

    // Handle request headers
    if (allowedHeadersValue === true) {
      const requestHeaders = request.headers.get('Access-Control-Request-Headers');
      if (requestHeaders) {
        headers.set('Access-Control-Allow-Headers', requestHeaders);
      }
    } else if (typeof allowedHeadersValue === 'string') {
      headers.set('Access-Control-Allow-Headers', allowedHeadersValue);
    }

    // Handle expose headers
    if (exposeHeadersValue === true) {
      headers.set('Access-Control-Expose-Headers', processHeaders(request.headers));
    } else if (typeof exposeHeadersValue === 'string') {
      headers.set('Access-Control-Expose-Headers', exposeHeadersValue);
    }

    // Set credentials if enabled
    if (credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Set max age if provided
    if (maxAge) {
      headers.set('Access-Control-Max-Age', maxAge.toString());
    }

    return new Response(null, { 
      status: 204, 
      headers 
    });
  };

  /**
   * Apply CORS headers to a response
   */
  const applyCorsHeaders = (request: Request, response: Response): Response => {
    const headers = new Headers(response.headers);
    
    handleOrigin(headers, request);
    handleMethods(headers, request.method);

    // Handle allowed headers
    if (allowedHeadersValue === true) {
      headers.set('Access-Control-Allow-Headers', processHeaders(request.headers));
    } else if (typeof allowedHeadersValue === 'string') {
      headers.set('Access-Control-Allow-Headers', allowedHeadersValue);
    }

    // Handle expose headers
    if (exposeHeadersValue === true) {
      headers.set('Access-Control-Expose-Headers', processHeaders(request.headers));
    } else if (typeof exposeHeadersValue === 'string') {
      headers.set('Access-Control-Expose-Headers', exposeHeadersValue);
    }

    // Set credentials if enabled
    if (credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };

  /**
   * Wrap a fetch handler with CORS functionality
   */
  return (handler: (req: Request) => Response | Promise<Response>) => {
    return async (request: Request): Promise<Response> => {
      // Handle preflight requests
      if (preflight && request.method === 'OPTIONS') {
        return handlePreflight(request);
      }
      
      // Process the request with the original handler
      const response = await handler(request);
      
      // Apply CORS headers to the response
      return applyCorsHeaders(request, response);
    };
  };
};

export default cors;
