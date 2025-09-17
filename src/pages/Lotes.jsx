import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  X,
  Package2
} from 'lucide-react';
import useAnimalesStore from '../store/animalesStore';
import { useConfirm, confirmDelete, confirmAction } from '../hooks/useConfirm.jsx';
import PageHeader from '../components/PageHeader';

const Lotes = () => {
  const { showConfirm, ConfirmComponent } = useConfirm();
  const {
    lotes,
    animales,
    fetchLotes,
    fetchAnimales,
    createLote,
    updateLote,
    deleteLote,
    asignarAnimalesALote,
    quitarAnimalesDeLote,
    loading,
    error
  } = useAnimalesStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageAnimalsModal, setShowManageAnimalsModal] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [newLote, setNewLote] = useState({
    nombre: '',
    numero: '',
    color: '#67806D',
    observaciones: ''
  });

  useEffect(() => {
    fetchLotes();
    fetchAnimales();
  }, []);

  const filteredLotes = lotes.filter(lote =>
    lote.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lote.numero && lote.numero.toString().includes(searchTerm))
  );

  const getAnimalesDelLote = (loteId) => {
    return animales.filter(animal => 
      animal.lote_actual && 
      animal.lote_actual.id === loteId && 
      animal.estado === 'en_campo'
    );
  };

  const getAnimalesDisponibles = () => {
    return animales.filter(animal => 
      animal.estado === 'en_campo' && 
      !animal.lote_actual
    );
  };

  const handleCreateLote = async () => {
    if (!newLote.nombre.trim()) {
      await showConfirm({
        type: 'warning',
        title: 'Campo requerido',
        message: 'El nombre del lote es requerido para poder crearlo.',
        confirmText: 'Entendido'
      });
      return;
    }

    try {
      const result = await createLote(newLote);
      if (result.success) {
        setNewLote({
          nombre: '',
          numero: '',
          color: '#67806D',
          observaciones: ''
        });
        setShowCreateModal(false);
        await showConfirm({
          type: 'success',
          title: 'Lote creado',
          message: 'El lote se ha creado exitosamente.',
          confirmText: 'Continuar'
        });
      } else {
        await showConfirm({
          type: 'danger',
          title: 'Error al crear lote',
          message: `Error al crear el lote: ${result.error}`,
          confirmText: 'Entendido'
        });
      }
    } catch (error) {
      await showConfirm({
        type: 'danger',
        title: 'Error al crear lote',
        message: `Error al crear el lote: ${error.message}`,
        confirmText: 'Entendido'
      });
    }
  };

  const handleEditLote = async () => {
    if (!selectedLote.nombre.trim()) {
      await showConfirm({
        type: 'warning',
        title: 'Campo requerido',
        message: 'El nombre del lote es requerido para poder actualizarlo.',
        confirmText: 'Entendido'
      });
      return;
    }

    try {
      const result = await updateLote(selectedLote.id, selectedLote);
      if (result.success) {
        setShowEditModal(false);
        setSelectedLote(null);
        await showConfirm({
          type: 'success',
          title: 'Lote actualizado',
          message: 'El lote se ha actualizado exitosamente.',
          confirmText: 'Continuar'
        });
      } else {
        await showConfirm({
          type: 'danger',
          title: 'Error al actualizar',
          message: `Error al actualizar el lote: ${result.error}`,
          confirmText: 'Entendido'
        });
      }
    } catch (error) {
      await showConfirm({
        type: 'danger',
        title: 'Error al actualizar',
        message: `Error al actualizar el lote: ${error.message}`,
        confirmText: 'Entendido'
      });
    }
  };

  const handleDeleteLote = async (lote) => {
    const animalesEnLote = getAnimalesDelLote(lote.id);
    
    let message = '';
    if (animalesEnLote.length > 0) {
      message = `Este lote tiene ${animalesEnLote.length} animales asignados. Los animales serán liberados automáticamente del lote y se eliminará el historial de asignaciones.`;
    } else {
      message = 'Se eliminará el historial de asignaciones de este lote.';
    }

    const confirmed = await confirmDelete(
      `lote "${lote.nombre}"`,
      message
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

  const handleManageAnimals = (lote) => {
    setSelectedLote(lote);
    setSelectedAnimals([]);
    setShowManageAnimalsModal(true);
  };

  const handleAsignarAnimales = async () => {
    if (selectedAnimals.length === 0) {
      await showConfirm({
        type: 'info',
        title: 'Ningún animal seleccionado',
        message: 'Por favor selecciona al menos un animal para asignar al lote.',
        confirmText: 'Entendido'
      });
      return;
    }

    try {
      const result = await asignarAnimalesALote(selectedAnimals, selectedLote.id);
      if (result.success) {
        setSelectedAnimals([]);
        await showConfirm({
          type: 'success',
          title: 'Animales asignados',
          message: `${selectedAnimals.length} animales asignados al lote exitosamente.`,
          confirmText: 'Continuar'
        });
      } else {
        await showConfirm({
          type: 'danger',
          title: 'Error en la asignación',
          message: `Error al asignar animales: ${result.error}`,
          confirmText: 'Entendido'
        });
      }
    } catch (error) {
      await showConfirm({
        type: 'danger',
        title: 'Error en la asignación',
        message: `Error al asignar animales: ${error.message}`,
        confirmText: 'Entendido'
      });
    }
  };

  const handleQuitarAnimales = async () => {
    if (selectedAnimals.length === 0) {
      await showConfirm({
        type: 'info',
        title: 'Ningún animal seleccionado',
        message: 'Por favor selecciona al menos un animal para remover del lote.',
        confirmText: 'Entendido'
      });
      return;
    }

    try {
      const result = await quitarAnimalesDeLote(selectedAnimals);
      if (result.success) {
        setSelectedAnimals([]);
        await showConfirm({
          type: 'success',
          title: 'Animales removidos',
          message: `${selectedAnimals.length} animales removidos del lote exitosamente.`,
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
    } catch (error) {
      await showConfirm({
        type: 'danger',
        title: 'Error en la remoción',
        message: `Error al remover animales: ${error.message}`,
        confirmText: 'Entendido'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rural-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Lotes"
        subtitle="Organiza y gestiona los lotes de animales"
      />

      {/* Barra de búsqueda y acciones */}
      <div className="bg-white rounded-xl shadow-sm border border-rural-alternate/20 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-rural-text/50" />
            <input
              type="text"
              placeholder="Buscar lotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-rural-alternate/30 rounded-lg focus:ring-2 focus:ring-rural-primary/20 focus:border-rural-primary"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-rural-primary text-white px-4 py-2 rounded-lg hover:bg-rural-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Lote</span>
          </button>
        </div>
      </div>

      {/* Grid de lotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLotes.map((lote) => {
          const animalesEnLote = getAnimalesDelLote(lote.id);
          return (
            <motion.div
              key={lote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-rural-alternate/20 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: lote.color }}
                    />
                    <h3 className="text-lg font-semibold text-rural-text">
                      {lote.nombre}
                    </h3>
                    {lote.numero && (
                      <span className="text-sm text-rural-text/60">
                        #{lote.numero}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-rural-text/70">
                    {animalesEnLote.length} animales
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === lote.id ? null : lote.id)}
                    className="p-2 text-rural-text/60 hover:text-rural-text hover:bg-rural-background rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {dropdownOpen === lote.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-rural-alternate/20 py-2 z-20">
                        <button
                          onClick={() => {
                            setSelectedLote(lote);
                            setShowEditModal(true);
                            setDropdownOpen(null);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-rural-text hover:bg-rural-background transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            handleManageAnimals(lote);
                            setDropdownOpen(null);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-rural-text hover:bg-rural-background transition-colors"
                        >
                          <Users className="h-4 w-4" />
                          <span>Gestionar animales</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteLote(lote);
                            setDropdownOpen(null);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {lote.observaciones && (
                <p className="text-sm text-rural-text/60 mb-4">
                  {lote.observaciones}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-rural-text/60">
                  <Package2 className="h-4 w-4" />
                  <span>{animalesEnLote.length} animales</span>
                </div>

                <button
                  onClick={() => handleManageAnimals(lote)}
                  className="text-sm text-rural-primary hover:text-rural-primary/80 font-medium"
                >
                  Gestionar
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredLotes.length === 0 && (
        <div className="text-center py-12">
          <Package2 className="h-12 w-12 mx-auto text-rural-text/30 mb-4" />
          <h3 className="text-lg font-medium text-rural-text mb-2">
            No hay lotes
          </h3>
          <p className="text-rural-text/60 mb-4">
            {searchTerm ? 'No se encontraron lotes con ese criterio de búsqueda' : 'Comienza creando tu primer lote'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 bg-rural-primary text-white px-4 py-2 rounded-lg hover:bg-rural-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Lote</span>
          </button>
        </div>
      )}

      {/* Modal Crear Lote */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b border-rural-alternate/20">
              <h3 className="text-lg font-semibold text-rural-text">
                Crear Nuevo Lote
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-rural-text/60 hover:text-rural-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newLote.nombre}
                  onChange={(e) => setNewLote({ ...newLote, nombre: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rural-primary/20 focus:border-rural-primary"
                  placeholder="Ej: Lote Norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={newLote.numero}
                  onChange={(e) => setNewLote({ ...newLote, numero: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rural-primary/20 focus:border-rural-primary"
                  placeholder="Ej: 001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newLote.color}
                  onChange={(e) => setNewLote({ ...newLote, color: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Observaciones
                </label>
                <textarea
                  value={newLote.observaciones}
                  onChange={(e) => setNewLote({ ...newLote, observaciones: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rural-primary/20 focus:border-rural-primary"
                  rows="3"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-rural-alternate/20">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-rural-text/70 border border-rural-alternate/30 rounded-lg hover:bg-rural-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateLote}
                className="flex-1 px-4 py-2 bg-rural-primary text-white rounded-lg hover:bg-rural-primary/90 transition-colors"
              >
                Crear Lote
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Editar Lote */}
      {showEditModal && selectedLote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b border-rural-alternate/20">
              <h3 className="text-lg font-semibold text-rural-text">
                Editar Lote
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-rural-text/60 hover:text-rural-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={selectedLote.nombre}
                  onChange={(e) => setSelectedLote({ ...selectedLote, nombre: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rural-primary/20 focus:border-rural-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={selectedLote.numero || ''}
                  onChange={(e) => setSelectedLote({ ...selectedLote, numero: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rural-primary/20 focus:border-rural-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={selectedLote.color}
                  onChange={(e) => setSelectedLote({ ...selectedLote, color: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rural-text mb-1">
                  Observaciones
                </label>
                <textarea
                  value={selectedLote.observaciones || ''}
                  onChange={(e) => setSelectedLote({ ...selectedLote, observaciones: e.target.value })}
                  className="w-full border border-rural-alternate/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rural-primary/20 focus:border-rural-primary"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-rural-alternate/20">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-rural-text/70 border border-rural-alternate/30 rounded-lg hover:bg-rural-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditLote}
                className="flex-1 px-4 py-2 bg-rural-primary text-white rounded-lg hover:bg-rural-primary/90 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Gestionar Animales */}
      {showManageAnimalsModal && selectedLote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-rural-alternate/20">
              <h3 className="text-lg font-semibold text-rural-text">
                Gestionar Animales - {selectedLote.nombre}
              </h3>
              <button
                onClick={() => setShowManageAnimalsModal(false)}
                className="text-rural-text/60 hover:text-rural-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Animales disponibles */}
                <div>
                  <h4 className="font-medium text-rural-text mb-3 flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Animales Disponibles
                  </h4>
                  <div className="border border-rural-alternate/20 rounded-lg max-h-60 overflow-y-auto">
                    {getAnimalesDisponibles().map((animal) => (
                      <label key={animal.id} className="flex items-center p-3 hover:bg-rural-background cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAnimals.includes(animal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAnimals([...selectedAnimals, animal.id]);
                            } else {
                              setSelectedAnimals(selectedAnimals.filter(id => id !== animal.id));
                            }
                          }}
                          className="rounded border-rural-alternate/30 text-rural-primary focus:ring-rural-primary"
                        />
                        <span className="ml-3 text-sm">
                          {animal.numero_caravana || 'Sin caravana'} - {animal.categoria}
                        </span>
                      </label>
                    ))}
                    {getAnimalesDisponibles().length === 0 && (
                      <p className="p-4 text-rural-text/60 text-center">
                        No hay animales disponibles
                      </p>
                    )}
                  </div>
                </div>

                {/* Animales en el lote */}
                <div>
                  <h4 className="font-medium text-rural-text mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Animales en el Lote
                  </h4>
                  <div className="border border-rural-alternate/20 rounded-lg max-h-60 overflow-y-auto">
                    {getAnimalesDelLote(selectedLote.id).map((animal) => (
                      <label key={animal.id} className="flex items-center p-3 hover:bg-rural-background cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAnimals.includes(animal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAnimals([...selectedAnimals, animal.id]);
                            } else {
                              setSelectedAnimals(selectedAnimals.filter(id => id !== animal.id));
                            }
                          }}
                          className="rounded border-rural-alternate/30 text-rural-primary focus:ring-rural-primary"
                        />
                        <span className="ml-3 text-sm">
                          {animal.numero_caravana || 'Sin caravana'} - {animal.categoria}
                        </span>
                      </label>
                    ))}
                    {getAnimalesDelLote(selectedLote.id).length === 0 && (
                      <p className="p-4 text-rural-text/60 text-center">
                        No hay animales en este lote
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={handleAsignarAnimales}
                  disabled={selectedAnimals.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-lg hover:bg-rural-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Asignar al Lote</span>
                </button>

                <button
                  onClick={handleQuitarAnimales}
                  disabled={selectedAnimals.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserMinus className="h-4 w-4" />
                  <span>Quitar del Lote</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmComponent />
    </div>
  );
};

export default Lotes;
