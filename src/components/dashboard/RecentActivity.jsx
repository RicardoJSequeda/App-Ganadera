import { motion } from 'framer-motion';
import { Clock, Package, DollarSign, TrendingUp, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentActivity = ({ compras, ventas, eventos }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
    return d.toLocaleDateString('es-AR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Combinar todas las actividades y ordenarlas por fecha
  const allActivities = [
    ...compras.map(compra => ({
      type: 'compra',
      id: compra.id,
      title: 'Nueva compra registrada',
      description: `${compra.proveedor?.nombre || 'Proveedor'} - ${formatCurrency(compra.precio_total)}`,
      date: compra.fecha,
      icon: Package,
      color: 'text-rural-primary',
      bgColor: 'bg-rural-primary/10'
    })),
    ...ventas.map(venta => ({
      type: 'venta',
      id: venta.id,
      title: 'Venta completada',
      description: `${venta.comprador?.nombre || 'Comprador'} - ${venta.tipo} - ${formatCurrency(venta.precio_kilo)}/kg`,
      date: venta.fecha,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    })),
    ...eventos.map(evento => ({
      type: 'evento',
      id: evento.id,
      title: 'Evento sanitario',
      description: `${evento.tipo} - ${evento.animal?.numero_caravana ? `Caravana ${evento.animal.numero_caravana}` : 'Animal'}`,
      date: evento.fecha,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'compra':
        navigate('/compras');
        break;
      case 'venta':
        navigate('/ventas');
        break;
      case 'evento':
        navigate('/sanidad');
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-rural-text">Actividad Reciente</h2>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-rural-primary" />
          <span className="text-sm text-rural-text/60">Últimas actualizaciones</span>
        </div>
      </div>

      {allActivities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-rural-primary/40 mx-auto mb-3" />
          <p className="text-rural-text/60">No hay actividad reciente</p>
          <p className="text-rural-text/40 text-sm">Las nuevas operaciones aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={`${activity.type}-${activity.id}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                onClick={() => handleActivityClick(activity)}
                className="flex items-center space-x-4 p-4 bg-rural-background rounded-xl hover:bg-rural-alternate/30 transition-all cursor-pointer group"
              >
                <div className={`p-2 rounded-lg ${activity.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-rural-text group-hover:text-rural-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-sm text-rural-text/60 truncate">
                    {activity.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-rural-text/50">
                  <span>{formatDate(activity.date)}</span>
                  <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {allActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-rural-alternate/30 text-center"
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm text-rural-primary hover:text-rural-primary/80 font-medium transition-colors"
          >
            Ver toda la actividad
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentActivity;
