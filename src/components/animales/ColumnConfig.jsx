import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, EyeOff, Check } from 'lucide-react';
import useAnimalesStore from '../../store/animalesStore';

const ColumnConfig = ({ isOpen, onClose }) => {
  const { visibleColumns, toggleColumnVisibility } = useAnimalesStore();

  const columns = [
    { key: 'foto', label: 'Foto', description: 'Foto del animal' },
    { key: 'caravana', label: 'Caravana', description: 'Número de caravana' },
    { key: 'colorCaravana', label: 'Color Caravana', description: 'Color de la caravana' },
    { key: 'categoria', label: 'Categoría', description: 'Tipo de animal' },
    { key: 'peso', label: 'Peso', description: 'Peso de ingreso' },
    { key: 'estadoFisico', label: 'Estado Físico', description: 'Condición del animal' },
    { key: 'fechaIngreso', label: 'Fecha Ingreso', description: 'Fecha de ingreso al campo' },
    { key: 'proveedor', label: 'Proveedor', description: 'Proveedor de origen' },
    { key: 'precio', label: 'Precio/kg', description: 'Precio de compra por kilogramo' },
    { key: 'lote', label: 'Lote', description: 'Lote asignado' },
    { key: 'compra', label: 'Compra', description: 'Información de compra' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-6">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative bg-rural-card rounded-2xl shadow-xl w-80 border border-rural-alternate/50"
        >
          {/* Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-rural-alternate/30">
            <div className="p-2 bg-rural-primary/10 rounded-lg">
              <Settings className="h-5 w-5 text-rural-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-rural-text">Configurar Columnas</h3>
              <p className="text-sm text-rural-text/60">Mostrar u ocultar columnas</p>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto table-scroll">
            <div className="p-4 space-y-3">
              {columns.map((column) => (
                <motion.div
                  key={column.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: columns.indexOf(column) * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-rural-background/50 transition-colors"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-rural-text">{column.label}</span>
                      {visibleColumns[column.key] && (
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-rural-text/60">{column.description}</p>
                  </div>

                  <button
                    onClick={() => toggleColumnVisibility(column.key)}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      visibleColumns[column.key]
                        ? 'text-rural-primary hover:bg-rural-primary/10'
                        : 'text-rural-text/40 hover:bg-rural-background'
                    }`}
                    title={visibleColumns[column.key] ? 'Ocultar columna' : 'Mostrar columna'}
                  >
                    {visibleColumns[column.key] ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-rural-alternate/30">
            <p className="text-xs text-rural-text/60 text-center">
              {Object.values(visibleColumns).filter(Boolean).length} de {columns.length} columnas visibles
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ColumnConfig;
