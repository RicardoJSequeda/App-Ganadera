import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users,
  Package,
  Weight,
  BarChart3
} from 'lucide-react';

export default function EstadisticasVentas({ ventas, compradores }) {
  const estadisticas = useMemo(() => {
    if (!ventas || ventas.length === 0) {
      return {
        totalVentas: 0,
        ventasEsteMes: 0,
        montoTotal: 0,
        montoEsteMes: 0,
        totalCompradores: 0,
        totalAnimales: 0,
        pesoTotal: 0,
        precioPromedio: 0
      };
    }

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const ventasEsteMes = ventas.filter(venta => 
      new Date(venta.fecha) >= inicioMes
    );

    // Calcular montos totales usando los datos disponibles en las ventas
    const montoTotal = ventas.reduce((sum, venta) => {
      return sum + ((venta.peso_total || 0) * (venta.precio_kilo || 0));
    }, 0);

    const montoEsteMes = ventasEsteMes.reduce((sum, venta) => {
      return sum + ((venta.peso_total || 0) * (venta.precio_kilo || 0));
    }, 0);

    // Calcular totales de animales y peso
    const totalAnimales = ventas.reduce((sum, venta) => sum + (venta.total_animales || 0), 0);
    const pesoTotal = ventas.reduce((sum, venta) => sum + (venta.peso_total || 0), 0);

    // Precio promedio por kg
    const precioPromedio = pesoTotal > 0 ? montoTotal / pesoTotal : 0;

    // Compradores únicos
    const compradoresUnicos = new Set(ventas.map(venta => venta.comprador_id));

    return {
      totalVentas: ventas.length,
      ventasEsteMes: ventasEsteMes.length,
      montoTotal,
      montoEsteMes,
      totalCompradores: compradoresUnicos.size,
      totalAnimales,
      pesoTotal,
      precioPromedio
    };
  }, [ventas]);

  const tarjetas = [
    {
      titulo: 'Total Ventas',
      valor: estadisticas.totalVentas,
      subtitulo: `${estadisticas.ventasEsteMes} este mes`,
      icono: Calendar,
      color: 'blue'
    },
    {
      titulo: 'Ingresos Totales',
      valor: `$${estadisticas.montoTotal.toLocaleString('es-AR')}`,
      subtitulo: `$${estadisticas.montoEsteMes.toLocaleString('es-AR')} este mes`,
      icono: DollarSign,
      color: 'green'
    },
    {
      titulo: 'Animales Vendidos',
      valor: estadisticas.totalAnimales,
      subtitulo: `${estadisticas.pesoTotal.toFixed(1)} kg total`,
      icono: Package,
      color: 'purple'
    },
    {
      titulo: 'Precio Promedio',
      valor: `$${estadisticas.precioPromedio.toFixed(2)}/kg`,
      subtitulo: `${estadisticas.totalCompradores} compradores`,
      icono: TrendingUp,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colores = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600'
    };
    return colores[color] || colores.blue;
  };

  if (ventas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center"
      >
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Sin datos de ventas</h3>
        <p className="text-gray-500">
          Las estadísticas aparecerán aquí cuando registre su primera venta.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header con título */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#67806D]/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-[#67806D]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#3C454A]">
              Resumen de Ventas
            </h3>
            <p className="text-sm text-gray-600">
              Estadísticas generales de las ventas realizadas
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((tarjeta, index) => (
          <motion.div
            key={tarjeta.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getColorClasses(tarjeta.color)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {tarjeta.titulo}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {tarjeta.valor}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {tarjeta.subtitulo}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${tarjeta.color === 'blue' ? 'bg-blue-100' : 
                tarjeta.color === 'green' ? 'bg-green-100' :
                tarjeta.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                <tarjeta.icono className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
