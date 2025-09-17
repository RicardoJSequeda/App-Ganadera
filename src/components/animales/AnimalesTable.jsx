import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye,
  Edit,
  Package,
  CheckSquare,
  Square,
  MoreHorizontal,
  Calendar,
  Tag,
  Weight,
  TrendingUp,
  User,
  Truck,
  Scale,
  Activity,
  Trash2,
  ArrowRightLeft,
  Camera
} from 'lucide-react';
import useAnimalesStore from '../../store/animalesStore';
import AnimalPhotoThumbnail from './AnimalPhotoThumbnail';

const AnimalesTable = ({ animales, visibleColumns, onAnimalClick, onEditAnimal, onAssignLote, onDeleteAnimal }) => {
  const {
    selectedAnimales,
    toggleAnimalSelection,
    selectAllAnimales,
    clearSelection
  } = useAnimalesStore();

  const [sortField, setSortField] = useState('numero_caravana');
  const [sortDirection, setSortDirection] = useState('asc');
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const allSelected = animales.length > 0 && selectedAnimales.length === animales.length;
  const someSelected = selectedAnimales.length > 0 && selectedAnimales.length < animales.length;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAnimales = [...animales].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? aValue - bValue 
      : bValue - aValue;
  });

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllAnimales(animales.map(a => a.id));
    }
  };

  const getEstadoFisicoColor = (estado) => {
    const colors = {
      'excelente': 'bg-green-100 text-green-800',
      'bueno': 'bg-blue-100 text-blue-800',
      'malo': 'bg-yellow-100 text-yellow-800',
      'critico': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getColorCaravana = (colorName) => {
    const colorMap = {
      'rojo': '#EF4444',
      'azul': '#3B82F6', 
      'verde': '#10B981',
      'amarillo': '#F59E0B',
      'naranja': '#F97316',
      'morado': '#8B5CF6',
      'rosa': '#EC4899',
      'negro': '#1F2937',
      'blanco': '#F9FAFB',
      'gris': '#6B7280',
      'cafe': '#92400E',
      'marrón': '#92400E',
      'celeste': '#06B6D4',
      'violeta': '#7C3AED'
    };
    
    if (!colorName) return '#6B7280';
    const normalizedColor = colorName.toLowerCase().trim();
    
    // Si el color está en el mapa, usarlo
    if (colorMap[normalizedColor]) {
      return colorMap[normalizedColor];
    }
    
    // Si ya es un color hexadecimal, usarlo directamente
    if (colorName.startsWith('#')) {
      return colorName;
    }
    
    // Si no se encuentra, usar gris por defecto
    return '#6B7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const formatPeso = (peso) => {
    return `${peso} kg`;
  };

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  if (animales.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-rural-primary/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-rural-text mb-2">
          No hay animales registrados
        </h3>
        <p className="text-rural-text/60">
          Registra tu primera compra para ver los animales aquí.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Vista de escritorio/tablet - tabla */}
      <div className="hidden md:block overflow-x-auto table-scroll">
        <table className="w-full">
          <thead className="bg-rural-background/50">
            <tr>
              <th className="p-4 text-left">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-rural-text hover:text-rural-primary"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : someSelected ? (
                    <div className="h-4 w-4 border-2 border-rural-primary bg-rural-primary/50"></div>
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>

            {visibleColumns.foto && (
              <th className="p-4 text-left">
                <div className="flex items-center space-x-1">
                  <Camera className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Foto</span>
                </div>
              </th>
            )}

            {visibleColumns.caravana && (
              <th 
                className="p-4 text-left cursor-pointer hover:bg-rural-alternate/30"
                onClick={() => handleSort('numero_caravana')}
              >
                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Caravana</span>
                </div>
              </th>
            )}

            {visibleColumns.colorCaravana && (
              <th className="p-4 text-left">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span className="font-medium text-rural-text">Color</span>
                </div>
              </th>
            )}

            {visibleColumns.categoria && (
              <th 
                className="p-4 text-left cursor-pointer hover:bg-rural-alternate/30"
                onClick={() => handleSort('categoria')}
              >
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-rural-text">Categoría</span>
                </div>
              </th>
            )}

            {visibleColumns.peso && (
              <th 
                className="p-4 text-left cursor-pointer hover:bg-rural-alternate/30"
                onClick={() => handleSort('peso_ingreso')}
              >
                <div className="flex items-center space-x-1">
                  <Weight className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Peso</span>
                </div>
              </th>
            )}

            {visibleColumns.estadoFisico && (
              <th 
                className="p-4 text-left cursor-pointer hover:bg-rural-alternate/30"
                onClick={() => handleSort('estado_fisico')}
              >
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Estado</span>
                </div>
              </th>
            )}

            {visibleColumns.fechaIngreso && (
              <th 
                className="p-4 text-left cursor-pointer hover:bg-rural-alternate/30"
                onClick={() => handleSort('fecha_ingreso')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Ingreso</span>
                </div>
              </th>
            )}

            {visibleColumns.proveedor && (
              <th className="p-4 text-left">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Proveedor</span>
                </div>
              </th>
            )}

            {visibleColumns.precio && (
              <th 
                className="p-4 text-left cursor-pointer hover:bg-rural-alternate/30"
                onClick={() => handleSort('precio_compra')}
              >
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-rural-text">Precio/kg</span>
                </div>
              </th>
            )}

            {visibleColumns.lote && (
              <th className="p-4 text-left">
                <div className="flex items-center space-x-1">
                  <Package className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Lote</span>
                </div>
              </th>
            )}

            {visibleColumns.compra && (
              <th className="p-4 text-left">
                <div className="flex items-center space-x-1">
                  <Truck className="h-4 w-4" />
                  <span className="font-medium text-rural-text">Compra</span>
                </div>
              </th>
            )}

            <th className="p-4 text-left">
              <span className="font-medium text-rural-text">Acciones</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedAnimales.map((animal, index) => (
            <motion.tr
              key={animal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-b border-rural-alternate/30 hover:bg-rural-background/30 transition-colors"
            >
              <td className="p-4">
                <button
                  onClick={() => toggleAnimalSelection(animal.id)}
                  className="text-rural-text hover:text-rural-primary"
                >
                  {selectedAnimales.includes(animal.id) ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </td>

              {visibleColumns.foto && (
                <td className="p-4">
                  <AnimalPhotoThumbnail 
                    animalId={animal.id}
                    animalData={animal}
                    size="medium"
                  />
                </td>
              )}

              {visibleColumns.caravana && (
                <td className="p-4">
                  <span className="font-medium text-rural-text">
                    {animal.numero_caravana || 'S/N'}
                  </span>
                </td>
              )}

              {visibleColumns.colorCaravana && (
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-lg ring-1 ring-gray-200 color-caravana-circle"
                      style={{ backgroundColor: getColorCaravana(animal.color_caravana) }}
                      title={`Color: ${animal.color_caravana || 'Sin color'}`}
                    ></div>
                    <span className="text-sm text-rural-text capitalize font-medium">
                      {animal.color_caravana || 'Sin color'}
                    </span>
                  </div>
                </td>
              )}

              {visibleColumns.categoria && (
                <td className="p-4">
                  <span className="text-rural-text">{animal.categoria}</span>
                </td>
              )}

              {visibleColumns.peso && (
                <td className="p-4">
                  <span className="text-rural-text font-medium">
                    {formatPeso(animal.peso_ingreso)}
                  </span>
                </td>
              )}

              {visibleColumns.estadoFisico && (
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoFisicoColor(animal.estado_fisico)}`}>
                    {animal.estado_fisico}
                  </span>
                </td>
              )}

              {visibleColumns.fechaIngreso && (
                <td className="p-4">
                  <span className="text-rural-text">
                    {formatDate(animal.fecha_ingreso)}
                  </span>
                </td>
              )}

              {visibleColumns.proveedor && (
                <td className="p-4">
                  <span className="text-rural-text">
                    {animal.proveedores?.nombre || 'N/A'}
                  </span>
                </td>
              )}

              {visibleColumns.precio && (
                <td className="p-4">
                  <span className="text-rural-text font-medium">
                    {formatPrecio(animal.precio_compra)}
                  </span>
                </td>
              )}

              {visibleColumns.lote && (
                <td className="p-4">
                  {animal.lote_nombre ? (
                    <span className="px-2 py-1 bg-rural-primary/10 text-rural-primary text-xs font-medium rounded-full">
                      {animal.lote_nombre}
                    </span>
                  ) : (
                    <span className="text-rural-text/40 text-sm">Sin lote</span>
                  )}
                </td>
              )}

              {visibleColumns.compra && (
                <td className="p-4">
                  {animal.compras ? (
                    <div className="flex flex-col">
                      <span className="text-rural-text text-sm font-medium">
                        {formatDate(animal.compras.fecha)}
                      </span>
                      <span className="text-rural-text/60 text-xs">
                        {animal.compras.lugar_origen}
                      </span>
                    </div>
                  ) : (
                    <span className="text-rural-text/40 text-sm">Sin compra</span>
                  )}
                </td>
              )}

              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAnimalClick(animal)}
                    className="p-2 text-rural-text hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === animal.id ? null : animal.id)}
                      className="p-2 text-rural-text hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
                      title="Más opciones"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {dropdownOpen === animal.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEditAnimal && onEditAnimal(animal);
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar Animal
                          </button>
                          
                          <button
                            onClick={() => {
                              onAnimalClick(animal, 'pesadas');
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Scale className="h-4 w-4" />
                            Historial de Pesadas
                          </button>
                          
                          <button
                            onClick={() => {
                              onAnimalClick(animal, 'sanidad');
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Activity className="h-4 w-4" />
                            Historial Sanitario
                          </button>
                          
                          <button
                            onClick={() => {
                              onAssignLote && onAssignLote(animal);
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                            Asignar a Lote
                          </button>
                          
                          <hr className="my-1" />
                          
                          <button
                            onClick={() => {
                              onDeleteAnimal && onDeleteAnimal(animal);
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Vista móvil - tarjetas */}
    <div className="md:hidden">
      {/* Controles de selección móvil */}
      <div className="p-4 border-b border-rural-alternate/30 bg-rural-background/50">
        <button
          onClick={handleSelectAll}
          className="flex items-center space-x-2 text-rural-text hover:text-rural-primary"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : someSelected ? (
            <div className="h-4 w-4 border-2 border-rural-primary bg-rural-primary/50"></div>
          ) : (
            <Square className="h-4 w-4" />
          )}
          <span className="text-sm">
            {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </span>
        </button>
      </div>

      {/* Lista de tarjetas para móvil */}
      <div className="divide-y divide-rural-alternate/30">
        {sortedAnimales.map((animal, index) => (
          <motion.div
            key={animal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 hover:bg-rural-background/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              {/* Información principal */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => toggleAnimalSelection(animal.id)}
                    className="text-rural-text hover:text-rural-primary"
                  >
                    {selectedAnimales.includes(animal.id) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  {visibleColumns.foto && (
                    <AnimalPhotoThumbnail 
                      animalId={animal.id}
                      animalData={animal}
                      size="small"
                    />
                  )}
                  
                  {visibleColumns.caravana && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-rural-primary" />
                      <span className="font-bold text-rural-text">
                        {animal.numero_caravana}
                      </span>
                    </div>
                  )}

                  {visibleColumns.colorCaravana && animal.color_caravana && (
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: getColorCaravana(animal.color_caravana) }}
                      title={animal.color_caravana}
                    />
                  )}
                </div>

                {/* Información secundaria */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {visibleColumns.categoria && (
                    <div className="flex items-center space-x-1">
                      <span className="text-rural-text/60">Categoría:</span>
                      <span className="text-rural-text">{animal.categoria}</span>
                    </div>
                  )}

                  {visibleColumns.peso && (
                    <div className="flex items-center space-x-1">
                      <Weight className="h-3 w-3 text-rural-primary" />
                      <span className="text-rural-text">{formatPeso(animal.peso_ingreso)}</span>
                    </div>
                  )}

                  {visibleColumns.estadoFisico && (
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEstadoFisicoColor(animal.estado_fisico)}`}>
                        {animal.estado_fisico}
                      </span>
                    </div>
                  )}

                  {visibleColumns.observaciones && animal.observaciones && (
                    <div className="col-span-2">
                      <span className="text-rural-text/60 text-xs">Observaciones:</span>
                      <p className="text-rural-text text-xs mt-1">{animal.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onAnimalClick?.(animal)}
                  className="p-2 text-rural-text/60 hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === animal.id ? null : animal.id)}
                    className="p-2 text-rural-text/60 hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {dropdownOpen === animal.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-rural-alternate/30 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onEditAnimal?.(animal);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-rural-text hover:bg-rural-background flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            onAssignLote?.(animal);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-rural-text hover:bg-rural-background flex items-center gap-2"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                          Cambiar lote
                        </button>
                        <button
                          onClick={() => {
                            onDeleteAnimal?.(animal);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </>
  );
};

export default AnimalesTable;
