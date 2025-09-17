import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Eye,
  Users,
  CheckSquare
} from 'lucide-react';
import { useAnimalesStore } from '../store/animalesStore';
import ModalNuevaPesada from '../components/ModalNuevaPesada';

const Pesadas = () => {
  const {
    pesadas,
    animales,
    loading,
    error,
    fetchPesadas,
    fetchAnimales,
    deletePesada
  } = useAnimalesStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    categoria: '',
    animal: '',
    lote: '',
    pesoMin: '',
    pesoMax: ''
  });

  const [selectedPesadas, setSelectedPesadas] = useState([]);
  const [showEstadisticasDetalle, setShowEstadisticasDetalle] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('campo'); // 'campo', 'vendidos', 'todos'

  const [showModalNueva, setShowModalNueva] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [selectedPesada, setSelectedPesada] = useState(null);

  useEffect(() => {
    fetchPesadas();
    fetchAnimales();
  }, []);

  // Separar pesadas por estado del animal
  const pesadasEnCampo = pesadas.filter(pesada => pesada.animales?.estado === 'en_campo');
  const pesadasVendidos = pesadas.filter(pesada => pesada.animales?.estado === 'vendido');

  // Función para filtrar pesadas según criterios
  const filtrarPesadas = (pesadasList) => {
    return pesadasList.filter(pesada => {
      const matchSearch = pesada.animales?.numero_caravana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pesada.observaciones?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchFechaDesde = !filtros.fechaDesde || pesada.fecha_pesada >= filtros.fechaDesde;
      const matchFechaHasta = !filtros.fechaHasta || pesada.fecha_pesada <= filtros.fechaHasta;
      const matchCategoria = !filtros.categoria || pesada.animales?.categoria === filtros.categoria;
      const matchAnimal = !filtros.animal || pesada.animal_id === filtros.animal;
      const matchLote = !filtros.lote || pesada.animales?.animal_lote?.some(al => al.lote_id === filtros.lote && !al.fecha_salida);
      const matchPesoMin = !filtros.pesoMin || pesada.peso >= parseFloat(filtros.pesoMin);
      const matchPesoMax = !filtros.pesoMax || pesada.peso <= parseFloat(filtros.pesoMax);

      return matchSearch && matchFechaDesde && matchFechaHasta && matchCategoria && matchAnimal && matchLote && matchPesoMin && matchPesoMax;
    });
  };

  // Aplicar filtros según la vista activa
  const pesadasCampoFiltradas = filtrarPesadas(pesadasEnCampo);
  const pesadasVendidosFiltradas = filtrarPesadas(pesadasVendidos);
  const pesadasFiltradas = vistaActiva === 'campo' ? pesadasCampoFiltradas : 
                          vistaActiva === 'vendidos' ? pesadasVendidosFiltradas :
                          [...pesadasCampoFiltradas, ...pesadasVendidosFiltradas];

  // Calcular estadísticas avanzadas
  const estadisticas = {
    totalPesadas: pesadasFiltradas.length,
    animalesUnicos: new Set(pesadasFiltradas.map(p => p.animal_id)).size,
    pesoPromedio: pesadasFiltradas.reduce((sum, p) => sum + p.peso, 0) / Math.max(pesadasFiltradas.length, 1),
    gananciaTotal: 0,
    gananciaPromedioPorDia: 0,
    gananciaPromedioPorPesada: 0
  };

  // Estadísticas de selección en tiempo real
  const estadisticasSeleccion = {
    cantidad: selectedPesadas.length,
    pesoPromedio: selectedPesadas.length > 0 ? 
      selectedPesadas.reduce((sum, id) => {
        const pesada = pesadasFiltradas.find(p => p.id === id);
        return sum + (pesada?.peso || 0);
      }, 0) / selectedPesadas.length : 0,
    pesoTotal: selectedPesadas.reduce((sum, id) => {
      const pesada = pesadasFiltradas.find(p => p.id === id);
      return sum + (pesada?.peso || 0);
    }, 0)
  };

  // Calcular ganancias por animal
  const ganancias = [];
  const animalesConPesadas = {};

  pesadasFiltradas.forEach(pesada => {
    if (!animalesConPesadas[pesada.animal_id]) {
      animalesConPesadas[pesada.animal_id] = [];
    }
    animalesConPesadas[pesada.animal_id].push(pesada);
  });

  Object.values(animalesConPesadas).forEach(pesadasAnimal => {
    if (pesadasAnimal.length > 1) {
      pesadasAnimal.sort((a, b) => new Date(a.fecha_pesada) - new Date(b.fecha_pesada));
      
      for (let i = 1; i < pesadasAnimal.length; i++) {
        const actual = pesadasAnimal[i];
        const anterior = pesadasAnimal[i - 1];
        const ganancia = actual.peso - anterior.peso;
        const dias = (new Date(actual.fecha_pesada) - new Date(anterior.fecha_pesada)) / (1000 * 60 * 60 * 24);
        
        ganancias.push({
          ganancia,
          dias,
          gananciaPerDia: ganancia / Math.max(dias, 1)
        });
      }
    }
  });

  if (ganancias.length > 0) {
    estadisticas.gananciaTotal = ganancias.reduce((sum, g) => sum + g.ganancia, 0);
    estadisticas.gananciaPromedioPorPesada = estadisticas.gananciaTotal / ganancias.length;
    estadisticas.gananciaPromedioPorDia = ganancias.reduce((sum, g) => sum + g.gananciaPerDia, 0) / ganancias.length;
  }

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta pesada?')) {
      try {
        await deletePesada(id);
      } catch (error) {
        console.error('Error al eliminar pesada:', error);
      }
    }
  };

  const handleSelectPesada = (pesadaId) => {
    setSelectedPesadas(prev => 
      prev.includes(pesadaId) 
        ? prev.filter(id => id !== pesadaId)
        : [...prev, pesadaId]
    );
  };

  const handleSelectAll = (pesadasList) => {
    const allIds = pesadasList.map(p => p.id);
    const allSelected = allIds.every(id => selectedPesadas.includes(id));
    
    if (allSelected) {
      setSelectedPesadas(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedPesadas(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const exportarExcel = () => {
    // Implementar exportación a Excel
    console.log('Exportar a Excel');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#67806D] mx-auto mb-4"></div>
          <p className="text-[#3C454A]">Cargando pesadas...</p>
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
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#67806D] bg-opacity-10 rounded-xl">
                <Scale className="h-6 w-6 text-[#67806D]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#3C454A]">Pesadas</h1>
                <p className="text-[#3C454A] opacity-70">Control de pesadas y seguimiento de ganancia de peso</p>
              </div>
            </div>
            <button
              onClick={() => setShowModalNueva(true)}
              className="flex items-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-xl hover:bg-[#67806D]/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva Pesada
            </button>
          </div>
        </div>

        {/* Pestañas de vista */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-[#F5F2E7] p-1 rounded-lg">
              <button
                onClick={() => setVistaActiva('campo')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  vistaActiva === 'campo' 
                    ? 'bg-[#67806D] text-white shadow-md' 
                    : 'text-[#3C454A] hover:bg-white'
                }`}
              >
                Animales en Campo ({pesadasCampoFiltradas.length})
              </button>
              <button
                onClick={() => setVistaActiva('vendidos')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  vistaActiva === 'vendidos' 
                    ? 'bg-[#805A36] text-white shadow-md' 
                    : 'text-[#3C454A] hover:bg-white'
                }`}
              >
                Animales Vendidos ({pesadasVendidosFiltradas.length})
              </button>
              <button
                onClick={() => setVistaActiva('todos')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  vistaActiva === 'todos' 
                    ? 'bg-[#3C454A] text-white shadow-md' 
                    : 'text-[#3C454A] hover:bg-white'
                }`}
              >
                Todos ({pesadasCampoFiltradas.length + pesadasVendidosFiltradas.length})
              </button>
            </div>
            
            {selectedPesadas.length > 0 && (
              <button
                onClick={() => setSelectedPesadas([])}
                className="text-sm text-[#F8B36A] hover:underline"
              >
                Limpiar selección ({selectedPesadas.length})
              </button>
            )}
          </div>
        </div>

        {/* Panel de estadísticas de selección */}
        {selectedPesadas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#67806D] bg-opacity-10 border-2 border-[#67806D] border-dashed rounded-xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-[#67806D] mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estadísticas de Selección ({selectedPesadas.length} pesadas)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-[#3C454A] opacity-70 text-sm">Peso Promedio</p>
                <p className="text-2xl font-bold text-[#67806D]">
                  {estadisticasSeleccion.pesoPromedio.toFixed(1)} kg
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-[#3C454A] opacity-70 text-sm">Peso Total</p>
                <p className="text-2xl font-bold text-[#3C454A]">
                  {estadisticasSeleccion.pesoTotal.toFixed(1)} kg
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-[#3C454A] opacity-70 text-sm">Animales Únicos</p>
                <p className="text-2xl font-bold text-[#805A36]">
                  {new Set(selectedPesadas.map(id => {
                    const pesada = pesadasFiltradas.find(p => p.id === id);
                    return pesada?.animal_id;
                  })).size}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#3C454A] opacity-70 text-sm">Total Pesadas</p>
                <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.totalPesadas}</p>
              </div>
              <Scale className="h-8 w-8 text-[#67806D]" />
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
                <p className="text-[#3C454A] opacity-70 text-sm">Animales</p>
                <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.animalesUnicos}</p>
              </div>
              <Users className="h-8 w-8 text-[#67806D]" />
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
                <p className="text-[#3C454A] opacity-70 text-sm">Peso Promedio</p>
                <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.pesoPromedio.toFixed(1)} kg</p>
              </div>
              <Scale className="h-8 w-8 text-[#805A36]" />
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
                <p className="text-[#3C454A] opacity-70 text-sm">Ganancia/Pesada</p>
                <p className="text-2xl font-bold text-[#67806D]">
                  {estadisticas.gananciaPromedioPorPesada > 0 ? '+' : ''}{estadisticas.gananciaPromedioPorPesada.toFixed(1)} kg
                </p>
              </div>
              {estadisticas.gananciaPromedioPorPesada > 0 ? 
                <TrendingUp className="h-8 w-8 text-[#67806D]" /> : 
                <TrendingDown className="h-8 w-8 text-[#F8B36A]" />
              }
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#3C454A] opacity-70 text-sm">Ganancia/Día</p>
                <p className="text-2xl font-bold text-[#67806D]">
                  {estadisticas.gananciaPromedioPorDia > 0 ? '+' : ''}{estadisticas.gananciaPromedioPorDia.toFixed(2)} kg
                </p>
              </div>
              <Calendar className="h-8 w-8 text-[#67806D]" />
            </div>
          </motion.div>
        </div>

        {/* Panel de estadísticas detallado */}
        {showEstadisticasDetalle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-[#3C454A] mb-4">Estadísticas Detalladas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-[#3C454A] mb-2">Ganancia Total</h4>
                <p className="text-3xl font-bold text-[#67806D]">
                  {estadisticas.gananciaTotal > 0 ? '+' : ''}{estadisticas.gananciaTotal.toFixed(1)} kg
                </p>
              </div>
              <div>
                <h4 className="font-medium text-[#3C454A] mb-2">Promedio por Animal</h4>
                <p className="text-3xl font-bold text-[#3C454A]">
                  {(estadisticas.gananciaTotal / Math.max(estadisticas.animalesUnicos, 1)).toFixed(1)} kg
                </p>
              </div>
              <div>
                <h4 className="font-medium text-[#3C454A] mb-2">Rendimiento</h4>
                <p className="text-3xl font-bold text-[#805A36]">
                  {estadisticas.gananciaPromedioPorDia > 0 ? 'Positivo' : 'Negativo'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#3C454A]">Filtros y Búsqueda</h3>
            <button
              onClick={() => setShowEstadisticasDetalle(!showEstadisticasDetalle)}
              className="text-sm text-[#67806D] hover:underline"
            >
              {showEstadisticasDetalle ? 'Ocultar' : 'Ver'} estadísticas detalladas
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#3C454A] opacity-50" />
                <input
                  type="text"
                  placeholder="Buscar por caravana o observaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                <option value="Ternero">Ternero</option>
                <option value="Novillo">Novillo</option>
                <option value="Vaca">Vaca</option>
                <option value="Toro">Toro</option>
              </select>
            </div>

            <div>
              <select
                value={filtros.animal}
                onChange={(e) => setFiltros({...filtros, animal: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              >
                <option value="">Todos los animales</option>
                {animales.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.numero_caravana} - {animal.categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
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
              <label className="block text-sm text-[#3C454A] opacity-70 mb-1">Peso mínimo (kg)</label>
              <input
                type="number"
                step="0.1"
                value={filtros.pesoMin}
                onChange={(e) => setFiltros({...filtros, pesoMin: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-[#3C454A] opacity-70 mb-1">Peso máximo (kg)</label>
              <input
                type="number"
                step="0.1"
                value={filtros.pesoMax}
                onChange={(e) => setFiltros({...filtros, pesoMax: e.target.value})}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#67806D] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-[#3C454A] opacity-70 mb-1">Acciones</label>
              <button
                onClick={() => {
                  setFiltros({
                    fechaDesde: '',
                    fechaHasta: '',
                    categoria: '',
                    animal: '',
                    lote: '',
                    pesoMin: '',
                    pesoMax: ''
                  });
                  setSearchTerm('');
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
            </div>

            <div>
              <label className="block text-sm text-[#3C454A] opacity-70 mb-1">Exportar</label>
              <button
                onClick={exportarExcel}
                className="w-full bg-[#805A36] text-white px-4 py-2 rounded-xl hover:bg-[#805A36]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de pesadas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto table-scroll">
            <table className="w-full">
              <thead className={`${vistaActiva === 'campo' ? 'bg-[#67806D] bg-opacity-10' : 
                                  vistaActiva === 'vendidos' ? 'bg-[#805A36] bg-opacity-10' : 
                                  'bg-[#F9E9D0]'}`}>
                <tr>
                  <th className="text-left p-4 font-semibold text-[#3C454A] w-12">
                    <input
                      type="checkbox"
                      checked={pesadasFiltradas.length > 0 && pesadasFiltradas.every(p => selectedPesadas.includes(p.id))}
                      onChange={() => handleSelectAll(pesadasFiltradas)}
                      className="rounded border-gray-300 text-[#67806D] focus:ring-[#67806D]"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-[#3C454A]">Animal</th>
                  <th className="text-left p-4 font-semibold text-[#3C454A]">Estado</th>
                  <th className="text-left p-4 font-semibold text-[#3C454A]">Fecha</th>
                  <th className="text-left p-4 font-semibold text-[#3C454A]">Peso</th>
                  <th className="text-left p-4 font-semibold text-[#3C454A]">Ganancia</th>
                  <th className="text-left p-4 font-semibold text-[#3C454A]">Lote</th>
                  <th className="text-left p-4 font-semibold text-[#3C454A]">Observaciones</th>
                  <th className="text-center p-4 font-semibold text-[#3C454A]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pesadasFiltradas.map((pesada, index) => {
                  const animal = pesada.animales;
                  const lote = animal?.animal_lote?.[0]?.lotes;
                  const isSelected = selectedPesadas.includes(pesada.id);
                  const isVendido = animal?.estado === 'vendido';
                  
                  // Calcular ganancia respecto a pesada anterior
                  const pesadaAnterior = pesadas
                    .filter(p => p.animal_id === pesada.animal_id && p.fecha_pesada < pesada.fecha_pesada)
                    .sort((a, b) => new Date(b.fecha_pesada) - new Date(a.fecha_pesada))[0];
                  
                  const ganancia = pesadaAnterior ? pesada.peso - pesadaAnterior.peso : null;

                  return (
                    <motion.tr
                      key={pesada.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-gray-100 transition-all cursor-pointer
                        ${isSelected ? 'bg-[#67806D] bg-opacity-10 ring-2 ring-[#67806D] ring-opacity-30' : 
                          isVendido ? 'bg-[#805A36] bg-opacity-5 hover:bg-[#805A36] hover:bg-opacity-10' : 
                          'hover:bg-[#F5F2E7]'}
                        ${isVendido ? 'opacity-75' : ''}`}
                      onClick={() => handleSelectPesada(pesada.id)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectPesada(pesada.id)}
                          className="rounded border-gray-300 text-[#67806D] focus:ring-[#67806D]"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${animal?.color_caravana || 'gray'}-500`}></div>
                          <div>
                            <p className={`font-medium ${isVendido ? 'text-[#805A36]' : 'text-[#3C454A]'}`}>
                              {animal?.numero_caravana || 'S/N'}
                            </p>
                            <p className={`text-sm opacity-70 ${isVendido ? 'text-[#805A36]' : 'text-[#3C454A]'}`}>
                              {animal?.categoria}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isVendido 
                            ? 'bg-[#805A36] bg-opacity-20 text-[#805A36]' 
                            : 'bg-[#67806D] bg-opacity-20 text-[#67806D]'
                        }`}>
                          {isVendido ? 'Vendido' : 'En Campo'}
                        </span>
                      </td>
                      <td className={`p-4 ${isVendido ? 'text-[#805A36]' : 'text-[#3C454A]'}`}>
                        {new Date(pesada.fecha_pesada).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${isVendido ? 'text-[#805A36]' : 'text-[#3C454A]'}`}>
                          {pesada.peso} kg
                        </span>
                      </td>
                      <td className="p-4">
                        {ganancia !== null ? (
                          <span className={`font-semibold ${ganancia > 0 ? 'text-[#67806D]' : 'text-[#F8B36A]'}`}>
                            {ganancia > 0 ? '+' : ''}{ganancia.toFixed(1)} kg
                          </span>
                        ) : (
                          <span className={`opacity-50 ${isVendido ? 'text-[#805A36]' : 'text-[#3C454A]'}`}>
                            Primera pesada
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {lote ? (
                          <span className={`px-2 py-1 rounded-lg text-sm ${
                            isVendido 
                              ? 'bg-[#805A36] bg-opacity-10 text-[#805A36]' 
                              : 'bg-[#67806D] bg-opacity-10 text-[#67806D]'
                          }`}>
                            {lote.nombre} - {lote.numero}
                          </span>
                        ) : (
                          <span className={`opacity-50 ${isVendido ? 'text-[#805A36]' : 'text-[#3C454A]'}`}>
                            Sin lote
                          </span>
                        )}
                      </td>
                      <td className={`p-4 opacity-70 max-w-xs truncate ${isVendido ? 'text-[#805A36]' : 'text-[#3C454A]'}`}>
                        {pesada.observaciones || '-'}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPesada(pesada);
                              setShowModalDetalle(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isVendido 
                                ? 'text-[#805A36] hover:bg-[#805A36] hover:bg-opacity-10' 
                                : 'text-[#67806D] hover:bg-[#67806D] hover:bg-opacity-10'
                            }`}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEliminar(pesada.id)}
                            className="p-2 text-[#F8B36A] hover:bg-[#F8B36A] hover:bg-opacity-10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pesadasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-[#3C454A] opacity-30 mx-auto mb-4" />
              <p className="text-[#3C454A] opacity-70">
                {vistaActiva === 'campo' ? 'No hay pesadas de animales en campo' :
                 vistaActiva === 'vendidos' ? 'No hay pesadas de animales vendidos' :
                 'No se encontraron pesadas'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modales */}
      <ModalNuevaPesada 
        isOpen={showModalNueva}
        onClose={() => setShowModalNueva(false)}
      />
      
      {showModalDetalle && selectedPesada && (
        <div>Modal Detalle Pesada</div>
      )}
    </div>
  );
};

export default Pesadas;
