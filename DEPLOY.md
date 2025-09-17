# 🚀 Guía de Deploy - Gutierrez Hnos App

## ✅ Build de Producción Listo

El proyecto está completamente preparado para deploy con:

### 📁 Estructura del Build (/dist)
```
dist/
├── assets/                    # JS y CSS optimizados
│   ├── index-C_Y9_EHe.js     # Aplicación principal (936 kB)
│   ├── vendor-BK48zxUW.js    # React/ReactDOM (12.35 kB)  
│   ├── router-D8tCdb1A.js    # React Router (32.14 kB)
│   ├── supabase-CZ9nTPiX.js  # Cliente Supabase (117 kB)
│   ├── ui-lG5_Uq8h.js        # Framer Motion/Lucide (150 kB)
│   ├── utils-BLjXeo-L.js     # Zustand (0.65 kB)
│   └── index-BkfOrwnq.css    # Estilos (46.73 kB)
├── index.html                # HTML principal con metadatos SEO
├── manifest.webmanifest      # Manifest PWA completo
├── sw.js                     # Service Worker
├── workbox-1ea6f077.js      # Cache management
├── registerSW.js            # PWA registration
├── logo.png                 # Logo principal
├── pwa-192x192.png         # Icono PWA 192x192
├── pwa-512x512.png         # Icono PWA 512x512
├── robots.txt              # SEO robots
├── _redirects              # Netlify SPA redirects
└── vercel.json             # Vercel SPA config
```

## 🌐 Opciones de Deploy

### 1. **Vercel** (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en la web:
# https://vercel.com/dashboard → Project → Settings → Environment Variables
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 2. **Netlify**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir dist

# Variables de entorno en:
# https://app.netlify.com → Site → Environment variables
```

### 3. **GitHub Pages** (con Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🔧 Configuraciones Incluidas

### ✅ PWA (Progressive Web App)
- **Manifest**: Completo con iconos y metadatos
- **Service Worker**: Cache automático con Workbox
- **Iconos**: 192x192, 512x512 incluidos
- **Modo**: `standalone` para app-like experience

### ✅ SEO Optimizado
- **Title**: "Gutierrez Hnos - Gestión Ganadera"
- **Description**: Descripción completa del sistema
- **Open Graph**: Para redes sociales
- **Twitter Cards**: Para compartir en Twitter
- **Theme Color**: Verde rural (#67806D)
- **Keywords**: ganadería, gestión, animales, etc.

### ✅ SPA Routing
- **Netlify**: `_redirects` configurado
- **Vercel**: `vercel.json` configurado
- **Otros**: Configurar server para SPA

### ✅ Performance
- **Chunks separados**: 7 archivos optimizados
- **Gzip**: ~333 kB total comprimido
- **Preconnect**: A Supabase para mejor rendimiento
- **PWA Cache**: Recursos estáticos cached

## 🔐 Variables de Entorno

**CRÍTICO**: Configurar estas variables en tu plataforma:
```env
VITE_SUPABASE_URL=https://dmrwdxevualztpbtybis.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_real
```

## 🧪 Testing Local

```bash
# Probar build localmente
npm run build
npm run preview
# → http://localhost:4173

# Verificar PWA
# Chrome DevTools → Application → Service Workers
# Chrome DevTools → Application → Manifest
```

## 📊 Métricas del Build

- **Total size**: 1.27 MB
- **Gzipped**: ~333 kB  
- **Chunks**: 7 archivos separados
- **PWA Score**: Completo (manifest + SW + icons)
- **Performance**: Optimizado con chunks

## 🏆 Build Status: **PRODUCTION READY** ✅
