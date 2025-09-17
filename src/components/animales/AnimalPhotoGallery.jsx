import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  Download, 
  Eye, 
  Trash2, 
  Image as ImageIcon,
  Plus,
  Loader
} from 'lucide-react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';

const AnimalPhotoGallery = ({ animalId, animalData }) => {
  const { photos, loading, error, uploading, uploadPhoto, deletePhoto } = useAnimalPhotos(animalId);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        await uploadPhoto(file, `Foto de ${animalData?.numero_caravana || 'animal'}`);
      }
    }
    
    setShowUploadModal(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de subir */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-rural-text">Galería de Fotos</h3>
          <p className="text-rural-text/60 text-sm">
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} del animal
          </p>
        </div>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
        >
          <Camera className="h-4 w-4" />
          <span>Subir fotos</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Galería de fotos - Layout Pinterest-like */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 text-rural-primary animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-rural-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-rural-primary" />
          </div>
          <h4 className="text-lg font-medium text-rural-text mb-2">No hay fotos</h4>
          <p className="text-rural-text/60 mb-4">Sube fotos del animal para identificarlo mejor</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Subir primera foto</span>
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="break-inside-avoid mb-4 bg-rural-background rounded-xl overflow-hidden shadow-sm border border-rural-alternate/30 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative">
                <img
                  src={photo.file_url}
                  alt={photo.description || `Foto del animal`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* Overlay con información */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-end">
                  <div className="w-full p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">
                      {photo.description || 'Sin descripción'}
                    </p>
                    <p className="text-white/80 text-xs">
                      {formatDate(photo.created_at)}
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(photo.file_url, '_blank');
                      }}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors"
                      title="Ver en nueva ventana"
                    >
                      <Eye className="h-3 w-3 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhoto(photo.id);
                      }}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors"
                      title="Eliminar foto"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información de la foto */}
              <div className="p-3">
                <p className="text-rural-text/80 text-sm truncate">
                  {photo.file_name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-rural-text/60 text-xs">
                    {formatFileSize(photo.file_size)}
                  </span>
                  <span className="text-rural-text/60 text-xs">
                    {formatDate(photo.created_at)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de subida de archivos */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-rural-card rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-rural-text">Subir fotos</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 text-rural-text/60 hover:text-rural-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-rural-primary bg-rural-primary/5' 
                    : 'border-rural-alternate/50 hover:border-rural-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="bg-rural-primary/10 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                    <Upload className="h-8 w-8 text-rural-primary" />
                  </div>
                  
                  <div>
                    <p className="text-rural-text font-medium mb-1">
                      Arrastra las fotos aquí
                    </p>
                    <p className="text-rural-text/60 text-sm">
                      o haz clic para seleccionar archivos
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="photo-upload"
                  />
                  
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Seleccionar fotos</span>
                  </label>
                </div>
              </div>

              {uploading && (
                <div className="mt-4 flex items-center space-x-2 text-rural-primary">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Subiendo fotos...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de vista previa */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.description || 'Foto del animal'}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg">
                <p className="text-white font-medium">
                  {selectedPhoto.description || 'Sin descripción'}
                </p>
                <p className="text-white/80 text-sm">
                  {formatDate(selectedPhoto.created_at)} • {formatFileSize(selectedPhoto.file_size)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimalPhotoGallery;
