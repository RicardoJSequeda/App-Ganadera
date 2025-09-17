import { motion } from 'framer-motion';

const KPICard = ({ title, value, subtitle, icon: Icon, color, bgColor, trend, delay = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: delay + 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 } 
      }}
      className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rural-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-rural-text/60 text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <motion.span 
                className="text-3xl font-bold text-rural-text"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.3, duration: 0.4 }}
              >
                {value}
              </motion.span>
              {trend && (
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-rural-text/50 text-xs mt-1">{subtitle}</p>
            )}
          </div>
          
          <motion.div 
            variants={iconVariants}
            className={`p-3 rounded-xl ${bgColor} flex-shrink-0`}
          >
            <Icon className={`h-6 w-6 ${color}`} />
          </motion.div>
        </div>

        {/* Progress bar for certain KPIs */}
        {title.includes('Crítico') && value > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-rural-text/60 mb-1">
              <span>Estado de alerta</span>
              <span>{value > 10 ? 'Alto' : value > 5 ? 'Medio' : 'Bajo'}</span>
            </div>
            <div className="w-full bg-rural-alternate/30 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${value > 10 ? 'bg-red-500' : value > 5 ? 'bg-rural-alert' : 'bg-green-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(value * 10, 100)}%` }}
                transition={{ delay: delay + 0.5, duration: 0.8 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KPICard;
