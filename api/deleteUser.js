// api/deleteUser.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  try {
    // Verificar que tenemos las variables de entorno necesarias
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Variables de entorno faltantes:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey
      });
      return res.status(500).json({ 
        error: 'Configuración del servidor incompleta. Faltan variables de entorno.' 
      });
    }

    // Crear cliente admin de Supabase
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Obtener userId del body
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido en el body.' });
    }

    // Validar que userId es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'userId debe ser un UUID válido.' });
    }

    console.log('🗑️ Iniciando eliminación de usuario:', userId);

    // 1. Primero eliminar de la tabla usuarios (por si falla el auth)
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('❌ Error al eliminar de tabla usuarios:', dbError);
      return res.status(500).json({ 
        error: `Error al eliminar perfil del usuario: ${dbError.message}` 
      });
    }

    console.log('✅ Usuario eliminado de tabla usuarios');

    // 2. Luego eliminar del Auth de Supabase
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('❌ Error al eliminar de Auth:', authError);
      // Si falla el auth pero ya eliminamos de la tabla, es un estado inconsistente
      // pero devolvemos success parcial con advertencia
      return res.status(200).json({ 
        success: true,
        warning: `Usuario eliminado de la base de datos pero error en Auth: ${authError.message}`
      });
    }

    console.log('✅ Usuario eliminado del Auth de Supabase');

    // 3. Éxito completo
    return res.status(200).json({ 
      success: true,
      message: 'Usuario eliminado exitosamente del Auth y base de datos.'
    });

  } catch (error) {
    console.error('💥 Error inesperado en deleteUser:', error);
    return res.status(500).json({ 
      error: `Error interno del servidor: ${error.message}` 
    });
  }
}
