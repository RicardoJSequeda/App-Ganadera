import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  FileText, 
  Upload,
  Plus,
  Search,
  X,
  DollarSign,
  Package,
  CheckCircle
} from 'lucide-react';
import { useCompradores } from '../../hooks/useVentas';
import { obtenerFechaActual } from '../../utils/dateUtils';

const TIPOS_VENTA = [
  { value: 'jaula', label: 'Jaula', description: 'Venta por jaula o lote cerrado' },
  { value: 'remate', label: 'Remate', description: 'Venta en remate ganadero' },
  { value: 'particular', label: 'Particular', description: 'Venta directa a particular' }
];

export default function DatosVenta({ datos, onChange, errores }) {
  console.log('📅 DatosVenta renderizado con fecha:', datos.fecha);
  
  const { compradores, createComprador } = useCompradores();
  
  const [mostrarModalComprador, setMostrarModalComprador] = useState(false);
  const [busquedaComprador, setBusquedaComprador] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [compradorSeleccionado, setCompradorSeleccionado] = useState(null);
  
  const [nuevoComprador, setNuevoComprador] = useState({
    nombre: '',
    contacto: '',
    cuit: '',
    observaciones: ''
  });

  // Actualizar el comprador seleccionado cuando cambie el ID
  useEffect(() => {
    if (datos.comprador_id && compradores.length > 0) {
      const comprador = compradores.find(c => c.id === datos.comprador_id);
      setCompradorSeleccionado(comprador);
      if (comprador && !busquedaComprador) {
        setBusquedaComprador(comprador.nombre);
      }
    } else {
      setCompradorSeleccionado(null);
    }
  }, [datos.comprador_id, compradores]);

  const compradoresFiltrados = compradores.filter(c => 
    c.nombre.toLowerCase().includes(busquedaComprador.toLowerCase()) ||
    c.cuit?.includes(busquedaComprador)
  );

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  const crearComprador = async () => {
    if (!nuevoComprador.nombre) return;
    
    const { data, error } = await createComprador(nuevoComprador);
    if (!error && data) {
      onChange({ comprador_id: data.id });
      setMostrarModalComprador(false);
      setNuevoComprador({
        nombre: '',
        contacto: '',
        cuit: '',
        observaciones: ''
      });
      setBusquedaComprador(data.nombre);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarComprador = (comprador) => {
    onChange({ comprador_id: comprador.id });
    setBusquedaComprador(comprador.nombre);
    setMostrarSugerencias(false);
    setCompradorSeleccionado(comprador);
  };

  const limpiarSeleccion = () => {
    onChange({ comprador_id: '' });
    setBusquedaComprador('');
    setCompradorSeleccionado(null);
    setMostrarSugerencias(false);
  };

  const handleBusquedaChange = (value) => {
    setBusquedaComprador(value);
    setMostrarSugerencias(value.length > 0);
    
    // Si el valor no coincide con el comprador seleccionado, limpiamos la selección
    if (compradorSeleccionado && value !== compradorSeleccionado.nombre) {
      onChange({ comprador_id: '' });
      setCompradorSeleccionado(null);
    }
  };

  const calcularResumenVenta = () => {
    const totalAnimales = datos.animales_seleccionados.length;
    const pesoTotal = datos.animales_seleccionados.reduce((sum, animal) => 
      sum + (parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0), 0
    );
    
    // Calcular valor total usando precios por categoría
    const valorTotal = datos.animales_seleccionados.reduce((sum, animal) => {
      const peso = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0;
      const precioCategoria = parseFloat(datos.precios_categoria?.[animal.categoria] || 0);
      return sum + (peso * precioCategoria);
    }, 0);

    // Agrupar por categoría
    const categorias = {};
    datos.animales_seleccionados.forEach(animal => {
      if (!categorias[animal.categoria]) {
        categorias[animal.categoria] = { 
          cantidad: 0, 
          peso: 0,
          valor: 0
        };
      }
      categorias[animal.categoria].cantidad += 1;
      const peso = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0;
      categorias[animal.categoria].peso += peso;
      const precioCategoria = parseFloat(datos.precios_categoria?.[animal.categoria] || 0);
      categorias[animal.categoria].valor += peso * precioCategoria;
    });

    return { totalAnimales, pesoTotal, valorTotal, categorias };
  };

  const { totalAnimales, pesoTotal, valorTotal, categorias } = calcularResumenVenta();

  const categoriasUnicas = [...new Set(datos.animales_seleccionados.map(a => a.categoria))].filter(Boolean);

  const handlePrecioCategoriaChange = (categoria, precio) => {
    const nuevosPrecios = { ...datos.precios_categoria };
    nuevosPrecios[categoria] = precio;
    onChange({ precios_categoria: nuevosPrecios });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F9E9D0] rounded-lg p-4 border border-[#805A36]/20"
      >
        <h3 className="text-lg font-semibold text-[#3C454A] mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Datos de la Venta
        </h3>
        <p className="text-[#805A36] text-sm">
          Complete la información de la venta: comprador, tipo de venta, precio y documentos.
        </p>
      </motion.div>

      {/* Resumen de Selección */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Resumen de Animales Seleccionados
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <span className="text-blue-600">Total Animales:</span>
            <span className="ml-2 font-bold text-blue-800">{totalAnimales}</span>
          </div>
          <div>
            <span className="text-blue-600">Peso Total:</span>
            <span className="ml-2 font-bold text-blue-800">{pesoTotal.toFixed(1)} kg</span>
          </div>
          <div>
            <span className="text-blue-600">Valor Total:</span>
            <span className="ml-2 font-bold text-blue-800">
              ${valorTotal.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
        
        {/* Resumen por Categoría */}
        {Object.keys(categorias).length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-blue-700 mb-2">Detalle por Categoría:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(categorias).map(([categoria, info]) => (
                <div key={categoria} className="bg-white rounded p-3 border border-blue-200">
                  <div className="font-medium text-blue-800 text-sm">{categoria}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    <div>{info.cantidad} animales • {info.peso.toFixed(1)} kg</div>
                    <div className="font-medium">${info.valor.toLocaleString('es-AR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-[#3C454A] mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha de Venta *
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={datos.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
                errores.fecha ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                const fechaHoy = obtenerFechaActual();
                console.log('🔄 Forzando fecha de hoy:', fechaHoy);
                handleInputChange('fecha', fechaHoy);
              }}
              className="px-3 py-2 text-sm bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors"
              title="Usar fecha de hoy"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('🐛 DEBUG - Fecha actual en datos:', datos.fecha);
                console.log('🐛 DEBUG - Fecha del sistema:', new Date().toISOString());
                console.log('🐛 DEBUG - Todos los datos:', datos);
              }}
              className="px-2 py-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="Debug fecha"
            >
              🐛
            </button>
          </div>
          {errores.fecha && (
            <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>
          )}
        </div>

        {/* Tipo de Venta */}
        <div>
          <label className="block text-sm font-medium text-[#3C454A] mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Tipo de Venta *
          </label>
          <select
            value={datos.tipo}
            onChange={(e) => handleInputChange('tipo', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
              errores.tipo ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {TIPOS_VENTA.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {TIPOS_VENTA.find(t => t.value === datos.tipo)?.description}
          </p>
          {errores.tipo && (
            <p className="text-red-500 text-sm mt-1">{errores.tipo}</p>
          )}
        </div>
      </div>

      {/* Comprador */}
      <div>
        <label className="block text-sm font-medium text-[#3C454A] mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Comprador *
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={busquedaComprador}
                onChange={(e) => handleBusquedaChange(e.target.value)}
                onFocus={() => setMostrarSugerencias(busquedaComprador.length > 0)}
                placeholder="Buscar comprador por nombre o CUIT..."
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
                  errores.comprador_id ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {compradorSeleccionado && (
                <button
                  onClick={limpiarSeleccion}
                  className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {mostrarSugerencias && busquedaComprador && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {compradoresFiltrados.length > 0 ? (
                  compradoresFiltrados.map(comprador => (
                    <button
                      key={comprador.id}
                      onClick={() => seleccionarComprador(comprador)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium">{comprador.nombre}</div>
                      {comprador.cuit && (
                        <div className="text-sm text-gray-500">CUIT: {comprador.cuit}</div>
                      )}
                      {comprador.contacto && (
                        <div className="text-sm text-gray-500">Contacto: {comprador.contacto}</div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                    <div>No se encontraron compradores</div>
                    <button
                      onClick={() => {
                        setNuevoComprador(prev => ({ ...prev, nombre: busquedaComprador }));
                        setMostrarModalComprador(true);
                        setMostrarSugerencias(false);
                      }}
                      className="text-[#67806D] hover:text-[#5a6b60] mt-1 text-xs"
                    >
                      ¿Crear nuevo comprador con este nombre?
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setMostrarModalComprador(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
        
        {compradorSeleccionado && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">{compradorSeleccionado.nombre}</span>
            </div>
            {compradorSeleccionado.cuit && (
              <div className="text-sm text-green-600 mt-1">CUIT: {compradorSeleccionado.cuit}</div>
            )}
          </div>
        )}
        
        {errores.comprador_id && (
          <p className="text-red-500 text-sm mt-1">{errores.comprador_id}</p>
        )}
      </div>

      {/* Precios por Categoría */}
      {categoriasUnicas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[#3C454A] mb-3">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Precios por Categoría *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasUnicas.map(categoria => {
              const cantidadAnimales = datos.animales_seleccionados.filter(a => a.categoria === categoria).length;
              const pesoCategoria = datos.animales_seleccionados
                .filter(a => a.categoria === categoria)
                .reduce((sum, animal) => sum + (parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0), 0);
              
              return (
                <div key={categoria} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <div className="font-medium text-[#3C454A]">{categoria}</div>
                    <div className="text-sm text-gray-600">
                      {cantidadAnimales} animales • {pesoCategoria.toFixed(1)} kg
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      value={datos.precios_categoria?.[categoria] || ''}
                      onChange={(e) => handlePrecioCategoriaChange(categoria, e.target.value)}
                      placeholder="450.00"
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
                        errores[`precio_${categoria}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {datos.precios_categoria?.[categoria] && pesoCategoria > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Subtotal: ${(parseFloat(datos.precios_categoria[categoria]) * pesoCategoria).toLocaleString('es-AR')}
                    </p>
                  )}
                  {errores[`precio_${categoria}`] && (
                    <p className="text-red-500 text-sm mt-1">{errores[`precio_${categoria}`]}</p>
                  )}
                </div>
              );
            })}
          </div>
          {errores.precios_categoria && (
            <p className="text-red-500 text-sm mt-2">{errores.precios_categoria}</p>
          )}
        </div>
      )}

      {/* Documentos */}
      <div>
        <label className="block text-sm font-medium text-[#3C454A] mb-2">
          <Upload className="w-4 h-4 inline mr-1" />
          Documentos de Venta (Opcional)
        </label>
        <input
          type="file"
          onChange={(e) => handleInputChange('documentos', Array.from(e.target.files))}
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Puede subir múltiples archivos. Formatos soportados: PDF, JPG, PNG
        </p>
        
        {datos.documentos && datos.documentos.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Archivos seleccionados:</p>
            <div className="space-y-1">
              {datos.documentos.map((archivo, index) => (
                <div key={index} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
                  {archivo.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-[#3C454A] mb-2">
          Observaciones
        </label>
        <textarea
          value={datos.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          placeholder="Información adicional sobre la venta..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
        />
      </div>

      {/* Modal Nuevo Comprador */}
      {mostrarModalComprador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#3C454A]">Nuevo Comprador</h3>
              <button
                onClick={() => setMostrarModalComprador(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nuevoComprador.nombre}
                  onChange={(e) => setNuevoComprador(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Contacto
                </label>
                <input
                  type="text"
                  value={nuevoComprador.contacto}
                  onChange={(e) => setNuevoComprador(prev => ({ ...prev, contacto: e.target.value }))}
                  placeholder="Teléfono, email, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  CUIT
                </label>
                <input
                  type="text"
                  value={nuevoComprador.cuit}
                  onChange={(e) => setNuevoComprador(prev => ({ ...prev, cuit: e.target.value }))}
                  placeholder="20-12345678-9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Observaciones
                </label>
                <textarea
                  value={nuevoComprador.observaciones}
                  onChange={(e) => setNuevoComprador(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Información adicional..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setMostrarModalComprador(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={crearComprador}
                disabled={!nuevoComprador.nombre}
                className="flex-1 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
