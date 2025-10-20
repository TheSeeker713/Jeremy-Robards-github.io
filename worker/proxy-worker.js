// Cloudflare Worker placeholder for proxying /article/* requests.
export default {
  async fetch(request, env, ctx) {
    return new Response('Worker proxy not yet implemented.', {
      status: 501,
      headers: { 'content-type': 'text/plain' },
    });
  },
};
