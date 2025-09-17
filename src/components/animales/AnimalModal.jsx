import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Edit,
  Save,
  Calendar,
  Weight,
  Tag,
  TrendingUp,
  User,
  Truck,
  Package,
  Activity,
  FileText,
  Camera,
  MapPin,
  DollarSign,
  Scale
} from 'lucide-react';
import useAnimalesStore from '../../store/animalesStore';
import PesadasHistory from '../PesadasHistory';
import HistorialSanitario from '../sanidad/HistorialSanitario';
import AnimalPhotoGallery from './AnimalPhotoGallery';

const AnimalModal = ({ animal, onClose }) => {
  const {
    updateAnimal,
    loading
  } = useAnimalesStore();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    numero_caravana: '',
    color_caravana: '',
    categoria: '',
    peso_ingreso: '',
    estado_fisico: '',
    observaciones: ''
  });

  useEffect(() => {
    if (animal) {
      setFormData({
        numero_caravana: animal.numero_caravana || '',
        color_caravana: animal.color_caravana || '',
        categoria: animal.categoria || '',
        peso_ingreso: animal.peso_ingreso || '',
        estado_fisico: animal.estado_fisico || '',
        observaciones: animal.observaciones || ''
      });
    }
  }, [animal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateAnimal(animal.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar animal:', error);
    }
  };

  const getEstadoFisicoColor = (estado) => {
    const colors = {
      'excelente': 'bg-green-100 text-green-800 border-green-200',
      'bueno': 'bg-blue-100 text-blue-800 border-blue-200',
      'malo': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'critico': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const calcularDiasEnCampo = (fechaIngreso) => {
    const fecha = new Date(fechaIngreso);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: FileText },
    { id: 'pesadas', label: 'Pesadas', icon: Scale },
    { id: 'sanidad', label: 'Historial Sanitario', icon: Activity },
    { id: 'documentos', label: 'Fotos', icon: Camera }
  ];

  if (!animal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-rural-card rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-rural-alternate/30">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: animal.color_caravana }}
                  title={`Color: ${animal.color_caravana}`}
                ></div>
                <div className="p-2 bg-rural-primary/10 rounded-xl">
                  <Tag className="h-6 w-6 text-rural-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-rural-text">
                  Caravana #{animal.numero_caravana}
                </h2>
                <p className="text-rural-text/60">
                  {animal.categoria} • {calcularDiasEnCampo(animal.fecha_ingreso)} días en campo
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-rural-text/60 hover:text-rural-text hover:bg-rural-background rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-rural-alternate/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-rural-primary text-rural-primary bg-rural-primary/5'
                      : 'border-transparent text-rural-text/60 hover:text-rural-text hover:bg-rural-background/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Tab: Información General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-rural-text mb-2">
                          Número de caravana
                        </label>
                        <input
                          type="text"
                          value={formData.numero_caravana}
                          onChange={(e) => setFormData({ ...formData, numero_caravana: e.target.value })}
                          className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rural-text mb-2">
                          Color de caravana
                        </label>
                        <select
                          value={formData.color_caravana}
                          onChange={(e) => setFormData({ ...formData, color_caravana: e.target.value })}
                          className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                        >
                          <option value="amarillo">Amarillo</option>
                          <option value="azul">Azul</option>
                          <option value="rojo">Rojo</option>
                          <option value="verde">Verde</option>
                          <option value="blanco">Blanco</option>
                          <option value="negro">Negro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rural-text mb-2">
                          Categoría
                        </label>
                        <select
                          value={formData.categoria}
                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                          className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                        >
                          <option value="ternero">Ternero</option>
                          <option value="ternera">Ternera</option>
                          <option value="novillo">Novillo</option>
                          <option value="vaca">Vaca</option>
                          <option value="toro">Toro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rural-text mb-2">
                          Peso de ingreso (kg)
                        </label>
                        <input
                          type="number"
                          value={formData.peso_ingreso}
                          onChange={(e) => setFormData({ ...formData, peso_ingreso: e.target.value })}
                          className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-rural-text mb-2">
                          Estado físico
                        </label>
                        <select
                          value={formData.estado_fisico}
                          onChange={(e) => setFormData({ ...formData, estado_fisico: e.target.value })}
                          className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all"
                        >
                          <option value="excelente">Excelente</option>
                          <option value="bueno">Bueno</option>
                          <option value="malo">Malo</option>
                          <option value="critico">Crítico</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-rural-text mb-2">
                          Observaciones
                        </label>
                        <textarea
                          value={formData.observaciones}
                          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-rural-alternate/50 rounded-xl bg-rural-background focus:border-rural-primary focus:ring-2 focus:ring-rural-primary/20 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-rural-text hover:bg-rural-alternate rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>Guardar cambios</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información básica */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-rural-text">Información Básica</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Tag className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Caravana</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: animal.color_caravana }}
                            ></div>
                            <span className="font-semibold text-rural-text">#{animal.numero_caravana}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <span className="text-rural-text/60">Categoría</span>
                          <span className="font-semibold text-rural-text">{animal.categoria}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Weight className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Peso ingreso</span>
                          </div>
                          <span className="font-semibold text-rural-text">{formatPeso(animal.peso_ingreso)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Estado físico</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoFisicoColor(animal.estado_fisico)}`}>
                            {animal.estado_fisico}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Fecha ingreso</span>
                          </div>
                          <span className="font-semibold text-rural-text">{formatDate(animal.fecha_ingreso)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Precio/kg</span>
                          </div>
                          <span className="font-semibold text-rural-text">{formatPrecio(animal.precio_compra)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Información de origen */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-rural-text">Origen y Compra</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Proveedor</span>
                          </div>
                          <span className="font-semibold text-rural-text">
                            {animal.proveedores?.nombre || 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Truck className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Transportador</span>
                          </div>
                          <span className="font-semibold text-rural-text">
                            {animal.transportadores?.nombre || 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-rural-primary" />
                            <span className="text-rural-text/60">Lote</span>
                          </div>
                          <span className="font-semibold text-rural-text">
                            {animal.lote_nombre || 'Sin asignar'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
                          <span className="text-rural-text/60">Días en campo</span>
                          <span className="font-semibold text-rural-text">
                            {calcularDiasEnCampo(animal.fecha_ingreso)} días
                          </span>
                        </div>
                      </div>

                      {/* Observaciones */}
                      {animal.observaciones && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-rural-text">Observaciones</h4>
                          <div className="p-3 bg-rural-background rounded-xl">
                            <p className="text-rural-text/80">{animal.observaciones}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Pesadas */}
            {activeTab === 'pesadas' && (
              <PesadasHistory 
                animalId={animal.id} 
                animalData={animal}
              />
            )}

            {/* Tab: Historial Sanitario */}
            {activeTab === 'sanidad' && (
              <HistorialSanitario 
                animalId={animal.id} 
                animalData={animal}
              />
            )}

            {/* Tab: Documentos */}
            {activeTab === 'documentos' && (
              <AnimalPhotoGallery 
                animalId={animal.id}
                animalData={animal}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnimalModal;
