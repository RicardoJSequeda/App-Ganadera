import { motion } from 'framer-motion';

const PageHeader = ({ title, description, icon: Icon, actions }) => {
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-4 sm:mb-0">
        {Icon && (
          <div className="p-3 bg-rural-primary/10 rounded-xl">
            <Icon className="h-6 w-6 text-rural-primary" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-rural-text">{title}</h1>
          {description && (
            <p className="text-rural-text/70 mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default PageHeader;
