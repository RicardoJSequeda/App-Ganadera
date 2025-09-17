import { motion } from 'framer-motion';

const SimpleChart = ({ data, title, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50">
        <h3 className="text-lg font-semibold text-rural-text mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-rural-text/60">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.cantidad));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-rural-card rounded-2xl p-5 shadow-sm border border-rural-alternate/50"
    >
      <h3 className="text-lg font-semibold text-rural-text mb-4">{title}</h3>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <motion.div
            key={item.nombre}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            className="flex items-center space-x-3"
          >
            <div className="w-16 text-xs font-medium text-rural-text/80 truncate">
              {item.nombre}
            </div>
            
            <div className="flex-1 flex items-center space-x-2">
              <div className="flex-1 bg-rural-alternate/30 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rural-primary to-rural-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.cantidad / maxValue) * 100}%` }}
                  transition={{ delay: 0.2 * index, duration: 0.8, ease: "easeOut" }}
                />
              </div>
              
              <div className="w-6 text-right">
                <motion.span
                  className="text-xs font-semibold text-rural-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 * index }}
                >
                  {item.cantidad}
                </motion.span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 pt-3 border-t border-rural-alternate/30"
      >
        <div className="flex justify-between text-xs">
          <span className="text-rural-text/60">Total categorías:</span>
          <span className="font-semibold text-rural-text">{data.length}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-rural-text/60">Total animales:</span>
          <span className="font-semibold text-rural-text">
            {data.reduce((sum, item) => sum + item.cantidad, 0)}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SimpleChart;
