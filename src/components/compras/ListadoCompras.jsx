import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  MapPin, 
  Package, 
  DollarSign,
  FileText,
  Download,
  Filter,
  Search
} from 'lucide-react';
import FacturaModal from '../facturacion/FacturaModal';

export default function ListadoCompras({ compras, onVerDetalle, onEditar, onEliminar, loading }) {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fechaDesde: '',
    fechaHasta: '',
    proveedor: ''
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [compraParaFacturar, setCompraParaFacturar] = useState(null);

  const comprasFiltradas = compras.filter(compra => {
    const cumpleBusqueda = !filtros.busqueda || 
      compra.lugar_origen.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      compra.proveedores?.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleFechaDesde = !filtros.fechaDesde || 
      new Date(compra.fecha) >= new Date(filtros.fechaDesde);
    
    const cumpleFechaHasta = !filtros.fechaHasta || 
      new Date(compra.fecha) <= new Date(filtros.fechaHasta);
    
    const cumpleProveedor = !filtros.proveedor || 
      compra.proveedores?.nombre.toLowerCase().includes(filtros.proveedor.toLowerCase());

    return cumpleBusqueda && cumpleFechaDesde && cumpleFechaHasta && cumpleProveedor;
  });

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMoneda = (valor) => {
    if (!valor) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      fechaDesde: '',
      fechaHasta: '',
      proveedor: ''
    });
  };

  const handleGenerarFactura = (compra) => {
    setCompraParaFacturar(compra);
    setMostrarModalFactura(true);
  };

  const handleFacturaGenerada = (factura) => {
    console.log('Factura generada:', factura);
    setMostrarModalFactura(false);
    setCompraParaFacturar(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#67806D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[#3C454A] flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h3>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-[#67806D] hover:text-[#5a6b60] text-sm font-medium"
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} filtros
          </button>
        </div>

        {/* Búsqueda rápida */}
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              placeholder="Buscar por lugar de origen o proveedor..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
            />
          </div>
        </div>

        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Proveedor
              </label>
              <input
                type="text"
                value={filtros.proveedor}
                onChange={(e) => setFiltros(prev => ({ ...prev, proveedor: e.target.value }))}
                placeholder="Filtrar por proveedor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
          </motion.div>
        )}

        {(filtros.busqueda || filtros.fechaDesde || filtros.fechaHasta || filtros.proveedor) && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Mostrando {comprasFiltradas.length} de {compras.length} compras
            </span>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-[#67806D] hover:text-[#5a6b60] font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Compras */}
      {comprasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay compras registradas
          </h3>
          <p className="text-gray-600">
            {compras.length === 0 
              ? 'Aún no has registrado ninguna compra.'
              : 'No hay compras que coincidan con los filtros aplicados.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {comprasFiltradas.map((compra, index) => (
            <motion.div
              key={compra.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#3C454A] mb-1">
                      Compra del {formatearFecha(compra.fecha)}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatearFecha(compra.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {compra.proveedores?.nombre || 'Proveedor no especificado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onVerDetalle(compra)}
                      className="p-2 text-[#67806D] hover:text-[#5a6b60] hover:bg-gray-50 rounded-lg transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditar(compra)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEliminar(compra)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#67806D]" />
                    <div>
                      <div className="text-xs text-gray-500">Lugar de Origen</div>
                      <div className="text-sm font-medium text-[#3C454A]">
                        {compra.lugar_origen}
                      </div>
                    </div>
                  </div>

                  {compra.transportadores && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#67806D]" />
                      <div>
                        <div className="text-xs text-gray-500">Transportador</div>
                        <div className="text-sm font-medium text-[#3C454A]">
                          {compra.transportadores.nombre}
                        </div>
                      </div>
                    </div>
                  )}

                  {compra.precio_total && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#67806D]" />
                      <div>
                        <div className="text-xs text-gray-500">Precio Total</div>
                        <div className="text-sm font-medium text-[#3C454A]">
                          {formatearMoneda(compra.precio_total)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Indicadores de método de carga */}
                <div className="flex items-center gap-4 mb-4">
                  {compra.flag_peso_promedio && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Peso Promedio: {compra.peso_promedio} kg
                    </span>
                  )}
                  
                  {compra.documento && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FileText className="w-3 h-3 mr-1" />
                      Con documento
                    </span>
                  )}
                </div>

                {compra.observaciones && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-500 mb-1">Observaciones</div>
                    <div className="text-sm text-[#3C454A]">
                      {compra.observaciones}
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <span>Registrado por: {compra.usuarios?.nombre || 'Usuario no disponible'}</span>
                      <span className="ml-4">{new Date(compra.created_at).toLocaleString('es-AR')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVerDetalle(compra)}
                        className="flex items-center gap-1 px-3 py-1 text-[#67806D] border border-[#67806D] rounded-lg hover:bg-[#67806D]/5 transition-colors text-sm"
                      >
                        <Eye className="w-3 h-3" />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => handleGenerarFactura(compra)}
                        className="flex items-center gap-1 px-3 py-1 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm"
                      >
                        <FileText className="w-3 h-3" />
                        Facturar
                      </button>
                      
                      <button
                        onClick={() => onEditar(compra)}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      >
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => onEliminar(compra)}
                        className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Botón de exportar */}
      {comprasFiltradas.length > 0 && (
        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#5a6b60] transition-colors">
            <Download className="w-4 h-4" />
            Exportar a Excel
          </button>
        </div>
      )}

      {/* Modal de Facturación */}
      {mostrarModalFactura && compraParaFacturar && (
        <FacturaModal
          isOpen={mostrarModalFactura}
          onClose={() => {
            setMostrarModalFactura(false);
            setCompraParaFacturar(null);
          }}
          tipo="compra"
          datos={compraParaFacturar}
          onSuccess={handleFacturaGenerada}
        />
      )}
    </div>
  );
}
