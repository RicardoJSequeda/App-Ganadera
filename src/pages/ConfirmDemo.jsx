import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { useConfirm, confirmDelete, confirmAction, confirmSave, confirmNavigation } from '../hooks/useConfirm.jsx';

const ConfirmDemo = () => {
  const { showConfirm, ConfirmComponent } = useConfirm();

  const handleDeleteAnimal = async () => {
    const confirmed = await showConfirm(confirmDelete(
      'animal',
      'Este animal tiene historial sanitario y eventos registrados. ¿Estás seguro que deseas eliminarlo permanentemente?'
    ));
    
    if (confirmed) {
      alert('Animal eliminado (simulación)');
    }
  };

  const handleDeleteLote = async () => {
    const confirmed = await showConfirm(confirmDelete(
      'lote completo',
      'Este lote contiene 25 animales. Al eliminar el lote, todos los animales quedarán sin asignar. Esta acción no se puede deshacer.'
    ));
    
    if (confirmed) {
      alert('Lote eliminado (simulación)');
    }
  };

  const handleSaveChanges = async () => {
    const confirmed = await showConfirm(confirmSave(
      'Se guardarán todos los cambios realizados en el formulario. ¿Deseas continuar?'
    ));
    
    if (confirmed) {
      alert('Cambios guardados (simulación)');
    }
  };

  const handleExportData = async () => {
    const confirmed = await showConfirm(confirmAction(
      'Exportar datos',
      'Se generará un archivo Excel con todos los animales del sistema. Esto puede tomar algunos minutos. ¿Deseas continuar?'
    ));
    
    if (confirmed) {
      alert('Exportación iniciada (simulación)');
    }
  };

  const handleNavigateAway = async () => {
    const confirmed = await showConfirm(confirmNavigation(
      'Has realizado cambios en el formulario que no se han guardado. ¿Estás seguro que deseas salir?'
    ));
    
    if (confirmed) {
      alert('Navegación confirmada (simulación)');
    }
  };

  const handleCustomConfirm = async () => {
    const confirmed = await showConfirm({
      title: 'Confirmar operación especial',
      message: 'Esta es una confirmación personalizada con iconos y colores específicos para una operación especial del sistema.',
      confirmText: 'Sí, ejecutar',
      cancelText: 'No, cancelar',
      type: 'info',
      isDestructive: false,
      icon: RefreshCw
    });
    
    if (confirmed) {
      alert('Operación especial ejecutada (simulación)');
    }
  };

  const handleDangerousAction = async () => {
    const confirmed = await showConfirm({
      title: 'ACCIÓN PELIGROSA',
      message: 'Estás a punto de realizar una acción que puede tener consecuencias irreversibles en todo el sistema. Por favor, confirma que entiendes los riesgos.',
      confirmText: 'SÍ, ENTIENDO LOS RIESGOS',
      cancelText: 'Cancelar',
      type: 'danger',
      isDestructive: true,
      icon: AlertTriangle
    });
    
    if (confirmed) {
      alert('Acción peligrosa ejecutada (simulación)');
    }
  };

  const handleSuccessAction = async () => {
    const confirmed = await showConfirm({
      title: 'Confirmar operación exitosa',
      message: 'La operación se completó correctamente. ¿Deseas proceder con el siguiente paso?',
      confirmText: 'Continuar',
      cancelText: 'Más tarde',
      type: 'success',
      isDestructive: false,
      icon: CheckCircle
    });
    
    if (confirmed) {
      alert('Continuando con siguiente paso (simulación)');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rural-primary/10 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-rural-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-rural-text">Demo - Confirmaciones Personalizadas</h1>
            <p className="text-rural-text/60">Ejemplos de uso del sistema de confirmaciones custom</p>
          </div>
        </div>
      </div>

      {/* Grid de ejemplos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Confirmación de eliminación de animal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-rural-text">Eliminar Animal</h3>
          </div>
          <p className="text-rural-text/60 text-sm mb-4">
            Confirmación destructiva con detalles específicos del animal y su historial.
          </p>
          <button
            onClick={handleDeleteAnimal}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            Probar Eliminación
          </button>
        </motion.div>

        {/* Confirmación de eliminación de lote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-rural-text">Eliminar Lote</h3>
          </div>
          <p className="text-rural-text/60 text-sm mb-4">
            Eliminación de lote completo con advertencia sobre animales contenidos.
          </p>
          <button
            onClick={handleDeleteLote}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            Probar Eliminación
          </button>
        </motion.div>

        {/* Confirmación de guardado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Save className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-rural-text">Guardar Cambios</h3>
          </div>
          <p className="text-rural-text/60 text-sm mb-4">
            Confirmación informativa para guardar cambios en formularios.
          </p>
          <button
            onClick={handleSaveChanges}
            className="w-full bg-rural-primary text-white py-2 px-4 rounded-xl hover:bg-rural-primary/90 transition-colors"
          >
            Probar Guardado
          </button>
        </motion.div>

        {/* Confirmación de exportación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Download className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-rural-text">Exportar Datos</h3>
          </div>
          <p className="text-rural-text/60 text-sm mb-4">
            Advertencia sobre procesos que pueden tomar tiempo.
          </p>
          <button
            onClick={handleExportData}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Probar Exportación
          </button>
        </motion.div>

        {/* Confirmación de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-rural-text">Cambios sin Guardar</h3>
          </div>
          <p className="text-rural-text/60 text-sm mb-4">
            Confirmación antes de navegar con cambios pendientes.
          </p>
          <button
            onClick={handleNavigateAway}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Probar Navegación
          </button>
        </motion.div>

        {/* Confirmación personalizada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-rural-text">Operación Especial</h3>
          </div>
          <p className="text-rural-text/60 text-sm mb-4">
            Confirmación completamente personalizada con icono y textos específicos.
          </p>
          <button
            onClick={handleCustomConfirm}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Probar Personalizada
          </button>
        </motion.div>

        {/* Confirmación peligrosa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-red-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-red-800">Acción Peligrosa</h3>
          </div>
          <p className="text-red-700 text-sm mb-4">
            Confirmación con máximo nivel de advertencia para acciones críticas.
          </p>
          <button
            onClick={handleDangerousAction}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            ⚠️ Probar Peligrosa
          </button>
        </motion.div>

        {/* Confirmación de éxito */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-green-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-800">Operación Exitosa</h3>
          </div>
          <p className="text-green-700 text-sm mb-4">
            Confirmación positiva para continuar con siguiente paso.
          </p>
          <button
            onClick={handleSuccessAction}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition-colors"
          >
            ✅ Probar Éxito
          </button>
        </motion.div>

      </div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-rural-alternate/10 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-rural-text mb-4 flex items-center space-x-2">
          <Info className="h-5 w-5 text-rural-primary" />
          <span>Características del Sistema de Confirmaciones</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-rural-text/80">
          <div className="space-y-2">
            <h4 className="font-medium text-rural-text">✨ Características UX:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Animaciones suaves con framer-motion</li>
              <li>• Fondo difuminado (backdrop-blur)</li>
              <li>• Colores rurales consistentes</li>
              <li>• Responsive design</li>
              <li>• Botones grandes para móvil</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-rural-text">⌨️ Accesibilidad:</h4>
            <ul className="space-y-1 ml-4">
              <li>• ESC para cerrar modal</li>
              <li>• TAB para navegar botones</li>
              <li>• ENTER para confirmar (no destructivo)</li>
              <li>• Click fuera para cerrar</li>
              <li>• Bloqueo de scroll del body</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Modal de confirmación */}
      <ConfirmComponent />
    </div>
  );
};

export default ConfirmDemo;
