import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      duration: notification.duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (message, title = 'Éxito') => {
    addNotification({
      type: 'success',
      title,
      message,
      icon: CheckCircle
    });
  };

  const showError = (message, title = 'Error') => {
    addNotification({
      type: 'error',
      title,
      message,
      icon: AlertCircle,
      duration: 8000 // Error messages stay longer
    });
  };

  const showInfo = (message, title = 'Información') => {
    addNotification({
      type: 'info',
      title,
      message,
      icon: Info
    });
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  return {
    showSuccess,
    showError,
    showInfo,
    NotificationContainer
  };
};

const NotificationItem = ({ notification, onRemove }) => {
  const { type, title, message, icon: Icon } = notification;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-900'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        ${styles.bg} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${styles.titleColor} text-sm`}>
            {title}
          </h4>
          <p className={`${styles.text} text-sm mt-1 leading-relaxed`}>
            {message}
          </p>
        </div>

        <button
          onClick={onRemove}
          className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default useNotification;
