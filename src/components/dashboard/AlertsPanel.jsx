import { motion } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, Bell, X } from 'lucide-react';
import { useState } from 'react';

const AlertsPanel = ({ stats, ultimosEventos }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const alerts = [];

  // Alerta de animales críticos
  if (stats.animalesCriticos > 0) {
    alerts.push({
      id: 'animales-criticos',
      type: 'warning',
      icon: AlertTriangle,
      title: 'Animales en estado crítico',
      message: `${stats.animalesCriticos} animales requieren atención médica inmediata`,
      action: 'Ver animales',
      priority: 'high'
    });
  }

  // Alerta de tiempo en campo
  if (stats.tiempoPromedioEnCampo > 180) { // Más de 6 meses
    alerts.push({
      id: 'tiempo-campo',
      type: 'info',
      icon: Clock,
      title: 'Tiempo promedio alto en campo',
      message: `Los animales llevan ${stats.tiempoPromedioEnCampo} días promedio en campo`,
      action: 'Revisar ventas',
      priority: 'medium'
    });
  }

  // Alerta de diferencia de precios negativa
  if (stats.diferenciaPrecios < 0) {
    alerts.push({
      id: 'precio-negativo',
      type: 'error',
      icon: TrendingDown,
      title: 'Margen de ganancia negativo',
      message: `Diferencia promedio de $${Math.abs(stats.diferenciaPrecios)} por kilo en pérdida`,
      action: 'Revisar precios',
      priority: 'high'
    });
  }

  // Alerta de eventos sanitarios recientes
  const eventosRecientes = ultimosEventos.filter(evento => {
    const fechaEvento = new Date(evento.fecha);
    const hace3Dias = new Date();
    hace3Dias.setDate(hace3Dias.getDate() - 3);
    return fechaEvento >= hace3Dias;
  });

  if (eventosRecientes.length > 5) {
    alerts.push({
      id: 'eventos-frecuentes',
      type: 'warning',
      icon: Bell,
      title: 'Alta actividad sanitaria',
      message: `${eventosRecientes.length} eventos sanitarios en los últimos 3 días`,
      action: 'Ver historial',
      priority: 'medium'
    });
  }

  // Filtrar alertas no descartadas
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertStyles = (type) => {
    const styles = {
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600'
      },
      warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: 'text-amber-600'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600'
      }
    };
    return styles[type] || styles.info;
  };

  if (activeAlerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Bell className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Todo en orden</h3>
            <p className="text-green-600">No hay alertas activas en este momento</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-rural-alert" />
        <h3 className="text-lg font-semibold text-rural-text">Alertas Activas</h3>
        <span className="px-2 py-1 bg-rural-alert/20 text-rural-alert text-xs rounded-full">
          {activeAlerts.length}
        </span>
      </div>

      {activeAlerts.map((alert, index) => {
        const Icon = alert.icon;
        const styles = getAlertStyles(alert.type);
        
        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            className={`${styles.bg} ${styles.border} border rounded-xl p-4 relative`}
          >
            <button
              onClick={() => dismissAlert(alert.id)}
              className={`absolute top-3 right-3 p-1 hover:bg-white/50 rounded transition-colors ${styles.text}`}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start space-x-3 pr-8">
              <div className={`p-2 bg-white/60 rounded-lg ${styles.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <h4 className={`font-semibold ${styles.text} mb-1`}>
                  {alert.title}
                </h4>
                <p className={`text-sm ${styles.text} opacity-80 mb-3`}>
                  {alert.message}
                </p>
                
                <button className={`text-sm font-medium ${styles.text} hover:underline`}>
                  {alert.action} →
                </button>
              </div>
            </div>

            {alert.priority === 'high' && (
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl" />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AlertsPanel;
