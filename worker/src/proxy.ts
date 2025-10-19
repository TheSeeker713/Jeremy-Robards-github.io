/**
 * Cloudflare Worker: Article Proxy
 * 
 * Purpose: Proxy /article/* requests from www.jeremyrobards.com to jr-articles.pages.dev
 * 
 * This worker allows you to:
 * - Serve CMS articles from a separate Pages project
 * - Keep /article/* path structure on your main domain
 * - Cache article content for better performance
 * - Provide friendly 404 pages when articles don't exist
 */

export interface Env {
  // Environment variables (injected via wrangler.toml or dashboard)
  // None required for this worker - target URL is hardcoded
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Only handle /article/* paths
    if (!url.pathname.startsWith('/article/')) {
      return new Response('Not Found', { status: 404 });
    }
    
    // Build upstream URL (jr-articles.pages.dev)
    const upstreamUrl = new URL(url.pathname + url.search, 'https://jr-articles.pages.dev');
    
    try {
      // Fetch from upstream (jr-articles project)
      const upstreamResponse = await fetch(upstreamUrl.toString(), {
        method: request.method,
        headers: request.headers,
        redirect: 'follow',
      });
      
      // Handle 404 from upstream with friendly error page
      if (upstreamResponse.status === 404) {
        return createNotFoundResponse(url.pathname);
      }
      
      // Clone response to modify headers
      const response = new Response(upstreamResponse.body, upstreamResponse);
      
      // Set cache headers
      // - Browser cache: 5 minutes (max-age=300)
      // - Cloudflare edge cache: 24 hours (s-maxage=86400)
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=86400');
      
      // Add CORS headers if needed
      response.headers.set('Access-Control-Allow-Origin', '*');
      
      return response;
      
    } catch (error) {
      // Handle fetch errors (network issues, etc.)
      console.error('Proxy error:', error);
      return createErrorResponse(error);
    }
  },
};

/**
 * Create a friendly 404 response when article doesn't exist
 */
function createNotFoundResponse(requestedPath: string): Response {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Article Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      font-size: 4rem;
      margin: 0 0 1rem 0;
    }
    p {
      font-size: 1.25rem;
      margin: 1rem 0;
      opacity: 0.9;
    }
    .path {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-family: monospace;
      margin: 1.5rem 0;
      word-break: break-all;
    }
    a {
      display: inline-block;
      margin-top: 2rem;
      padding: 1rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    a:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📝 404</h1>
    <p>Article Not Found</p>
    <div class="path">${escapeHtml(requestedPath)}</div>
    <p>The article you're looking for doesn't exist or has been moved.</p>
    <a href="/writing.html">← Back to Articles</a>
  </div>
</body>
</html>
  `.trim();
  
  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60', // Cache 404s for 1 minute
    },
  });
}

/**
 * Create an error response for fetch failures
 */
function createErrorResponse(error: unknown): Response {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      font-size: 4rem;
      margin: 0 0 1rem 0;
    }
    p {
      font-size: 1.25rem;
      margin: 1rem 0;
      opacity: 0.9;
    }
    a {
      display: inline-block;
      margin-top: 2rem;
      padding: 1rem 2rem;
      background: white;
      color: #f5576c;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    a:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ 503</h1>
    <p>Service Temporarily Unavailable</p>
    <p>We're having trouble connecting to the article server. Please try again in a moment.</p>
    <a href="/">← Back to Home</a>
  </div>
</body>
</html>
  `.trim();
  
  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache', // Don't cache errors
      'Retry-After': '60', // Suggest retry after 60 seconds
    },
  });
}

/**
 * Escape HTML to prevent XSS in error messages
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
