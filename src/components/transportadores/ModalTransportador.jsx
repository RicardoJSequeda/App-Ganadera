import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Truck,
  Phone,
  DollarSign,
  MessageSquare,
  MapPin
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const ModalTransportador = ({ 
  isOpen, 
  onClose, 
  mode = 'crear', 
  transportador = null, 
  onTransportadorCreated,
  onTransportadorUpdated 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    precio_km: '',
    observaciones: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transportador) {
      setFormData({
        nombre: transportador.nombre || '',
        contacto: transportador.contacto || '',
        precio_km: transportador.precio_km || '',
        observaciones: transportador.observaciones || ''
      });
    }
  }, [transportador]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      precio_km: '',
      observaciones: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (formData.precio_km && isNaN(formData.precio_km)) {
      newErrors.precio_km = 'El precio debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        precio_km: formData.precio_km ? parseFloat(formData.precio_km) : null,
        updated_at: new Date().toISOString()
      };

      if (mode === 'crear') {
        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('transportadores')
          .insert([{
            ...dataToSubmit,
            created_by: user?.id,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        
        onTransportadorCreated?.(data);
      } else {
        const { data, error } = await supabase
          .from('transportadores')
          .update(dataToSubmit)
          .eq('id', transportador.id)
          .select()
          .single();

        if (error) throw error;
        
        onTransportadorUpdated?.(data);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al guardar transportador:', error);
      setErrors({ submit: 'Error al guardar el transportador. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'ver';
  const title = mode === 'crear' ? 'Nuevo Transportador' : 
                mode === 'editar' ? 'Editar Transportador' : 
                'Detalles del Transportador';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-rural-alternate/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rural-primary/10 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-rural-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-rural-text">{title}</h2>
              <p className="text-sm text-rural-text/60">
                {isViewMode ? 'Información completa' : 'Completa los datos del transportador'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rural-alternate/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-rural-text/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Información del Transportador
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    disabled={isViewMode}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                      errors.nombre ? 'border-red-500' : 'border-rural-alternate'
                    } ${isViewMode ? 'bg-rural-alternate/20' : 'bg-white'}`}
                    placeholder="Nombre de la empresa de transporte"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">
                    Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) => handleInputChange('contacto', e.target.value)}
                    disabled={isViewMode}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                      isViewMode ? 'bg-rural-alternate/20 border-rural-alternate/50' : 'bg-white border-rural-alternate'
                    }`}
                    placeholder="Teléfono o email"
                  />
                </div>
              </div>
            </div>

            {/* Información comercial */}
            <div>
              <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Información Comercial
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-rural-text mb-2">
                  Precio por Kilómetro
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_km}
                  onChange={(e) => handleInputChange('precio_km', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                    errors.precio_km ? 'border-red-500' : isViewMode ? 'border-rural-alternate/50' : 'border-rural-alternate'
                  } ${isViewMode ? 'bg-rural-alternate/20' : 'bg-white'}`}
                  placeholder="0.00"
                />
                {errors.precio_km && (
                  <p className="text-red-500 text-sm mt-1">{errors.precio_km}</p>
                )}
                <p className="text-xs text-rural-text/60 mt-1">
                  Precio en pesos argentinos por kilómetro recorrido
                </p>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Observaciones
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-rural-text mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  disabled={isViewMode}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                    isViewMode ? 'bg-rural-alternate/20 border-rural-alternate/50' : 'bg-white border-rural-alternate'
                  }`}
                  placeholder="Información adicional sobre el transportador, horarios, especialidades, etc."
                />
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        {!isViewMode && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-rural-alternate/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-rural-text border border-rural-alternate rounded-xl hover:bg-rural-alternate/10 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{mode === 'crear' ? 'Crear Transportador' : 'Guardar Cambios'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ModalTransportador;
