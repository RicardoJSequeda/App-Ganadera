import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import WizardVenta from '../components/ventas/WizardVenta';
import ListadoVentas from '../components/ventas/ListadoVentas';
import EstadisticasVentas from '../components/ventas/EstadisticasVentas';
import { useVentas, useCompradores } from '../hooks/useVentas';
import { useNotification } from '../hooks/useNotification';

export default function Ventas() {
  const { NotificationContainer } = useNotification();
  const [vista, setVista] = useState('listado'); // 'listado', 'wizard'
  const { ventas } = useVentas();
  const { compradores } = useCompradores();

  const irANuevaVenta = () => {
    console.log('🚀 Abriendo nueva venta...');
    setVista('wizard');
  };

  const volverAListado = () => {
    console.log('🔙 Volviendo al listado...');
    setVista('listado');
  };

  const onVentaCreada = () => {
    console.log('✅ Venta creada, volviendo al listado...');
    setVista('listado');
  };

  const renderHeader = () => {
    const titulos = {
      listado: 'Gestión de Ventas',
      wizard: 'Nueva Venta'
    };

    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {vista !== 'listado' && (
            <motion.button
              onClick={volverAListado}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-[#67806D] hover:text-[#5a6b60] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </motion.button>
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-[#3C454A]">{titulos[vista]}</h1>
            <p className="text-gray-600 mt-2">
              {vista === 'listado' && 'Administre todas las ventas realizadas y vea estadísticas en tiempo real'}
              {vista === 'wizard' && 'Complete los datos para registrar una nueva venta'}
            </p>
          </div>
        </div>

        {vista === 'listado' && (
          <motion.button
            onClick={irANuevaVenta}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-[#67806D] text-white px-4 py-2 rounded-lg hover:bg-[#5a6b60] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Venta
          </motion.button>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {renderHeader()}
      
      <div className="min-h-[600px]">
        {vista === 'listado' && (
          <div className="space-y-6">
            {/* Estadísticas integradas */}
            <EstadisticasVentas 
              ventas={ventas}
              compradores={compradores}
            />
            
            {/* Listado de ventas */}
            <ListadoVentas 
              onNuevaVenta={irANuevaVenta}
            />
          </div>
        )}
        
        {vista === 'wizard' && (
          <WizardVenta 
            key={`wizard-${Date.now()}`} // Forzar recreación del componente
            onComplete={onVentaCreada}
            onClose={volverAListado}
          />
        )}
      </div>
      
      <NotificationContainer />
    </motion.div>
  );
}