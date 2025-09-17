import { useState, useEffect, useCallback } from 'react';
import { usePWA } from './usePWA';

export const useSystemNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { sendNotification, notificationPermission } = usePWA();

  // Cargar notificaciones del localStorage al inicializar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('system-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      }
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('system-notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Crear nueva notificación
  const createNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info', // info, success, warning, error
      timestamp: new Date().toISOString(),
      read: false,
      action: notification.action || null,
      data: notification.data || null
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Enviar notificación push si está disponible
    if (notificationPermission === 'granted' && notification.push) {
      sendNotification(notification.title, {
        body: notification.message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        data: newNotification
      });
    }

    return newNotification;
  }, [sendNotification, notificationPermission]);

  // Marcar notificación como leída
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Eliminar notificación
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Limpiar notificaciones leídas
  const clearReadNotifications = useCallback(() => {
    setNotifications(prev => 
      prev.filter(notification => !notification.read)
    );
  }, []);

  // Notificaciones del sistema específicas
  const notifyNewSale = useCallback((sale) => {
    return createNotification({
      title: 'Nueva Venta Registrada',
      message: `Venta por $${sale.valor_total || sale.precio_total || 0} registrada exitosamente`,
      type: 'success',
      push: true,
      action: 'view_sale',
      data: { saleId: sale.id }
    });
  });

  const notifyNewPurchase = useCallback((purchase) => {
    return createNotification({
      title: 'Nueva Compra Registrada',
      message: `Compra por $${purchase.precio_total || 0} registrada exitosamente`,
      type: 'success',
      push: true,
      action: 'view_purchase',
      data: { purchaseId: purchase.id }
    });
  });

  const notifyNewInvoice = useCallback((invoice) => {
    return createNotification({
      title: 'Nueva Factura Generada',
      message: `Factura ${invoice.numero_factura} generada por $${invoice.monto_total}`,
      type: 'success',
      push: true,
      action: 'view_invoice',
      data: { invoiceId: invoice.id }
    });
  });

  const notifyLowStock = useCallback((animal) => {
    return createNotification({
      title: 'Stock Bajo',
      message: `El animal ${animal.numero_identificacion} requiere atención`,
      type: 'warning',
      push: true,
      action: 'view_animal',
      data: { animalId: animal.id }
    });
  });

  const notifyHealthAlert = useCallback((healthEvent) => {
    return createNotification({
      title: 'Alerta Sanitaria',
      message: `${healthEvent.tipo_evento} registrado para el animal ${healthEvent.animal_id}`,
      type: 'error',
      push: true,
      action: 'view_health',
      data: { healthEventId: healthEvent.id }
    });
  });

  const notifySystemError = useCallback((error) => {
    return createNotification({
      title: 'Error del Sistema',
      message: `Se ha producido un error: ${error.message || 'Error desconocido'}`,
      type: 'error',
      push: false
    });
  });

  const notifySyncComplete = useCallback(() => {
    return createNotification({
      title: 'Sincronización Completada',
      message: 'Los datos se han sincronizado correctamente',
      type: 'success',
      push: false
    });
  });

  const notifyOfflineMode = useCallback(() => {
    return createNotification({
      title: 'Modo Offline',
      message: 'La aplicación está funcionando sin conexión. Los datos se sincronizarán cuando se recupere la conexión.',
      type: 'info',
      push: false
    });
  });

  // Obtener notificaciones por tipo
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Obtener notificaciones no leídas
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  // Obtener notificaciones recientes (últimas 24 horas)
  const getRecentNotifications = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(notification => 
      new Date(notification.timestamp) > oneDayAgo
    );
  }, [notifications]);

  return {
    // Estado
    notifications,
    unreadCount,
    
    // Acciones básicas
    createNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearReadNotifications,
    
    // Notificaciones específicas del sistema
    notifyNewSale,
    notifyNewPurchase,
    notifyNewInvoice,
    notifyLowStock,
    notifyHealthAlert,
    notifySystemError,
    notifySyncComplete,
    notifyOfflineMode,
    
    // Utilidades
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications
  };
};