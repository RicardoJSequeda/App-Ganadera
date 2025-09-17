import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Plus,
  Package,
  Edit,
  Trash2,
  Save,
  Calendar,
  User,
  Tag,
  FileText,
  Users,
  MoreHorizontal,
  UserPlus,
  UserMinus
} from 'lucide-react';
import useAnimalesStore from '../../store/animalesStore';
import { useConfirm, confirmDelete } from '../../hooks/useConfirm.jsx';

const LoteModal = ({ onClose }) => {
  const { showConfirm, ConfirmComponent } = useConfirm();
  const {
    lotes,
    fetchLotes,
    createLote,
    updateLote,
    deleteLote,
    loading
  } = useAnimalesStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLote, setEditingLote] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    numero: '',
    color: '#67806D',
    observaciones: ''
  });

  useEffect(() => {
    fetchLotes();
  }, [fetchLotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      await showConfirm({
        type: 'warning',
        title: 'Campo requerido',
        message: 'El nombre del lote es requerido para poder guardarlo.',
        confirmText: 'Entendido'
      });
      return;
    }

    try {
      let result;
      if (editingLote) {
        result = await updateLote(editingLote.id, formData);
      } else {
        result = await createLote(formData);
      }
      
      if (result.success) {
        resetForm();
        await showConfirm({
          type: 'success',
          title: `Lote ${editingLote ? 'actualizado' : 'creado'}`,
          message: `El lote se ha ${editingLote ? 'actualizado' : 'creado'} exitosamente.`,
          confirmText: 'Continuar'
        });
      } else {
        await showConfirm({
          type: 'danger',
          title: `Error al ${editingLote ? 'actualizar' : 'crear'} lote`,
          message: `Error al ${editingLote ? 'actualizar' : 'crear'} el lote: ${result.error}`,
          confirmText: 'Entendido'
        });
      }
    } catch (error) {
      await showConfirm({
        type: 'danger',
        title: `Error al ${editingLote ? 'actualizar' : 'crear'} lote`,
        message: `Error al ${editingLote ? 'actualizar' : 'crear'} el lote: ${error.message}`,
        confirmText: 'Entendido'
      });
    }
  };

  const handleDelete = async (lote) => {
    const confirmed = await confirmDelete(
      `lote "${lote.nombre}"`,
      'Los animales asignados serán liberados automáticamente y se eliminará el historial de asignaciones.'
    );
    
    if (confirmed) {
      try {
        const result = await deleteLote(lote.id);
        if (result.success) {
          await showConfirm({
            type: 'success',
            title: 'Lote eliminado',
            message: result.message,
            confirmText: 'Continuar'
          });
        } else {
          await showConfirm({
            type: 'danger',
            title: 'Error al eliminar',
            message: `Error al eliminar el lote: ${result.error}`,
            confirmText: 'Entendido'
          });
        }
      } catch (error) {
        await showConfirm({
          type: 'danger',
          title: 'Error al eliminar',
          message: `Error al eliminar el lote: ${error.message}`,
          confirmText: 'Entendido'
        });
      }
    }
  };

  const handleEdit = (lote) => {
    setEditingLote(lote);
    setFormData({
      nombre: lote.nombre,
      numero: lote.numero || '',
      color: lote.color || '#67806D',
      observaciones: lote.observaciones || ''
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      numero: '',
      color: '#67806D',
      observaciones: ''
    });
    setEditingLote(null);
    setShowCreateForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-rural-card rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-rural-alternate/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rural-primary/10 rounded-xl">
                <Package className="h-6 w-6 text-rural-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-rural-text">Gestión de Lotes</h2>
                <p className="text-rural-text/60">Crear, editar y administrar lotes de animales</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-rural-text/60 hover:text-rural-text hover:bg-rural-background rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Botón crear nuevo lote */}
            {!showCreateForm && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Crear nuevo lote</span>
                </button>
              </div>
            )}

            {/* Formulario de creación/edición */}
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rural-background rounded-xl p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-rural-text">
                    {editingLote ? 'Editar lote' : 'Crear nuevo lote'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-rural-text/60 hover:text-rural-text"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-rural-text mb-2">
                        Nombre del lote *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ejemplo: Lote Primavera 2024"
                        required
                        className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-card focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-rural-text mb-2">
                        Número
                      </label>
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        placeholder="Número del lote"
                        className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-card focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-rural-text mb-2">
                      Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-10 border border-rural-alternate/50 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#67806D"
                        className="flex-1 px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-card focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-rural-text mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      placeholder="Observaciones adicionales del lote..."
                      rows={3}
                      className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-card focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-rural-text hover:bg-rural-alternate rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingLote ? 'Actualizar' : 'Crear'} lote</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Lista de lotes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-rural-text">
                Lotes existentes ({lotes.length})
              </h3>

              {lotes.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-rural-primary/40 mx-auto mb-3" />
                  <p className="text-rural-text/60">No hay lotes creados aún</p>
                  <p className="text-rural-text/40 text-sm">Crea tu primer lote para organizar los animales</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lotes.map((lote) => (
                    <motion.div
                      key={lote.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rural-card border border-rural-alternate/50 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="p-2 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${lote.color}20` }}
                          >
                            <Package className="h-5 w-5" style={{ color: lote.color }} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-rural-text">{lote.nombre}</h4>
                              {lote.numero && (
                                <span className="px-2 py-1 bg-rural-alternate/50 text-rural-text text-xs rounded-lg">
                                  #{lote.numero}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-rural-text/60">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(lote.fecha_creacion)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(lote)}
                            className="p-2 text-rural-text/60 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar lote"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lote.id)}
                            className="p-2 text-rural-text/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar lote"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {lote.observaciones && (
                        <p className="text-rural-text/60 text-sm mb-3">{lote.observaciones}</p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3 text-rural-primary" />
                            <span className="text-rural-text/60">
                              {lote.cantidad_animales || 0} animales
                            </span>
                          </div>
                          
                          {lote.created_by && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-rural-primary" />
                              <span className="text-rural-text/60">
                                {lote.usuario_nombre || 'Usuario'}
                              </span>
                            </div>
                          )}
                        </div>

                        <button className="text-rural-primary hover:text-rural-primary/80 font-medium">
                          Ver animales
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-rural-alternate/30">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmComponent />
    </AnimatePresence>
  );
};

export default LoteModal;
