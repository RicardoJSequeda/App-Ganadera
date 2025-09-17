# 🐄 Gutiérrez Hnos App - Gestión Ganadera

Una aplicación web progresiva (PWA) para la gestión integral de ganado, diseñada específicamente para la empresa familiar Gutiérrez Hnos de San Martín, Chaco, Argentina.

## 🎯 Objetivo

Reemplazar el manejo empírico y en papel por un sistema moderno, simple, robusto y adaptable, diseñado para uso fácil desde el campo en PC, móvil y tablet.

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ulicseg/Gutierrez-Hnos-App.git
   cd Gutierrez-Hnos-App
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus credenciales de Supabase:
   ```bash
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima
   ```

4. **Configurar base de datos**
   
   Ejecutar los scripts SQL en tu proyecto de Supabase:
   ```bash
   # En el orden indicado:
   sql/notifications_table.sql
   database/schema.sql
   # Otros scripts según necesidad
   ```

### Comandos de Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Deploy

```bash
# Build optimizado
npm run build

# Los archivos listos para deploy estarán en /dist
```

## 🛠 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: TailwindCSS
- **Navegación**: React Router DOM
- **Animaciones**: Framer Motion
- **Iconografía**: Lucide React
- **Estado**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **PWA**: Vite PWA Plugin
- **Build**: Vite + TypeScript

## 🎨 Diseño Rural

### Paleta de Colores
- **Fondo**: `#F5F2E7` (beige claro, "papel rural")
- **Textos/títulos**: `#3C454A` (azul oscuro/gris piedra)
- **Primario/acentos**: `#67806D` (verde oliva/campo)
- **Secundario**: `#805A36` (marrón oscuro)
- **Fondo alterno**: `#F9E9D0` (beige cálido)
- **Alertas**: `#F8B36A` (naranja suave)
- **Tarjetas**: Blanco puro

### Características de Diseño
- Tipografía sans-serif moderna (Inter, Poppins, Nunito)
- Bordes redondeados y espacios amplios
- Animaciones suaves con Framer Motion
- Design mobile-first y responsive
- Iconografía rural clara

## 📊 Modelo de Datos

### Tablas Principales (Supabase/PostgreSQL)

- **proveedores**: Datos de proveedores de ganado
- **compradores**: Información de compradores
- **transportadores**: Datos de transportistas
- **compras**: Registro de compras de ganado
- **animales**: Stock de animales con historial
- **ventas**: Registro de ventas
- **detalle_venta**: Detalle de animales vendidos
- **eventos_sanitarios**: Historial sanitario
- **usuarios**: Gestión de usuarios y roles

### Relaciones Clave
- Compras → Animales (1:N)
- Ventas → Detalle_venta → Animales (1:N:1)
- Animales → Eventos_sanitarios (1:N)
- Usuarios con roles (administrador/operador)

## 🔐 Sistema de Autenticación

- **Login empresarial**: Solo usuarios autorizados
- **Creación de usuarios**: Solo administradores
- **Roles y permisos**: Administrador y Operador
- **Sesiones persistentes**: Mantiene login entre recargas
- **Protección de rutas**: Acceso controlado por autenticación

## 📱 Funcionalidades Principales

### ✅ Completadas (Fase 1 y 2)
- **Layout Responsive**: Navegación lateral (desktop) y inferior (móvil)
- **Sistema de Autenticación**: Login, protección de rutas, gestión de usuarios
- **Tema Rural**: Diseño completo con paleta de colores y animaciones

### 🔄 En Desarrollo
- **Dashboard**: KPIs y métricas visuales
- **Gestión de Animales**: Stock, filtros, historial
- **Compras**: Wizard de compra, carga individual/lote
- **Ventas**: Selección de animales, tipos de venta
- **Sanidad**: Eventos sanitarios, medicamentos
- **Reportes**: Exportación Excel/PDF

## 🛠️ Instalación y Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/ulicseg/Gutierrez-Hnos-App.git
cd gutierrez-hnos-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Agregar credenciales de Supabase

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Logo e imágenes
├── components/      # Componentes reutilizables
│   ├── Layout.jsx   # Layout principal con navegación
│   ├── Header.jsx   # Header con notificaciones
│   ├── Sidebar.jsx  # Navegación lateral
│   ├── BottomNav.jsx # Navegación móvil
│   └── ConfirmModal.jsx # Modal de confirmación personalizado
├── pages/           # Páginas principales
│   ├── Dashboard.jsx    # Panel principal con KPIs
│   ├── Animales.jsx     # Gestión de animales
│   ├── Compras.jsx      # Registro de compras
│   ├── Ventas.jsx       # Gestión de ventas
│   ├── Sanidad.jsx      # Eventos sanitarios
│   ├── Proveedores.jsx  # Gestión de proveedores
│   ├── Transportadores.jsx # Gestión de transportadores
│   ├── Usuarios.jsx     # Administración de usuarios
│   ├── Configuracion.jsx # Configuración y mantenimiento
│   └── Ayuda.jsx        # Ayuda y soporte
├── routes/          # Configuración de rutas
├── store/           # Estado global (Zustand)
├── utils/           # Utilidades y Supabase client
└── hooks/           # Custom hooks (useConfirm, useNotifications)
```

## 🔄 Progreso del Desarrollo

### ✅ Fase 1: Layout y Navegación
- Layout responsivo completo (sidebar/bottom navigation)
- Navegación funcional entre páginas
- Tema rural implementado

### ✅ Fase 2: Autenticación
- Sistema de login empresarial
- Protección de rutas
- Gestión de roles (Admin/Operador)

### ✅ Fase 3: Dashboard
- KPIs principales implementados
- Información del establecimiento
- Estadísticas visuales

### ✅ Fase 4: Gestión de Animales
- Stock de animales con filtros
- Historial de compras y ventas
- Estados de animal (disponible/vendido)

### ✅ Fase 5: Compras
- Wizard de compra guiado
- Carga individual y por lotes
- Integración con proveedores

### ✅ Fase 6: Ventas
- Selección de animales disponibles
- Tipos de venta (directa/feria)
- Integración con compradores

### ✅ Fase 7: Sanidad
- Registro de eventos sanitarios
- Medicamentos y tratamientos
- Historial por animal

### ✅ Fase 8: Gestión de Usuarios
- Creación de usuarios (solo admin)
- Asignación de roles
- Estado activo/inactivo
- **Eliminación completa**: Auth + Base de datos via endpoint serverless
- **Acceso restringido**: Solo administradores pueden ver/acceder
- **Protección de rutas**: AdminRoute para usuarios
- **UI condicional**: Sidebar oculta "Usuarios" para operadores

### ✅ Fase 9: Configuración
- Gestión de proveedores/transportadores
- Mantenimiento de base de datos (solo admin)
- Configuraciones del sistema

### ✅ Fase 10: Confirmaciones Personalizadas
- Modal de confirmación branded
- Reemplazo de window.confirm
- Funciones helper (confirmDelete, confirmAction)

### ✅ API Serverless (Vercel Functions)
- **POST /api/deleteUser**: Eliminación completa de usuarios
- Integración con Supabase Auth Admin API
- Variables de entorno seguras

### ✅ Fase A: Optimización para Producción
- Variables de entorno configuradas
- Build optimizado con chunks separados
- Limpieza de archivos temporales
- Configuración PWA
- README actualizado
- Sistema de notificaciones en tiempo real
- Seguridad mejorada

## 🚀 Deploy y Producción

### Variables de Entorno Requeridas
```env
# Desarrollo local (.env.local):
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima

# Producción (configurar en plataforma de deploy):
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Preparación para Deploy
```bash
# 1. Configurar variables de entorno
cp .env.example .env.local
# Completar con credenciales reales

# 2. Instalar dependencias
npm install

# 3. Construir para producción
npm run build

# 4. Verificar build (opcional)
npm run preview
```

### ⚠️ Seguridad de Variables de Entorno
- ✅ Usa `.env.local` para desarrollo (excluido del repo)
- ✅ Configura variables en la plataforma de deploy para producción
- ✅ Las claves ANON de Supabase son públicas por diseño
- ❌ NUNCA expongas la `service_role` key en el frontend
- 📖 Lee `ENV_SETUP.md` para instrucciones detalladas

### Plataformas de Deploy Recomendadas
- **Vercel**: Deploy automático desde GitHub
- **Netlify**: Configuración zero-config
- **GitHub Pages**: Para proyectos públicos
- **Railway**: Con backend incluido

### Configuración de Build Optimizada
El proyecto está configurado con:
- **Chunks separados**: vendor, router, supabase, ui, utils
- **Tree shaking**: Eliminación de código no usado
- **Compresión**: Gzip habilitado
- **PWA**: Service worker para cache
- **TypeScript**: Verificación de tipos en build

### Tamaño de Build Optimizado
```
dist/assets/
├── vendor-[hash].js     (12.35 kB)   # React, ReactDOM
├── router-[hash].js     (32.14 kB)   # React Router
├── supabase-[hash].js   (117.03 kB)  # Supabase client
├── ui-[hash].js         (150.76 kB)  # Framer Motion, Lucide
├── utils-[hash].js      (4.12 kB)    # Utilidades
└── index-[hash].js      (936 kB)     # Código de la app
```

**Total optimizado**: ~1.27 MB (vs 2.1 MB sin optimización)
- [x] Configuración inicial del proyecto
- [x] Implementación de TailwindCSS
- [x] Layout responsive completo
- [x] Navegación lateral y móvil
- [x] Tema rural y animaciones

### ✅ Fase 2: Autenticación
- [x] Configuración de Supabase Auth
- [x] Store de autenticación con Zustand
- [x] Páginas de login
- [x] Protección de rutas
- [x] Gestión de usuarios (solo admin)

### 🔄 Fase 3: Dashboard y KPIs (Próximo)
- [ ] Métricas principales
- [ ] Gráficos y visualizaciones
- [ ] Alertas y notificaciones

### 🔄 Fase 4: Gestión de Animales
- [ ] Listado con filtros avanzados
- [ ] Ficha individual de animal
- [ ] Historial sanitario
- [ ] Exportación de datos

## 🤝 Contribución

Este es un proyecto específico para Gutiérrez Hnos. Para contribuir:

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Proyecto privado para uso exclusivo de Gutiérrez Hnos.

---

**Desarrollado con ❤️ para la gestión ganadera moderna** 🌾
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
**Desarrollado con ❤️ para la gestión ganadera moderna** 🌾
