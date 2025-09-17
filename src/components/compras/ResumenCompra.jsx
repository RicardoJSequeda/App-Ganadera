import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { 
  Check, 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  Truck, 
  Package, 
  DollarSign,
  Scale,
  Activity,
  Hash,
  Palette
} from 'lucide-react';

const ESTADOS_FISICOS = {
  'critico': { label: 'Crítico', color: 'text-red-600 bg-red-50' },
  'malo': { label: 'Malo', color: 'text-orange-600 bg-orange-50' },
  'bueno': { label: 'Bueno', color: 'text-yellow-600 bg-yellow-50' },
  'excelente': { label: 'Excelente', color: 'text-green-600 bg-green-50' }
};

export default function ResumenCompra({ datos, onConfirmar, loading }) {
  const [proveedor, setProveedor] = useState(null);
  const [transportador, setTransportador] = useState(null);

  useEffect(() => {
    const fetchDetalles = async () => {
      if (datos.proveedor_id) {
        const { data } = await supabase.from('proveedores').select('*').eq('id', datos.proveedor_id).single();
        setProveedor(data);
      }
      if (datos.transportador_id) {
        const { data } = await supabase.from('transportadores').select('*').eq('id', datos.transportador_id).single();
        setTransportador(data);
      }
    };
    fetchDetalles();
  }, [datos.proveedor_id, datos.transportador_id]);

  const calcularTotales = () => {
    const totalAnimales = datos.animales.length;
    const pesoTotal = datos.animales.reduce((sum, animal) => sum + (parseFloat(animal.peso_ingreso) || 0), 0);
    const valorTotal = datos.animales.reduce((sum, animal) => {
      const peso = parseFloat(animal.peso_ingreso) || 0;
      const precio = parseFloat(animal.precio_compra) || 0;
      return sum + (peso * precio);
    }, 0);
    
    return { totalAnimales, pesoTotal, valorTotal };
  };

  const { totalAnimales, pesoTotal, valorTotal } = calcularTotales();

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMoneda = (valor) => {
    const number = Number(valor) || 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(number);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F9E9D0] rounded-lg p-4 border border-[#805A36]/20"
      >
        <h3 className="text-lg font-semibold text-[#3C454A] mb-2 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Resumen de la Compra
        </h3>
        <p className="text-[#805A36] text-sm">
          Revise todos los datos antes de confirmar. Una vez confirmada, la compra se guardará en el sistema.
        </p>
      </motion.div>

      {/* Información General */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información General
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#67806D]" />
              <div>
                <div className="text-sm text-gray-600">Fecha de Compra</div>
                <div className="font-medium text-[#3C454A]">
                  {formatearFecha(datos.fecha)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#67806D]" />
              <div>
                <div className="text-sm text-gray-600">Lugar de Origen</div>
                <div className="font-medium text-[#3C454A]">
                  {datos.lugar_origen}
                </div>
              </div>
            </div>
            
            {datos.transportador_id && (
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#67806D]" />
                <div>
                  <div className="text-sm text-gray-600">Transportador</div>
                  <div className="font-medium text-[#3C454A]">
                    {transportador ? transportador.nombre : 'Cargando...'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#67806D]" />
              <div>
                <div className="text-sm text-gray-600">Proveedor</div>
                <div className="font-medium text-[#3C454A]">
                  {proveedor ? `${proveedor.nombre} ${proveedor.cuit ? `(CUIT: ${proveedor.cuit})` : ''}` : 'Cargando...'}
                </div>
              </div>
            </div>
            
            {datos.precio_total && (
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#67806D]" />
                <div>
                  <div className="text-sm text-gray-600">Precio Total</div>
                  <div className="font-medium text-[#3C454A]">
                    {formatearMoneda(parseFloat(datos.precio_total))}
                  </div>
                </div>
              </div>
            )}
            
            {datos.documento && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#67806D]" />
                <div>
                  <div className="text-sm text-gray-600">Documento</div>
                  <div className="font-medium text-[#3C454A]">
                    {datos.documento.name || 'Archivo adjunto'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {datos.observaciones && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Observaciones</div>
            <div className="text-[#3C454A] bg-gray-50 p-3 rounded-lg">
              {datos.observaciones}
            </div>
          </div>
        )}
      </div>

      {/* Resumen de Animales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-[#3C454A] flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" />
          Animales ({totalAnimales})
        </h4>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalAnimales}</div>
            <div className="text-sm text-blue-800">Total Animales</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {pesoTotal.toFixed(1)} kg
            </div>
            <div className="text-sm text-green-800">Peso Total</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {formatearMoneda(valorTotal)}
            </div>
            <div className="text-sm text-yellow-800">Valor Estimado</div>
          </div>
        </div>

        {/* Método de Carga */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#67806D]" />
            <span className="font-medium text-[#3C454A]">
              Método de carga: {datos.flag_peso_promedio ? 'Lote con peso promedio' : 'Individual'}
            </span>
          </div>
          {datos.flag_peso_promedio && (
            <div className="text-sm text-gray-600 mt-1">
              Peso promedio aplicado: {datos.peso_promedio} kg
            </div>
          )}
        </div>

        {/* Detalle de Animales */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          {/* Desktop Table */}
          <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
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
                      Peso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio/kg
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {datos.animales.map((animal, index) => {
                    const peso = parseFloat(animal.peso_ingreso) || 0;
                    const precio = parseFloat(animal.precio_compra) || 0;
                    const subtotal = peso * precio;

                    return (
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
                        <td className="px-4 py-3 text-[#3C454A]">
                          {peso} kg
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            ESTADOS_FISICOS[animal.estado_fisico]?.color || 'text-gray-600 bg-gray-50'
                          }`}>
                            {ESTADOS_FISICOS[animal.estado_fisico]?.label || animal.estado_fisico}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#3C454A]">
                          {formatearMoneda(precio)}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#3C454A]">
                          {formatearMoneda(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {datos.animales.map((animal, index) => {
              const peso = parseFloat(animal.peso_ingreso) || 0;
              const precio = parseFloat(animal.precio_compra) || 0;
              const subtotal = peso * precio;

              return (
                <div key={animal.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-[#3C454A] flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        {animal.numero_caravana || `Sin caravana #${index + 1}`}
                      </div>
                      {animal.color_caravana && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Palette className="w-3 h-3" />
                          {animal.color_caravana}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      ESTADOS_FISICOS[animal.estado_fisico]?.color || 'text-gray-600 bg-gray-50'
                    }`}>
                      {ESTADOS_FISICOS[animal.estado_fisico]?.label || animal.estado_fisico}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Categoría:</span>
                      <div className="font-medium text-[#3C454A]">{animal.categoria}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Peso:</span>
                      <div className="font-medium text-[#3C454A] flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        {peso} kg
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Precio/kg:</span>
                      <div className="font-medium text-[#3C454A]">{formatearMoneda(precio)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Subtotal:</span>
                      <div className="font-medium text-[#67806D] flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatearMoneda(subtotal)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Resumen por Categoría */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-[#3C454A] mb-4">Resumen por Categoría</h4>
        
        <div className="space-y-3">
          {Object.entries(
            datos.animales.reduce((acc, animal) => {
              const categoria = animal.categoria;
              if (!acc[categoria]) {
                acc[categoria] = { cantidad: 0, peso: 0 };
              }
              acc[categoria].cantidad += 1;
              acc[categoria].peso += parseFloat(animal.peso_ingreso) || 0;
              return acc;
            }, {})
          ).map(([categoria, datos]) => (
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

      {/* Botón de Confirmación */}
      {/* Este bloque se elimina para evitar duplicados. El botón está en el footer del Wizard. */}
    </div>
  );
}
