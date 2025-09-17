import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';

// Helper para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para servir las funciones de la API
const apiMiddleware = () => {
  const app = express();
  app.use(express.json());

  const apiDir = path.resolve(__dirname, 'api');
  if (fs.existsSync(apiDir)) {
    const apiFiles = fs.readdirSync(apiDir).filter(file => file.endsWith('.js'));
    
    apiFiles.forEach(async (file) => {
      const route = `/` + file.replace(/\.js$/, '');
      const modulePath = path.join(apiDir, file);
      
      app.all(route, async (req, res) => {
        try {
          // Importa dinámicamente el módulo en cada solicitud
          const module = await import(`file://${modulePath}?t=${Date.now()}`);
          const handler = module.default || module;
          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.status(404).send('API endpoint not found or not a function');
          }
        } catch (error) {
          console.error(`Error handling request for ${route}:`, error);
          res.status(500).send('Internal Server Error');
        }
      });
    });
  }

  return app;
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-api-server',
      configureServer(server) {
        server.middlewares.use('/api', apiMiddleware());
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'vite.svg'],
      manifest: {
        name: 'Gutierrez Hnos - Gestión Ganadera',
        short_name: 'Gutierrez Hnos',
        description: 'Sistema de gestión ganadera para control de animales, compras, ventas y sanidad',
        theme_color: '#67806D',
        background_color: '#F5F2E7',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dmrwdxevualztpbtybis\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semana
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['framer-motion', 'lucide-react'],
          utils: ['zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
