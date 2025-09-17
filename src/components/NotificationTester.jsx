import { motion } from 'framer-motion';
import { Bell, Plus, TestTube } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationTester = () => {
  const { createNotification } = useNotifications();

  const testNotifications = [
    {
      title: 'Venta exitosa',
      message: 'Se registró la venta de 5 terneros por $1,250,000',
      type: 'success'
    },
    {
      title: 'Alerta sanitaria',
      message: 'Recordatorio: Vacunación antiaftosa pendiente para 15 animales',
      type: 'warning'
    },
    {
      title: 'Nueva compra',
      message: 'Se agregaron 8 novillos al inventario desde "Estancia San José"',
      type: 'info'
    },
    {
      title: 'Peso crítico',
      message: 'Animal #1247 presenta peso bajo. Revisar estado sanitario.',
      type: 'alert'
    },
    {
      title: 'Error de sistema',
      message: 'Falló la sincronización con el servidor. Reintentando...',
      type: 'error'
    }
  ];

  const handleCreateTestNotification = async (notification) => {
    await createNotification(notification.title, notification.message, notification.type);
  };

  const createRandomNotification = async () => {
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    await handleCreateTestNotification(randomNotification);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-rural-primary/10 rounded-lg">
          <TestTube className="h-5 w-5 text-rural-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-rural-text">Probar Notificaciones</h3>
          <p className="text-sm text-rural-text/60">Genera notificaciones de ejemplo para probar el sistema</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={createRandomNotification}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Notificación Aleatoria</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testNotifications.map((notification, index) => (
            <button
              key={index}
              onClick={() => handleCreateTestNotification(notification)}
              className={`p-3 rounded-lg border-2 border-dashed transition-colors text-left ${
                notification.type === 'success' ? 'border-green-300 hover:bg-green-50' :
                notification.type === 'warning' ? 'border-yellow-300 hover:bg-yellow-50' :
                notification.type === 'alert' ? 'border-red-300 hover:bg-red-50' :
                notification.type === 'error' ? 'border-red-400 hover:bg-red-50' :
                'border-blue-300 hover:bg-blue-50'
              }`}
            >
              <p className="font-medium text-sm text-rural-text">{notification.title}</p>
              <p className="text-xs text-rural-text/60 mt-1">{notification.message}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                notification.type === 'success' ? 'bg-green-100 text-green-700' :
                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                notification.type === 'alert' ? 'bg-red-100 text-red-700' :
                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-700'
              }`}>
                {notification.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationTester;
