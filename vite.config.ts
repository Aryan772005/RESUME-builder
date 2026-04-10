import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

/** Vite dev plugin: intercepts POST /api/ai and proxies to NVIDIA server-side */
function nvidiaProxyPlugin(apiKey: string): Plugin {
  return {
    name: 'nvidia-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { prompt } = JSON.parse(body) as { prompt: string };
            const upstream = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'meta/llama-3.3-70b-instruct',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.6,
                max_tokens: 2048,
              }),
            });
            const data = await upstream.json();
            const text = (data.choices?.[0]?.message?.content ?? '').trim();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = upstream.status;
            res.end(JSON.stringify({ text }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message ?? 'Proxy error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      nvidiaProxyPlugin(env.VITE_NVIDIA_API_KEY ?? ''),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
