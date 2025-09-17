import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Plus, 
  Search, 
  Download, 
  Edit2,
  Eye,
  Phone,
  DollarSign,
  Activity,
  UserPlus,
  Calendar,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import * as XLSX from 'xlsx';
import ModalTransportador from '../components/transportadores/ModalTransportador';

const Transportadores = () => {
  const [transportadores, setTransportadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransportadores, setFilteredTransportadores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalTransportadores: 0,
    transportadoresActivos: 0,
    viajesEsteAno: 0,
    costoPromedioKm: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('crear');
  const [selectedTransportador, setSelectedTransportador] = useState(null);

  useEffect(() => {
    cargarTransportadores();
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransportadores(transportadores);
    } else {
      const filtered = transportadores.filter(transportador =>
        transportador.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transportador.contacto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransportadores(filtered);
    }
  }, [searchTerm, transportadores]);

  const cargarTransportadores = async () => {
    try {
      setLoading(true);
      
      const { data: transportadoresData, error } = await supabase
        .from('transportadores')
        .select(`
          *,
          compras:compras(
            id,
            fecha,
            precio_total
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transportadoresConEstadisticas = transportadoresData.map(transportador => {
        const comprasEsteAno = transportador.compras?.filter(compra => 
          new Date(compra.fecha).getFullYear() === new Date().getFullYear()
        ) || [];
        
        const totalViajes = transportador.compras?.length || 0;
        const ultimoViaje = transportador.compras?.[0]?.fecha || null;

        return {
          ...transportador,
          estadisticas: {
            totalViajes,
            viajesEsteAno: comprasEsteAno.length,
            ultimoViaje
          }
        };
      });

      setTransportadores(transportadoresConEstadisticas);
    } catch (error) {
      console.error('Error al cargar transportadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const { count: totalTransportadores } = await supabase
        .from('transportadores')
        .select('*', { count: 'exact', head: true });

      const { data: comprasEsteAno } = await supabase
        .from('compras')
        .select('transportador_id, precio_total')
        .gte('fecha', `${new Date().getFullYear()}-01-01`)
        .lte('fecha', `${new Date().getFullYear()}-12-31`)
        .not('transportador_id', 'is', null);

      const { data: allTransportadores } = await supabase
        .from('transportadores')
        .select('precio_km');

      const transportadoresActivos = new Set(comprasEsteAno?.map(c => c.transportador_id)).size;
      const costoPromedioKm = allTransportadores?.reduce((sum, t) => sum + (t.precio_km || 0), 0) / (allTransportadores?.length || 1) || 0;

      setEstadisticas({
        totalTransportadores: totalTransportadores || 0,
        transportadoresActivos,
        viajesEsteAno: comprasEsteAno?.length || 0,
        costoPromedioKm
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const exportarExcel = () => {
    const datosExport = filteredTransportadores.map(transportador => ({
      'Nombre': transportador.nombre || '',
      'Contacto': transportador.contacto || '',
      'Precio por KM': transportador.precio_km || 0,
      'Total Viajes': transportador.estadisticas?.totalViajes || 0,
      'Viajes Este Año': transportador.estadisticas?.viajesEsteAno || 0,
      'Último Viaje': transportador.estadisticas?.ultimoViaje || '',
      'Observaciones': transportador.observaciones || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datosExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transportadores');
    XLSX.writeFile(wb, `transportadores-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const abrirModal = (mode, transportador = null) => {
    setModalMode(mode);
    setSelectedTransportador(transportador);
    setShowModal(true);
  };

  const handleTransportadorCreated = (nuevoTransportador) => {
    // Recargar los datos después de crear
    cargarTransportadores();
    cargarEstadisticas();
  };

  const handleTransportadorUpdated = (transportadorActualizado) => {
    // Recargar los datos después de actualizar
    cargarTransportadores();
    cargarEstadisticas();
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
          <p className="text-rural-text/60">Cargando transportes...</p>
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
            Gestión de Transporte
          </h1>
          <p className="text-rural-text/60">
            Administra tus transportes y servicios de flete
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
                <p className="text-rural-text/60 text-sm font-medium">Total de Transportes</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {estadisticas.totalTransportadores}
                </p>
              </div>
              <div className="w-12 h-12 bg-rural-primary/10 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-rural-primary" />
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
                  {estadisticas.transportadoresActivos}
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
                <p className="text-rural-text/60 text-sm font-medium">Viajes Este Año</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {estadisticas.viajesEsteAno}
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
                <p className="text-rural-text/60 text-sm font-medium">Promedio $/KM</p>
                <p className="text-2xl font-bold text-rural-text mt-1">
                  {formatearMoneda(estadisticas.costoPromedioKm)}
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
                  placeholder="Buscar por nombre o contacto..."
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
                <span className="hidden sm:inline">Nuevo Transporte</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lista de Transportes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-rural-card rounded-2xl border border-rural-alternate/50 overflow-hidden"
        >
          {filteredTransportadores.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-rural-text/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-rural-text mb-2">
                {searchTerm ? 'No se encontraron transportes' : 'Sin transportes registrados'}
              </h3>
              <p className="text-rural-text/60 mb-6">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primer transporte'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => abrirModal('crear')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-all duration-200"
                >
                  <UserPlus className="w-5 h-5" />
                  Agregar Primer Transportador
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-rural-alternate/30">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Transportador</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Contacto</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Precio/KM</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Estadísticas</th>
                    <th className="text-left py-4 px-6 font-semibold text-rural-text">Último Viaje</th>
                    <th className="text-center py-4 px-6 font-semibold text-rural-text">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rural-alternate/20">
                  {filteredTransportadores.map((transportador, index) => (
                    <motion.tr
                      key={transportador.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-rural-alternate/10 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-rural-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Truck className="w-5 h-5 text-rural-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-rural-text">
                              {transportador.nombre || 'Sin nombre'}
                            </h4>
                            {transportador.observaciones && (
                              <p className="text-sm text-rural-text/60 line-clamp-1">
                                {transportador.observaciones}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        {transportador.contacto && (
                          <div className="flex items-center gap-2 text-sm text-rural-text/80">
                            <Phone className="w-4 h-4" />
                            {transportador.contacto}
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="text-lg font-medium text-rural-primary">
                          {formatearMoneda(transportador.precio_km || 0)}
                        </div>
                        <div className="text-xs text-rural-text/60">por kilómetro</div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm text-rural-text">
                            <span className="font-medium">{transportador.estadisticas?.totalViajes || 0}</span> viajes
                          </div>
                          <div className="text-sm text-rural-text/60">
                            {transportador.estadisticas?.viajesEsteAno || 0} este año
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-rural-text/60">
                          <Calendar className="w-4 h-4" />
                          {formatearFecha(transportador.estadisticas?.ultimoViaje)}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => abrirModal('ver', transportador)}
                            className="p-2 text-rural-text/60 hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-all duration-200" 
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => abrirModal('editar', transportador)}
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center text-sm text-rural-text/60"
        >
          Mostrando {filteredTransportadores.length} de {transportadores.length} transportadores
        </motion.div>
      </motion.div>

      {/* Modal */}
      <ModalTransportador
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        transportador={selectedTransportador}
        onTransportadorCreated={handleTransportadorCreated}
        onTransportadorUpdated={handleTransportadorUpdated}
      />
    </div>
  );
};

export default Transportadores;