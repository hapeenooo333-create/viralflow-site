// Cloudflare Worker: workers/groq-proxy.js
// Deploy this with Wrangler or Cloudflare dashboard. Set the secret/environment variable GROQ_API_KEY in the Worker (e.g. `wrangler secret put GROQ_API_KEY`).

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      // forward the incoming body to Groq with the worker-held API key
      const body = await request.text();
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body,
      });

      const responseText = await groqRes.text();
      const responseHeaders = new Headers(groqRes.headers);
      // allow CORS for simple static hosting; tighten for production
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(responseText, {
        status: groqRes.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }
};
