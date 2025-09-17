import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Calendar,
  Tag,
  Weight,
  TrendingUp,
  User,
  Package,
  X,
  RotateCcw
} from 'lucide-react';
import useAnimalesStore from '../../store/animalesStore';

const AnimalesFilters = () => {
  const {
    filters,
    updateFilters,
    clearFilters,
    proveedores,
    lotes
  } = useAnimalesStore();

  const estadosFisicos = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'malo', label: 'Malo' },
    { value: 'critico', label: 'Crítico' }
  ];

  const coloresCaravana = [
    { value: 'amarillo', label: 'Amarillo' },
    { value: 'azul', label: 'Azul' },
    { value: 'rojo', label: 'Rojo' },
    { value: 'verde', label: 'Verde' },
    { value: 'blanco', label: 'Blanco' },
    { value: 'negro', label: 'Negro' }
  ];

  const categorias = [
    { value: 'ternero', label: 'Ternero' },
    { value: 'ternera', label: 'Ternera' },
    { value: 'novillo', label: 'Novillo' },
    { value: 'vaca', label: 'Vaca' },
    { value: 'toro', label: 'Toro' }
  ];

  const handleInputChange = (field, value) => {
    updateFilters({ [field]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && (typeof value === 'string' ? value.trim() : true)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-rural-primary" />
          <h3 className="text-lg font-semibold text-rural-text">Filtros de Búsqueda</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-rural-text/60 hover:text-rural-text hover:bg-rural-background rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Búsqueda general */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Search className="h-4 w-4" />
            <span>Búsqueda general</span>
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Número de caravana, categoría..."
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          />
        </div>

        {/* Número de caravana */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Tag className="h-4 w-4" />
            <span>Número de caravana</span>
          </label>
          <input
            type="text"
            value={filters.numero_caravana || ''}
            onChange={(e) => handleInputChange('numero_caravana', e.target.value)}
            placeholder="Ejemplo: 1234"
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          />
        </div>

        {/* Color de caravana */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500"></div>
            <span>Color de caravana</span>
          </label>
          <select
            value={filters.color_caravana || ''}
            onChange={(e) => handleInputChange('color_caravana', e.target.value)}
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          >
            <option value="">Todos los colores</option>
            {coloresCaravana.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Package className="h-4 w-4" />
            <span>Categoría</span>
          </label>
          <select
            value={filters.categoria || ''}
            onChange={(e) => handleInputChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.value} value={categoria.value}>
                {categoria.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado físico */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <TrendingUp className="h-4 w-4" />
            <span>Estado físico</span>
          </label>
          <select
            value={filters.estado_fisico || ''}
            onChange={(e) => handleInputChange('estado_fisico', e.target.value)}
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          >
            <option value="">Todos los estados</option>
            {estadosFisicos.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <User className="h-4 w-4" />
            <span>Proveedor</span>
          </label>
          <select
            value={filters.proveedor_id || ''}
            onChange={(e) => handleInputChange('proveedor_id', e.target.value)}
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Lote */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Package className="h-4 w-4" />
            <span>Lote</span>
          </label>
          <select
            value={filters.lote_id || ''}
            onChange={(e) => handleInputChange('lote_id', e.target.value)}
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          >
            <option value="">Todos los lotes</option>
            <option value="sin_lote">Sin lote asignado</option>
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Calendar className="h-4 w-4" />
            <span>Fecha desde</span>
          </label>
          <input
            type="date"
            value={filters.fecha_desde || ''}
            onChange={(e) => handleInputChange('fecha_desde', e.target.value)}
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          />
        </div>

        {/* Fecha hasta */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Calendar className="h-4 w-4" />
            <span>Fecha hasta</span>
          </label>
          <input
            type="date"
            value={filters.fecha_hasta || ''}
            onChange={(e) => handleInputChange('fecha_hasta', e.target.value)}
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          />
        </div>

        {/* Peso mínimo */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Weight className="h-4 w-4" />
            <span>Peso mínimo (kg)</span>
          </label>
          <input
            type="number"
            value={filters.peso_min || ''}
            onChange={(e) => handleInputChange('peso_min', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          />
        </div>

        {/* Peso máximo */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-rural-text">
            <Weight className="h-4 w-4" />
            <span>Peso máximo (kg)</span>
          </label>
          <input
            type="number"
            value={filters.peso_max || ''}
            onChange={(e) => handleInputChange('peso_max', e.target.value)}
            placeholder="999"
            min="0"
            className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-rural-alternate/30">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="h-4 w-4 text-rural-primary" />
            <span className="text-sm font-medium text-rural-text">Filtros activos:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (typeof value === 'string' && !value.trim())) return null;
              
              let label = key;
              let displayValue = value;

              // Personalizar etiquetas
              switch (key) {
                case 'search':
                  label = 'Búsqueda';
                  break;
                case 'numero_caravana':
                  label = 'Caravana';
                  break;
                case 'color_caravana':
                  label = 'Color';
                  break;
                case 'estado_fisico':
                  label = 'Estado';
                  break;
                case 'proveedor_id':
                  label = 'Proveedor';
                  displayValue = proveedores.find(p => p.id === value)?.nombre || value;
                  break;
                case 'lote_id':
                  label = 'Lote';
                  if (value === 'sin_lote') {
                    displayValue = 'Sin lote';
                  } else {
                    displayValue = lotes.find(l => l.id === value)?.nombre || value;
                  }
                  break;
                case 'fecha_desde':
                  label = 'Desde';
                  displayValue = new Date(value).toLocaleDateString('es-AR');
                  break;
                case 'fecha_hasta':
                  label = 'Hasta';
                  displayValue = new Date(value).toLocaleDateString('es-AR');
                  break;
                case 'peso_min':
                  label = 'Peso mín.';
                  displayValue = `${value} kg`;
                  break;
                case 'peso_max':
                  label = 'Peso máx.';
                  displayValue = `${value} kg`;
                  break;
              }

              return (
                <div
                  key={key}
                  className="flex items-center space-x-1 px-3 py-1 bg-rural-primary/10 text-rural-primary text-sm rounded-full"
                >
                  <span className="font-medium">{label}:</span>
                  <span>{displayValue}</span>
                  <button
                    onClick={() => handleInputChange(key, '')}
                    className="ml-1 hover:text-rural-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AnimalesFilters;
