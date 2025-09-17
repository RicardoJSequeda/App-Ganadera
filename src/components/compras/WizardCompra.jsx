import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  FileText,
  Calendar,
  MapPin,
  Truck,
  User,
  Upload
} from 'lucide-react';
import DatosGenerales from './DatosGenerales';
import CargaAnimales from './CargaAnimales';
import ResumenCompra from './ResumenCompra';

const PASOS = [
  { id: 1, titulo: 'Datos Generales', icono: FileText },
  { id: 2, titulo: 'Carga de Animales', icono: Package },
  { id: 3, titulo: 'Resumen y Confirmación', icono: Check }
];

export default function WizardCompra({ onClose, onComplete }) {
  const [pasoActual, setPasoActual] = useState(1);
  const [datosCompra, setDatosCompra] = useState({
    // Datos generales
    fecha: new Date().toISOString().split('T')[0],
    proveedor_id: '',
    lugar_origen: '',
    transportador_id: '',
    precio_total: '',
    documento: '',
    observaciones: '',
    
    // Datos de animales
    tipo_carga: 'individual', // 'individual' o 'lote'
    flag_peso_promedio: false,
    peso_promedio: '',
    animales: []
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const actualizarDatos = (nuevosDatos) => {
    setDatosCompra(prev => ({
      ...prev,
      ...nuevosDatos
    }));
    setErrores({});
  };

  const validarPaso = (paso) => {
    const nuevosErrores = {};
    
    if (paso === 1) {
      if (!datosCompra.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
      if (!datosCompra.proveedor_id) nuevosErrores.proveedor_id = 'El proveedor es obligatorio';
      if (!datosCompra.lugar_origen) nuevosErrores.lugar_origen = 'El lugar de origen es obligatorio';
    }
    
    if (paso === 2) {
      if (datosCompra.animales.length === 0) {
        nuevosErrores.animales = 'Debe cargar al menos un animal';
      }
      
      if (datosCompra.flag_peso_promedio && !datosCompra.peso_promedio) {
        nuevosErrores.peso_promedio = 'Debe ingresar el peso promedio';
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

  const completarCompra = async () => {
    if (!validarPaso(pasoActual)) return;
    
    setLoading(true);
    try {
      await onComplete(datosCompra);
    } catch (error) {
      console.error('Error al completar compra:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <DatosGenerales
            datos={datosCompra}
            onChange={actualizarDatos}
            errores={errores}
          />
        );
      case 2:
        return (
          <CargaAnimales
            datos={datosCompra}
            onChange={actualizarDatos}
            errores={errores}
          />
        );
      case 3:
        return (
          <ResumenCompra
            datos={datosCompra}
            onConfirmar={completarCompra}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[98vh] sm:max-h-[95vh] flex flex-col my-2 sm:my-8"
      >
        {/* Header */}
        <div className="bg-[#3C454A] text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nueva Compra</span>
              <span className="sm:hidden">Compra</span>
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors text-lg sm:text-base"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-4 sm:mt-6">
            {/* Mobile version - simplified */}
            <div className="flex sm:hidden items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-300 mb-1">
                  Paso {pasoActual} de {PASOS.length}
                </div>
                <div className="text-sm font-medium text-white">
                  {PASOS.find(p => p.id === pasoActual)?.titulo}
                </div>
                <div className="flex justify-center mt-2 space-x-1">
                  {PASOS.map((paso) => (
                    <div
                      key={paso.id}
                      className={`w-2 h-2 rounded-full ${
                        pasoActual >= paso.id ? 'bg-[#67806D]' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop version - full steps */}
            <div className="hidden sm:flex items-center justify-center space-x-2 lg:space-x-4">
              {PASOS.map((paso, index) => (
                <div key={paso.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 transition-all
                    ${pasoActual >= paso.id 
                      ? 'bg-[#67806D] border-[#67806D] text-white' 
                      : 'border-gray-400 text-gray-400'
                    }
                  `}>
                    {pasoActual > paso.id ? (
                      <Check className="w-3 h-3 lg:w-5 lg:h-5" />
                    ) : (
                      <paso.icono className="w-3 h-3 lg:w-5 lg:h-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <div className={`text-xs lg:text-sm font-medium ${
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
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 mx-2 lg:mx-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
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
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 flex-shrink-0">
          <button
            onClick={pasoAnterior}
            disabled={pasoActual === 1}
            className={`
              flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${pasoActual === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-[#3C454A] hover:bg-gray-200'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Cancelar
            </button>
            
            {pasoActual < PASOS.length ? (
              <button
                onClick={siguientePaso}
                className="flex items-center justify-center gap-2 bg-[#67806D] text-white px-6 py-2 rounded-lg hover:bg-[#5a6b60] transition-all"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={completarCompra}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#67806D] text-white px-6 py-2 rounded-lg hover:bg-[#5a6b60] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Guardando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Completar Compra</span>
                    <span className="sm:hidden">Completar</span>
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
