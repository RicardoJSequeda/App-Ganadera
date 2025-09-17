import { supabase } from '../utils/supabaseClient';

// Función para verificar y crear la tabla de notificaciones si no existe
export const initializeNotificationsTable = async () => {
  try {
    // Verificar si la tabla existe intentando hacer una consulta simple
    const { error: testError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('Tabla notifications no existe, intentando crearla...');
      
      // Ejecutar el SQL para crear la tabla
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Crear tabla de notificaciones si no existe
          CREATE TABLE IF NOT EXISTS public.notifications (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID NOT NULL,
              title VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert', 'error')),
              read BOOLEAN DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );

          -- Índices para optimizar consultas
          CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
          CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
          CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

          -- RLS (Row Level Security)
          ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        `
      });

      if (createError) {
        console.error('Error creando tabla notifications:', createError);
        return false;
      }

      console.log('Tabla notifications creada exitosamente');
    }

    return true;
  } catch (error) {
    console.error('Error inicializando tabla notifications:', error);
    return false;
  }
};

// Función para crear notificaciones de prueba (solo para desarrollo)
export const createTestNotifications = async (userId) => {
  if (!userId) return false;

  try {
    const testNotifications = [
      {
        user_id: userId,
        title: 'Bienvenido al sistema',
        message: 'Tu cuenta ha sido configurada correctamente. ¡Comienza a gestionar tu ganado!',
        type: 'success'
      },
      {
        user_id: userId,
        title: 'Recordatorio',
        message: 'No olvides revisar el estado sanitario de tus animales regularmente.',
        type: 'info'
      }
    ];

    const { error } = await supabase
      .from('notifications')
      .insert(testNotifications);

    if (error) {
      console.error('Error creando notificaciones de prueba:', error);
      return false;
    }

    console.log('Notificaciones de prueba creadas');
    return true;
  } catch (error) {
    console.error('Error creando notificaciones de prueba:', error);
    return false;
  }
};
