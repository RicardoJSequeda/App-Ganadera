import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import useAuthStore from '../store/authStore';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const { userProfile } = useAuthStore();

  // Verificar si la tabla de notificaciones existe
  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .select('count')
        .limit(1);
      
      if (error && error.code === '42P01') {
        setTableExists(false);
        return false;
      }
      
      setTableExists(true);
      return true;
    } catch (error) {
      console.error('Error verificando tabla notifications:', error);
      setTableExists(false);
      return false;
    }
  };

  // Cargar notificaciones desde la base de datos o localStorage
  const loadNotifications = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      
      const exists = await checkTableExists();
      
      if (!exists) {
        // Usar localStorage como fallback
        const localNotifications = localStorage.getItem(`notifications_${userProfile.id}`);
        if (localNotifications) {
          setNotifications(JSON.parse(localNotifications));
        } else {
          // Crear notificaciones de ejemplo para demostrar la funcionalidad
          const exampleNotifications = [
            {
              id: 'local_1',
              title: 'Sistema iniciado',
              message: 'El sistema de notificaciones está funcionando correctamente.',
              type: 'success',
              created_at: new Date().toISOString(),
              read: false
            },
            {
              id: 'local_2',
              title: 'Funcionalidad disponible',
              message: 'Las notificaciones se están ejecutando en modo local hasta que se configure la base de datos.',
              type: 'info',
              created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutos atrás
              read: false
            }
          ];
          setNotifications(exampleNotifications);
          localStorage.setItem(`notifications_${userProfile.id}`, JSON.stringify(exampleNotifications));
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      if (!tableExists) {
        // Modo local
        setNotifications(prev => {
          const updated = prev.filter(n => n.id !== notificationId);
          localStorage.setItem(`notifications_${userProfile.id}`, JSON.stringify(updated));
          return updated;
        });
        return true;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      // Actualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    if (notifications.length === 0) return true;

    try {
      if (!tableExists) {
        // Modo local
        setNotifications([]);
        localStorage.setItem(`notifications_${userProfile.id}`, JSON.stringify([]));
        return true;
      }

      const notificationIds = notifications.map(n => n.id);
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      // Limpiar estado local
      setNotifications([]);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  // Crear nueva notificación
  const createNotification = async (title, message, type = 'info', userId = null) => {
    try {
      const targetUserId = userId || userProfile?.id;
      if (!targetUserId) return false;

      if (!tableExists) {
        // Modo local - solo para el usuario actual
        if (targetUserId === userProfile?.id) {
          const newNotification = {
            id: `local_${Date.now()}`,
            title,
            message,
            type,
            created_at: new Date().toISOString(),
            read: false
          };
          
          setNotifications(prev => {
            const updated = [newNotification, ...prev];
            localStorage.setItem(`notifications_${userProfile.id}`, JSON.stringify(updated));
            return updated;
          });
        }
        return true;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title,
          message,
          type,
          read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      // Recargar notificaciones si es para el usuario actual
      if (targetUserId === userProfile?.id) {
        await loadNotifications();
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  };

  // Crear notificaciones automáticas basadas en eventos del sistema
  const createSystemNotification = async (event, data) => {
    const notificationTemplates = {
      'animal_sold': {
        title: 'Venta registrada',
        message: `Se vendieron ${data.cantidad} animales a "${data.comprador}"`
      },
      'animal_bought': {
        title: 'Compra registrada',
        message: `Se compraron ${data.cantidad} animales de "${data.proveedor}"`
      },
      'health_event': {
        title: 'Evento sanitario',
        message: `${data.tipo_evento} programado para ${data.animal_count} animales`
      },
      'weight_recorded': {
        title: 'Pesada registrada',
        message: `Nuevo peso registrado: ${data.peso}kg para animal ${data.animal_id}`
      },
      'alert_vaccination': {
        title: 'Alerta sanitaria',
        message: `Vacunación pendiente para ${data.animal_count} animales`
      },
      'alert_weight': {
        title: 'Alerta de peso',
        message: `Animal ${data.animal_id} requiere atención - peso bajo detectado`
      }
    };

    const template = notificationTemplates[event];
    if (!template) return false;

    return await createNotification(template.title, template.message, 'alert');
  };

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!userProfile?.id) return;

    loadNotifications();

    // Solo suscribirse si la tabla existe
    if (!tableExists) return;

    // Suscripción a tiempo real para nuevas notificaciones
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userProfile.id}`
        },
        (payload) => {
          console.log('Nueva notificación recibida:', payload.new);
          setNotifications(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userProfile?.id, tableExists]);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    createSystemNotification,
    refetch: loadNotifications
  };
};
