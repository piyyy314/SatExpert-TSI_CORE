import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Strict URI Normalization Middleware (Reverse Proxy Simulation)
const uriNormalizationPlugin = () => ({
  name: 'uri-normalizer',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url) {
        try {
          // Decode URI to check for traversal characters
          const decodedUri = decodeURI(req.url);
          // Normalize the path to remove dot-segments (e.g., /../)
          const normalizedPath = path.posix.normalize(decodedUri);
          
          if (decodedUri !== normalizedPath && (req.url?.includes('..'))) {
             console.log(`[Proxy] Blocked path traversal attempt: ${req.url}`);
             res.statusCode = 403;
             return res.end('Forbidden: Path traversal detected');
          }
          
          // Re-encode before overwriting req.url to prevent breaking downstream middleware
          req.url = encodeURI(normalizedPath);
        } catch (e) {
          // Malformed URI
          res.statusCode = 400;
          return res.end('Bad Request: Malformed URI');
        }
      }
      next();
    });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss(), uriNormalizationPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'esnext',
        chunkSizeWarningLimit: 4000,
      }
    };
});
