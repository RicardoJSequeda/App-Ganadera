import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Settings, 
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useFacturas } from '../hooks/useFacturas';
import { useNotification } from '../hooks/useNotification';
import ListadoFacturas from '../components/facturacion/ListadoFacturas';
import ConfiguracionFacturacion from '../components/facturacion/ConfiguracionFacturacion';
import FacturaModal from '../components/facturacion/FacturaModal';

export default function Facturacion() {
  const { facturas, loading } = useFacturas();
  const { NotificationContainer } = useNotification();
  const [vista, setVista] = useState('listado'); // 'listado', 'configuracion'
  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const calcularEstadisticas = () => {
    const total = facturas.length;
    const esteMes = facturas.filter(factura => {
      const fechaFactura = new Date(factura.fecha_emision);
      const mesActual = new Date().getMonth();
      const añoActual = new Date().getFullYear();
      return fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual;
    }).length;

    const montoTotal = facturas.reduce((sum, factura) => sum + (parseFloat(factura.monto_total) || 0), 0);
    const facturasEmitidas = facturas.filter(f => f.estado === 'emitida').length;
    const facturasPendientes = facturas.filter(f => f.estado === 'pendiente').length;

    return { total, esteMes, montoTotal, facturasEmitidas, facturasPendientes };
  };

  const estadisticas = calcularEstadisticas();

  const handleNuevaFactura = () => {
    setMostrarModalFactura(true);
  };

  const handleVerDetalle = (factura) => {
    setFacturaSeleccionada(factura);
    // TODO: Implementar modal de detalle
  };

  const handleFacturaGenerada = (factura) => {
    console.log('Factura generada:', factura);
    // Cerrar modal y refrescar datos
    setMostrarModalFactura(false);
  };

  const renderHeader = () => {
    const titulos = {
      listado: 'Gestión de Facturación',
      configuracion: 'Configuración de Facturación'
    };

    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#67806D] rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-[#3C454A]">{titulos[vista]}</h1>
            <p className="text-gray-600 mt-2">
              {vista === 'listado' && 'Administre todas las facturas emitidas y recibidas'}
              {vista === 'configuracion' && 'Configure la numeración y parámetros de facturación'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {vista === 'listado' && (
            <button
              onClick={handleNuevaFactura}
              className="flex items-center gap-2 bg-[#67806D] text-white px-6 py-3 rounded-lg hover:bg-[#5a6b60] transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Nueva Factura
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderNavegacion = () => {
    const opciones = [
      { id: 'listado', label: 'Listado', icon: FileText },
      { id: 'configuracion', label: 'Configuración', icon: Settings }
    ];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
        <div className="flex">
          {opciones.map((opcion) => {
            const Icon = opcion.icon;
            const activa = vista === opcion.id;
            
            return (
              <button
                key={opcion.id}
                onClick={() => setVista(opcion.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  activa
                    ? 'bg-[#67806D] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {opcion.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEstadisticas = () => {
    if (vista !== 'listado') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Facturas</p>
              <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emitidas</p>
              <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.facturasEmitidas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-[#3C454A]">{estadisticas.facturasPendientes}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderContenido = () => {
    switch (vista) {
      case 'listado':
        return (
          <ListadoFacturas
            onNuevaFactura={handleNuevaFactura}
            onVerDetalle={handleVerDetalle}
          />
        );
      case 'configuracion':
        return <ConfiguracionFacturacion />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {renderHeader()}
      {renderNavegacion()}
      {renderEstadisticas()}
      {renderContenido()}

      {/* Modal de Nueva Factura */}
      {mostrarModalFactura && (
        <FacturaModal
          isOpen={mostrarModalFactura}
          onClose={() => setMostrarModalFactura(false)}
          onSuccess={handleFacturaGenerada}
        />
      )}

      <NotificationContainer />
    </motion.div>
  );
}
