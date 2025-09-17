import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search, 
  Filter, 
  Hash, 
  Palette, 
  Weight, 
  Activity, 
  User, 
  Calendar,
  CheckSquare,
  Square,
  Eye,
  RotateCcw,
  AlertTriangle,
  Layers,
  Users
} from 'lucide-react';
import { useAnimalesVenta, useLotes } from '../../hooks/useVentas';
import { useProveedores } from '../../hooks/useCompras';
import AnimalModal from '../animales/AnimalModal';

const CATEGORIAS = [
  'Ternero', 'Ternera', 'Novillo', 'Vaquillona', 'Vaca', 'Toro'
];

const ESTADOS_FISICOS = [
  { value: 'critico', label: 'Crítico', color: 'text-red-600 bg-red-50' },
  { value: 'malo', label: 'Malo', color: 'text-orange-600 bg-orange-50' },
  { value: 'bueno', label: 'Bueno', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'excelente', label: 'Excelente', color: 'text-green-600 bg-green-50' }
];

export default function SeleccionAnimales({ animalesSeleccionados, onChange, errores }) {
  const { animalesDisponibles, loading, fetchAnimalesDisponibles } = useAnimalesVenta();
  const { lotes, loading: loadingLotes } = useLotes();
  const { proveedores } = useProveedores();
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    estado_fisico: '',
    proveedor_id: '',
    peso_min: '',
    peso_max: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [seleccionMasiva, setSeleccionMasiva] = useState(false);
  const [animalEditando, setAnimalEditando] = useState(null);
  const [mostrarLotes, setMostrarLotes] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [mostrarDetalleAnimal, setMostrarDetalleAnimal] = useState(false);

  useEffect(() => {
    // Cargar todos los animales al inicio (sin filtros)
    if (Object.values(filtros).every(valor => valor === '')) {
      fetchAnimalesDisponibles({});
    } else {
      fetchAnimalesDisponibles(filtros);
    }
  }, [filtros]);

  const aplicarFiltros = () => {
    fetchAnimalesDisponibles(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      categoria: '',
      estado_fisico: '',
      proveedor_id: '',
      peso_min: '',
      peso_max: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
  };

  // Función para seleccionar lote completo
  const seleccionarLoteCompleto = (lote) => {
    const animalesDelLote = lote.animales_activos.map(animal => ({
      ...animal,
      peso_salida: animal.peso_ingreso,
      precio_final: 0
    }));

    // Agregar animales que no estén ya seleccionados
    const animalesNuevos = animalesDelLote.filter(animal => 
      !isAnimalSeleccionado(animal.id)
    );

    onChange([...animalesSeleccionados, ...animalesNuevos]);
    setMostrarLotes(false);
  };

  const isAnimalSeleccionado = (animalId) => {
    return animalesSeleccionados.some(animal => animal.id === animalId);
  };

  const toggleSeleccionAnimal = (animal) => {
    const yaSeleccionado = isAnimalSeleccionado(animal.id);
    
    if (yaSeleccionado) {
      // Remover de selección
      const nuevaSeleccion = animalesSeleccionados.filter(a => a.id !== animal.id);
      onChange(nuevaSeleccion);
    } else {
      // Agregar a selección con peso de salida por defecto
      const animalConDatos = {
        ...animal,
        peso_salida: animal.peso_ingreso,
        precio_final: 0 // Se calculará después
      };
      onChange([...animalesSeleccionados, animalConDatos]);
    }
  };

  const seleccionarTodos = () => {
    if (seleccionMasiva) {
      // Deseleccionar todos
      onChange([]);
      setSeleccionMasiva(false);
    } else {
      // Seleccionar todos los visibles
      const animalesParaSeleccionar = animalesDisponibles
        .filter(animal => !isAnimalSeleccionado(animal.id))
        .map(animal => ({
          ...animal,
          peso_salida: animal.peso_ingreso,
          precio_final: 0
        }));
      
      onChange([...animalesSeleccionados, ...animalesParaSeleccionar]);
      setSeleccionMasiva(true);
    }
  };

  const seleccionarPorCategoria = (categoria) => {
    const animalesCategoria = animalesDisponibles
      .filter(animal => 
        animal.categoria === categoria && 
        !isAnimalSeleccionado(animal.id)
      )
      .map(animal => ({
        ...animal,
        peso_salida: animal.peso_ingreso,
        precio_final: 0
      }));
    
    onChange([...animalesSeleccionados, ...animalesCategoria]);
  };

  const actualizarPesoSalida = (animalId, pesoSalida) => {
    const nuevaSeleccion = animalesSeleccionados.map(animal => 
      animal.id === animalId 
        ? { ...animal, peso_salida: parseFloat(pesoSalida) || 0 }
        : animal
    );
    onChange(nuevaSeleccion);
  };

  const editarAnimal = (animal) => {
    setAnimalSeleccionado(animal);
    setMostrarDetalleAnimal(true);
  };

  const cerrarDetalleAnimal = () => {
    setAnimalSeleccionado(null);
    setMostrarDetalleAnimal(false);
  };

  const calcularEstadisticas = () => {
    const totalSeleccionados = animalesSeleccionados.length;
    const pesoTotal = animalesSeleccionados.reduce((sum, animal) => 
      sum + (parseFloat(animal.peso_salida) || 0), 0
    );
    
    const porCategoria = animalesSeleccionados.reduce((acc, animal) => {
      const categoria = animal.categoria;
      if (!acc[categoria]) acc[categoria] = 0;
      acc[categoria]++;
      return acc;
    }, {});

    return { totalSeleccionados, pesoTotal, porCategoria };
  };

  const { totalSeleccionados, pesoTotal, porCategoria } = calcularEstadisticas();

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F9E9D0] rounded-lg p-4 border border-[#805A36]/20"
      >
        <h3 className="text-lg font-semibold text-[#3C454A] mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Selección de Animales para Venta
        </h3>
        <p className="text-[#805A36] text-sm">
          Seleccione los animales que desea vender. Puede usar filtros para encontrarlos más fácilmente.
        </p>
      </motion.div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-[#3C454A] flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Búsqueda
          </h4>
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
              placeholder="Buscar por número de caravana..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
            />
          </div>
        </div>

        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              >
                <option value="">Todas</option>
                {CATEGORIAS.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Estado Físico
              </label>
              <select
                value={filtros.estado_fisico}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado_fisico: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              >
                <option value="">Todos</option>
                {ESTADOS_FISICOS.map(estado => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Proveedor
              </label>
              <select
                value={filtros.proveedor_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, proveedor_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              >
                <option value="">Todos</option>
                {proveedores.map(proveedor => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                Peso Mínimo (kg)
              </label>
              <input
                type="number"
                value={filtros.peso_min}
                onChange={(e) => setFiltros(prev => ({ ...prev, peso_min: e.target.value }))}
                placeholder="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors text-sm"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            Limpiar
          </button>
          <button
            onClick={() => setMostrarLotes(true)}
            className="px-4 py-2 border border-[#67806D] text-[#67806D] rounded-lg hover:bg-[#67806D]/5 transition-colors text-sm"
          >
            <Layers className="w-4 h-4 inline mr-1" />
            Seleccionar Lote
          </button>
        </div>
      </div>

      {/* Estadísticas de Selección */}
      {totalSeleccionados > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Animales Seleccionados</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-600">Total:</span>
              <span className="ml-2 font-medium text-green-800">{totalSeleccionados} animales</span>
            </div>
            <div>
              <span className="text-green-600">Peso Total:</span>
              <span className="ml-2 font-medium text-green-800">{pesoTotal.toFixed(1)} kg</span>
            </div>
            <div>
              <span className="text-green-600">Promedio:</span>
              <span className="ml-2 font-medium text-green-800">
                {totalSeleccionados > 0 ? (pesoTotal / totalSeleccionados).toFixed(1) : 0} kg
              </span>
            </div>
          </div>
          
          {Object.keys(porCategoria).length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <span className="text-green-600 text-sm">Por categoría:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(porCategoria).map(([categoria, cantidad]) => (
                  <span key={categoria} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {categoria}: {cantidad}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Acciones Masivas */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-[#3C454A] mb-3">Selección Rápida</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={seleccionarTodos}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          >
            {seleccionMasiva ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            {seleccionMasiva ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </button>
          
          {CATEGORIAS.map(categoria => (
            <button
              key={categoria}
              onClick={() => seleccionarPorCategoria(categoria)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Todos {categoria}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Animales */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-[#3C454A] flex items-center gap-2">
            <Package className="w-5 h-5" />
            Animales Disponibles 
            {loading && <div className="w-4 h-4 border-2 border-[#67806D] border-t-transparent rounded-full animate-spin" />}
            ({animalesDisponibles.length})
          </h4>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-[#67806D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando animales...</p>
          </div>
        ) : animalesDisponibles.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay animales disponibles con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={seleccionMasiva}
                      onChange={seleccionarTodos}
                      className="rounded border-gray-300 text-[#67806D] focus:ring-[#67806D]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Caravana
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Peso (kg)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Proveedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ingreso
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {animalesDisponibles.map((animal, index) => {
                  const seleccionado = isAnimalSeleccionado(animal.id);
                  const animalSeleccionado = animalesSeleccionados.find(a => a.id === animal.id);
                  
                  return (
                    <tr 
                      key={animal.id} 
                      className={`hover:bg-gray-50 ${seleccionado ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => toggleSeleccionAnimal(animal)}
                          className="rounded border-gray-300 text-[#67806D] focus:ring-[#67806D]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-[#3C454A] flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {animal.numero_caravana || `#${index + 1}`}
                          </div>
                          {animal.color_caravana && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Palette className="w-3 h-3" />
                              {animal.color_caravana}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#3C454A]">
                        {animal.categoria}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Weight className="w-3 h-3 text-gray-400" />
                          {seleccionado && animalSeleccionado ? (
                            <input
                              type="number"
                              value={animalSeleccionado.peso_salida || animal.peso_ingreso}
                              onChange={(e) => actualizarPesoSalida(animal.id, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#67806D]"
                              step="0.1"
                            />
                          ) : (
                            <span className="text-[#3C454A]">{animal.peso_ingreso}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          ESTADOS_FISICOS.find(e => e.value === animal.estado_fisico)?.color || 'text-gray-600 bg-gray-50'
                        }`}>
                          <Activity className="w-3 h-3 inline mr-1" />
                          {ESTADOS_FISICOS.find(e => e.value === animal.estado_fisico)?.label || animal.estado_fisico}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-[#3C454A]">
                            {animal.proveedores?.nombre || 'Sin datos'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-[#3C454A]">
                            {formatearFecha(animal.fecha_ingreso)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <button
                            onClick={() => editarAnimal(animal)}
                            className="p-1 text-[#67806D] hover:text-[#5a6b60] transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {errores.animales_seleccionados && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">{errores.animales_seleccionados}</span>
        </div>
      )}

      {/* Modal de Detalle de Animal */}
      {mostrarDetalleAnimal && animalSeleccionado && (
        <AnimalModal 
          animal={animalSeleccionado}
          onClose={cerrarDetalleAnimal}
        />
      )}

      {/* Modal de Selección de Lotes */}
      {mostrarLotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#3C454A] flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Seleccionar Lote Completo
              </h3>
              <button
                onClick={() => setMostrarLotes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loadingLotes ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-2 border-[#67806D] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {lotes.filter(lote => lote.total_animales > 0).length > 0 ? (
                  lotes.filter(lote => lote.total_animales > 0).map((lote) => (
                    <div key={lote.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-[#3C454A] flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border-2"
                              style={{ backgroundColor: lote.color }}
                            />
                            {lote.nombre}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Número: {lote.numero} • Creado: {new Date(lote.fecha_creacion).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => seleccionarLoteCompleto(lote)}
                          className="px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors text-sm"
                        >
                          <Users className="w-4 h-4 inline mr-1" />
                          Seleccionar Lote
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm text-blue-600">Total Animales</div>
                          <div className="text-xl font-bold text-blue-800">{lote.total_animales}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-sm text-green-600">Peso Total</div>
                          <div className="text-xl font-bold text-green-800">{lote.peso_total.toFixed(1)} kg</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <div className="text-sm text-yellow-600">Peso Promedio</div>
                          <div className="text-xl font-bold text-yellow-800">{lote.peso_promedio.toFixed(1)} kg</div>
                        </div>
                      </div>
                      
                      {lote.observaciones && (
                        <div className="bg-gray-50 rounded p-2 text-sm text-gray-700">
                          <strong>Observaciones:</strong> {lote.observaciones}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No hay lotes con animales disponibles
                    </h3>
                    <p className="text-gray-500">
                      Todos los lotes están vacíos o no tienen animales en campo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
