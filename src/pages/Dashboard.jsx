import { motion } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  Clock,
  Target,
  Loader
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import KPICard from '../components/dashboard/KPICard';
import SimpleChart from '../components/dashboard/SimpleChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import EstablishmentInfo from '../components/dashboard/EstablishmentInfo';

const Dashboard = () => {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="h-8 w-8 text-rural-primary animate-spin mx-auto mb-4" />
          <p className="text-rural-text/60">Cargando datos del dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertTriangle className="h-12 w-12 text-rural-alert mx-auto mb-4" />
          <p className="text-rural-text/60 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  const { stats, categorias, ultimasCompras, ultimasVentas, ultimosEventos } = data;

  const kpiCards = [
    {
      title: 'Animales en Campo',
      value: stats.totalAnimalesEnCampo,
      subtitle: 'Stock actual',
      icon: FileText,
      color: 'text-rural-primary',
      bgColor: 'bg-rural-primary/10',
      delay: 0
    },
    {
      title: 'Animales Vendidos',
      value: stats.totalAnimalesVendidos,
      subtitle: 'Total histórico',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      delay: 0.1
    },
    {
      title: 'Estado Crítico/Malo',
      value: stats.animalesCriticos,
      subtitle: 'Requieren atención',
      icon: AlertTriangle,
      color: 'text-rural-alert',
      bgColor: 'bg-rural-alert/10',
      delay: 0.2
    },
    {
      title: 'Tiempo Promedio',
      value: `${stats.tiempoPromedioEnCampo}`,
      subtitle: 'días en campo',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      delay: 0.3
    },
    {
      title: 'Diferencia de Precio',
      value: stats.diferenciaPrecios >= 0 ? `+$${stats.diferenciaPrecios}` : `-$${Math.abs(stats.diferenciaPrecios)}`,
      subtitle: 'por kilo promedio',
      icon: DollarSign,
      color: stats.diferenciaPrecios >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.diferenciaPrecios >= 0 ? 'bg-green-100' : 'bg-red-100',
      delay: 0.4
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-rural-text mb-2">
              Dashboard
            </h1>
            <p className="text-rural-text/70">
              Resumen general de la gestión ganadera • {new Date().toLocaleDateString('es-AR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            className="flex items-center space-x-2 px-4 py-2 bg-rural-primary/10 text-rural-primary rounded-xl hover:bg-rural-primary/20 transition-colors"
          >
            <Target className="h-4 w-4" />
            <span>Actualizar</span>
          </motion.button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rural-primary/5 to-transparent rounded-full -translate-y-8 translate-x-8 -z-10" />
      </motion.div>

      {/* KPI Cards Grid - Más compacto */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            {...kpi}
          />
        ))}
      </div>

      {/* Main Content Grid - Reorganizado */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Quick Actions - Más prominente */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity - Más espacio */}
        <div className="lg:col-span-3">
          <RecentActivity
            compras={ultimasCompras}
            ventas={ultimasVentas}
            eventos={ultimosEventos}
          />
        </div>

        {/* Chart y Stats juntos */}
        <div className="lg:col-span-2 space-y-6">
          <SimpleChart
            data={categorias}
            title="Animales por Categoría"
          />
          
          <EstablishmentInfo />
        </div>
      </div>

      {/* Objetivos y Stats - Reorganizado sin alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objetivos principales */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rural-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-rural-primary" />
              </div>
              <h3 className="text-lg font-semibold text-rural-text">Objetivos del Mes</h3>
            </div>
            <div className="space-y-4">
              {/* Animales listos para vender */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-rural-text/60 text-sm">Listos para vender:</span>
                  <span className="font-semibold text-rural-text">
                    {stats.totalAnimalesEnCampo - stats.animalesCriticos} / 60
                  </span>
                </div>
                <div className="w-full bg-rural-alternate/30 rounded-full h-3">
                  <div 
                    className="h-full bg-rural-primary rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${Math.min(((stats.totalAnimalesEnCampo - stats.animalesCriticos) / 60) * 100, 100)}%` 
                    }} 
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-rural-text/60 mt-1">
                  <span>Estado óptimo</span>
                  <span>{Math.round(((stats.totalAnimalesEnCampo - stats.animalesCriticos) / 60) * 100)}% completado</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats mensuales */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-rural-text">Este Mes</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-rural-text/60">Compras:</span>
                <span className="font-semibold text-rural-text">{ultimasCompras.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rural-text/60">Ventas:</span>
                <span className="font-semibold text-rural-text">{ultimasVentas.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rural-text/60">Eventos:</span>
                <span className="font-semibold text-rural-text">{ultimosEventos.length}</span>
              </div>
              <div className="pt-2 border-t border-rural-alternate/30">
                <div className="flex justify-between">
                  <span className="text-rural-text/60">Rotación:</span>
                  <span className="font-semibold text-rural-text">
                    {stats.totalAnimalesVendidos > 0 && stats.totalAnimalesEnCampo > 0 
                      ? `${Math.round((stats.totalAnimalesVendidos / (stats.totalAnimalesVendidos + stats.totalAnimalesEnCampo)) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rendimiento general */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-rural-text">Rendimiento</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-rural-text/60">Stock total:</span>
                <span className="font-semibold text-rural-text">{stats.totalAnimalesEnCampo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rural-text/60">Categorías:</span>
                <span className="font-semibold text-rural-text">{categorias.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rural-text/60">Estado:</span>
                <span className={`font-semibold ${stats.animalesCriticos === 0 ? 'text-green-600' : 'text-rural-alert'}`}>
                  {stats.animalesCriticos === 0 ? 'Óptimo' : 'Revisar'}
                </span>
              </div>
              <div className="pt-2 border-t border-rural-alternate/30">
                <div className="flex justify-between">
                  <span className="text-rural-text/60">Eficiencia:</span>
                  <span className={`font-semibold ${stats.animalesCriticos === 0 ? 'text-green-600' : 'text-rural-alert'}`}>
                    {stats.animalesCriticos === 0 ? '100%' : 'Mejorable'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;