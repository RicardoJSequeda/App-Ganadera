import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  isDestructive = false,
  icon: CustomIcon
}) => {
  // Manejar teclas del teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter' && !isDestructive) {
        // Solo confirmar con Enter si no es destructivo
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm, isDestructive]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white'
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          confirmBg: 'bg-amber-600 hover:bg-amber-700',
          confirmText: 'text-white'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-rural-primary hover:bg-rural-primary/90',
          confirmText: 'text-white'
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          confirmBg: 'bg-rural-primary hover:bg-rural-primary/90',
          confirmText: 'text-white'
        };
      default:
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          confirmBg: 'bg-amber-600 hover:bg-amber-700',
          confirmText: 'text-white'
        };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'danger':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const styles = getTypeStyles();
  const IconComponent = CustomIcon || getDefaultIcon();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`relative w-full max-w-md mx-auto ${styles.bgColor} ${styles.borderColor} border rounded-2xl shadow-2xl overflow-hidden`}
          >
            {/* Header con botón cerrar */}
            <div className="relative p-6 pb-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-rural-text/60 hover:text-rural-text transition-colors rounded-lg hover:bg-white/50"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Icono y título */}
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full bg-white/70 ${styles.iconColor}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-rural-text mb-2">
                    {title}
                  </h3>
                  <p className="text-rural-text/80 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="bg-white/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-rural-text bg-white border border-rural-alternate rounded-xl hover:bg-rural-alternate/20 transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl transition-colors font-medium ${styles.confirmBg} ${styles.confirmText}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
