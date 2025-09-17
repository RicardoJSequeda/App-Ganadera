import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  Plus, 
  Syringe,
  Pill,
  Activity,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAnimalesStore } from '../../store/animalesStore';

const HistorialSanitario = ({ animalId, animalData }) => {
  const {
    fetchEventosSanitarios,
    createEventoSanitario,
    updateEventoSanitario,
    deleteEventoSanitario,
    eventosSanitarios
  } = useAnimalesStore();

  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'vacuna',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  useEffect(() => {
    if (animalId) {
      loadEventos();
    }
  }, [animalId]);

  const loadEventos = async () => {
    await fetchEventosSanitarios(animalId);
  };

  const tiposEventos = [
    { value: 'vacuna', label: 'Vacuna', icon: <Syringe className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'desparasitario', label: 'Desparasitario', icon: <Pill className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    { value: 'tratamiento', label: 'Tratamiento', icon: <Activity className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    { value: 'revision', label: 'Revisión', icon: <Heart className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
    { value: 'medicamento', label: 'Medicamento', icon: <Pill className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEvento) {
        await updateEventoSanitario(editingEvento.id, formData);
      } else {
        await createEventoSanitario({
          animal_id: animalId,
          ...formData,
          created_by: 'current-user-id'
        });
      }
      
      await loadEventos();
      resetForm();
    } catch (error) {
      console.error('Error al guardar evento sanitario:', error);
    }
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setFormData({
      tipo: evento.tipo,
      descripcion: evento.descripcion || '',
      fecha: evento.fecha,
      observaciones: evento.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este evento sanitario?')) {
      try {
        await deleteEventoSanitario(id);
        await loadEventos();
      } catch (error) {
        console.error('Error al eliminar evento sanitario:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'vacuna',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    });
    setEditingEvento(null);
    setShowForm(false);
  };

  const getIconoTipo = (tipo) => {
    const tipoObj = tiposEventos.find(t => t.value === tipo);
    return tipoObj?.icon || <Heart className="h-4 w-4" />;
  };

  const getColorTipo = (tipo) => {
    const tipoObj = tiposEventos.find(t => t.value === tipo);
    return tipoObj?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-[#67806D]" />
          <h3 className="text-lg font-semibold text-[#3C454A]">Historial Sanitario</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#67806D]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Evento
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                >
                  {tiposEventos.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
                placeholder="Ej: Vacuna Triple, Ivermectina, etc."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Observaciones adicionales..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#67806D]/90 transition-colors"
              >
                {editingEvento ? 'Actualizar' : 'Guardar'}
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

      {/* Lista de eventos */}
      <div className="space-y-3">
        {eventosSanitarios.length > 0 ? (
          eventosSanitarios.map((evento, index) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getColorTipo(evento.tipo)}`}>
                      {getIconoTipo(evento.tipo)}
                      {evento.tipo}
                    </span>
                  </div>
                  
                  <div className="border-l border-gray-200 pl-4">
                    <div className="flex items-center gap-2 text-[#3C454A]">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{formatDate(evento.fecha)}</span>
                    </div>
                    <div className="text-[#3C454A] font-medium mt-1">
                      {evento.descripcion}
                    </div>
                    {evento.observaciones && (
                      <div className="text-sm text-[#3C454A] opacity-70 mt-1">
                        {evento.observaciones}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(evento)}
                    className="p-2 text-[#67806D] hover:bg-[#67806D] hover:bg-opacity-10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evento.id)}
                    className="p-2 text-[#F8B36A] hover:bg-[#F8B36A] hover:bg-opacity-10 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-[#3C454A] opacity-30 mx-auto mb-4" />
            <p className="text-[#3C454A] opacity-70">No hay eventos sanitarios registrados</p>
            <p className="text-sm text-[#3C454A] opacity-50">
              Registra el primer evento para hacer seguimiento sanitario
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      {eventosSanitarios.length > 0 && (
        <div className="bg-[#F5F2E7] rounded-lg p-4">
          <h4 className="font-medium text-[#3C454A] mb-3">Resumen Sanitario</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[#3C454A] opacity-70">Total Eventos:</span>
              <div className="font-semibold text-[#3C454A]">
                {eventosSanitarios.length}
              </div>
            </div>
            <div>
              <span className="text-[#3C454A] opacity-70">Último Evento:</span>
              <div className="font-semibold text-[#3C454A]">
                {eventosSanitarios.length > 0 ? formatDate(eventosSanitarios[0].fecha) : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-[#3C454A] opacity-70">Vacunas:</span>
              <div className="font-semibold text-blue-600">
                {eventosSanitarios.filter(e => e.tipo === 'vacuna').length}
              </div>
            </div>
            <div>
              <span className="text-[#3C454A] opacity-70">Tratamientos:</span>
              <div className="font-semibold text-orange-600">
                {eventosSanitarios.filter(e => e.tipo === 'tratamiento').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialSanitario;
