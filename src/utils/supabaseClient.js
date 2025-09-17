import { createClient } from '@supabase/supabase-js';

// Variables de entorno para Supabase
// En desarrollo: se leen desde .env.local
// En producción: se configuran en la plataforma de deploy (Vercel, Netlify, etc.)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación de variables de entorno requeridas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file in development or environment configuration in production.'
  );
}

// Verificación adicional de formato de URL
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL variable.');
}

// Inicializar cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
