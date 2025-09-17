import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Hash,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useFacturas } from '../../hooks/useFacturas';
import { useNotification } from '../../hooks/useNotification';

const TIPOS_COMPROBANTE = [
  { value: 'A', label: 'Factura A', description: 'Consumidor final con CUIT' },
  { value: 'B', label: 'Factura B', description: 'Consumidor final sin CUIT' },
  { value: 'C', label: 'Factura C', description: 'Exportación' },
  { value: 'E', label: 'Factura E', description: 'Operación exenta' }
];

export default function ConfiguracionFacturacion() {
  const { fetchConfiguracion, updateConfiguracion } = useFacturas();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [configuraciones, setConfiguraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchConfiguracion();
      
      if (error) {
        throw new Error(error);
      }

      // Crear configuraciones para todos los tipos si no existen
      const configsExistentes = data || [];
      const configsCompletas = TIPOS_COMPROBANTE.map(tipo => {
        const existente = configsExistentes.find(c => c.tipo_comprobante === tipo.value);
        return existente || {
          tipo_comprobante: tipo.value,
          punto_venta: 1,
          ultimo_numero: 0,
          prefijo: '',
          sufijo: '',
          activo: true
        };
      });

      setConfiguraciones(configsCompletas);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      showError(error.message, 'Error al Cargar Configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (tipoComprobante, field, value) => {
    setConfiguraciones(prev => 
      prev.map(config => 
        config.tipo_comprobante === tipoComprobante 
          ? { ...config, [field]: value }
          : config
      )
    );

    // Limpiar error si existe
    if (errores[`${tipoComprobante}_${field}`]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[`${tipoComprobante}_${field}`];
        return nuevos;
      });
    }
  };

  const validarConfiguracion = () => {
    const nuevosErrores = {};

    configuraciones.forEach(config => {
      if (config.activo) {
        if (!config.punto_venta || config.punto_venta < 1) {
          nuevosErrores[`${config.tipo_comprobante}_punto_venta`] = 'El punto de venta debe ser mayor a 0';
        }
        
        if (config.ultimo_numero < 0) {
          nuevosErrores[`${config.tipo_comprobante}_ultimo_numero`] = 'El último número no puede ser negativo';
        }
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarConfiguracion()) {
      showError('Por favor corrige los errores antes de guardar', 'Error de Validación');
      return;
    }

    try {
      setSaving(true);
      const { error } = await updateConfiguracion(configuraciones);
      
      if (error) {
        throw new Error(error);
      }

      showSuccess('Configuración guardada exitosamente', 'Configuración Actualizada');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showError(error.message, 'Error al Guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleResetear = () => {
    if (window.confirm('¿Está seguro de que desea resetear la configuración a los valores por defecto?')) {
      cargarConfiguracion();
      showInfo('Configuración reseteada a los valores por defecto', 'Configuración Reseteada');
    }
  };

  const getTipoInfo = (tipoComprobante) => {
    return TIPOS_COMPROBANTE.find(t => t.value === tipoComprobante);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#67806D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#67806D] rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3C454A]">
                Configuración de Facturación
              </h2>
              <p className="text-sm text-gray-600">
                Configure la numeración y parámetros para cada tipo de comprobante
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetear}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Resetear
            </button>
            
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Configuraciones por tipo de comprobante */}
      <div className="space-y-6">
        {configuraciones.map((config) => {
          const tipoInfo = getTipoInfo(config.tipo_comprobante);
          
          return (
            <motion.div
              key={config.tipo_comprobante}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#3C454A]">
                      {tipoInfo.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tipoInfo.description}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.activo}
                    onChange={(e) => handleInputChange(config.tipo_comprobante, 'activo', e.target.checked)}
                    className="w-4 h-4 text-[#67806D] border-gray-300 rounded focus:ring-[#67806D]"
                  />
                  <span className="text-sm font-medium text-[#3C454A]">
                    {config.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>

              {config.activo && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Punto de Venta */}
                  <div>
                    <label className="block text-sm font-medium text-[#3C454A] mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Punto de Venta
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={config.punto_venta}
                      onChange={(e) => handleInputChange(config.tipo_comprobante, 'punto_venta', parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
                        errores[`${config.tipo_comprobante}_punto_venta`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errores[`${config.tipo_comprobante}_punto_venta`] && (
                      <p className="text-red-500 text-xs mt-1">{errores[`${config.tipo_comprobante}_punto_venta`]}</p>
                    )}
                  </div>

                  {/* Último Número */}
                  <div>
                    <label className="block text-sm font-medium text-[#3C454A] mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Último Número
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={config.ultimo_numero}
                      onChange={(e) => handleInputChange(config.tipo_comprobante, 'ultimo_numero', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
                        errores[`${config.tipo_comprobante}_ultimo_numero`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errores[`${config.tipo_comprobante}_ultimo_numero`] && (
                      <p className="text-red-500 text-xs mt-1">{errores[`${config.tipo_comprobante}_ultimo_numero`]}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Próximo número: {config.ultimo_numero + 1}
                    </p>
                  </div>

                  {/* Prefijo */}
                  <div>
                    <label className="block text-sm font-medium text-[#3C454A] mb-2">
                      Prefijo (Opcional)
                    </label>
                    <input
                      type="text"
                      maxLength="10"
                      value={config.prefijo}
                      onChange={(e) => handleInputChange(config.tipo_comprobante, 'prefijo', e.target.value)}
                      placeholder="Ej: 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se agregará al inicio del número
                    </p>
                  </div>

                  {/* Sufijo */}
                  <div>
                    <label className="block text-sm font-medium text-[#3C454A] mb-2">
                      Sufijo (Opcional)
                    </label>
                    <input
                      type="text"
                      maxLength="10"
                      value={config.sufijo}
                      onChange={(e) => handleInputChange(config.tipo_comprobante, 'sufijo', e.target.value)}
                      placeholder="Ej: A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se agregará al final del número
                    </p>
                  </div>
                </div>
              )}

              {/* Vista previa del formato */}
              {config.activo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-[#3C454A] mb-2">Vista Previa del Formato:</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Número de ejemplo:</span>
                    <code className="px-2 py-1 bg-white border rounded font-mono">
                      {config.prefijo}{String(config.ultimo_numero + 1).padStart(8, '0')}{config.sufijo}
                    </code>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Información Importante</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los números de factura se generan automáticamente de forma secuencial</li>
              <li>• Una vez guardada la configuración, no se puede modificar el último número hacia atrás</li>
              <li>• El punto de venta debe coincidir con la configuración de AFIP</li>
              <li>• Los tipos de comprobante inactivos no aparecerán en las opciones de generación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
