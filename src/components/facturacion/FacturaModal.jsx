import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  AlertCircle,
  Check,
  Download,
  Eye
} from 'lucide-react';
import { useFacturas } from '../../hooks/useFacturas';
import { useNotification } from '../../hooks/useNotification';

const TIPOS_COMPROBANTE = [
  { value: 'A', label: 'Factura A', description: 'Consumidor final con CUIT' },
  { value: 'B', label: 'Factura B', description: 'Consumidor final sin CUIT' },
  { value: 'C', label: 'Factura C', description: 'Exportación' },
  { value: 'E', label: 'Factura E', description: 'Operación exenta' }
];

export default function FacturaModal({ 
  isOpen, 
  onClose, 
  tipo, // 'venta' o 'compra'
  datos, // datos de la venta o compra
  onSuccess 
}) {
  const { generarFacturaVenta, generarFacturaCompra } = useFacturas();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [formData, setFormData] = useState({
    tipo_comprobante: 'B',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observaciones: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (isOpen && datos) {
      // Establecer tipo de comprobante por defecto según el tipo
      const tipoDefecto = tipo === 'venta' ? 'B' : 'A';
      setFormData(prev => ({
        ...prev,
        tipo_comprobante: tipoDefecto,
        observaciones: `Factura generada automáticamente desde ${tipo} ${datos.id}`
      }));
    }
  }, [isOpen, datos, tipo]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: null }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.tipo_comprobante) {
      nuevosErrores.tipo_comprobante = 'Seleccione un tipo de comprobante';
    }

    if (!formData.fecha_emision) {
      nuevosErrores.fecha_emision = 'La fecha de emisión es requerida';
    }

    if (!formData.fecha_vencimiento) {
      nuevosErrores.fecha_vencimiento = 'La fecha de vencimiento es requerida';
    }

    if (formData.fecha_vencimiento && formData.fecha_emision && 
        new Date(formData.fecha_vencimiento) <= new Date(formData.fecha_emision)) {
      nuevosErrores.fecha_vencimiento = 'La fecha de vencimiento debe ser posterior a la emisión';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGenerarFactura = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      let resultado;
      
      if (tipo === 'venta') {
        resultado = await generarFacturaVenta(datos, formData.tipo_comprobante);
      } else {
        resultado = await generarFacturaCompra(datos, formData.tipo_comprobante);
      }

      if (resultado.error) {
        throw new Error(resultado.error);
      }

      showSuccess(
        `Factura ${resultado.data.numero_factura} generada exitosamente`,
        'Factura Generada'
      );

      onSuccess?.(resultado.data);
      onClose();
    } catch (error) {
      console.error('Error generando factura:', error);
      showError(
        error.message || 'Error al generar la factura',
        'Error'
      );
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    const montoBase = datos?.valor_total || datos?.precio_total || 0;
    const esFacturaA = formData.tipo_comprobante === 'A';
    
    const iva = esFacturaA ? montoBase * 0.21 : 0;
    const neto = esFacturaA ? montoBase / 1.21 : montoBase;
    
    return { montoBase, iva, neto, total: montoBase };
  };

  const { montoBase, iva, neto, total } = calcularTotales();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#67806D] rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#3C454A]">
                  Generar Factura
                </h2>
                <p className="text-sm text-gray-600">
                  {tipo === 'venta' ? 'Venta' : 'Compra'} - {datos?.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Información de la transacción */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-[#3C454A] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Información de la {tipo === 'venta' ? 'Venta' : 'Compra'}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <span className="ml-2 font-medium">
                    {new Date(datos?.fecha).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Monto:</span>
                  <span className="ml-2 font-medium">
                    ${(datos?.valor_total || datos?.precio_total || 0).toLocaleString('es-AR')}
                  </span>
                </div>
                {tipo === 'venta' && datos?.compradores && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Comprador:</span>
                    <span className="ml-2 font-medium">
                      {datos.compradores.nombre} (CUIT: {datos.compradores.cuit})
                    </span>
                  </div>
                )}
                {tipo === 'compra' && datos?.proveedores && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Proveedor:</span>
                    <span className="ml-2 font-medium">
                      {datos.proveedores.nombre} (CUIT: {datos.proveedores.cuit})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              {/* Tipo de Comprobante */}
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-2">
                  Tipo de Comprobante *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TIPOS_COMPROBANTE.map((tipo) => (
                    <label
                      key={tipo.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.tipo_comprobante === tipo.value
                          ? 'border-[#67806D] bg-[#67806D]/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipo_comprobante"
                        value={tipo.value}
                        checked={formData.tipo_comprobante === tipo.value}
                        onChange={(e) => handleInputChange('tipo_comprobante', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-sm font-medium text-[#3C454A]">
                        {tipo.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {tipo.description}
                      </div>
                    </label>
                  ))}
                </div>
                {errores.tipo_comprobante && (
                  <p className="text-red-500 text-sm mt-1">{errores.tipo_comprobante}</p>
                )}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3C454A] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_emision}
                    onChange={(e) => handleInputChange('fecha_emision', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
                      errores.fecha_emision ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errores.fecha_emision && (
                    <p className="text-red-500 text-sm mt-1">{errores.fecha_emision}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C454A] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
                      errores.fecha_vencimiento ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errores.fecha_vencimiento && (
                    <p className="text-red-500 text-sm mt-1">{errores.fecha_vencimiento}</p>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
            </div>

            {/* Resumen de Totales */}
            <div className="bg-[#F5F2E7] rounded-lg p-4">
              <h3 className="font-semibold text-[#3C454A] mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Resumen de Totales
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${neto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                {formData.tipo_comprobante === 'A' && (
                  <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span>${iva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerarFactura}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Generar Factura
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
