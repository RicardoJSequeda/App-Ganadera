import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  ShoppingCart,
  Activity,
  Tag,
  Trash2,
  Edit,
  FileText,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  X
} from 'lucide-react';
import useAnimalesStore from '../../store/animalesStore';
import { useConfirm, confirmDelete, confirmAction } from '../../hooks/useConfirm.jsx';

const AnimalesActions = () => {
  const { showConfirm, ConfirmComponent } = useConfirm();
  const { 
    selectedAnimales, 
    clearSelection, 
    lotes,
    fetchLotes,
    asignarAnimalesALote,
    quitarAnimalesDeLote
  } = useAnimalesStore();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);

  const handleAsignarLote = async () => {
    if (selectedAnimales.length === 0) {
      await showConfirm({
        type: 'info',
        title: 'Ningún animal seleccionado',
        message: 'Por favor selecciona al menos un animal para asignar a un lote.',
        confirmText: 'Entendido'
      });
      return;
    }
    setShowLoteModal(true);
    if (lotes.length === 0) {
      fetchLotes();
    }
  };

  const handleAsignarALoteSeleccionado = async (loteId) => {
    const result = await asignarAnimalesALote(selectedAnimales, loteId);
    if (result.success) {
      setShowLoteModal(false);
      clearSelection();
      await showConfirm({
        type: 'success',
        title: 'Asignación exitosa',
        message: `${selectedAnimales.length} animales asignados al lote correctamente.`,
        confirmText: 'Continuar'
      });
    } else {
      await showConfirm({
        type: 'danger',
        title: 'Error en la asignación',
        message: `Error al asignar animales al lote: ${result.error}`,
        confirmText: 'Entendido'
      });
    }
  };

  const handleQuitarDeLote = async () => {
    if (selectedAnimales.length === 0) {
      await showConfirm({
        type: 'info',
        title: 'Ningún animal seleccionado',
        message: 'Por favor selecciona al menos un animal para quitar de su lote.',
        confirmText: 'Entendido'
      });
      return;
    }
    
    const confirmed = await showConfirm({
      type: 'warning',
      title: 'Confirmar remoción',
      message: `¿Quitar ${selectedAnimales.length} animales de sus lotes actuales?`,
      confirmText: 'Quitar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      const result = await quitarAnimalesDeLote(selectedAnimales);
      if (result.success) {
        clearSelection();
        await showConfirm({
          type: 'success',
          title: 'Remoción exitosa',
          message: 'Animales removidos de lotes correctamente.',
          confirmText: 'Continuar'
        });
      } else {
        await showConfirm({
          type: 'danger',
          title: 'Error en la remoción',
          message: `Error al remover animales: ${result.error}`,
          confirmText: 'Entendido'
        });
      }
    }
  };

  const handleMarcarVenta = () => {
    console.log('Marcar como vendidos:', selectedAnimales);
    // TODO: Implementar modal de venta
  };

  const handleEventoSanitario = () => {
    console.log('Registrar evento sanitario:', selectedAnimales);
    // TODO: Implementar modal de evento sanitario
  };

  const handleCambiarCategoria = () => {
    console.log('Cambiar categoría:', selectedAnimales);
    // TODO: Implementar modal de cambio de categoría
  };

  const handleEditarMasivo = () => {
    console.log('Editar masivo:', selectedAnimales);
    // TODO: Implementar modal de edición masiva
  };

  const handleEliminar = async () => {
    const confirmed = await confirmDelete(
      `${selectedAnimales.length} animales`,
      'Esta acción eliminará permanentemente los animales seleccionados y todo su historial. Esta operación no se puede deshacer.'
    );
    
    if (confirmed) {
      console.log('Eliminar animales:', selectedAnimales);
      // TODO: Implementar eliminación
    }
  };

  const handleExportar = () => {
    console.log('Exportar seleccionados:', selectedAnimales);
    // TODO: Implementar exportación de seleccionados
  };

  const actions = [
    {
      icon: Package,
      label: 'Asignar a lote',
      action: handleAsignarLote,
      color: 'text-rural-primary hover:bg-rural-primary/10'
    },
    {
      icon: UserMinus,
      label: 'Quitar de lote',
      action: handleQuitarDeLote,
      color: 'text-orange-600 hover:bg-orange-50'
    },
    {
      icon: ShoppingCart,
      label: 'Marcar como vendidos',
      action: handleMarcarVenta,
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      icon: Activity,
      label: 'Evento sanitario',
      action: handleEventoSanitario,
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      icon: Tag,
      label: 'Cambiar categoría',
      action: handleCambiarCategoria,
      color: 'text-yellow-600 hover:bg-yellow-50'
    },
    {
      icon: Edit,
      label: 'Editar masivo',
      action: handleEditarMasivo,
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      icon: FileText,
      label: 'Exportar selección',
      action: handleExportar,
      color: 'text-indigo-600 hover:bg-indigo-50'
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      action: handleEliminar,
      color: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div className="relative">
      {/* Acciones principales (visibles) */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleAsignarLote}
          className="flex items-center space-x-1 px-3 py-2 text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
          title="Asignar a lote"
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Lote</span>
        </button>

        <button
          onClick={handleMarcarVenta}
          className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Marcar como vendidos"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Vender</span>
        </button>

        <button
          onClick={handleEventoSanitario}
          className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Registrar evento sanitario"
        >
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Sanidad</span>
        </button>

        {/* Dropdown para más acciones */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-1 px-3 py-2 text-rural-text hover:bg-rural-background rounded-lg transition-colors"
            title="Más acciones"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showDropdown && (
            <>
              {/* Overlay para cerrar dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />

              {/* Dropdown menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-rural-alternate/50 py-2 z-20"
              >
                {actions.slice(3).map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => {
                        action.action();
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${action.color}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Modal de selección de lotes */}
      {showLoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-rural-alternate/20">
              <h3 className="text-lg font-semibold text-rural-text">
                Seleccionar Lote
              </h3>
              <button
                onClick={() => setShowLoteModal(false)}
                className="text-rural-text/60 hover:text-rural-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-rural-text/70 mb-4">
                Selecciona el lote para asignar {selectedAnimales.length} animales
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lotes.map((lote) => (
                  <button
                    key={lote.id}
                    onClick={() => handleAsignarALoteSeleccionado(lote.id)}
                    className="w-full p-3 text-left border border-rural-alternate/20 rounded-lg hover:bg-rural-background transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium text-rural-text">
                        {lote.nombre}
                      </span>
                      {lote.numero && (
                        <span className="text-sm text-rural-text/60 ml-2">
                          #{lote.numero}
                        </span>
                      )}
                      {lote.color && (
                        <div className="flex items-center mt-1">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: lote.color }}
                          />
                          <span className="text-xs text-rural-text/60">
                            {lote.color}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {lotes.length === 0 && (
                <div className="text-center py-8 text-rural-text/60">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay lotes disponibles</p>
                  <p className="text-sm">Crea un lote primero</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 p-6 border-t border-rural-alternate/20">
              <button
                onClick={() => setShowLoteModal(false)}
                className="flex-1 px-4 py-2 text-rural-text/70 border border-rural-alternate/30 rounded-lg hover:bg-rural-background transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmComponent />
    </div>
  );
};

export default AnimalesActions;
