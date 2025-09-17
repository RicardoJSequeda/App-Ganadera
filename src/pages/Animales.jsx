import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Filter, 
  Download, 
  Settings, 
  Plus, 
  Eye,
  Package,
  Search,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import useAnimalesStore from '../store/animalesStore';
import AnimalesTable from '../components/animales/AnimalesTable';
import AnimalesFilters from '../components/animales/AnimalesFilters';
import AnimalesActions from '../components/animales/AnimalesActions';
import LoteModal from '../components/animales/LoteModal';
import AnimalModal from '../components/animales/AnimalModal';
import ColumnConfig from '../components/animales/ColumnConfig';
import DatabaseDebug from '../components/DatabaseDebug';
import { useConfirm } from '../hooks/useConfirm.jsx';

const Animales = () => {
  const { ConfirmComponent } = useConfirm();
  const {
    animales,
    lotes,
    proveedores,
    loading,
    error,
    selectedAnimales,
    visibleColumns,
    fetchAnimales,
    fetchLotes,
    fetchProveedores,
    clearError,
    clearSelection,
    getFilteredAnimales
  } = useAnimalesStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    fetchAnimales();
    fetchLotes();
    fetchProveedores();
  }, [fetchAnimales, fetchLotes, fetchProveedores]);

  const filteredAnimales = getFilteredAnimales();

  const handleOpenAnimal = (animal) => {
    setSelectedAnimal(animal);
    setShowAnimalModal(true);
  };

  const handleCloseAnimalModal = () => {
    setSelectedAnimal(null);
    setShowAnimalModal(false);
  };

  const handleExportExcel = () => {
    // TODO: Implementar exportación a Excel
    console.log('Exportar a Excel:', filteredAnimales);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Debug component - descomentar si hay problemas con BD */}
      {/* <DatabaseDebug /> */}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rural-primary/10 rounded-xl">
            <FileText className="h-6 w-6 text-rural-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-rural-text">Stock de Animales</h1>
            <p className="text-sm sm:text-base text-rural-text/60">
              {filteredAnimales.length} de {animales.length} animales en campo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-xl transition-colors whitespace-nowrap
              ${showFilters 
                ? 'bg-rural-primary text-white' 
                : 'bg-rural-background text-rural-text hover:bg-rural-alternate'
              }
            `}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          <button
            onClick={() => setShowColumnConfig(!showColumnConfig)}
            className="flex items-center space-x-2 px-3 py-2 bg-rural-background text-rural-text hover:bg-rural-alternate rounded-xl transition-colors whitespace-nowrap"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Columnas</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-3 py-2 bg-rural-background text-rural-text hover:bg-rural-alternate rounded-xl transition-colors whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={() => setShowLoteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors whitespace-nowrap"
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Gestionar Lotes</span>
            <span className="sm:hidden">Lotes</span>
          </button>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between"
        >
          <span className="text-red-600">{error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Selection Info */}
      {selectedAnimales.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium text-sm sm:text-base">
              {selectedAnimales.length} animales seleccionados
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AnimalesActions />
            <button
              onClick={clearSelection}
              className="text-blue-400 hover:text-blue-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimalesFilters />
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-rural-card rounded-2xl shadow-sm border border-rural-alternate/50 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rural-primary"></div>
          </div>
        ) : (
          <AnimalesTable 
            animales={filteredAnimales}
            visibleColumns={visibleColumns}
            onAnimalClick={handleOpenAnimal}
          />
        )}
      </motion.div>

      {/* Modals */}
      {showLoteModal && (
        <LoteModal onClose={() => setShowLoteModal(false)} />
      )}

      {showAnimalModal && selectedAnimal && (
        <AnimalModal 
          animal={selectedAnimal}
          onClose={handleCloseAnimalModal}
        />
      )}

      {/* Column Configuration */}
      <ColumnConfig 
        isOpen={showColumnConfig}
        onClose={() => setShowColumnConfig(false)}
      />
      
      {/* Modal de confirmación */}
      <ConfirmComponent />
    </div>
  );
};

export default Animales;
