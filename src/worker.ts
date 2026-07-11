export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    
    try {
      // 1. Try to fetch the static asset
      const response = await env.ASSETS.fetch(request);
      
      // 2. If it's a 404 and not an API request, serve index.html for SPA routing
      if (response.status === 404 && !url.pathname.startsWith('/api')) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      }
      
      return response;
    } catch (e) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
