import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  User, 
  MapPin, 
  Truck, 
  Package, 
  DollarSign,
  FileText,
  Hash,
  Palette,
  Weight,
  Activity,
  Download,
  Edit3,
  Eye
} from 'lucide-react';
import { useAnimales } from '../../hooks/useAnimales';

const ESTADOS_FISICOS = {
  'critico': { label: 'Crítico', color: 'text-red-600 bg-red-50 border-red-200' },
  'malo': { label: 'Malo', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  'bueno': { label: 'Bueno', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  'excelente': { label: 'Excelente', color: 'text-green-600 bg-green-50 border-green-200' }
};

export default function DetalleCompra({ compra, onClose, onEditarCompra, onVerAnimal }) {
  const { getAnimalesByCompra } = useAnimales();
  const [animales, setAnimales] = useState([]);
  const [loadingAnimales, setLoadingAnimales] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (compra?.id) {
      cargarAnimales();
    }
  }, [compra]);

  const cargarAnimales = async () => {
    setLoadingAnimales(true);
    try {
      const { data, error } = await getAnimalesByCompra(compra.id);
      if (!error) {
        setAnimales(data);
      }
    } catch (error) {
      console.error('Error cargando animales:', error);
    } finally {
      setLoadingAnimales(false);
    }
  };

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

  const calcularEstadisticas = () => {
    const totalAnimales = animales.length;
    const pesoTotal = animales.reduce((sum, animal) => sum + (parseFloat(animal.peso_ingreso) || 0), 0);
    const valorTotal = animales.reduce((sum, animal) => {
      const peso = parseFloat(animal.peso_ingreso) || 0;
      const precio = parseFloat(animal.precio_compra) || 0;
      return sum + (peso * precio);
    }, 0);
    
    const porCategoria = animales.reduce((acc, animal) => {
      const categoria = animal.categoria;
      if (!acc[categoria]) {
        acc[categoria] = { cantidad: 0, peso: 0 };
      }
      acc[categoria].cantidad += 1;
      acc[categoria].peso += parseFloat(animal.peso_ingreso) || 0;
      return acc;
    }, {});

    const porEstado = animales.reduce((acc, animal) => {
      const estado = animal.estado_fisico;
      if (!acc[estado]) {
        acc[estado] = 0;
      }
      acc[estado] += 1;
      return acc;
    }, {});

    return { totalAnimales, pesoTotal, valorTotal, porCategoria, porEstado };
  };

  const estadisticas = calcularEstadisticas();

  if (!compra) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#3C454A] text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Compra del {formatearFecha(compra.fecha)}
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                {compra.lugar_origen}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditarCompra(compra)}
                className="p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                title="Editar compra"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-[#67806D] text-[#67806D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('animales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'animales'
                  ? 'border-[#67806D] text-[#67806D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Animales ({estadisticas.totalAnimales})
            </button>
            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'estadisticas'
                  ? 'border-[#67806D] text-[#67806D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Estadísticas
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#67806D]" />
                    <div>
                      <div className="text-sm text-gray-600">Fecha de Compra</div>
                      <div className="font-medium text-[#3C454A]">
                        {formatearFecha(compra.fecha)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#67806D]" />
                    <div>
                      <div className="text-sm text-gray-600">Proveedor</div>
                      <div className="font-medium text-[#3C454A]">
                        {compra.proveedores?.nombre || 'No especificado'}
                      </div>
                      {compra.proveedores?.cuit && (
                        <div className="text-sm text-gray-500">
                          CUIT: {compra.proveedores.cuit}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#67806D]" />
                    <div>
                      <div className="text-sm text-gray-600">Lugar de Origen</div>
                      <div className="font-medium text-[#3C454A]">
                        {compra.lugar_origen}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {compra.transportadores && (
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#67806D]" />
                      <div>
                        <div className="text-sm text-gray-600">Transportador</div>
                        <div className="font-medium text-[#3C454A]">
                          {compra.transportadores.nombre}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {compra.precio_total && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-[#67806D]" />
                      <div>
                        <div className="text-sm text-gray-600">Precio Total</div>
                        <div className="font-medium text-[#3C454A]">
                          {formatearMoneda(compra.precio_total)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {compra.documento && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#67806D]" />
                      <div>
                        <div className="text-sm text-gray-600">Documento</div>
                        <div className="font-medium text-[#3C454A]">
                          Archivo adjunto
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Método de Carga */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-[#3C454A] mb-2">Método de Carga</h4>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#67806D]" />
                  <span className="text-sm">
                    {compra.flag_peso_promedio ? 'Lote con peso promedio' : 'Carga individual'}
                  </span>
                </div>
                {compra.flag_peso_promedio && (
                  <div className="mt-2 text-sm text-gray-600">
                    Peso promedio aplicado: {compra.peso_promedio} kg
                  </div>
                )}
              </div>

              {/* Observaciones */}
              {compra.observaciones && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-[#3C454A] mb-2">Observaciones</h4>
                  <p className="text-[#3C454A] text-sm">
                    {compra.observaciones}
                  </p>
                </div>
              )}

              {/* Información de Registro */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Información de Registro</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Registrado por:</span>
                    <span className="ml-2 text-blue-800">
                      {compra.usuarios?.nombre || 'Usuario no disponible'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Fecha de registro:</span>
                    <span className="ml-2 text-blue-800">
                      {new Date(compra.created_at).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'animales' && (
            <div className="space-y-6">
              {loadingAnimales ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-[#67806D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando animales...</p>
                </div>
              ) : animales.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay animales registrados en esta compra.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-[#3C454A]">
                      Animales de la Compra ({animales.length})
                    </h4>
                    <button className="flex items-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#5a6b60] transition-colors text-sm">
                      <Download className="w-4 h-4" />
                      Exportar Lista
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
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
                              Estado Físico
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Precio/kg
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Estado
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {animales.map((animal, index) => (
                            <tr key={animal.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium text-[#3C454A] flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {animal.numero_caravana || `Sin caravana #${index + 1}`}
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
                                <span className="flex items-center gap-1 text-[#3C454A]">
                                  <Weight className="w-3 h-3" />
                                  {animal.peso_ingreso}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                                  ESTADOS_FISICOS[animal.estado_fisico]?.color || 'text-gray-600 bg-gray-50 border-gray-200'
                                }`}>
                                  <Activity className="w-3 h-3 inline mr-1" />
                                  {ESTADOS_FISICOS[animal.estado_fisico]?.label || animal.estado_fisico}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#3C454A]">
                                {formatearMoneda(animal.precio_compra)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  animal.estado === 'en_campo' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {animal.estado === 'en_campo' ? 'En Campo' : 'Vendido'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => onVerAnimal && onVerAnimal(animal)}
                                    className="p-1 text-[#67806D] hover:text-[#5a6b60] transition-colors"
                                    title="Ver detalle del animal"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'estadisticas' && (
            <div className="space-y-6">
              {/* Resumen General */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{estadisticas.totalAnimales}</div>
                  <div className="text-sm text-blue-800">Total Animales</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {estadisticas.pesoTotal.toFixed(1)} kg
                  </div>
                  <div className="text-sm text-green-800">Peso Total</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatearMoneda(estadisticas.valorTotal)}
                  </div>
                  <div className="text-sm text-yellow-800">Valor Total</div>
                </div>
              </div>

              {/* Por Categoría */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-[#3C454A] mb-4">Distribución por Categoría</h4>
                <div className="space-y-3">
                  {Object.entries(estadisticas.porCategoria).map(([categoria, datos]) => (
                    <div key={categoria} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-[#3C454A]">{categoria}</div>
                        <div className="text-sm text-gray-600">
                          {datos.cantidad} {datos.cantidad === 1 ? 'animal' : 'animales'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-[#3C454A]">
                          {datos.peso.toFixed(1)} kg
                        </div>
                        <div className="text-sm text-gray-600">
                          Promedio: {(datos.peso / datos.cantidad).toFixed(1)} kg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Por Estado Físico */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-[#3C454A] mb-4">Estado Físico</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(estadisticas.porEstado).map(([estado, cantidad]) => (
                    <div key={estado} className={`p-3 rounded-lg text-center border ${
                      ESTADOS_FISICOS[estado]?.color || 'text-gray-600 bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-lg font-bold">
                        {cantidad}
                      </div>
                      <div className="text-xs font-medium">
                        {ESTADOS_FISICOS[estado]?.label || estado}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
