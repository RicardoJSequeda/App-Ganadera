import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  X
} from 'lucide-react';
import { useCompras } from '../hooks/useCompras';
import { useAnimales } from '../hooks/useAnimales';
import { useNotification } from '../hooks/useNotification';
import WizardCompra from '../components/compras/WizardCompra';
import ListadoCompras from '../components/compras/ListadoCompras';
import DetalleCompra from '../components/compras/DetalleCompra';

export default function Compras() {
  const { compras, loading, createCompra, deleteCompra } = useCompras();
  const { showSuccess, showError, showInfo, NotificationContainer } = useNotification();
  const { createAnimales } = useAnimales();
  
  const [mostrarWizard, setMostrarWizard] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(true);

  const calcularEstadisticas = () => {
    const total = compras.length;
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();
    
    const esteMes = compras.filter(compra => {
      const fechaCompra = new Date(compra.fecha);
      return fechaCompra.getMonth() === mesActual && fechaCompra.getFullYear() === añoActual;
    }).length;

    const montoTotal = compras.reduce((sum, compra) => 
      sum + (parseFloat(compra.precio_total) || 0), 0
    );

    const proveedoresUnicos = new Set(compras.map(compra => compra.proveedor_id)).size;

    return { total, esteMes, montoTotal, proveedoresUnicos };
  };

  const estadisticas = calcularEstadisticas();

  const completarCompra = async (datosCompra) => {
    try {
      // Crear la compra
      const { data: compraCreada, error: errorCompra } = await createCompra({
        fecha: datosCompra.fecha,
        proveedor_id: datosCompra.proveedor_id,
        lugar_origen: datosCompra.lugar_origen,
        transportador_id: datosCompra.transportador_id || null,
        precio_total: parseFloat(datosCompra.precio_total) || null,
        documento: datosCompra.documento || null,
        flag_peso_promedio: datosCompra.flag_peso_promedio,
        peso_promedio: parseFloat(datosCompra.peso_promedio) || null,
        observaciones: datosCompra.observaciones
      });

      if (errorCompra) {
        throw new Error(errorCompra);
      }

      // Preparar animales con el ID de la compra
      const animalesParaCrear = datosCompra.animales.map(animal => {
        const { id, ...animalSinId } = animal; // Excluir el ID temporal
        return {
          ...animalSinId,
          compra_id: compraCreada.id
        };
      });

      // Crear los animales
      const { error: errorAnimales } = await createAnimales(animalesParaCrear);

      if (errorAnimales) {
        throw new Error(errorAnimales);
      }

      setMostrarWizard(false);
      
      // Mostrar notificación de éxito
      showSuccess(
        `Se han registrado ${animalesParaCrear.length} animales correctamente en el sistema.`,
        'Compra Registrada Exitosamente'
      );
      
    } catch (error) {
      console.error('Error al completar compra:', error);
      showError(
        error.message,
        'Error al Registrar la Compra'
      );
    }
  };

  const verDetalle = (compra) => {
    setCompraSeleccionada(compra);
    setMostrarDetalle(true);
  };

  const editarCompra = (compra) => {
    // TODO: Implementar edición
    showInfo(
      'Esta funcionalidad estará disponible en una próxima actualización.',
      'Funcionalidad en Desarrollo'
    );
  };

  const eliminarCompra = async (compra) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta compra? Esta acción no se puede deshacer.')) {
      const { error } = await deleteCompra(compra.id);
      if (error) {
        showError(
          error,
          'Error al Eliminar la Compra'
        );
      } else {
        showSuccess(
          'La compra ha sido eliminada correctamente del sistema.',
          'Compra Eliminada'
        );
      }
    }
  };

  const verAnimal = (animal) => {
    // TODO: Implementar vista de detalle del animal
    showInfo(
      `Caravana: ${animal.numero_caravana || 'Sin caravana'}. Vista de detalle próximamente.`,
      'Detalle del Animal'
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#3C454A] flex items-center gap-2">
            <Package className="w-6 h-6" />
            Gestión de Compras
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Registre y administre las compras de animales con información detallada
          </p>
        </div>
        
        <button
          onClick={() => setMostrarWizard(true)}
          className="flex items-center gap-2 bg-[#67806D] text-white px-6 py-3 rounded-lg hover:bg-[#5a6b60] transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nueva Compra
        </button>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Compras</p>
              <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Este Mes</p>
              <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.esteMes}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-[#3C454A]">
                ${estadisticas.montoTotal.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Proveedores</p>
              <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.proveedoresUnicos}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Información de ayuda */}
      {mostrarAyuda && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.2 }}
          className="bg-[#F9E9D0] rounded-lg p-4 border border-[#805A36]/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#805A36] mt-0.5" />
              <div>
                <h3 className="font-medium text-[#3C454A] mb-1">Wizard de Compras</h3>
                <p className="text-[#805A36] text-sm">
                  El wizard lo guiará paso a paso para registrar una nueva compra: primero los datos generales 
                  (proveedor, fecha, lugar), luego la carga de animales (individual o por lote), y finalmente 
                  el resumen para confirmar toda la información.
                </p>
              </div>
            </div>
            <button
              onClick={() => setMostrarAyuda(false)}
              className="text-[#805A36] hover:text-[#3C454A] transition-colors p-1 rounded-full hover:bg-[#805A36]/10"
              title="Cerrar ayuda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista de Compras */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ListadoCompras
          compras={compras}
          onVerDetalle={verDetalle}
          onEditar={editarCompra}
          onEliminar={eliminarCompra}
          loading={loading}
        />
      </motion.div>

      {/* Wizard de Nueva Compra */}
      {mostrarWizard && (
        <WizardCompra
          onClose={() => setMostrarWizard(false)}
          onComplete={completarCompra}
        />
      )}

      {/* Detalle de Compra */}
      {mostrarDetalle && compraSeleccionada && (
        <DetalleCompra
          compra={compraSeleccionada}
          onClose={() => {
            setMostrarDetalle(false);
            setCompraSeleccionada(null);
          }}
          onEditarCompra={editarCompra}
          onVerAnimal={verAnimal}
        />
      )}

      {/* Contenedor de Notificaciones */}
      <NotificationContainer />
    </div>
  );
}