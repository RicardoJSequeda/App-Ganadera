import { useState, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    isDestructive: false,
    icon: null,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || '¿Estás seguro?',
        message: options.message || '¿Deseas continuar con esta acción?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'warning',
        isDestructive: options.isDestructive || false,
        icon: options.icon || null,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmComponent = useCallback(() => (
    <ConfirmModal
      isOpen={confirmState.isOpen}
      onClose={confirmState.onCancel}
      onConfirm={confirmState.onConfirm}
      title={confirmState.title}
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      type={confirmState.type}
      isDestructive={confirmState.isDestructive}
      icon={confirmState.icon}
    />
  ), [confirmState]);

  return {
    showConfirm,
    hideConfirm,
    ConfirmComponent
  };
};

// Funciones helper para casos comunes
export const confirmDelete = (itemName, customMessage) => {
  return {
    title: `Eliminar ${itemName}`,
    message: customMessage || `¿Estás seguro que deseas eliminar este ${itemName}? Esta acción no se puede deshacer.`,
    confirmText: 'Sí, eliminar',
    cancelText: 'Cancelar',
    type: 'danger',
    isDestructive: true
  };
};

export const confirmAction = (actionName, message) => {
  return {
    title: actionName,
    message: message,
    confirmText: 'Continuar',
    cancelText: 'Cancelar',
    type: 'warning',
    isDestructive: false
  };
};

export const confirmSave = (message) => {
  return {
    title: 'Guardar cambios',
    message: message || '¿Deseas guardar los cambios realizados?',
    confirmText: 'Guardar',
    cancelText: 'Cancelar',
    type: 'info',
    isDestructive: false
  };
};

export const confirmNavigation = (message) => {
  return {
    title: 'Cambios sin guardar',
    message: message || 'Tienes cambios sin guardar. ¿Deseas salir sin guardar?',
    confirmText: 'Salir sin guardar',
    cancelText: 'Continuar editando',
    type: 'warning',
    isDestructive: true
  };
};
