import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Upload,
  User,
  Building2,
  Phone,
  CreditCard,
  FileText,
  MapPin,
  MessageSquare,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const ModalProveedor = ({ 
  isOpen, 
  onClose, 
  mode = 'crear', 
  proveedor = null, 
  onProveedorCreated,
  onProveedorUpdated 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    establecimiento: '',
    renspa: '',
    cuit: '',
    observaciones: '',
    datos_personales: '',
    boleto_marca: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre || '',
        contacto: proveedor.contacto || '',
        establecimiento: proveedor.establecimiento || '',
        renspa: proveedor.renspa || '',
        cuit: proveedor.cuit || '',
        observaciones: proveedor.observaciones || '',
        datos_personales: proveedor.datos_personales || '',
        boleto_marca: proveedor.boleto_marca || ''
      });
    }
  }, [proveedor]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      establecimiento: '',
      renspa: '',
      cuit: '',
      observaciones: '',
      datos_personales: '',
      boleto_marca: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (formData.cuit && !/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      newErrors.cuit = 'Formato de CUIT inválido (ej: 20-12345678-9)';
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
        updated_at: new Date().toISOString()
      };

      if (mode === 'crear') {
        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('proveedores')
          .insert([{
            ...dataToSubmit,
            created_by: user?.id,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        
        onProveedorCreated?.(data);
      } else {
        const { data, error } = await supabase
          .from('proveedores')
          .update(dataToSubmit)
          .eq('id', proveedor.id)
          .select()
          .single();

        if (error) throw error;
        
        onProveedorUpdated?.(data);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      setErrors({ submit: 'Error al guardar el proveedor. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploadingFile(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `boletos-marca/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        boleto_marca: publicUrl
      }));
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setErrors({ file: 'Error al subir el archivo' });
    } finally {
      setUploadingFile(false);
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
  const title = mode === 'crear' ? 'Nuevo Proveedor' : 
                mode === 'editar' ? 'Editar Proveedor' : 
                'Detalles del Proveedor';

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
              <Building2 className="w-5 h-5 text-rural-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-rural-text">{title}</h2>
              <p className="text-sm text-rural-text/60">
                {isViewMode ? 'Información completa' : 'Completa los datos del proveedor'}
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
                <User className="w-5 h-5" />
                Información Básica
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
                    placeholder="Nombre del proveedor"
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

            {/* Información del establecimiento */}
            <div>
              <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Establecimiento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">
                    Nombre del Establecimiento
                  </label>
                  <input
                    type="text"
                    value={formData.establecimiento}
                    onChange={(e) => handleInputChange('establecimiento', e.target.value)}
                    disabled={isViewMode}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                      isViewMode ? 'bg-rural-alternate/20 border-rural-alternate/50' : 'bg-white border-rural-alternate'
                    }`}
                    placeholder="Nombre del campo/establecimiento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">
                    RENSPA
                  </label>
                  <input
                    type="text"
                    value={formData.renspa}
                    onChange={(e) => handleInputChange('renspa', e.target.value)}
                    disabled={isViewMode}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                      isViewMode ? 'bg-rural-alternate/20 border-rural-alternate/50' : 'bg-white border-rural-alternate'
                    }`}
                    placeholder="Número RENSPA"
                  />
                </div>
              </div>
            </div>

            {/* Información fiscal */}
            <div>
              <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Información Fiscal
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-rural-text mb-2">
                  CUIT
                </label>
                <input
                  type="text"
                  value={formData.cuit}
                  onChange={(e) => handleInputChange('cuit', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                    errors.cuit ? 'border-red-500' : isViewMode ? 'border-rural-alternate/50' : 'border-rural-alternate'
                  } ${isViewMode ? 'bg-rural-alternate/20' : 'bg-white'}`}
                  placeholder="20-12345678-9"
                />
                {errors.cuit && (
                  <p className="text-red-500 text-sm mt-1">{errors.cuit}</p>
                )}
              </div>
            </div>

            {/* Documentos */}
            <div>
              <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-rural-text mb-2">
                  Boleto de Marca
                </label>
                
                {formData.boleto_marca ? (
                  <div className="flex items-center gap-3 p-3 bg-rural-alternate/10 rounded-lg">
                    <FileText className="w-5 h-5 text-rural-primary" />
                    <span className="flex-1 text-sm text-rural-text">
                      Documento cargado
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(formData.boleto_marca, '_blank')}
                        className="p-2 text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
                        title="Ver documento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('boleto_marca', '')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : !isViewMode && (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="boleto-marca"
                    />
                    <label
                      htmlFor="boleto-marca"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-rural-alternate hover:border-rural-primary rounded-xl cursor-pointer transition-colors"
                    >
                      {uploadingFile ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rural-primary"></div>
                          <span className="text-rural-text">Subiendo archivo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-rural-primary" />
                          <span className="text-rural-text">Subir Boleto de Marca</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Información Adicional
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">
                    Datos Personales
                  </label>
                  <textarea
                    value={formData.datos_personales}
                    onChange={(e) => handleInputChange('datos_personales', e.target.value)}
                    disabled={isViewMode}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                      isViewMode ? 'bg-rural-alternate/20 border-rural-alternate/50' : 'bg-white border-rural-alternate'
                    }`}
                    placeholder="Información personal del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    disabled={isViewMode}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none ${
                      isViewMode ? 'bg-rural-alternate/20 border-rural-alternate/50' : 'bg-white border-rural-alternate'
                    }`}
                    placeholder="Observaciones generales"
                  />
                </div>
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
                  <span>{mode === 'crear' ? 'Crear Proveedor' : 'Guardar Cambios'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ModalProveedor;
