import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Scale, 
  AlertTriangle,
  Hash,
  Palette,
  Weight,
  Activity,
  DollarSign
} from 'lucide-react';
import { useAnimales } from '../../hooks/useAnimales';

const CATEGORIAS = [
  'Ternero',
  'Ternera',
  'Novillo',
  'Vaquillona',
  'Vaca',
  'Toro'
];

const ESTADOS_FISICOS = [
  { value: 'critico', label: 'Crítico', color: 'text-red-600' },
  { value: 'malo', label: 'Malo', color: 'text-orange-600' },
  { value: 'bueno', label: 'Bueno', color: 'text-yellow-600' },
  { value: 'excelente', label: 'Excelente', color: 'text-green-600' }
];

const COLORES_CARAVANA = [
  'Amarillo', 'Verde', 'Azul', 'Rojo', 'Blanco', 'Negro', 'Naranja', 'Rosa'
];

export default function CargaAnimales({ datos, onChange, errores }) {
  const { validateCaravanas } = useAnimales();
  
  const [tipoCarga, setTipoCarga] = useState(datos.tipo_carga || 'individual');
  const [animales, setAnimales] = useState(datos.animales || []);
  const [pesoPromedio, setPesoPromedio] = useState(datos.peso_promedio || '');
  const [editandoAnimal, setEditandoAnimal] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState([]);
  
  const formatCurrency = (value) => {
    if (!value) return '';
    const numberValue = String(value).replace(/[^\d.]/g, '');
    const parts = numberValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  };

  const handlePrecioChange = (e, field) => {
    const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
    if (editandoAnimal) {
      setEditandoAnimal(prev => ({ ...prev, [field]: rawValue }));
    } else {
      setNuevoAnimal(prev => ({ ...prev, [field]: rawValue }));
    }
  };

  const handlePesoChange = (e, field) => {
    const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
    setNuevoAnimal(prev => ({ ...prev, [field]: rawValue }));
  };

  const handlePesoPromedioChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
    setPesoPromedio(rawValue);
  };
  
  const [nuevoAnimal, setNuevoAnimal] = useState({
    numero_caravana: '',
    color_caravana: '',
    categoria: '',
    peso_ingreso: '',
    estado_fisico: 'bueno',
    precio_compra: '',
    observaciones: ''
  });

  useEffect(() => {
    onChange({
      tipo_carga: tipoCarga,
      flag_peso_promedio: tipoCarga === 'lote',
      peso_promedio: tipoCarga === 'lote' ? pesoPromedio : '',
      animales: animales
    });
  }, [tipoCarga, animales, pesoPromedio]);

  const agregarAnimal = () => {
    if (tipoCarga === 'individual' && (!nuevoAnimal.categoria || !nuevoAnimal.estado_fisico)) {
      return;
    }

    const animalParaAgregar = {
      ...nuevoAnimal,
      id: Date.now() + Math.random(), // ID temporal
      peso_ingreso: tipoCarga === 'lote' ? parseFloat(pesoPromedio) || 0 : parseFloat(nuevoAnimal.peso_ingreso) || 0,
      precio_compra: parseFloat(nuevoAnimal.precio_compra) || 0,
      compra_id: null, // Se asignará al crear la compra
      proveedor_id: datos.proveedor_id,
      transportador_id: datos.transportador_id
    };

    setAnimales(prev => [...prev, animalParaAgregar]);
    setNuevoAnimal({
      numero_caravana: '',
      color_caravana: '',
      categoria: '',
      peso_ingreso: '',
      estado_fisico: 'bueno',
      precio_compra: '',
      observaciones: ''
    });
  };

  const eliminarAnimal = (id) => {
    setAnimales(prev => prev.filter(animal => animal.id !== id));
  };

  const editarAnimal = (animal) => {
    setEditandoAnimal(animal);
  };

  const guardarEdicion = () => {
    setAnimales(prev => 
      prev.map(animal => 
        animal.id === editandoAnimal.id ? editandoAnimal : animal
      )
    );
    setEditandoAnimal(null);
  };

  const validarCaravanasDuplicadas = async () => {
    const animalesConCaravana = animales.filter(a => a.numero_caravana && a.color_caravana);
    if (animalesConCaravana.length === 0) return;

    const { duplicadas } = await validateCaravanas(animalesConCaravana);
    setErroresValidacion(duplicadas);
  };

  useEffect(() => {
    if (animales.length > 0) {
      validarCaravanasDuplicadas();
    }
  }, [animales]);

  const aplicarPesoPromedio = () => {
    if (!pesoPromedio) return;
    
    setAnimales(prev => 
      prev.map(animal => ({
        ...animal,
        peso_ingreso: parseFloat(pesoPromedio)
      }))
    );
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
          Carga de Animales
        </h3>
        <p className="text-[#805A36] text-sm">
          Agregue los animales de esta compra. Puede cargarlos individualmente o usar peso promedio para lotes.
        </p>
      </motion.div>

      {/* Tipo de Carga */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-[#3C454A] mb-3">Método de Carga</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <button
            onClick={() => setTipoCarga('individual')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoCarga === 'individual'
                ? 'border-[#67806D] bg-[#67806D]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-[#67806D]" />
              <div className="text-left">
                <div className="font-medium text-[#3C454A]">Individual</div>
                <div className="text-sm text-gray-600">
                  Cargar cada animal con su peso específico
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTipoCarga('lote')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoCarga === 'lote'
                ? 'border-[#67806D] bg-[#67806D]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-[#67806D]" />
              <div className="text-left">
                <div className="font-medium text-[#3C454A]">Lote con Peso Promedio</div>
                <div className="text-sm text-gray-600">
                  Usar un peso promedio para todos los animales
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Peso Promedio */}
      {tipoCarga === 'lote' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Peso Promedio del Lote</h4>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-yellow-800 mb-1">
                Peso en KG
              </label>
              <input
                type="text"
                value={formatCurrency(pesoPromedio)}
                onChange={handlePesoPromedioChange}
                placeholder="350"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errores.peso_promedio ? 'border-red-500' : 'border-yellow-300'
                }`}
              />
              {errores.peso_promedio && (
                <p className="text-red-500 text-sm mt-1">{errores.peso_promedio}</p>
              )}
            </div>
            
            {animales.length > 0 && (
              <button
                onClick={aplicarPesoPromedio}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Aplicar a Todos
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Formulario Nuevo Animal */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-[#3C454A] mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agregar Animal
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Número de Caravana */}
          <div>
            <label className="block text-sm font-medium text-[#3C454A] mb-1">
              <Hash className="w-4 h-4 inline mr-1" />
              Caravana
            </label>
            <input
              type="text"
              value={nuevoAnimal.numero_caravana}
              onChange={(e) => setNuevoAnimal(prev => ({ ...prev, numero_caravana: e.target.value }))}
              placeholder="123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
            />
          </div>

          {/* Color Caravana */}
          <div>
            <label className="block text-sm font-medium text-[#3C454A] mb-1">
              <Palette className="w-4 h-4 inline mr-1" />
              Color
            </label>
            <select
              value={nuevoAnimal.color_caravana}
              onChange={(e) => setNuevoAnimal(prev => ({ ...prev, color_caravana: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
            >
              <option value="">Seleccionar</option>
              {COLORES_CARAVANA.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-[#3C454A] mb-1">
              Categoría *
            </label>
            <select
              value={nuevoAnimal.categoria}
              onChange={(e) => setNuevoAnimal(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
            >
              <option value="">Seleccionar</option>
              {CATEGORIAS.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Estado Físico */}
          <div>
            <label className="block text-sm font-medium text-[#3C454A] mb-1">
              <Activity className="w-4 h-4 inline mr-1" />
              Estado *
            </label>
            <select
              value={nuevoAnimal.estado_fisico}
              onChange={(e) => setNuevoAnimal(prev => ({ ...prev, estado_fisico: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
            >
              {ESTADOS_FISICOS.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {/* Peso Individual */}
          {tipoCarga === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-[#3C454A] mb-1">
                <Weight className="w-4 h-4 inline mr-1" />
                Peso (KG)
              </label>
              <input
                type="text"
                value={formatCurrency(nuevoAnimal.peso_ingreso)}
                onChange={(e) => handlePesoChange(e, 'peso_ingreso')}
                placeholder="350"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
          )}

          {/* Precio Compra */}
          <div>
            <label className="block text-sm font-medium text-[#3C454A] mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Precio/KG
            </label>
            <input
              type="text"
              value={formatCurrency(nuevoAnimal.precio_compra)}
              onChange={(e) => handlePrecioChange(e, 'precio_compra')}
              placeholder="450"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#3C454A] mb-1">
            Observaciones
          </label>
          <textarea
            value={nuevoAnimal.observaciones}
            onChange={(e) => setNuevoAnimal(prev => ({ ...prev, observaciones: e.target.value }))}
            placeholder="Información adicional del animal..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
          />
        </div>

        <button
          onClick={agregarAnimal}
          disabled={!nuevoAnimal.categoria || !nuevoAnimal.estado_fisico}
          className="mt-4 flex items-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#5a6b60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Agregar Animal
        </button>
      </div>

      {/* Lista de Animales */}
      {animales.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-[#3C454A] flex items-center gap-2">
              <Package className="w-5 h-5" />
              Animales Agregados ({animales.length})
            </h4>
          </div>
          
          {/* Alertas de Validación */}
          {erroresValidacion.length > 0 && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Caravanas Duplicadas Detectadas</span>
              </div>
              <div className="text-sm text-red-700">
                Las siguientes caravanas ya existen en el stock:
                <ul className="list-disc list-inside mt-1">
                  {erroresValidacion.map((error, index) => (
                    <li key={index}>
                      Caravana {error.numero_caravana} {error.color_caravana}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
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
                    Peso (KG)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio/KG
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
                        <div className="font-medium text-[#3C454A]">
                          {animal.numero_caravana || `Sin caravana #${index + 1}`}
                        </div>
                        {animal.color_caravana && (
                          <div className="text-sm text-gray-500">
                            {animal.color_caravana}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#3C454A]">
                      {animal.categoria}
                    </td>
                    <td className="px-4 py-3 text-[#3C454A]">
                      {animal.peso_ingreso} kg
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        ESTADOS_FISICOS.find(e => e.value === animal.estado_fisico)?.color || 'text-gray-600'
                      }`}>
                        {ESTADOS_FISICOS.find(e => e.value === animal.estado_fisico)?.label || animal.estado_fisico}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3C454A]">
                      ${animal.precio_compra}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => editarAnimal(animal)}
                          className="p-1 text-[#67806D] hover:text-[#5a6b60] transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarAnimal(animal.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {errores.animales && (
        <p className="text-red-500 text-sm">{errores.animales}</p>
      )}

      {/* Modal de Edición */}
      {editandoAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-[#3C454A] mb-4">
              Editar Animal
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3C454A] mb-1">
                    Caravana
                  </label>
                  <input
                    type="text"
                    value={editandoAnimal.numero_caravana}
                    onChange={(e) => setEditandoAnimal(prev => ({ 
                      ...prev, 
                      numero_caravana: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3C454A] mb-1">
                    Color
                  </label>
                  <select
                    value={editandoAnimal.color_caravana}
                    onChange={(e) => setEditandoAnimal(prev => ({ 
                      ...prev, 
                      color_caravana: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  >
                    <option value="">Seleccionar</option>
                    {COLORES_CARAVANA.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3C454A] mb-1">
                    Categoría
                  </label>
                  <select
                    value={editandoAnimal.categoria}
                    onChange={(e) => setEditandoAnimal(prev => ({ 
                      ...prev, 
                      categoria: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  >
                    <option value="">Seleccionar</option>
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
                    value={editandoAnimal.estado_fisico}
                    onChange={(e) => setEditandoAnimal(prev => ({ 
                      ...prev, 
                      estado_fisico: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  >
                    {ESTADOS_FISICOS.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3C454A] mb-1">
                    Peso (KG)
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(editandoAnimal.peso_ingreso)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                      setEditandoAnimal(prev => ({ 
                        ...prev, 
                        peso_ingreso: rawValue 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3C454A] mb-1">
                    Precio/KG
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(editandoAnimal.precio_compra)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                      setEditandoAnimal(prev => ({ 
                        ...prev, 
                        precio_compra: rawValue 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Observaciones
                </label>
                <textarea
                  value={editandoAnimal.observaciones}
                  onChange={(e) => setEditandoAnimal(prev => ({ 
                    ...prev, 
                    observaciones: e.target.value 
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditandoAnimal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="flex-1 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60]"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
