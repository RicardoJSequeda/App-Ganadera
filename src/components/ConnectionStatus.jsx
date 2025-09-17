import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const ConnectionStatus = () => {
  const [showStatus, setShowStatus] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const { isOnline, syncWhenOnline, isServiceWorkerRegistered } = usePWA();

  // Mostrar estado cuando cambie la conexión
  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    } else if (isOnline && lastSync === null) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, lastSync]);

  const handleSync = async () => {
    const result = await syncWhenOnline();
    if (result.success) {
      setLastSync(new Date());
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 2000);
    }
  };

  if (!showStatus) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`rounded-lg shadow-lg p-3 flex items-center space-x-2 transition-all duration-300 ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isOnline ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Conectado</span>
            {lastSync && (
              <span className="text-xs">
                Sincronizado {lastSync.toLocaleTimeString()}
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Sin conexión</span>
            <span className="text-xs">Modo offline</span>
          </>
        )}
        
        {isOnline && isServiceWorkerRegistered && (
          <button
            onClick={handleSync}
            className="ml-2 p-1 hover:bg-green-200 rounded transition-colors"
            title="Sincronizar datos"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
