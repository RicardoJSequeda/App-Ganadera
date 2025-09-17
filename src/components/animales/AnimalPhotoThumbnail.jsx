import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const AnimalPhotoThumbnail = ({ animalId, animalData, size = 'medium' }) => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Tamaños predefinidos
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-6 w-6'
  };

  // Cargar la primera foto del animal
  useEffect(() => {
    const loadFirstPhoto = async () => {
      if (!animalId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const { data, error } = await supabase
          .from('animal_photos')
          .select('file_url, file_name')
          .eq('animal_id', animalId)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          throw error;
        }

        if (data) {
          setPhoto(data);
        }
      } catch (err) {
        console.error('Error cargando foto del animal:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadFirstPhoto();
  }, [animalId]);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-rural-background flex items-center justify-center border border-rural-alternate/30`}>
        <Loader className={`${iconSizes[size]} text-rural-primary animate-spin`} />
      </div>
    );
  }

  // Mostrar foto si existe
  if (photo && !error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-rural-alternate/30 shadow-sm bg-white`}
      >
        <img
          src={photo.file_url}
          alt={`Foto de ${animalData?.numero_caravana || 'animal'}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
      </motion.div>
    );
  }

  // Mostrar placeholder cuando no hay foto
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`${sizeClasses[size]} rounded-lg bg-rural-background flex items-center justify-center border border-rural-alternate/30 shadow-sm`}
      title={animalData?.numero_caravana ? `Sin foto - ${animalData.numero_caravana}` : 'Sin foto'}
    >
      <Camera className={`${iconSizes[size]} text-rural-primary/60`} />
    </motion.div>
  );
};

export default AnimalPhotoThumbnail;
