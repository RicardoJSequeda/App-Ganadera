import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Edit2,
  Eye,
  Building2,
  Phone,
  FileText,
  TrendingUp,
  UserPlus,
  MapPin,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import * as XLSX from 'xlsx';
import ModalProveedor from '../components/proveedores/ModalProveedor';
import DetalleProveedor from '../components/proveedores/DetalleProveedor';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalProveedores: 0,
    proveedoresActivos: 0,
    comprasEsteAno: 0,
    montoTotalCompras: 0
  });
  const [vistaActual, setVistaActual] = useState('lista');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('crear');
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);

  useEffect(() => {
    cargarProveedores();
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProveedores(proveedores);
    } else {
      const filtered = proveedores.filter(proveedor =>
        proveedor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.establecimiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.cuit?.includes(searchTerm) ||
        proveedor.contacto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProveedores(filtered);
    }
  }, [searchTerm, proveedores]);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      
      // Obtener proveedores con su historial de compras
      const { data: proveedoresData, error: proveedoresError } = await supabase
        .from('proveedores')
        .select(`
          *,
          compras:compras(
            id,
            fecha,
            precio_total,
            observaciones
          )
        `)
        .order('created_at', { ascending: false });

      if (proveedoresError) throw proveedoresError;

      // Calcular estadísticas por proveedor
      const proveedoresConEstadisticas = proveedoresData.map(proveedor => {
        const comprasDelAno = proveedor.compras?.filter(compra => 
          new Date(compra.fecha).getFullYear() === new Date().getFullYear()
        ) || [];
        
        const totalCompras = proveedor.compras?.length || 0;
        const montoTotal = proveedor.compras?.reduce((sum, compra) => sum + (compra.precio_total || 0), 0) || 0;
        const ultimaCompra = proveedor.compras?.[0]?.fecha || null;

        return {
          ...proveedor,
          estadisticas: {
            totalCompras,
            comprasEsteAno: comprasDelAno.length,
            montoTotal,
            ultimaCompra
          }
        };
      });

      setProveedores(proveedoresConEstadisticas);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      // Contar total de proveedores
      const { count: totalProveedores } = await supabase
        .from('proveedores')
        .select('*', { count: 'exact', head: true });

      // Proveedores con compras este año
      const { data: comprasEsteAno } = await supabase
        .from('compras')
        .select('proveedor_id, precio_total')
        .gte('fecha', `${new Date().getFullYear()}-01-01`)
        .lte('fecha', `${new Date().getFullYear()}-12-31`);

      const proveedoresActivos = new Set(comprasEsteAno?.map(c => c.proveedor_id)).size;
      const montoTotalCompras = comprasEsteAno?.reduce((sum, compra) => sum + (compra.precio_total || 0), 0) || 0;

      setEstadisticas({
        totalProveedores: totalProveedores || 0,
        proveedoresActivos,
        comprasEsteAno: comprasEsteAno?.length || 0,
        montoTotalCompras
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const exportarExcel = () => {
    const datosExport = filteredProveedores.map(proveedor => ({
      'Nombre': proveedor.nombre || '',
      'Establecimiento': proveedor.establecimiento || '',
      'CUIT': proveedor.cuit || '',
      'Contacto': proveedor.contacto || '',
      'RENSPA': proveedor.renspa || '',
      'Total Compras': proveedor.estadisticas?.totalCompras || 0,
      'Compras Este Año': proveedor.estadisticas?.comprasEsteAno || 0,
      'Monto Total': proveedor.estadisticas?.montoTotal || 0,
      'Última Compra': proveedor.estadisticas?.ultimaCompra || '',
      'Observaciones': proveedor.observaciones || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datosExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, `proveedores-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const abrirModal = (mode, proveedor = null) => {
    setModalMode(mode);
    setSelectedProveedor(proveedor);
    setShowModal(true);
  };

  const abrirDetalle = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDetalle(true);
  };

  const handleProveedorCreated = (nuevoProveedor) => {
    // Recargar los datos después de crear
    cargarProveedores();
    cargarEstadisticas();
  };

  const handleProveedorUpdated = (proveedorActualizado) => {
    // Recargar los datos después de actualizar
    cargarProveedores();
    cargarEstadisticas();
  };

  const handleEditFromDetalle = (proveedor) => {
    setShowDetalle(false);
    abrirModal('editar', proveedor);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rural-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rural-primary mx-auto mb-4"></div>
          <p className="text-rural-text/60">Cargando proveedores...</p>
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
            Gestión de Proveedores
          </h1>
          <p className="text-rural-text/60">
            Administra tus proveedores, historiales y documentación
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-rural-card rounded-2xl p-6 border border-rural-alternate/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rural-text/60 text-sm font-medium">Total Proveedores</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {estadisticas.totalProveedores}
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
                  {estadisticas.proveedoresActivos}
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
                <p className="text-rural-text/60 text-sm font-medium">Compras Este Año</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {estadisticas.comprasEsteAno}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-rural-card rounded-2xl p-6 border border-rural-alternate/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rural-text/60 text-sm font-medium">Monto Total</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {formatearMoneda(estadisticas.montoTotalCompras)}
                </p>
              </div>
              <div className="w-12 h-12 bg-rural-alert/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-rural-alert" />
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
                  placeholder="Buscar por nombre, establecimiento, CUIT..."
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
              
              <button
                onClick={() => abrirModal('crear')}
                className="flex items-center gap-2 px-4 py-3 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nuevo Proveedor</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lista de Proveedores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-rural-card rounded-2xl border border-rural-alternate/50 overflow-hidden"
        >
          {filteredProveedores.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-rural-text/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-rural-text mb-2">
                {searchTerm ? 'No se encontraron proveedores' : 'Sin proveedores registrados'}
              </h3>
              <p className="text-rural-text/60 mb-6">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primer proveedor'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => abrirModal('crear')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-all duration-200"
                >
                  <UserPlus className="w-5 h-5" />
                  Agregar Primer Proveedor
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-rural-alternate/30">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Proveedor</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Contacto</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Estadísticas</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Última Compra</th>
                    <th className="text-center py-4 px-6 font-semibold text-rural-text">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rural-alternate/20">
                  {filteredProveedores.map((proveedor, index) => (
                    <motion.tr
                      key={proveedor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-rural-alternate/10 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-rural-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Building2 className="w-5 h-5 text-rural-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-rural-text">
                              {proveedor.nombre || 'Sin nombre'}
                            </h4>
                            <p className="text-sm text-rural-text/60">
                              {proveedor.establecimiento || 'Sin establecimiento'}
                            </p>
                            {proveedor.cuit && (
                              <p className="text-xs text-rural-text/40">
                                CUIT: {proveedor.cuit}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {proveedor.contacto && (
                            <div className="flex items-center gap-2 text-sm text-rural-text/80">
                              <Phone className="w-4 h-4" />
                              {proveedor.contacto}
                            </div>
                          )}
                          {proveedor.renspa && (
                            <div className="flex items-center gap-2 text-sm text-rural-text/60">
                              <FileText className="w-4 h-4" />
                              RENSPA: {proveedor.renspa}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm text-rural-text">
                            <span className="font-medium">{proveedor.estadisticas?.totalCompras || 0}</span> compras
                          </div>
                          <div className="text-sm text-rural-text/60">
                            {proveedor.estadisticas?.comprasEsteAno || 0} este año
                          </div>
                          <div className="text-sm font-medium text-rural-primary">
                            {formatearMoneda(proveedor.estadisticas?.montoTotal || 0)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-rural-text/60">
                          <Calendar className="w-4 h-4" />
                          {formatearFecha(proveedor.estadisticas?.ultimaCompra)}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirDetalle(proveedor)}
                            className="p-2 text-rural-text/60 hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-all duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirModal('editar', proveedor)}
                            className="p-2 text-rural-text/60 hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-all duration-200"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
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

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center text-sm text-rural-text/60"
        >
          Mostrando {filteredProveedores.length} de {proveedores.length} proveedores
        </motion.div>
      </motion.div>

      {/* Modal */}
      <ModalProveedor
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        proveedor={selectedProveedor}
        onProveedorCreated={handleProveedorCreated}
        onProveedorUpdated={handleProveedorUpdated}
      />

      {/* Detalle del Proveedor */}
      <AnimatePresence>
        {showDetalle && selectedProveedor && (
          <DetalleProveedor
            proveedor={selectedProveedor}
            onClose={() => setShowDetalle(false)}
            onEdit={handleEditFromDetalle}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Proveedores;