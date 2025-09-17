import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Eye,
  Phone,
  CreditCard,
  Activity,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Scale,
  Users
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import ModalCompradorDetalle from '../components/compradores/ModalCompradorDetalle';
import * as XLSX from 'xlsx';

const Compradores = () => {
  const [compradores, setCompradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompradores, setFilteredCompradores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalCompradores: 0,
    compradoresActivos: 0,
    ventasEsteAno: 0
  });
  
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedComprador, setSelectedComprador] = useState(null);

  useEffect(() => {
    cargarCompradores();
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompradores(compradores);
    } else {
      const filtered = compradores.filter(comprador =>
        comprador.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comprador.contacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comprador.cuit?.includes(searchTerm)
      );
      setFilteredCompradores(filtered);
    }
  }, [searchTerm, compradores]);

  const cargarCompradores = async () => {
    try {
      setLoading(true);
      
      // Obtener compradores con sus ventas y detalles
      const { data: compradoresData, error } = await supabase
        .from('compradores')
        .select(`
          *,
          ventas:ventas(
            id,
            fecha,
            precio_kilo,
            detalle_venta:detalle_venta(
              peso_salida,
              precio_final,
              animales:animales(
                categoria
              )
            )
          )
        `)
        .order('nombre', { ascending: true });

      if (error) throw error;

      const compradoresConEstadisticas = compradoresData.map(comprador => {
        const ventasEsteAno = comprador.ventas?.filter(venta => 
          new Date(venta.fecha).getFullYear() === new Date().getFullYear()
        ) || [];
        
        const totalVentas = comprador.ventas?.length || 0;
        const ultimaVenta = comprador.ventas?.[0]?.fecha || null;

        // Calcular precios promedio por categoría
        const preciosPorCategoria = {};
        const pesosPorCategoria = {};
        
        comprador.ventas?.forEach(venta => {
          venta.detalle_venta?.forEach(detalle => {
            const categoria = detalle.animales?.categoria || 'Sin categoría';
            const pesoSalida = parseFloat(detalle.peso_salida) || 0;
            const precioFinal = parseFloat(detalle.precio_final) || 0;
            
            if (pesoSalida > 0 && precioFinal > 0) {
              const precioKilo = precioFinal / pesoSalida;
              
              if (!preciosPorCategoria[categoria]) {
                preciosPorCategoria[categoria] = [];
                pesosPorCategoria[categoria] = 0;
              }
              
              preciosPorCategoria[categoria].push({
                precio: precioKilo,
                peso: pesoSalida
              });
              pesosPorCategoria[categoria] += pesoSalida;
            }
          });
        });

        // Calcular promedio ponderado por peso para cada categoría
        const preciosPromedioPorCategoria = {};
        Object.keys(preciosPorCategoria).forEach(categoria => {
          const datos = preciosPorCategoria[categoria];
          const pesoTotal = pesosPorCategoria[categoria];
          
          if (datos.length > 0 && pesoTotal > 0) {
            const sumaPrecios = datos.reduce((sum, dato) => sum + (dato.precio * dato.peso), 0);
            preciosPromedioPorCategoria[categoria] = sumaPrecios / pesoTotal;
          }
        });

        return {
          ...comprador,
          estadisticas: {
            totalVentas,
            ventasEsteAno: ventasEsteAno.length,
            ultimaVenta,
            preciosPromedioPorCategoria
          }
        };
      });

      setCompradores(compradoresConEstadisticas);
    } catch (error) {
      console.error('Error al cargar compradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const { count: totalCompradores } = await supabase
        .from('compradores')
        .select('*', { count: 'exact', head: true });

      const { data: ventasEsteAno } = await supabase
        .from('ventas')
        .select('comprador_id')
        .gte('fecha', `${new Date().getFullYear()}-01-01`)
        .lte('fecha', `${new Date().getFullYear()}-12-31`);

      const compradoresActivos = new Set(ventasEsteAno?.map(v => v.comprador_id)).size;

      setEstadisticas({
        totalCompradores: totalCompradores || 0,
        compradoresActivos,
        ventasEsteAno: ventasEsteAno?.length || 0
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const exportarExcel = () => {
    const datosExport = filteredCompradores.map(comprador => {
      const base = {
        'Nombre': comprador.nombre || '',
        'Contacto': comprador.contacto || '',
        'CUIT': comprador.cuit || '',
        'Total Compras': comprador.estadisticas?.totalVentas || 0,
        'Compras Este Año': comprador.estadisticas?.ventasEsteAno || 0,
        'Última Compra': comprador.estadisticas?.ultimaVenta || '',
        'Observaciones': comprador.observaciones || ''
      };

      // Agregar precios promedio por categoría
      const precios = comprador.estadisticas?.preciosPromedioPorCategoria || {};
      Object.keys(precios).forEach(categoria => {
        base[`Precio Promedio ${categoria} ($/kg)`] = precios[categoria].toFixed(2);
      });

      return base;
    });

    const ws = XLSX.utils.json_to_sheet(datosExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Compradores');
    XLSX.writeFile(wb, `compradores-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  const handleVerDetalles = (comprador) => {
    setSelectedComprador(comprador);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComprador(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rural-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rural-primary mx-auto mb-4"></div>
          <p className="text-rural-text/60">Cargando compradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rural-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-rural-text mb-2">
            Gestión de Compradores
          </h1>
          <p className="text-rural-text/60">
            Registro automático de compradores y análisis de precios por categoría
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-rural-card rounded-2xl p-6 border border-rural-alternate/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rural-text/60 text-sm font-medium">Total Compradores</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {estadisticas.totalCompradores}
                </p>
              </div>
              <div className="w-12 h-12 bg-rural-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-rural-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-rural-card rounded-2xl p-6 border border-rural-alternate/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rural-text/60 text-sm font-medium">Activos Este Año</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {estadisticas.compradoresActivos}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-rural-card rounded-2xl p-6 border border-rural-alternate/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rural-text/60 text-sm font-medium">Ventas Este Año</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {estadisticas.ventasEsteAno}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-rural-card rounded-2xl p-6 mb-8 border border-rural-alternate/50"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rural-text/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, contacto o CUIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportarExcel}
                className="flex items-center gap-2 px-4 py-3 bg-rural-secondary text-white rounded-xl hover:bg-rural-secondary/90 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lista de Compradores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-rural-card rounded-2xl border border-rural-alternate/50 overflow-hidden"
        >
          {filteredCompradores.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-rural-text/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-rural-text mb-2">
                {searchTerm ? 'No se encontraron compradores' : 'Sin compradores registrados'}
              </h3>
              <p className="text-rural-text/60 mb-6">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Los compradores se agregan automáticamente al realizar ventas'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-rural-alternate/30">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Comprador</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Contacto</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">CUIT</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Estadísticas</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Precios Promedio</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Última Compra</th>
                    <th className="text-center py-4 px-6 font-semibold text-rural-text">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rural-alternate/20">
                  {filteredCompradores.map((comprador, index) => (
                    <motion.tr
                      key={comprador.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-rural-alternate/10 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-rural-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Users className="w-5 h-5 text-rural-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-rural-text">
                              {comprador.nombre || 'Sin nombre'}
                            </h4>
                            {comprador.observaciones && (
                              <p className="text-sm text-rural-text/60 line-clamp-1">
                                {comprador.observaciones}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        {comprador.contacto && (
                          <div className="flex items-center gap-2 text-sm text-rural-text/80">
                            <Phone className="w-4 h-4" />
                            {comprador.contacto}
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        {comprador.cuit && (
                          <div className="flex items-center gap-2 text-sm text-rural-text/80">
                            <CreditCard className="w-4 h-4" />
                            {comprador.cuit}
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm text-rural-text">
                            <span className="font-medium">{comprador.estadisticas?.totalVentas || 0}</span> compras
                          </div>
                          <div className="text-sm text-rural-text/60">
                            {comprador.estadisticas?.ventasEsteAno || 0} este año
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {comprador.estadisticas?.preciosPromedioPorCategoria && 
                           Object.keys(comprador.estadisticas.preciosPromedioPorCategoria).length > 0 ? (
                            Object.entries(comprador.estadisticas.preciosPromedioPorCategoria).map(([categoria, precio]) => (
                              <div key={categoria} className="flex items-center gap-2 text-sm">
                                <Scale className="w-3 h-3 text-rural-primary" />
                                <span className="text-rural-text/60 capitalize">{categoria}:</span>
                                <span className="font-medium text-rural-text">${precio.toFixed(2)}/kg</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-rural-text/40">Sin datos</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-rural-text/60">
                          <Calendar className="w-4 h-4" />
                          {formatearFecha(comprador.estadisticas?.ultimaVenta)}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleVerDetalles(comprador)}
                            className="p-2 text-rural-text/60 hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-all duration-200" 
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center text-sm text-rural-text/60"
        >
          Mostrando {filteredCompradores.length} de {compradores.length} compradores
        </motion.div>
      </motion.div>

      {/* Modal de detalles */}
      <ModalCompradorDetalle
        comprador={selectedComprador}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Compradores;
