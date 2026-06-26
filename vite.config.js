import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import 'dotenv/config'

const vercelDevServer = () => {
  return {
    name: 'vercel-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/api')) {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const pathname = urlObj.pathname;
          // Map /api/route to ./api/route.js
          const handlerPath = resolve(process.cwd(), `.${pathname}.js`);
          
          try {
            await fs.access(handlerPath);
            // Dynamic import cache busting for hot-reloading
            const module = await import('file://' + handlerPath + '?update=' + Date.now());
            if (module.default) {
              let body = '';
              req.on('data', chunk => body += chunk.toString());
              req.on('end', async () => {
                if (body) {
                  try { req.body = JSON.parse(body); } catch(e) {}
                }
                
                req.query = Object.fromEntries(urlObj.searchParams);
                
                // Mock Vercel response methods
                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };

                try {
                  await module.default(req, res);
                } catch (err) {
                  console.error('API execution error:', err);
                  res.status(500).json({ error: err.message });
                }
              });
              return; // Stop middleware chain if we handled it
            }
          } catch (e) {
            // File doesn't exist or failed to load
            console.error('API routing error:', e);
          }
        }
        next();
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelDevServer()],
})
