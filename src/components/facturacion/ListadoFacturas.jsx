import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  Calendar,
  DollarSign,
  User,
  Package,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Weight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useFacturas } from '../../hooks/useFacturas';
import { useCompany } from '../../context/CompanyContext';
import FacturaPreviewModal from './FacturaPreviewModal';
import { useNotification } from '../../hooks/useNotification';

const ESTADOS_FACTURA = {
  'pendiente': { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  'emitida': { label: 'Emitida', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  'anulada': { label: 'Anulada', color: 'text-red-600 bg-red-50', icon: XCircle },
  'pagada': { label: 'Pagada', color: 'text-green-600 bg-green-50', icon: CheckCircle }
};

const TIPOS_COMPROBANTE = {
  'A': { label: 'Factura A', color: 'text-blue-600 bg-blue-50' },
  'B': { label: 'Factura B', color: 'text-green-600 bg-green-50' },
  'C': { label: 'Factura C', color: 'text-purple-600 bg-purple-50' },
  'E': { label: 'Factura E', color: 'text-orange-600 bg-orange-50' }
};

export default function ListadoFacturas({ onNuevaFactura, onVerDetalle }) {
  const { facturas, loading, deleteFactura, fetchFacturas, generarPDF, abrirPDF, generarPreviewDataUri } = useFacturas();
  const { showSuccess, showError, showInfo } = useNotification();
  const { companyConfig } = useCompany();
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_comprobante: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [facturasExpandidas, setVentasExpandidas] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [facturaAEliminar, setFacturaAEliminar] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDataUri, setPreviewDataUri] = useState('');

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    setCargando(true);
    await fetchFacturas();
    setCargando(false);
  };

  const facturasFiltradas = useMemo(() => {
    return facturas.filter(factura => {
      const cumpleBusqueda = !filtros.busqueda || 
        factura.numero_factura.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        (factura.ventas?.compradores?.nombre || factura.compras?.proveedores?.nombre || '').toLowerCase().includes(filtros.busqueda.toLowerCase());
      
      const cumpleTipo = !filtros.tipo_comprobante || factura.tipo_comprobante === filtros.tipo_comprobante;
      const cumpleEstado = !filtros.estado || factura.estado === filtros.estado;
      
      const cumpleFechaDesde = !filtros.fecha_desde || new Date(factura.fecha_emision) >= new Date(filtros.fecha_desde);
      const cumpleFechaHasta = !filtros.fecha_hasta || new Date(factura.fecha_emision) <= new Date(filtros.fecha_hasta);
      
      return cumpleBusqueda && cumpleTipo && cumpleEstado && cumpleFechaDesde && cumpleFechaHasta;
    });
  }, [facturas, filtros]);

  const toggleExpandir = (facturaId) => {
    const nuevasExpandidas = new Set(facturasExpandidas);
    if (nuevasExpandidas.has(facturaId)) {
      nuevasExpandidas.delete(facturaId);
    } else {
      nuevasExpandidas.add(facturaId);
    }
    setVentasExpandidas(nuevasExpandidas);
  };

  const handleEliminar = async (factura) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la factura ${factura.numero_factura}?`)) {
      const { error } = await deleteFactura(factura.id);
      if (error) {
        showError(error, 'Error al Eliminar Factura');
      } else {
        showSuccess('Factura eliminada correctamente', 'Factura Eliminada');
      }
    }
  };

  const handleGenerarPDF = async (factura) => {
    try {
      const resultado = await generarPDF(factura, companyConfig);
      if (resultado.success) {
        showSuccess('PDF generado y descargado exitosamente', 'PDF Generado');
      } else {
        throw new Error(resultado.error);
      }
    } catch (error) {
      showError(error.message, 'Error al Generar PDF');
    }
  };

  const handleAbrirPDF = async (factura) => {
    try {
      // Previsualización en modal con DataURI
      const resultado = await generarPreviewDataUri(factura, companyConfig);
      if (!resultado.success) throw new Error(resultado.error);
      setPreviewDataUri(resultado.dataUri);
      setPreviewOpen(true);
    } catch (error) {
      showError(error.message, 'Error al Previsualizar PDF');
    }
  };

  const exportarExcel = () => {
    // TODO: Implementar exportación a Excel
    showInfo('Funcionalidad de exportación en desarrollo', 'Próximamente');
  };

  const getTipoTransaccion = (factura) => {
    if (factura.venta_id) return { tipo: 'Venta', color: 'text-green-600' };
    if (factura.compra_id) return { tipo: 'Compra', color: 'text-blue-600' };
    return { tipo: 'N/A', color: 'text-gray-600' };
  };

  const getClienteProveedor = (factura) => {
    if (factura.ventas?.compradores) {
      return {
        nombre: factura.ventas.compradores.nombre,
        cuit: factura.ventas.compradores.cuit
      };
    }
    if (factura.compras?.proveedores) {
      return {
        nombre: factura.compras.proveedores.nombre,
        cuit: factura.compras.proveedores.cuit
      };
    }
    return { nombre: 'N/A', cuit: 'N/A' };
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#67806D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por número de factura o cliente..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {mostrarFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            <button
              onClick={onNuevaFactura}
              className="flex items-center gap-2 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Factura
            </button>
          </div>
        </div>

        {/* Filtros expandibles */}
        <AnimatePresence>
          {mostrarFiltros && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Comprobante
                  </label>
                  <select
                    value={filtros.tipo_comprobante}
                    onChange={(e) => setFiltros(prev => ({ ...prev, tipo_comprobante: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="A">Factura A</option>
                    <option value="B">Factura B</option>
                    <option value="C">Factura C</option>
                    <option value="E">Factura E</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="emitida">Emitida</option>
                    <option value="anulada">Anulada</option>
                    <option value="pagada">Pagada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_desde}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fecha_desde: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_hasta}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de facturas */}
      <div className="space-y-4">
        {facturasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No se encontraron facturas
            </h3>
            <p className="text-gray-500 mb-6">
              {filtros.busqueda || filtros.tipo_comprobante || filtros.estado || filtros.fecha_desde || filtros.fecha_hasta
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza generando tu primera factura'
              }
            </p>
            {!filtros.busqueda && !filtros.tipo_comprobante && !filtros.estado && !filtros.fecha_desde && !filtros.fecha_hasta && (
              <button
                onClick={onNuevaFactura}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Generar Primera Factura
              </button>
            )}
          </div>
        ) : (
          facturasFiltradas.map((factura) => {
            const tipoTransaccion = getTipoTransaccion(factura);
            const clienteProveedor = getClienteProveedor(factura);
            const estaExpandida = facturasExpandidas.has(factura.id);
            const estadoInfo = ESTADOS_FACTURA[factura.estado];
            const tipoInfo = TIPOS_COMPROBANTE[factura.tipo_comprobante];
            const EstadoIcon = estadoInfo.icon;

            return (
              <motion.div
                key={factura.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header de la factura */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#67806D] rounded-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#3C454A]">
                            {factura.numero_factura}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(factura.fecha_emision).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoInfo.color}`}>
                          {tipoInfo.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                          <EstadoIcon className="w-3 h-3 inline mr-1" />
                          {estadoInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#3C454A]">
                        ${factura.monto_total.toLocaleString('es-AR')}
                      </span>
                      <button
                        onClick={() => toggleExpandir(factura.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {estaExpandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className={`ml-2 font-medium ${tipoTransaccion.color}`}>
                        {tipoTransaccion.tipo}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cliente/Proveedor:</span>
                      <span className="ml-2 font-medium">{clienteProveedor.nombre}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">CUIT:</span>
                      <span className="ml-2 font-medium">{clienteProveedor.cuit}</span>
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                <AnimatePresence>
                  {estaExpandida && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Detalles financieros */}
                          <div>
                            <h4 className="font-semibold text-[#3C454A] mb-3">Detalles Financieros</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span>${factura.monto_neto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              {factura.iva_total > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">IVA (21%):</span>
                                  <span>${factura.iva_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold border-t pt-2">
                                <span>Total:</span>
                                <span>${factura.monto_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>

                          {/* Fechas */}
                          <div>
                            <h4 className="font-semibold text-[#3C454A] mb-3">Fechas</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Emisión:</span>
                                <span>{new Date(factura.fecha_emision).toLocaleDateString('es-AR')}</span>
                              </div>
                              {factura.fecha_vencimiento && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Vencimiento:</span>
                                  <span>{new Date(factura.fecha_vencimiento).toLocaleDateString('es-AR')}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Creada:</span>
                                <span>{new Date(factura.created_at).toLocaleDateString('es-AR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Observaciones */}
                        {factura.observaciones && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-[#3C454A] mb-2">Observaciones</h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                              {factura.observaciones}
                            </p>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                          <button
                            onClick={() => onVerDetalle?.(factura)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalle
                          </button>
                          
                          <button
                            onClick={() => handleAbrirPDF(factura)}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver PDF
                          </button>
                          
                          <button
                            onClick={() => handleGenerarPDF(factura)}
                            className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Descargar PDF
                          </button>
                          
                          <button
                            onClick={() => handleEliminar(factura)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
      {/* Modal de previsualización */}
      <FacturaPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        dataUri={previewDataUri}
      />
    </div>
  );
}
