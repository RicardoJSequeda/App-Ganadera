import { motion } from 'framer-motion';
import { Plus, ShoppingCart, DollarSign, Activity, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nueva Compra',
      description: 'Registrar compra de animales',
      icon: ShoppingCart,
      color: 'bg-rural-primary hover:bg-rural-primary/90',
      textColor: 'text-white',
      path: '/compras',
      action: 'new'
    },
    {
      label: 'Registrar Venta',
      description: 'Procesar venta de animales',
      icon: DollarSign,
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white',
      path: '/ventas',
      action: 'new'
    },
    {
      label: 'Evento Sanitario',
      description: 'Registrar actividad sanitaria',
      icon: Activity,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      path: '/sanidad',
      action: 'new'
    },
    {
      label: 'Ver Animales',
      description: 'Consultar stock actual',
      icon: Eye,
      color: 'bg-rural-secondary hover:bg-rural-secondary/90',
      textColor: 'text-white',
      path: '/animales',
      action: 'view'
    }
  ];

  const handleActionClick = (action) => {
    navigate(action.path, { state: { action: action.action } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
    >
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="h-5 w-5 text-rural-primary" />
        <h2 className="text-xl font-semibold text-rural-text">Accesos Rápidos</h2>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02, 
                x: 4,
                transition: { duration: 0.2 } 
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action)}
              className={`w-full p-3 rounded-xl transition-all duration-300 ${action.color} ${action.textColor} group relative overflow-hidden`}
            >
              {/* Background animation */}
              <motion.div
                className="absolute inset-0 bg-white/10 rounded-xl"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              
              <div className="relative flex items-center space-x-2">
                <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs opacity-80 hidden md:block">{action.description}</p>
                </div>
                
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/80"
                >
                  <Plus className="h-3 w-3" />
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickActions;
