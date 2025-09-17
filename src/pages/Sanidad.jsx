import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Plus, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Syringe,
  Pill,
  Activity,
  Edit2,
  Trash2,
  Eye,
  Users,
  CheckSquare,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import { useAnimalesStore } from '../store/animalesStore';
import { useConfirm, confirmDelete } from '../hooks/useConfirm.jsx';
import ModalNuevoEventoSanitario from '../components/sanidad/ModalNuevoEventoSanitario';
import EventoSanitarioModal from '../components/sanidad/EventoSanitarioModal';
import AnimalModal from '../components/animales/AnimalModal';
import * as XLSX from 'xlsx';

const Sanidad = () => {
  const { showConfirm, ConfirmComponent } = useConfirm();
  const {
    eventosSanitarios,
    animales,
    lotes,
    loading,
    error,
    fetchEventosSanitarios,
    fetchAnimales,
    fetchLotes,
    deleteEventoSanitario
  } = useAnimalesStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    tipo: '',
    animal: '',
    lote: '',
    estado: 'todos' // 'todos', 'pendientes', 'completados'
  });

  const [vistaActual, setVistaActual] = useState('dashboard'); // 'dashboard', 'eventos', 'reportes'
  const [selectedEventos, setSelectedEventos] = useState([]);

  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    fetchEventosSanitarios();
    fetchAnimales();
    fetchLotes();
  }, []);

  // Filtrar eventos sanitarios
  const eventosFiltrados = eventosSanitarios.filter(evento => {
    const matchSearch = evento.animales?.numero_caravana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       evento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       evento.tipo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFechaDesde = !filtros.fechaDesde || evento.fecha >= filtros.fechaDesde;
    const matchFechaHasta = !filtros.fechaHasta || evento.fecha <= filtros.fechaHasta;
    const matchTipo = !filtros.tipo || evento.tipo === filtros.tipo;
    const matchAnimal = !filtros.animal || evento.animal_id === filtros.animal;
    const matchLote = !filtros.lote || evento.animales?.animal_lote?.some(al => al.lote_id === filtros.lote && !al.fecha_salida);

    return matchSearch && matchFechaDesde && matchFechaHasta && matchTipo && matchAnimal && matchLote;
  });

  // Calcular métricas avanzadas
  const metricas = {
    totalEventos: eventosFiltrados.length,
    animalesUnicos: new Set(eventosFiltrados.map(e => e.animal_id)).size,
    eventosUltimoMes: eventosFiltrados.filter(e => {
      const fechaEvento = new Date(e.fecha);
      const unMesAtras = new Date();
      unMesAtras.setMonth(unMesAtras.getMonth() - 1);
      return fechaEvento >= unMesAtras;
    }).length,
    // Animales sin ningún evento sanitario
    animalesSinEventos: animales.filter(animal => {
      return !eventosSanitarios.some(e => e.animal_id === animal.id);
    }).length,
    // Distribución de tipos de eventos
    tiposDistribucion: eventosFiltrados.reduce((acc, evento) => {
      acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
      return acc;
    }, {})
  };

  const handleVerEvento = (evento) => {
    setSelectedEvento(evento);
    setShowModalDetalle(true);
  };

  const handleVerAnimal = (animal) => {
    setSelectedAnimal(animal);
    setShowAnimalModal(true);
  };

  const handleEliminar = async (id) => {
    const confirmed = await confirmDelete(
      'evento sanitario',
      'Se eliminará permanentemente este registro sanitario. Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
      try {
        await deleteEventoSanitario(id);
        await fetchEventosSanitarios(); // Recargar datos
      } catch (error) {
        console.error('Error al eliminar evento sanitario:', error);
        await showConfirm({
          type: 'danger',
          title: 'Error al eliminar',
          message: 'Hubo un problema al eliminar el evento sanitario. Inténtalo nuevamente.',
          confirmText: 'Entendido'
        });
      }
    }
  };

  const exportarExcel = () => {
    const datosExport = eventosFiltrados.map(evento => ({
      'Animal': evento.animales?.numero_caravana || 'S/N',
      'Color Caravana': evento.animales?.color_caravana || '',
      'Categoría': evento.animales?.categoria || '',
      'Fecha': new Date(evento.fecha).toLocaleDateString('es-AR'),
      'Tipo': evento.tipo,
      'Descripción': evento.descripcion || '',
      'Observaciones': evento.observaciones || '',
      'Lote': evento.animales?.animal_lote?.[0]?.lotes?.nombre || 'Sin lote'
    }));

    const ws = XLSX.utils.json_to_sheet(datosExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Eventos Sanitarios');
    
    const fechaExport = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `eventos_sanitarios_${fechaExport}.xlsx`);
  };

  const getIconoTipo = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'vacuna':
        return <Syringe className="h-4 w-4" />;
      case 'desparasitario':
        return <Pill className="h-4 w-4" />;
      case 'tratamiento':
        return <Activity className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const getColorTipo = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'vacuna':
        return 'bg-blue-100 text-blue-800';
      case 'desparasitario':
        return 'bg-green-100 text-green-800';
      case 'tratamiento':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#67806D] mx-auto mb-4"></div>
          <p className="text-[#3C454A]">Cargando información sanitaria...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2E7] p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header con navegación */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#67806D] bg-opacity-10 rounded-xl">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-[#67806D]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#3C454A]">Control Sanitario</h1>
                <p className="text-sm sm:text-base text-[#3C454A] opacity-70">Gestión integral de salud animal</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Navegación por pestañas */}
              <div className="flex bg-[#F5F2E7] rounded-lg p-1">
                <button
                  onClick={() => setVistaActual('dashboard')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    vistaActual === 'dashboard' 
                      ? 'bg-white text-[#67806D] shadow-sm' 
                      : 'text-[#3C454A] hover:text-[#67806D]'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setVistaActual('eventos')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    vistaActual === 'eventos' 
                      ? 'bg-white text-[#67806D] shadow-sm' 
                      : 'text-[#3C454A] hover:text-[#67806D]'
                  }`}
                >
                  Eventos
                </button>
                <button
                  onClick={() => setVistaActual('reportes')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    vistaActual === 'reportes' 
                      ? 'bg-white text-[#67806D] shadow-sm' 
                      : 'text-[#3C454A] hover:text-[#67806D]'
                  }`}
                >
                  Reportes
                </button>
              </div>
              
              <button
                onClick={() => setShowModalNuevo(true)}
                className="flex items-center justify-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-xl hover:bg-[#67806D]/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Evento</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vista Dashboard - Resumen ejecutivo */}
        {vistaActual === 'dashboard' && (
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#3C454A] opacity-70 text-sm">Total Eventos</p>
                    <p className="text-3xl font-bold text-[#3C454A]">{metricas.totalEventos}</p>
                    <p className="text-sm text-[#67806D]">+{metricas.eventosUltimoMes} este mes</p>
                  </div>
                  <Heart className="h-10 w-10 text-[#67806D]" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#3C454A] opacity-70 text-sm">Animales en Control</p>
                    <p className="text-3xl font-bold text-[#3C454A]">{metricas.animalesUnicos}</p>
                    <p className="text-sm text-[#67806D]">de {animales.length} totales</p>
                  </div>
                  <Users className="h-10 w-10 text-[#67806D]" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#3C454A] opacity-70 text-sm">Sin Eventos Sanitarios</p>
                    <p className={`text-3xl font-bold ${metricas.animalesSinEventos > 5 ? 'text-[#F8B36A]' : 'text-[#67806D]'}`}>
                      {metricas.animalesSinEventos}
                    </p>
                    <p className="text-sm text-[#3C454A] opacity-60">animales sin registro</p>
                  </div>
                  <AlertTriangle className={`h-10 w-10 ${metricas.animalesSinEventos > 5 ? 'text-[#F8B36A]' : 'text-[#67806D]'}`} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#3C454A] opacity-70 text-sm">Eventos Último Mes</p>
                    <p className="text-3xl font-bold text-[#67806D]">{metricas.eventosUltimoMes}</p>
                    <p className="text-sm text-[#3C454A] opacity-60">Actividad reciente</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-[#67806D]" />
                </div>
              </motion.div>
            </div>

            {/* Alertas y acciones rápidas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Animales sin eventos sanitarios */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-5 w-5 text-[#F8B36A]" />
                  <h3 className="text-lg font-semibold text-[#3C454A]">Sin Eventos Sanitarios</h3>
                  <span className="bg-[#F8B36A] text-white text-xs px-2 py-1 rounded-full">
                    {metricas.animalesSinEventos}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {animales
                    .filter(animal => {
                      return !eventosSanitarios.some(e => e.animal_id === animal.id);
                    })
                    .slice(0, 5)
                    .map(animal => (
                      <div key={animal.id} className="flex items-center justify-between p-3 bg-[#F5F2E7] rounded-lg hover:bg-[#F9E9D0] transition-colors cursor-pointer" onClick={() => handleVerAnimal(animal)}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: animal.color_caravana }}
                          ></div>
                          <div>
                            <span className="font-medium text-[#3C454A]">#{animal.numero_caravana}</span>
                            <p className="text-xs text-[#3C454A] opacity-60">{animal.categoria}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-[#F8B36A]">
                            Sin registros
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
                
                {metricas.animalesSinEventos > 5 && (
                  <button className="w-full mt-4 text-sm text-[#67806D] hover:underline">
                    Ver todos los {metricas.animalesSinEventos} animales
                  </button>
                )}
              </motion.div>

              {/* Distribución de eventos por tipo */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-5 w-5 text-[#67806D]" />
                  <h3 className="text-lg font-semibold text-[#3C454A]">Tipos de Eventos</h3>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(metricas.tiposDistribucion)
                    .sort(([,a], [,b]) => b - a)
                    .map(([tipo, cantidad]) => {
                      const porcentaje = Math.round((cantidad / metricas.totalEventos) * 100);
                      const color = tipo === 'vacuna' ? 'bg-blue-500' : 
                                   tipo === 'desparasitario' ? 'bg-green-500' : 
                                   tipo === 'tratamiento' ? 'bg-orange-500' : 'bg-gray-500';
                      
                      return (
                        <div key={tipo} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getIconoTipo(tipo)}
                              <span className="text-sm font-medium text-[#3C454A] capitalize">{tipo}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#3C454A]">{cantidad}</span>
                              <span className="text-xs text-[#3C454A] opacity-60 ml-1">({porcentaje}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${color}`}
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            </div>

            {/* Eventos recientes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#67806D]" />
                  <h3 className="text-lg font-semibold text-[#3C454A]">Eventos Recientes</h3>
                </div>
                <button 
                  onClick={() => setVistaActual('eventos')}
                  className="text-sm text-[#67806D] hover:underline"
                >
                  Ver todos
                </button>
              </div>
              
              {/* Vista desktop - tabla */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-sm font-medium text-[#3C454A] opacity-70">Animal</th>
                      <th className="text-left py-2 text-sm font-medium text-[#3C454A] opacity-70">Tipo</th>
                      <th className="text-left py-2 text-sm font-medium text-[#3C454A] opacity-70">Descripción</th>
                      <th className="text-left py-2 text-sm font-medium text-[#3C454A] opacity-70">Fecha</th>
                      <th className="text-center py-2 text-sm font-medium text-[#3C454A] opacity-70">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosSanitarios
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                      .slice(0, 5)
                      .map((evento, index) => (
                        <tr key={evento.id} className="border-b border-gray-50 hover:bg-[#F5F2E7] transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: evento.animales?.color_caravana }}
                              ></div>
                              <span className="text-sm font-medium text-[#3C454A]">
                                #{evento.animales?.numero_caravana || 'S/N'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColorTipo(evento.tipo)}`}>
                              {getIconoTipo(evento.tipo)}
                              {evento.tipo}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-[#3C454A] truncate max-w-xs">
                              {evento.descripcion || '-'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-[#3C454A] opacity-70">
                              {new Date(evento.fecha).toLocaleDateString('es-AR')}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleVerEvento(evento)}
                              className="p-1 text-[#67806D] hover:bg-[#67806D] hover:bg-opacity-10 rounded transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Vista mobile - cards */}
              <div className="md:hidden space-y-3">
                {eventosSanitarios
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .slice(0, 5)
                  .map((evento, index) => (
                    <div 
                      key={evento.id} 
                      className="bg-[#F5F2E7] rounded-lg p-4 hover:bg-[#F9E9D0] transition-colors cursor-pointer"
                      onClick={() => handleVerEvento(evento)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: evento.animales?.color_caravana }}
                          ></div>
                          <span className="font-medium text-[#3C454A]">
                            #{evento.animales?.numero_caravana || 'S/N'}
                          </span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColorTipo(evento.tipo)}`}>
                          {getIconoTipo(evento.tipo)}
                          {evento.tipo}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-[#3C454A]">
                          {evento.descripcion || 'Sin descripción'}
                        </p>
                        <p className="text-xs text-[#3C454A] opacity-70">
                          {new Date(evento.fecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Vista Eventos - Lista optimizada */}
        {vistaActual === 'eventos' && (
          <div className="space-y-6">
            {/* Filtros simplificados */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#3C454A] opacity-50" />
                    <input
                      type="text"
                      placeholder="Buscar por caravana, tipo o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={filtros.tipo}
                    onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="vacuna">Vacuna</option>
                    <option value="desparasitario">Desparasitario</option>
                    <option value="tratamiento">Tratamiento</option>
                    <option value="revision">Revisión</option>
                    <option value="medicamento">Medicamento</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={exportarExcel}
                    className="w-full bg-[#67806D] text-white px-4 py-2 rounded-xl hover:bg-[#67806D]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[#3C454A] opacity-70 mb-1">Fecha desde</label>
                  <input
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#3C454A] opacity-70 mb-1">Fecha hasta</label>
                  <input
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#3C454A] opacity-70 mb-1">Limpiar filtros</label>
                  <button
                    onClick={() => {
                      setFiltros({
                        fechaDesde: '',
                        fechaHasta: '',
                        tipo: '',
                        animal: '',
                        lote: '',
                        estado: 'todos'
                      });
                      setSearchTerm('');
                    }}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de eventos en cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {eventosFiltrados.length > 0 ? (
                eventosFiltrados
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((evento, index) => (
                    <motion.div
                      key={evento.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => handleVerEvento(evento)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: evento.animales?.color_caravana }}
                          ></div>
                          <span className="font-semibold text-[#3C454A]">
                            #{evento.animales?.numero_caravana || 'S/N'}
                          </span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColorTipo(evento.tipo)}`}>
                          {getIconoTipo(evento.tipo)}
                          {evento.tipo}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-[#3C454A]">
                            {evento.descripcion || 'Sin descripción'}
                          </p>
                          <p className="text-xs text-[#3C454A] opacity-60">
                            {evento.animales?.categoria}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-[#3C454A] opacity-70">
                            {new Date(evento.fecha).toLocaleDateString('es-AR')}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerEvento(evento);
                              }}
                              className="p-1 text-[#67806D] hover:bg-[#67806D] hover:bg-opacity-10 rounded transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminar(evento.id);
                              }}
                              className="p-1 text-[#F8B36A] hover:bg-[#F8B36A] hover:bg-opacity-10 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Heart className="h-12 w-12 text-[#3C454A] opacity-30 mx-auto mb-4" />
                  <p className="text-[#3C454A] opacity-70">No se encontraron eventos sanitarios</p>
                  <p className="text-sm text-[#3C454A] opacity-50">
                    Ajusta los filtros o registra el primer evento
                  </p>
                </div>
              )}
            </div>

            {/* Paginación si es necesaria */}
            {eventosFiltrados.length > 12 && (
              <div className="flex justify-center">
                <button className="text-sm text-[#67806D] hover:underline">
                  Cargar más eventos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vista Reportes */}
        {vistaActual === 'reportes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-[#3C454A] mb-4">Reportes Avanzados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-xl hover:bg-[#F5F2E7] transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-[#67806D]" />
                    <span className="font-medium text-[#3C454A]">Reporte Completo</span>
                  </div>
                  <p className="text-sm text-[#3C454A] opacity-70">
                    Todos los eventos sanitarios con detalles completos
                  </p>
                </button>

                <button className="p-4 border border-gray-200 rounded-xl hover:bg-[#F5F2E7] transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-[#67806D]" />
                    <span className="font-medium text-[#3C454A]">Análisis Temporal</span>
                  </div>
                  <p className="text-sm text-[#3C454A] opacity-70">
                    Evolución de eventos por período
                  </p>
                </button>

                <button className="p-4 border border-gray-200 rounded-xl hover:bg-[#F5F2E7] transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-[#F8B36A]" />
                    <span className="font-medium text-[#3C454A]">Animales Sin Registro</span>
                  </div>
                  <p className="text-sm text-[#3C454A] opacity-70">
                    Listado de animales sin eventos sanitarios
                  </p>
                </button>
              </div>
            </div>

            {/* Métricas detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-semibold text-[#3C454A] mb-4">Distribución por Tipo</h4>
                <div className="space-y-3">
                  {Object.entries(metricas.tiposDistribucion)
                    .sort(([,a], [,b]) => b - a)
                    .map(([tipo, cantidad]) => {
                      const porcentaje = Math.round((cantidad / metricas.totalEventos) * 100);
                      return (
                        <div key={tipo} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#3C454A] capitalize">{tipo}</span>
                            <span className="text-sm text-[#3C454A]">{cantidad} ({porcentaje}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-[#67806D] transition-all duration-500"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-semibold text-[#3C454A] mb-4">Actividad Mensual</h4>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-[#67806D] mx-auto mb-3" />
                  <p className="text-[#3C454A] opacity-70">Gráfico de actividad mensual</p>
                  <p className="text-sm text-[#3C454A] opacity-50">Próximamente disponible</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modales */}
      <ModalNuevoEventoSanitario 
        isOpen={showModalNuevo}
        onClose={() => setShowModalNuevo(false)}
        onEventoCreado={() => {
          // Solo recargar eventos sanitarios después de crear uno nuevo
          fetchEventosSanitarios();
        }}
      />
      
      {showModalDetalle && selectedEvento && (
        <EventoSanitarioModal
          evento={selectedEvento}
          isOpen={showModalDetalle}
          onClose={() => setShowModalDetalle(false)}
        />
      )}

      {showAnimalModal && selectedAnimal && (
        <AnimalModal
          animal={selectedAnimal}
          onClose={() => {
            setShowAnimalModal(false);
            setSelectedAnimal(null);
          }}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmComponent />
    </div>
  );
};

export default Sanidad;
