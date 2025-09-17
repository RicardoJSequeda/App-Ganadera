import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Calendar, TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react';
import { useAnimalesStore } from '../store/animalesStore';

const PesadasHistory = ({ animalId, animalData }) => {
  const {
    fetchPesadasByAnimal,
    createPesada,
    updatePesada,
    deletePesada
  } = useAnimalesStore();

  const [pesadas, setPesadas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPesada, setEditingPesada] = useState(null);
  const [formData, setFormData] = useState({
    fecha_pesada: new Date().toISOString().split('T')[0],
    peso: '',
    observaciones: ''
  });

  useEffect(() => {
    if (animalId) {
      loadPesadas();
    }
  }, [animalId]);

  const loadPesadas = async () => {
    const data = await fetchPesadasByAnimal(animalId);
    setPesadas(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPesada) {
        await updatePesada(editingPesada.id, {
          ...formData,
          peso: parseFloat(formData.peso)
        });
      } else {
        await createPesada({
          animal_id: animalId,
          ...formData,
          peso: parseFloat(formData.peso),
          created_by: 'current-user-id'
        });
      }
      
      await loadPesadas();
      resetForm();
    } catch (error) {
      console.error('Error al guardar pesada:', error);
    }
  };

  const handleEdit = (pesada) => {
    setEditingPesada(pesada);
    setFormData({
      fecha_pesada: pesada.fecha_pesada,
      peso: pesada.peso.toString(),
      observaciones: pesada.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta pesada?')) {
      try {
        await deletePesada(id);
        await loadPesadas();
      } catch (error) {
        console.error('Error al eliminar pesada:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_pesada: new Date().toISOString().split('T')[0],
      peso: '',
      observaciones: ''
    });
    setEditingPesada(null);
    setShowForm(false);
  };

  const calculateGain = (current, previous) => {
    if (!previous) return null;
    return current.peso - previous.peso;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-5 w-5 text-[#67806D]" />
          <h3 className="text-lg font-semibold text-[#3C454A]">Historial de Pesadas</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#67806D]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Pesada
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#F9E9D0] rounded-lg p-4"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={formData.fecha_pesada}
                onChange={(e) => setFormData({...formData, fecha_pesada: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => setFormData({...formData, peso: e.target.value})}
                required
                placeholder="Peso en kg"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Observaciones
              </label>
              <input
                type="text"
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Observaciones..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#67806D]/90 transition-colors"
              >
                {editingPesada ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Lista de pesadas */}
      <div className="space-y-3">
        {pesadas.length > 0 ? (
          pesadas.map((pesada, index) => {
            const previousPesada = pesadas[index + 1];
            const gain = calculateGain(pesada, previousPesada);
            
            return (
              <motion.div
                key={pesada.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#3C454A]">
                        {pesada.peso} kg
                      </div>
                      {gain !== null && (
                        <div className={`text-sm font-medium ${gain > 0 ? 'text-[#67806D]' : 'text-[#F8B36A]'}`}>
                          {gain > 0 ? '+' : ''}{gain.toFixed(1)} kg
                          {gain > 0 ? (
                            <TrendingUp className="inline h-3 w-3 ml-1" />
                          ) : (
                            <TrendingDown className="inline h-3 w-3 ml-1" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="border-l border-gray-200 pl-4">
                      <div className="flex items-center gap-2 text-[#3C454A]">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(pesada.fecha_pesada)}</span>
                      </div>
                      {pesada.observaciones && (
                        <div className="text-sm text-[#3C454A] opacity-70 mt-1">
                          {pesada.observaciones}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(pesada)}
                      className="p-2 text-[#67806D] hover:bg-[#67806D] hover:bg-opacity-10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pesada.id)}
                      className="p-2 text-[#F8B36A] hover:bg-[#F8B36A] hover:bg-opacity-10 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Scale className="h-12 w-12 text-[#3C454A] opacity-30 mx-auto mb-4" />
            <p className="text-[#3C454A] opacity-70">No hay pesadas registradas</p>
            <p className="text-sm text-[#3C454A] opacity-50">
              Registra la primera pesada para hacer seguimiento del peso
            </p>
          </div>
        )}
      </div>

      {/* Resumen */}
      {pesadas.length > 1 && (
        <div className="bg-[#F5F2E7] rounded-lg p-4">
          <h4 className="font-medium text-[#3C454A] mb-3">Resumen</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[#3C454A] opacity-70">Peso Inicial:</span>
              <div className="font-semibold text-[#3C454A]">
                {pesadas[pesadas.length - 1]?.peso} kg
              </div>
            </div>
            <div>
              <span className="text-[#3C454A] opacity-70">Peso Actual:</span>
              <div className="font-semibold text-[#3C454A]">
                {pesadas[0]?.peso} kg
              </div>
            </div>
            <div>
              <span className="text-[#3C454A] opacity-70">Ganancia Total:</span>
              <div className={`font-semibold ${
                (pesadas[0]?.peso - pesadas[pesadas.length - 1]?.peso) > 0 
                  ? 'text-[#67806D]' 
                  : 'text-[#F8B36A]'
              }`}>
                {((pesadas[0]?.peso - pesadas[pesadas.length - 1]?.peso) || 0).toFixed(1)} kg
              </div>
            </div>
            <div>
              <span className="text-[#3C454A] opacity-70">Total Pesadas:</span>
              <div className="font-semibold text-[#3C454A]">
                {pesadas.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PesadasHistory;
