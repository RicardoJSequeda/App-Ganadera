import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  FileText,
  Calendar,
  User,
  Package,
  Upload
} from 'lucide-react';
import SeleccionAnimales from './SeleccionAnimales';
import DatosVenta from './DatosVenta';
import ResumenVenta from './ResumenVenta';
import { useVentas, useCompradores } from '../../hooks/useVentas';
import { useProveedores } from '../../hooks/useCompras';
import { useNotification } from '../../hooks/useNotification';
import { obtenerFechaActual } from '../../utils/dateUtils';

const PASOS = [
  { id: 1, titulo: 'Selección de Animales', icono: Package },
  { id: 2, titulo: 'Datos de Venta', icono: FileText },
  { id: 3, titulo: 'Resumen y Confirmación', icono: Check }
];

export default function WizardVenta({ onClose, onComplete }) {
  const { createVenta } = useVentas();
  const { compradores } = useCompradores();
  const { proveedores } = useProveedores();
  const { showSuccess, showError } = useNotification();
  
  const [pasoActual, setPasoActual] = useState(1);
  const [datosVenta, setDatosVenta] = useState(() => {
    const fechaInicial = obtenerFechaActual();
    console.log('🏗️ Inicializando estado del wizard con fecha:', fechaInicial);
    return {
      fecha: fechaInicial,
      tipo: 'particular',
      comprador_id: '',
      precios_categoria: {},
      documentos: [],
      observaciones: '',
      animales_seleccionados: []
    };
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // Resetear datos cuando se abre el wizard
  useEffect(() => {
    const fechaActual = obtenerFechaActual();
    console.log('🔄 Reseteando datos del wizard...');
    console.log('📅 Nueva fecha inicializada:', fechaActual);
    
    setPasoActual(1);
    setDatosVenta({
      fecha: fechaActual,
      tipo: 'particular',
      comprador_id: '',
      precios_categoria: {},
      documentos: [],
      observaciones: '',
      animales_seleccionados: []
    });
    setErrores({});
    setLoading(false);
  }, []); // Solo ejecutar al montar el componente

  const actualizarDatos = (nuevosDatos) => {
    setDatosVenta(prev => ({
      ...prev,
      ...nuevosDatos
    }));
    setErrores({});
  };

  const validarPaso = (paso) => {
    const nuevosErrores = {};
    
    if (paso === 1) {
      if (datosVenta.animales_seleccionados.length === 0) {
        nuevosErrores.animales_seleccionados = 'Debe seleccionar al menos un animal';
      }
    }
    
    if (paso === 2) {
      if (!datosVenta.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
      if (!datosVenta.tipo) nuevosErrores.tipo = 'El tipo de venta es obligatorio';
      if (!datosVenta.comprador_id) nuevosErrores.comprador_id = 'El comprador es obligatorio';
      
      // Validar precios por categoría
      const categoriasUnicas = [...new Set(datosVenta.animales_seleccionados.map(a => a.categoria))].filter(Boolean);
      const preciosFaltantes = [];
      
      categoriasUnicas.forEach(categoria => {
        const precio = parseFloat(datosVenta.precios_categoria?.[categoria] || 0);
        if (!precio || precio <= 0) {
          preciosFaltantes.push(categoria);
          nuevosErrores[`precio_${categoria}`] = `El precio para ${categoria} debe ser mayor a 0`;
        }
      });
      
      if (preciosFaltantes.length > 0) {
        nuevosErrores.precios_categoria = `Faltan precios para: ${preciosFaltantes.join(', ')}`;
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const siguientePaso = () => {
    if (validarPaso(pasoActual)) {
      setPasoActual(prev => Math.min(prev + 1, PASOS.length));
    }
  };

  const pasoAnterior = () => {
    setPasoActual(prev => Math.max(prev - 1, 1));
  };

  const completarVenta = async () => {
    if (!validarPaso(pasoActual)) return;
    
    setLoading(true);
    try {
      // Preparar datos de venta
      const ventaData = {
        fecha: datosVenta.fecha,
        tipo: datosVenta.tipo,
        comprador_id: datosVenta.comprador_id,
        precios_categoria: datosVenta.precios_categoria,
        documentos: datosVenta.documentos,
        observaciones: datosVenta.observaciones
      };

      // Preparar animales con datos de venta y precios específicos por categoría
      const animalesVendidos = datosVenta.animales_seleccionados.map(animal => {
        const peso = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso);
        const precioKilo = parseFloat(datosVenta.precios_categoria[animal.categoria] || 0);
        
        return {
          ...animal,
          peso_salida: peso,
          precio_kilo: precioKilo,
          precio_final: peso * precioKilo
        };
      });

      const { data, error } = await createVenta(ventaData, animalesVendidos);
      
      if (error) {
        throw new Error(error);
      }

      // Notificar éxito y cerrar
      showSuccess(`Venta registrada exitosamente con ${animalesVendidos.length} animales`);
      onClose();
      
      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error('Error al completar venta:', error);
      showError('Error al registrar la venta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <SeleccionAnimales
            animalesSeleccionados={datosVenta.animales_seleccionados}
            onChange={(animales) => actualizarDatos({ animales_seleccionados: animales })}
            errores={errores}
          />
        );
      case 2:
        return (
          <DatosVenta
            datos={datosVenta}
            onChange={actualizarDatos}
            errores={errores}
          />
        );
      case 3:
        return (
          <ResumenVenta
            datos={datosVenta}
            compradores={compradores}
            proveedores={proveedores}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col my-8"
      >
        {/* Header */}
        <div className="bg-[#3C454A] text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Nueva Venta
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {PASOS.map((paso, index) => (
              <div key={paso.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${pasoActual >= paso.id 
                    ? 'bg-[#67806D] border-[#67806D] text-white' 
                    : 'border-gray-400 text-gray-400'
                  }
                `}>
                  {pasoActual > paso.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <paso.icono className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-2">
                  <div className={`text-sm font-medium ${
                    pasoActual >= paso.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    Paso {paso.id}
                  </div>
                  <div className={`text-xs ${
                    pasoActual >= paso.id ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    {paso.titulo}
                  </div>
                </div>
                {index < PASOS.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pasoActual}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderPaso()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between flex-shrink-0">
          <button
            onClick={pasoAnterior}
            disabled={pasoActual === 1}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${pasoActual === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-[#3C454A] hover:bg-gray-200'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            
            {pasoActual < PASOS.length ? (
              <button
                onClick={siguientePaso}
                className="flex items-center gap-2 bg-[#67806D] text-white px-6 py-2 rounded-lg hover:bg-[#5a6b60] transition-all"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={completarVenta}
                disabled={loading}
                className="flex items-center gap-2 bg-[#67806D] text-white px-6 py-2 rounded-lg hover:bg-[#5a6b60] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Completar Venta
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
