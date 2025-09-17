import { useState, useEffect, useCallback } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detectar si la app está instalada
  useEffect(() => {
    const checkIfInstalled = () => {
      // Verificar si se ejecuta en modo standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // O si está en la pantalla de inicio en iOS
      const isIOSStandalone = window.navigator.standalone === true;
      
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkIfInstalled();
    
    // Escuchar cambios en el modo de visualización
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkIfInstalled);
    
    return () => mediaQuery.removeEventListener('change', checkIfInstalled);
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
          setIsServiceWorkerRegistered(true);
        })
        .catch((error) => {
          console.error('Error registrando Service Worker:', error);
        });
    }
  }, []);

  // Detectar prompt de instalación
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Verificar permisos de notificación
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      return { success: false, error: 'No hay prompt de instalación disponible' };
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        return { success: true, message: 'PWA instalada correctamente' };
      } else {
        return { success: false, error: 'Instalación cancelada por el usuario' };
      }
    } catch (error) {
      console.error('Error instalando PWA:', error);
      return { success: false, error: error.message };
    }
  }, [deferredPrompt]);

  // Solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return { success: false, error: 'Este navegador no soporta notificaciones' };
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        return { success: true, message: 'Permisos de notificación concedidos' };
      } else {
        return { success: false, error: 'Permisos de notificación denegados' };
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Enviar notificación
  const sendNotification = useCallback((title, options = {}) => {
    if (notificationPermission !== 'granted') {
      return { success: false, error: 'Permisos de notificación no concedidos' };
    }

    try {
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        ...options
      });

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return { success: true, notification };
    } catch (error) {
      console.error('Error enviando notificación:', error);
      return { success: false, error: error.message };
    }
  }, [notificationPermission]);

  // Sincronizar datos cuando se recupere la conexión
  const syncWhenOnline = useCallback(async () => {
    if (!isOnline) {
      return { success: false, error: 'Sin conexión a internet' };
    }

    try {
      // Registrar sincronización en segundo plano
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        return { success: true, message: 'Sincronización programada' };
      } else {
        return { success: false, error: 'Sincronización en segundo plano no disponible' };
      }
    } catch (error) {
      console.error('Error programando sincronización:', error);
      return { success: false, error: error.message };
    }
  }, [isOnline]);

  // Verificar si la app puede funcionar offline
  const canWorkOffline = useCallback(() => {
    return isServiceWorkerRegistered && 'caches' in window;
  }, [isServiceWorkerRegistered]);

  // Obtener información del cache
  const getCacheInfo = useCallback(async () => {
    if (!('caches' in window)) {
      return { success: false, error: 'Cache API no disponible' };
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = keys.length;
      }

      return { success: true, data: cacheInfo };
    } catch (error) {
      console.error('Error obteniendo info del cache:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Limpiar cache
  const clearCache = useCallback(async () => {
    if (!('caches' in window)) {
      return { success: false, error: 'Cache API no disponible' };
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      return { success: true, message: 'Cache limpiado correctamente' };
    } catch (error) {
      console.error('Error limpiando cache:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    // Estado
    isOnline,
    isInstalled,
    canInstall: !!deferredPrompt,
    notificationPermission,
    isServiceWorkerRegistered,
    canWorkOffline: canWorkOffline(),
    
    // Acciones
    installPWA,
    requestNotificationPermission,
    sendNotification,
    syncWhenOnline,
    getCacheInfo,
    clearCache
  };
};
