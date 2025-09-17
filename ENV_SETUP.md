# Configuración de Variables de Entorno - LEEME

## ⚠️ IMPORTANTE: Configuración Segura

### Para Desarrollo Local:
1. Copia `.env.example` como `.env.local`
2. Reemplaza las credenciales con las reales de tu proyecto Supabase
3. Nunca subas `.env.local` al repositorio

### Para Producción (Deploy):
Configura estas variables en tu plataforma de deploy:

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Netlify:**
```bash
# En la interfaz web: Site settings > Environment variables
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

**GitHub Pages con Actions:**
```yaml
# En Settings > Secrets and variables > Actions
VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## 🔐 Seguridad

- ✅ Las claves ANON de Supabase son **públicas por diseño**
- ✅ La seguridad real está en las **Row Level Security (RLS) policies**
- ❌ **NUNCA** expongas la `service_role` key en el frontend
- ✅ Las variables `VITE_*` se incluyen en el build, pero eso es esperado

## 📝 Archivos de Entorno

- `.env.example` - Plantilla pública (SÍ va al repo)
- `.env.local` - Desarrollo local (NO va al repo)
- `.env` - Evitar usar, preferir `.env.local`
