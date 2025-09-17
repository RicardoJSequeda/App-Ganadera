import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  User,
  DollarSign,
  Package,
  Weight,
  Truck,
  ArrowLeft,
  Check,
  Download,
  Eye
} from 'lucide-react';
import { formatearFecha } from '../../utils/dateUtils';

export default function ResumenVenta({ 
  datos, 
  compradores = [], 
  proveedores = []
}) {
  const [expandirAnimales, setExpandirAnimales] = useState(false);

  const comprador = compradores?.find(c => c.id === datos.comprador_id);
  
  const calcularTotales = () => {
    const totalAnimales = datos.animales_seleccionados.length;
    const pesoTotal = datos.animales_seleccionados.reduce((sum, animal) => 
      sum + (parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0), 0
    );
    
    // Calcular valor total usando precios por categoría
    const valorTotal = datos.animales_seleccionados.reduce((sum, animal) => {
      const peso = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0;
      const precioCategoria = parseFloat(datos.precios_categoria?.[animal.categoria] || 0);
      const valorAnimal = peso * precioCategoria;
      
      return sum + valorAnimal;
    }, 0);

    return { totalAnimales, pesoTotal, valorTotal };
  };

  const agruparPorCategoria = () => {
    const grupos = {};
    datos.animales_seleccionados.forEach(animal => {
      if (!grupos[animal.categoria]) {
        grupos[animal.categoria] = [];
      }
      grupos[animal.categoria].push(animal);
    });
    return grupos;
  };

  const { totalAnimales, pesoTotal, valorTotal } = calcularTotales();
  const gruposCategoria = agruparPorCategoria();

  const getTipoVentaLabel = (tipo) => {
    const tipos = {
      'jaula': 'Jaula',
      'remate': 'Remate',
      'particular': 'Particular'
    };
    return tipos[tipo] || tipo;
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
          Resumen de Venta
        </h3>
        <p className="text-[#805A36] text-sm">
          Revise todos los datos antes de confirmar la venta.
        </p>
      </motion.div>

      {/* Totales Destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-800">{totalAnimales}</div>
          <div className="text-sm text-blue-600">Animales</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Weight className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-800">{pesoTotal.toFixed(1)} kg</div>
          <div className="text-sm text-green-600">Peso Total</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-800">
            ${(!isNaN(valorTotal) && isFinite(valorTotal) ? valorTotal : 0).toLocaleString('es-AR')}
          </div>
          <div className="text-sm text-yellow-600">Valor Total</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos de la Venta */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Datos de la Venta
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Fecha:
              </span>
              <span className="font-medium">{formatearFecha(datos.fecha)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Package className="w-4 h-4" />
                Tipo:
              </span>
              <span className="font-medium">{getTipoVentaLabel(datos.tipo)}</span>
            </div>
            
            {/* Precios por Categoría */}
            {datos.precios_categoria && Object.keys(datos.precios_categoria).length > 0 && (
              <div className="pt-2 border-t">
                <span className="text-gray-600 text-sm flex items-center gap-1 mb-2">
                  <DollarSign className="w-4 h-4" />
                  Precios por Categoría:
                </span>
                <div className="space-y-1">
                  {Object.entries(datos.precios_categoria).map(([categoria, precio]) => {
                    const precioNumerico = parseFloat(precio || 0);
                    const precioFinal = (!isNaN(precioNumerico) && isFinite(precioNumerico)) ? precioNumerico : 0;
                    
                    return (
                      <div key={categoria} className="flex justify-between text-sm">
                        <span className="text-gray-600">{categoria}:</span>
                        <span className="font-medium">${precioFinal.toFixed(2)}/kg</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {datos.observaciones && (
              <div className="pt-2 border-t">
                <span className="text-gray-600 text-sm">Observaciones:</span>
                <p className="text-sm mt-1 text-gray-800">{datos.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* Datos del Comprador */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Comprador
          </h4>
          
          {comprador ? (
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Nombre:</span>
                <p className="font-medium">{comprador.nombre}</p>
              </div>
              
              {comprador.contacto && (
                <div>
                  <span className="text-gray-600 text-sm">Contacto:</span>
                  <p className="font-medium">{comprador.contacto}</p>
                </div>
              )}
              
              {comprador.cuit && (
                <div>
                  <span className="text-gray-600 text-sm">CUIT:</span>
                  <p className="font-medium">{comprador.cuit}</p>
                </div>
              )}
              
              {comprador.observaciones && (
                <div>
                  <span className="text-gray-600 text-sm">Observaciones:</span>
                  <p className="text-sm text-gray-800">{comprador.observaciones}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No se encontró información del comprador</p>
          )}
        </div>
      </div>

      {/* Resumen por Categoría */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-[#3C454A] mb-4">
          Resumen por Categoría
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(gruposCategoria).map(([categoria, animales]) => {
            const pesoCategoria = animales.reduce((sum, animal) => 
              sum + (parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0), 0
            );
            
            // Usar precio de la categoría específica, no precio_kilo general
            const precioCategoria = parseFloat(datos.precios_categoria?.[categoria] || 0);
            const valorCategoria = pesoCategoria * precioCategoria;
            
            // Validar que el valor no sea NaN
            const valorFinal = (!isNaN(valorCategoria) && isFinite(valorCategoria)) ? valorCategoria : 0;
            
            return (
              <div key={categoria} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-[#3C454A] mb-2">{categoria}</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Cantidad:</span>
                    <span className="font-medium">{animales.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peso:</span>
                    <span className="font-medium">{pesoCategoria.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio/kg:</span>
                    <span className="font-medium">${precioCategoria.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Valor:</span>
                    <span className="font-medium">${valorFinal.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle de Animales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-[#3C454A]">
            Detalle de Animales ({totalAnimales})
          </h4>
          <button
            onClick={() => setExpandirAnimales(!expandirAnimales)}
            className="flex items-center gap-2 text-[#67806D] hover:text-[#5a6b60] transition-colors"
          >
            <Eye className="w-4 h-4" />
            {expandirAnimales ? 'Ocultar' : 'Ver detalle'}
          </button>
        </div>

        {expandirAnimales && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 max-h-96 overflow-y-auto"
          >
            <div className="grid grid-cols-6 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
              <div>Caravana</div>
              <div>Color</div>
              <div>Categoría</div>
              <div>Estado</div>
              <div>Peso Salida</div>
              <div>Valor</div>
            </div>
            
            {datos.animales_seleccionados.map((animal, index) => {
              const pesoSalida = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0;
              const precioCategoria = parseFloat(datos.precios_categoria?.[animal.categoria] || 0);
              const valorAnimal = pesoSalida * precioCategoria;
              
              // Validar que el valor no sea NaN
              const valorFinal = (!isNaN(valorAnimal) && isFinite(valorAnimal)) ? valorAnimal : 0;
              
              return (
                <div key={animal.id} className="grid grid-cols-6 gap-2 text-sm py-2 border-b border-gray-100 last:border-b-0">
                  <div className="font-medium">{animal.numero_caravana}</div>
                  <div>{animal.color_caravana}</div>
                  <div>{animal.categoria}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      animal.estado_fisico === 'excelente' ? 'bg-green-100 text-green-800' :
                      animal.estado_fisico === 'bueno' ? 'bg-blue-100 text-blue-800' :
                      animal.estado_fisico === 'malo' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {animal.estado_fisico}
                    </span>
                  </div>
                  <div className="font-medium">{pesoSalida.toFixed(1)} kg</div>
                  <div className="font-medium">${valorFinal.toLocaleString('es-AR')}</div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Documentos */}
      {datos.documentos && datos.documentos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos ({datos.documentos.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {datos.documentos.map((archivo, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 flex-1">{archivo.name}</span>
                <span className="text-xs text-gray-500">
                  {(archivo.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
