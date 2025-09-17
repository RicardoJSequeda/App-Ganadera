import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Search, Calendar, FileText } from 'lucide-react';
import { useAnimalesStore } from '../store/animalesStore';

const ModalNuevaPesada = ({ isOpen, onClose }) => {
  const {
    animales,
    createPesada,
    fetchAnimales,
    loading
  } = useAnimalesStore();

  const [formData, setFormData] = useState({
    animal_id: '',
    fecha_pesada: new Date().toISOString().split('T')[0],
    peso: '',
    observaciones: '',
    created_by: '' // Se asignará desde el contexto de usuario
  });

  const [searchAnimal, setSearchAnimal] = useState('');
  const [showAnimalList, setShowAnimalList] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && animales.length === 0) {
      fetchAnimales();
    }
  }, [isOpen, animales.length, fetchAnimales]);

  // Filtrar animales en campo
  const animalesEnCampo = animales.filter(animal => 
    animal.estado === 'en_campo' &&
    (animal.numero_caravana?.toLowerCase().includes(searchAnimal.toLowerCase()) ||
     animal.categoria?.toLowerCase().includes(searchAnimal.toLowerCase()))
  );

  const selectedAnimal = animales.find(a => a.id === formData.animal_id);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectAnimal = (animal) => {
    setFormData(prev => ({ ...prev, animal_id: animal.id }));
    setSearchAnimal(`${animal.numero_caravana} - ${animal.categoria}`);
    setShowAnimalList(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.animal_id) {
      newErrors.animal_id = 'Debe seleccionar un animal';
    }

    if (!formData.fecha_pesada) {
      newErrors.fecha_pesada = 'La fecha es obligatoria';
    }

    if (!formData.peso || formData.peso <= 0) {
      newErrors.peso = 'El peso debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await createPesada({
        ...formData,
        peso: parseFloat(formData.peso),
        created_by: 'current-user-id' // Obtener del contexto de usuario
      });

      // Resetear formulario
      setFormData({
        animal_id: '',
        fecha_pesada: new Date().toISOString().split('T')[0],
        peso: '',
        observaciones: '',
        created_by: ''
      });
      setSearchAnimal('');
      
      onClose();
    } catch (error) {
      console.error('Error al crear pesada:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      animal_id: '',
      fecha_pesada: new Date().toISOString().split('T')[0],
      peso: '',
      observaciones: '',
      created_by: ''
    });
    setSearchAnimal('');
    setErrors({});
    setShowAnimalList(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#67806D] bg-opacity-10 rounded-lg">
                  <Scale className="h-5 w-5 text-[#67806D]" />
                </div>
                <h2 className="text-xl font-bold text-[#3C454A]">Nueva Pesada</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#3C454A]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Selección de Animal */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3C454A]">
                  Animal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#3C454A] opacity-50" />
                    <input
                      type="text"
                      value={searchAnimal}
                      onChange={(e) => {
                        setSearchAnimal(e.target.value);
                        setShowAnimalList(true);
                      }}
                      onFocus={() => setShowAnimalList(true)}
                      placeholder="Buscar animal por caravana o categoría..."
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent ${
                        errors.animal_id ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  
                  {showAnimalList && searchAnimal && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {animalesEnCampo.length > 0 ? (
                        animalesEnCampo.map((animal) => (
                          <button
                            key={animal.id}
                            type="button"
                            onClick={() => selectAnimal(animal)}
                            className="w-full text-left px-4 py-3 hover:bg-[#F5F2E7] transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-${animal.color_caravana || 'gray'}-500`}></div>
                              <div>
                                <p className="font-medium text-[#3C454A]">
                                  {animal.numero_caravana || 'S/N'} - {animal.categoria}
                                </p>
                                <p className="text-sm text-[#3C454A] opacity-70">
                                  {animal.proveedores?.nombre} - Peso: {animal.peso_ingreso} kg
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-[#3C454A] opacity-70">
                          No se encontraron animales
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.animal_id && (
                  <p className="text-red-500 text-sm">{errors.animal_id}</p>
                )}
              </div>

              {/* Animal seleccionado */}
              {selectedAnimal && (
                <div className="bg-[#F9E9D0] rounded-xl p-4">
                  <h3 className="font-medium text-[#3C454A] mb-2">Animal Seleccionado</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#3C454A] opacity-70">Caravana:</span>
                      <span className="ml-2 font-medium">{selectedAnimal.numero_caravana || 'S/N'}</span>
                    </div>
                    <div>
                      <span className="text-[#3C454A] opacity-70">Categoría:</span>
                      <span className="ml-2 font-medium">{selectedAnimal.categoria}</span>
                    </div>
                    <div>
                      <span className="text-[#3C454A] opacity-70">Peso Ingreso:</span>
                      <span className="ml-2 font-medium">{selectedAnimal.peso_ingreso} kg</span>
                    </div>
                    <div>
                      <span className="text-[#3C454A] opacity-70">Estado Físico:</span>
                      <span className="ml-2 font-medium capitalize">{selectedAnimal.estado_fisico}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#3C454A]">
                    Fecha de Pesada <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#3C454A] opacity-50" />
                    <input
                      type="date"
                      name="fecha_pesada"
                      value={formData.fecha_pesada}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent ${
                        errors.fecha_pesada ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.fecha_pesada && (
                    <p className="text-red-500 text-sm">{errors.fecha_pesada}</p>
                  )}
                </div>

                {/* Peso */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#3C454A]">
                    Peso (kg) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-3 h-4 w-4 text-[#3C454A] opacity-50" />
                    <input
                      type="number"
                      name="peso"
                      value={formData.peso}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      placeholder="Peso en kilogramos"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent ${
                        errors.peso ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.peso && (
                    <p className="text-red-500 text-sm">{errors.peso}</p>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3C454A]">
                  Observaciones
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-[#3C454A] opacity-50" />
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Observaciones sobre la pesada..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-200 text-[#3C454A] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#67806D] text-white rounded-xl hover:bg-[#67806D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar Pesada'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalNuevaPesada;
