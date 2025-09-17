import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  Calendar, 
  Users, 
  Syringe,
  Pill,
  Activity,
  AlertCircle,
  Save,
  User
} from 'lucide-react';
import { useAnimalesStore } from '../../store/animalesStore';

const ModalNuevoEventoSanitario = ({ isOpen, onClose, onEventoCreado }) => {
  const {
    animales,
    lotes,
    createEventoSanitario,
    fetchAnimales,
    fetchLotes,
    loading
  } = useAnimalesStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tipo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    aplicacion: 'individual', // 'individual' o 'multiple'
    animales_seleccionados: [],
    lote_seleccionado: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Solo cargar datos una vez cuando se abre el modal si no hay datos
  useEffect(() => {
    if (isOpen && (animales.length === 0 || lotes.length === 0)) {
      fetchAnimales();
      fetchLotes();
    }
  }, [isOpen]);

  const tiposEventos = [
    { value: 'vacuna', label: 'Vacuna', icon: <Syringe className="h-4 w-4" />, color: 'blue' },
    { value: 'desparasitario', label: 'Desparasitario', icon: <Pill className="h-4 w-4" />, color: 'green' },
    { value: 'tratamiento', label: 'Tratamiento', icon: <Activity className="h-4 w-4" />, color: 'orange' },
    { value: 'revision', label: 'Revisión', icon: <Heart className="h-4 w-4" />, color: 'red' },
    { value: 'medicamento', label: 'Medicamento', icon: <Pill className="h-4 w-4" />, color: 'purple' }
  ];

  const resetForm = () => {
    setFormData({
      tipo: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: '',
      aplicacion: 'individual',
      animales_seleccionados: [],
      lote_seleccionado: ''
    });
    setStep(1);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.tipo) newErrors.tipo = 'Selecciona un tipo de evento';
      if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
      if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    }

    if (stepNumber === 2) {
      if (formData.aplicacion === 'individual' && formData.animales_seleccionados.length === 0) {
        newErrors.animales_seleccionados = 'Selecciona al menos un animal';
      }
      if (formData.aplicacion === 'lote' && !formData.lote_seleccionado) {
        newErrors.lote_seleccionado = 'Selecciona un lote';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleAnimalToggle = (animalId) => {
    setFormData(prev => ({
      ...prev,
      animales_seleccionados: prev.animales_seleccionados.includes(animalId)
        ? prev.animales_seleccionados.filter(id => id !== animalId)
        : [...prev.animales_seleccionados, animalId]
    }));
  };

  const handleLoteSelection = (loteId) => {
    setFormData(prev => ({
      ...prev,
      lote_seleccionado: loteId,
      animales_seleccionados: [] // Limpiar selección individual
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      let animalesParaEvento = [];

      if (formData.aplicacion === 'individual') {
        animalesParaEvento = formData.animales_seleccionados;
      } else if (formData.aplicacion === 'lote') {
        // Obtener animales del lote seleccionado
        const lote = lotes.find(l => l.id === formData.lote_seleccionado);
        if (lote?.animales_actuales) {
          animalesParaEvento = lote.animales_actuales.map(al => al.animal_id);
        }
      }

      console.log('Creando eventos para animales:', animalesParaEvento);

      // Crear un evento por cada animal
      for (const animalId of animalesParaEvento) {
        await createEventoSanitario({
          animal_id: animalId,
          tipo: formData.tipo,
          descripcion: formData.descripcion,
          fecha: formData.fecha,
          observaciones: formData.observaciones,
          created_by: 'current-user-id'
        });
      }
      
      console.log('Eventos creados exitosamente');
      
      // Cerrar modal y resetear formulario
      handleClose();
      
      // Ejecutar callback para recargar datos en la página padre
      if (onEventoCreado) {
        onEventoCreado();
      }
    } catch (error) {
      console.error('Error al crear eventos sanitarios:', error);
      setErrors({ submit: 'Error al guardar los eventos sanitarios: ' + error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnimalesDelLote = (loteId) => {
    const lote = lotes.find(l => l.id === loteId);
    return lote?.animales_actuales?.length || 0;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#67806D] text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Nuevo Evento Sanitario</h2>
                <p className="text-[#67806D]/20">Paso {step} de 3</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 h-1">
            <div 
              className="bg-[#67806D] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Step 1: Datos del Evento */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#3C454A] mb-4">Información del Evento</h3>
                  
                  {/* Tipo de Evento */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#3C454A] mb-3">
                      Tipo de Evento *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {tiposEventos.map(tipo => (
                        <button
                          key={tipo.value}
                          type="button"
                          onClick={() => setFormData({...formData, tipo: tipo.value})}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            formData.tipo === tipo.value
                              ? 'border-[#67806D] bg-[#67806D]/10 text-[#67806D]'
                              : 'border-gray-200 hover:border-[#67806D]/50'
                          }`}
                        >
                          {tipo.icon}
                          <span className="font-medium">{tipo.label}</span>
                        </button>
                      ))}
                    </div>
                    {errors.tipo && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.tipo}
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#3C454A] mb-2">
                      Descripción del Evento *
                    </label>
                    <input
                      type="text"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      placeholder="Ej: Vacuna Triple, Ivermectina, Revisión general..."
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent ${
                        errors.descripcion ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors.descripcion && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#3C454A] mb-2">
                      Fecha del Evento *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent ${
                        errors.fecha ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors.fecha && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.fecha}
                      </p>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-medium text-[#3C454A] mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      placeholder="Observaciones adicionales del evento..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Selección de Animales */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#3C454A] mb-4">Selección de Animales</h3>
                  
                  {/* Tipo de Aplicación */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#3C454A] mb-3">
                      ¿Cómo aplicar el evento?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, aplicacion: 'individual', lote_seleccionado: ''})}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          formData.aplicacion === 'individual'
                            ? 'border-[#67806D] bg-[#67806D]/10 text-[#67806D]'
                            : 'border-gray-200 hover:border-[#67806D]/50'
                        }`}
                      >
                        <User className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Individual</div>
                          <div className="text-sm opacity-70">Seleccionar animales uno por uno</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, aplicacion: 'lote', animales_seleccionados: []})}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          formData.aplicacion === 'lote'
                            ? 'border-[#67806D] bg-[#67806D]/10 text-[#67806D]'
                            : 'border-gray-200 hover:border-[#67806D]/50'
                        }`}
                      >
                        <Users className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Por Lote</div>
                          <div className="text-sm opacity-70">Aplicar a todo un lote</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Selección Individual */}
                  {formData.aplicacion === 'individual' && (
                    <div>
                      <label className="block text-sm font-medium text-[#3C454A] mb-3">
                        Seleccionar Animales ({formData.animales_seleccionados.length} seleccionados)
                      </label>
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
                        {animales.map(animal => (
                          <div
                            key={animal.id}
                            className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                              formData.animales_seleccionados.includes(animal.id) ? 'bg-[#67806D]/10' : ''
                            }`}
                            onClick={() => handleAnimalToggle(animal.id)}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={formData.animales_seleccionados.includes(animal.id)}
                                onChange={() => handleAnimalToggle(animal.id)}
                                className="rounded border-gray-300 text-[#67806D] focus:ring-[#67806D]"
                              />
                              <div className={`w-3 h-3 rounded-full bg-${animal.color_caravana || 'gray'}-500`}></div>
                              <div className="flex-1">
                                <p className="font-medium text-[#3C454A]">{animal.numero_caravana || 'S/N'}</p>
                                <p className="text-sm text-[#3C454A] opacity-70">{animal.categoria}</p>
                              </div>
                              {animal.lote_nombre && (
                                <span className="text-xs bg-[#67806D]/10 text-[#67806D] px-2 py-1 rounded">
                                  {animal.lote_nombre}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.animales_seleccionados && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.animales_seleccionados}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Selección por Lote */}
                  {formData.aplicacion === 'lote' && (
                    <div>
                      <label className="block text-sm font-medium text-[#3C454A] mb-3">
                        Seleccionar Lote
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lotes.map(lote => (
                          <button
                            key={lote.id}
                            type="button"
                            onClick={() => handleLoteSelection(lote.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.lote_seleccionado === lote.id
                                ? 'border-[#67806D] bg-[#67806D]/10 text-[#67806D]'
                                : 'border-gray-200 hover:border-[#67806D]/50'
                            }`}
                          >
                            <div className="font-medium">{lote.nombre} - {lote.numero}</div>
                            <div className="text-sm opacity-70 mt-1">
                              {getAnimalesDelLote(lote.id)} animales en el lote
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.lote_seleccionado && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.lote_seleccionado}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmación */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#3C454A] mb-4">Confirmar Evento Sanitario</h3>
                  
                  <div className="bg-[#F5F2E7] rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#3C454A] opacity-70">Tipo</label>
                        <p className="font-semibold text-[#3C454A] capitalize">{formData.tipo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#3C454A] opacity-70">Fecha</label>
                        <p className="font-semibold text-[#3C454A]">
                          {new Date(formData.fecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[#3C454A] opacity-70">Descripción</label>
                        <p className="font-semibold text-[#3C454A]">{formData.descripcion}</p>
                      </div>
                      {formData.observaciones && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-[#3C454A] opacity-70">Observaciones</label>
                          <p className="text-[#3C454A]">{formData.observaciones}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[#3C454A] opacity-70">Aplicación</label>
                        <p className="font-semibold text-[#3C454A] capitalize">
                          {formData.aplicacion === 'individual' 
                            ? `Individual - ${formData.animales_seleccionados.length} animales`
                            : `Por lote - ${lotes.find(l => l.id === formData.lote_seleccionado)?.nombre || 'N/A'}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {errors.submit}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 flex items-center justify-between">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Anterior
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-[#67806D] text-white rounded-xl hover:bg-[#67806D]/90 transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#67806D] text-white rounded-xl hover:bg-[#67806D]/90 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Guardando...' : 'Guardar Evento'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModalNuevoEventoSanitario;
