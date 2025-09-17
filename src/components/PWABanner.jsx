import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWABanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  
  const { 
    isOnline, 
    isInstalled, 
    canInstall, 
    installPWA, 
    requestNotificationPermission,
    sendNotification,
    notificationPermission 
  } = usePWA();

  // Mostrar banner si puede instalar y no está instalado
  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed');
    if (canInstall && !isInstalled && !wasDismissed) {
      setIsVisible(true);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const result = await installPWA();
    
    if (result.success) {
      setIsVisible(false);
      // Solicitar permisos de notificación después de instalar
      await requestNotificationPermission();
      // Enviar notificación de bienvenida
      sendNotification('¡PWA instalada!', {
        body: 'Gutierrez Hnos está ahora disponible como app nativa',
        icon: '/pwa-192x192.png'
      });
    } else {
      console.error('Error instalando PWA:', result.error);
    }
    
    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleRequestNotifications = async () => {
    const result = await requestNotificationPermission();
    if (result.success) {
      sendNotification('¡Notificaciones activadas!', {
        body: 'Recibirás alertas importantes de la aplicación',
        icon: '/pwa-192x192.png'
      });
    }
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Instalar App</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Instala Gutierrez Hnos como app nativa para acceso rápido y funcionamiento offline.
        </p>

        <div className="space-y-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isInstalling ? 'Instalando...' : 'Instalar App'}</span>
          </button>

          {notificationPermission === 'default' && (
            <button
              onClick={handleRequestNotifications}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Wifi className="h-4 w-4" />
              <span>Activar Notificaciones</span>
            </button>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>En línea</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>Sin conexión</span>
                </>
              )}
            </div>
            <span>Funciona offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWABanner;
