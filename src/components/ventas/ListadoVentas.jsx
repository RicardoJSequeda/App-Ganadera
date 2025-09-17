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
  TrendingUp
} from 'lucide-react';
import { useVentas, useCompradores } from '../../hooks/useVentas';
import { useNotification } from '../../hooks/useNotification';
import { supabase } from '../../utils/supabaseClient';
import * as XLSX from 'xlsx';
import FacturaModal from '../facturacion/FacturaModal';

export default function ListadoVentas({ onNuevaVenta, onVerDetalle }) {
  const { ventas, fetchVentas, deleteVenta } = useVentas();
  const { compradores } = useCompradores();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    comprador_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ventasExpandidas, setVentasExpandidas] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [ventaAEliminar, setVentaAEliminar] = useState(null);
  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [ventaParaFacturar, setVentaParaFacturar] = useState(null);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setCargando(true);
    await fetchVentas();
    setCargando(false);
  };

  const ventasFiltradas = ventas.filter(venta => {
    const comprador = compradores.find(c => c.id === venta.comprador_id);
    const compradorNombre = comprador?.nombre || '';
    
    const cumpleBusqueda = !filtros.busqueda || 
      compradorNombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      venta.observaciones?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleTipo = !filtros.tipo || venta.tipo === filtros.tipo;
    
    const cumpleComprador = !filtros.comprador_id || venta.comprador_id === filtros.comprador_id;
    
    const cumpleFechaDesde = !filtros.fecha_desde || 
      new Date(venta.fecha) >= new Date(filtros.fecha_desde);
    
    const cumpleFechaHasta = !filtros.fecha_hasta || 
      new Date(venta.fecha) <= new Date(filtros.fecha_hasta);
    
    return cumpleBusqueda && cumpleTipo && cumpleComprador && cumpleFechaDesde && cumpleFechaHasta;
  });

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      tipo: '',
      comprador_id: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
  };

  const exportarExcel = () => {
    const datosExcel = ventasFiltradas.map(venta => {
      const comprador = compradores.find(c => c.id === venta.comprador_id);
      
      // Formatear fecha correctamente
      const [año, mes, dia] = venta.fecha.split('-');
      const fechaLocal = new Date(año, mes - 1, dia);
      const fechaFormateada = fechaLocal.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
      
      return {
        'Fecha': fechaFormateada,
        'Tipo': venta.tipo,
        'Comprador': comprador?.nombre || 'Sin comprador',
        'Precio/kg': `$${venta.precio_kilo}`,
        'Total Animales': venta.total_animales || 0,
        'Peso Total (kg)': venta.peso_total || 0,
        'Valor Total': `$${((venta.peso_total || 0) * venta.precio_kilo).toLocaleString('es-AR')}`,
        'Observaciones': venta.observaciones || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `ventas_${fecha}.xlsx`);
  };

  const confirmarEliminacion = async () => {
    if (ventaAEliminar) {
      try {
        await deleteVenta(ventaAEliminar.id);
        showSuccess('Venta eliminada correctamente');
        setVentaAEliminar(null);
        cargarVentas();
      } catch (error) {
        showError('Error al eliminar la venta: ' + error.message);
      }
    }
  };

  const handleGenerarFactura = (venta) => {
    setVentaParaFacturar(venta);
    setMostrarModalFactura(true);
  };

  const handleFacturaGenerada = (factura) => {
    showSuccess(`Factura ${factura.numero_factura} generada exitosamente`, 'Factura Generada');
    setMostrarModalFactura(false);
    setVentaParaFacturar(null);
  };

  const toggleExpandirVenta = (ventaId) => {
    const nuevasExpandidas = new Set(ventasExpandidas);
    if (nuevasExpandidas.has(ventaId)) {
      nuevasExpandidas.delete(ventaId);
    } else {
      nuevasExpandidas.add(ventaId);
    }
    setVentasExpandidas(nuevasExpandidas);
  };

  // Función para calcular el valor total basado en precios por categoría
  const calcularValorTotal = (venta) => {
    // Validar que venta existe
    if (!venta) return 0;
    
    // Si tenemos valor_total calculado, usarlo
    if (venta.valor_total && !isNaN(venta.valor_total) && isFinite(venta.valor_total)) {
      return parseFloat(venta.valor_total);
    }

    // Si no hay precios por categoría, usar el método anterior como fallback
    if (!venta.precios_categoria || Object.keys(venta.precios_categoria).length === 0) {
      const pesoTotal = parseFloat(venta.peso_total || 0);
      const precioKilo = parseFloat(venta.precio_kilo || 0);
      const resultado = pesoTotal * precioKilo;
      console.log('📊 Cálculo fallback:', { pesoTotal, precioKilo, resultado });
      return isFinite(resultado) ? resultado : 0;
    }

    // Parsear precios_categoria si es string
    let preciosCategoria = venta.precios_categoria;
    if (typeof preciosCategoria === 'string') {
      try {
        preciosCategoria = JSON.parse(preciosCategoria);
      } catch (e) {
        console.error('Error parsing precios_categoria:', e);
        return 0;
      }
    }

    // Si tenemos precios por categoría pero no peso_total, calcular desde cero
    if (!venta.peso_total && venta.total_animales) {
      // Este es un fallback básico - idealmente deberíamos tener los datos detallados
      const totalAnimales = parseFloat(venta.total_animales || 0);
      const precioKilo = parseFloat(venta.precio_kilo || 0);
      const resultado = totalAnimales * 350 * precioKilo; // 350kg peso promedio estimado
      console.log('📊 Cálculo desde total_animales:', { totalAnimales, precioKilo, resultado });
      return isFinite(resultado) ? resultado : 0;
    }

    // Calcular basado en los datos disponibles con precios por categoría
    // Si tenemos peso_total, distribuir proporcionalmente entre categorías
    const categorias = Object.keys(preciosCategoria);
    if (categorias.length === 1) {
      // Solo una categoría
      const precio = parseFloat(preciosCategoria[categorias[0]] || 0);
      const pesoTotal = parseFloat(venta.peso_total || 0);
      const resultado = pesoTotal * precio;
      console.log('📊 Cálculo una categoría:', { precio, pesoTotal, resultado });
      return isFinite(resultado) ? resultado : 0;
    }

    // Múltiples categorías - usar precio promedio ponderado como estimación
    const preciosArray = Object.values(preciosCategoria).map(p => {
      const precio = parseFloat(p || 0);
      return isFinite(precio) ? precio : 0;
    });
    const precioPromedio = preciosArray.length > 0 
      ? preciosArray.reduce((sum, precio) => sum + precio, 0) / preciosArray.length 
      : 0;
    
    const pesoTotal = parseFloat(venta.peso_total || 0);
    const resultado = pesoTotal * precioPromedio;
    console.log('📊 Cálculo múltiples categorías:', { preciosArray, precioPromedio, pesoTotal, resultado });
    
    return isFinite(resultado) ? resultado : 0;
  };

  // Función para obtener resumen por categoría de una venta
  const obtenerResumenCategoria = async (venta) => {
    if (!venta.precios_categoria) return {};

    try {
      // Obtener animales de esta venta específica
      const { data: detallesVenta, error } = await supabase
        .from('detalle_venta')
        .select(`
          *,
          animales (categoria, peso_ingreso)
        `)
        .eq('venta_id', venta.id);

      if (error) throw error;

      // Agrupar por categoría
      const resumenCategorias = {};
      
      detallesVenta.forEach(detalle => {
        const categoria = detalle.animales?.categoria;
        if (!categoria) return;

        if (!resumenCategorias[categoria]) {
          resumenCategorias[categoria] = {
            cantidad: 0,
            peso: 0,
            precio_kg: parseFloat(venta.precios_categoria[categoria] || 0),
            valor: 0
          };
        }

        const peso = parseFloat(detalle.peso_salida || detalle.animales.peso_ingreso || 0);
        resumenCategorias[categoria].cantidad += 1;
        resumenCategorias[categoria].peso += peso;
        resumenCategorias[categoria].valor += peso * resumenCategorias[categoria].precio_kg;
      });

      return resumenCategorias;
    } catch (error) {
      console.error('Error obteniendo resumen por categoría:', error);
      return {};
    }
  };

  const expandirTodas = () => {
    setVentasExpandidas(new Set(ventasFiltradas.map(v => v.id)));
  };

  const contraerTodas = () => {
    setVentasExpandidas(new Set());
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      'jaula': 'Jaula',
      'remate': 'Remate', 
      'particular': 'Particular'
    };
    return tipos[tipo] || tipo;
  };

  const formatearFecha = (fecha) => {
    // Crear fecha sin conversión de timezone
    const [año, mes, dia] = fecha.split('-');
    const fechaLocal = new Date(año, mes - 1, dia);
    
    const fechaFormateada = fechaLocal.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
    
    return fechaFormateada;
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-[#67806D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3C454A]">Ventas</h2>
          <p className="text-gray-600">
            {ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''} 
            {filtros.busqueda || filtros.tipo || filtros.comprador_id || filtros.fecha_desde || filtros.fecha_hasta 
              ? ` (filtrada${ventasFiltradas.length !== 1 ? 's' : ''} de ${ventas.length})` 
              : ''
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          
          <button
            onClick={exportarExcel}
            disabled={ventasFiltradas.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-[#67806D] text-[#67806D] rounded-lg hover:bg-[#67806D]/5 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Comprador, observaciones..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Venta
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              >
                <option value="">Todos</option>
                <option value="jaula">Jaula</option>
                <option value="remate">Remate</option>
                <option value="particular">Particular</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprador
              </label>
              <select
                value={filtros.comprador_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, comprador_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              >
                <option value="">Todos</option>
                {compradores.map(comprador => (
                  <option key={comprador.id} value={comprador.id}>
                    {comprador.nombre}
                  </option>
                ))}
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
          
          <div className="flex justify-end mt-4">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista de ventas */}
      {ventasFiltradas.length > 0 ? (
        <div className="space-y-4">
          {/* Controles de expansión */}
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {ventasExpandidas.size} de {ventasFiltradas.length} expandida{ventasExpandidas.size !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandirTodas}
                className="text-sm text-[#67806D] hover:text-[#5a6b60] flex items-center gap-1"
              >
                <ChevronDown className="w-4 h-4" />
                Expandir todas
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={contraerTodas}
                className="text-sm text-[#67806D] hover:text-[#5a6b60] flex items-center gap-1"
              >
                <ChevronUp className="w-4 h-4" />
                Contraer todas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ventasFiltradas.map((venta) => {
              const comprador = compradores.find(c => c.id === venta.comprador_id);
              const valorTotal = calcularValorTotal(venta);
              const estaExpandida = ventasExpandidas.has(venta.id);
              
              return (
                <motion.div
                  key={venta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-[#3C454A] flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              {formatearFecha(venta.fecha)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {getTipoLabel(venta.tipo)} • ID: {venta.id.slice(0, 8)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              venta.tipo === 'jaula' ? 'bg-blue-100 text-blue-800' :
                              venta.tipo === 'remate' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {getTipoLabel(venta.tipo)}
                            </span>
                            
                            <button
                              onClick={() => toggleExpandirVenta(venta.id)}
                              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              {estaExpandida ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Comprador</p>
                              <p className="font-medium">{comprador?.nombre || 'Sin comprador'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Animales</p>
                              <p className="font-medium">{venta.total_animales || 0}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Weight className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Peso Total</p>
                              <p className="font-medium">{(venta.peso_total || 0).toFixed(1)} kg</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Valor Total</p>
                              <p className="font-bold text-[#67806D] text-lg">
                                ${valorTotal.toLocaleString('es-AR')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {venta.observaciones && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <FileText className="w-4 h-4 inline mr-1" />
                            {venta.observaciones}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex lg:flex-col gap-2">
                        <button
                          onClick={() => toggleExpandirVenta(venta.id)}
                          className="flex items-center gap-1 px-3 py-2 text-[#67806D] border border-[#67806D] rounded-lg hover:bg-[#67806D]/5 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {ventasExpandidas.has(venta.id) ? 'Ocultar' : 'Ver'}
                        </button>
                        
                        <button
                          onClick={() => handleGenerarFactura(venta)}
                          className="flex items-center gap-1 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Facturar
                        </button>
                        
                        <button
                          onClick={() => setVentaAEliminar(venta)}
                          className="flex items-center gap-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  <AnimatePresence>
                    {estaExpandida && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 overflow-hidden"
                      >
                        <div className="p-6 bg-gray-50">
                          <h4 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Detalles de la Venta
                          </h4>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Información del comprador */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Información del Comprador
                              </h5>
                              {comprador ? (
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm text-gray-600">Nombre:</span>
                                    <span className="ml-2 font-medium">{comprador.nombre}</span>
                                  </div>
                                  {comprador.contacto && (
                                    <div>
                                      <span className="text-sm text-gray-600">Contacto:</span>
                                      <span className="ml-2">{comprador.contacto}</span>
                                    </div>
                                  )}
                                  {comprador.cuit && (
                                    <div>
                                      <span className="text-sm text-gray-600">CUIT:</span>
                                      <span className="ml-2">{comprador.cuit}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">Sin información del comprador</p>
                              )}
                            </div>

                            {/* Resumen financiero */}
                            <ResumenFinanciero venta={venta} valorTotal={valorTotal} />
                          </div>

                          {/* Resumen por categoría */}
                          {venta.precios_categoria && Object.keys(venta.precios_categoria).length > 0 && (
                            <ResumenPorCategoria venta={venta} />
                          )}

                          {/* Lista de animales vendidos (placeholder) */}
                          <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Animales Vendidos
                            </h5>
                            <div className="text-center py-8 text-gray-500">
                              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>Lista de animales próximamente disponible</p>
                              <p className="text-sm">
                                Total: {venta.total_animales || 0} animales • {(venta.peso_total || 0).toFixed(1)} kg
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {ventas.length === 0 ? 'No hay ventas registradas' : 'No se encontraron ventas'}
          </h3>
          <p className="text-gray-500 mb-4">
            {ventas.length === 0 
              ? 'Comience registrando su primera venta' 
              : 'Intente modificar los filtros de búsqueda'
            }
          </p>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {ventaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-[#3C454A] mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro de que desea eliminar esta venta? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setVentaAEliminar(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Facturación */}
      {mostrarModalFactura && ventaParaFacturar && (
        <FacturaModal
          isOpen={mostrarModalFactura}
          onClose={() => {
            setMostrarModalFactura(false);
            setVentaParaFacturar(null);
          }}
          tipo="venta"
          datos={ventaParaFacturar}
          onSuccess={handleFacturaGenerada}
        />
      )}
    </div>
  );
}

// Componente para mostrar resumen financiero
const ResumenFinanciero = ({ venta, valorTotal }) => {
  // Validar y limpiar valores
  const valorFinal = (!isNaN(valorTotal) && isFinite(valorTotal)) ? valorTotal : 0;
  const pesoTotal = (!isNaN(venta.peso_total) && isFinite(venta.peso_total)) ? venta.peso_total : 0;
  const totalAnimales = venta.total_animales || 0;
  
  // Obtener precio para mostrar
  let precioMostrar = 0;
  if (venta.precios_categoria && Object.keys(venta.precios_categoria).length > 0) {
    if (Object.keys(venta.precios_categoria).length === 1) {
      const precio = Object.values(venta.precios_categoria)[0];
      precioMostrar = (!isNaN(precio) && isFinite(precio)) ? parseFloat(precio) : 0;
    }
  } else if (venta.precio_kilo) {
    precioMostrar = (!isNaN(venta.precio_kilo) && isFinite(venta.precio_kilo)) ? parseFloat(venta.precio_kilo) : 0;
  }
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        Resumen Financiero
      </h5>
      <div className="space-y-2">
        {venta.precios_categoria && Object.keys(venta.precios_categoria).length > 1 ? (
          // Múltiples categorías
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Precios por categoría:</span>
            <span className="font-medium text-xs">Ver detalle abajo</span>
          </div>
        ) : (
          // Una sola categoría o precio único
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Precio por kg:</span>
            <span className="font-medium">
              ${precioMostrar.toLocaleString('es-AR')}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Peso total:</span>
          <span className="font-medium">{pesoTotal.toFixed(1)} kg</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total animales:</span>
          <span className="font-medium">{totalAnimales}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-sm font-medium text-gray-700">Total:</span>
          <span className="font-bold text-[#67806D] text-lg">
            ${valorFinal.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar resumen por categoría
const ResumenPorCategoria = ({ venta }) => {
  const [resumenCategorias, setResumenCategorias] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarResumen = async () => {
      if (!venta.precios_categoria) return;
      
      setCargando(true);
      try {
        console.log('🔍 Cargando resumen para venta:', venta.id);
        console.log('📊 Precios categoria (raw):', venta.precios_categoria);
        console.log('📊 Tipo de precios_categoria:', typeof venta.precios_categoria);
        
        // Parsear precios_categoria si es string
        let preciosCategoria = venta.precios_categoria;
        if (typeof preciosCategoria === 'string') {
          try {
            preciosCategoria = JSON.parse(preciosCategoria);
          } catch (e) {
            console.error('Error parsing precios_categoria:', e);
            return;
          }
        }
        
        console.log('📊 Precios categoria (parsed):', preciosCategoria);
        
        // Obtener animales de esta venta específica
        const { data: detallesVenta, error } = await supabase
          .from('detalle_venta')
          .select(`
            *,
            animales (categoria, peso_ingreso)
          `)
          .eq('venta_id', venta.id);

        if (error) throw error;
        
        console.log('🐄 Detalles venta obtenidos:', detallesVenta);

        // Agrupar por categoría
        const resumen = {};
        
        detallesVenta.forEach(detalle => {
          const categoria = detalle.animales?.categoria;
          console.log('🏷️ Procesando animal categoria:', categoria);
          
          if (!categoria) return;

          if (!resumen[categoria]) {
            const precioKg = parseFloat(preciosCategoria[categoria] || 0);
            console.log(`💰 Precio para ${categoria}:`, precioKg);
            
            resumen[categoria] = {
              cantidad: 0,
              peso: 0,
              precio_kg: precioKg,
              valor: 0
            };
          }

          const peso = parseFloat(detalle.peso_salida || detalle.animales.peso_ingreso || 0);
          const valorCalculado = peso * resumen[categoria].precio_kg;
          
          console.log(`� Categoria ${categoria}: peso=${peso}, precio=${resumen[categoria].precio_kg}, valor=${valorCalculado}`);
          
          resumen[categoria].cantidad += 1;
          resumen[categoria].peso += peso;
          resumen[categoria].valor += valorCalculado;
        });

        console.log('📋 Resumen final:', resumen);
        setResumenCategorias(resumen);
      } catch (error) {
        console.error('Error cargando resumen por categoría:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, [venta.id, venta.precios_categoria]);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h5 className="font-medium text-gray-700 mb-3">Resumen por Categoría</h5>
        <div className="animate-pulse text-gray-500 text-sm">Cargando...</div>
      </div>
    );
  }

  if (Object.keys(resumenCategorias).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
      <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Resumen por Categoría
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(resumenCategorias).map(([categoria, datos]) => {
          console.log(`🎯 Renderizando ${categoria}:`, datos);
          
          // Validaciones más robustas
          const cantidad = datos.cantidad || 0;
          const peso = datos.peso || 0;
          const precioKg = datos.precio_kg || 0;
          const valor = datos.valor || 0;
          
          const valorFinal = (!isNaN(valor) && isFinite(valor)) ? valor : 0;
          const pesoFinal = (!isNaN(peso) && isFinite(peso)) ? peso : 0;
          const precioFinal = (!isNaN(precioKg) && isFinite(precioKg)) ? precioKg : 0;
          
          console.log(`✅ Valores finales ${categoria}:`, {
            cantidad, 
            peso: pesoFinal, 
            precio: precioFinal, 
            valor: valorFinal
          });
          
          return (
            <div key={categoria} className="bg-gray-50 rounded-lg p-3">
              <h6 className="font-medium text-gray-800 mb-2 capitalize">{categoria}</h6>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-medium">{cantidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso:</span>
                  <span className="font-medium">{pesoFinal.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio/kg:</span>
                  <span className="font-medium">${precioFinal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1">
                  <span className="text-gray-700 font-medium">Valor:</span>
                  <span className="font-bold text-[#67806D]">
                    ${valorFinal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
