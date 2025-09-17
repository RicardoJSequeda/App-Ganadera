import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useAnimalPhotos = (animalId) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Cargar fotos del animal
  const loadPhotos = async () => {
    if (!animalId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('animal_photos')
        .select('*')
        .eq('animal_id', animalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPhotos(data || []);
    } catch (err) {
      console.error('Error cargando fotos:', err);
      setError('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  // Subir nueva foto
  const uploadPhoto = async (file, description = '') => {
    if (!animalId) return null;
    
    setUploading(true);
    setError(null);
    
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${animalId}_${Date.now()}.${fileExt}`;
      const filePath = `animal-photos/${fileName}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('animal-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(filePath);

      // Guardar referencia en la base de datos
      const { data, error: dbError } = await supabase
        .from('animal_photos')
        .insert({
          animal_id: animalId,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          description: description
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Actualizar lista local
      setPhotos(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error subiendo foto:', err);
      setError('Error al subir la foto');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Eliminar foto
  const deletePhoto = async (photoId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener información de la foto
      const photo = photos.find(p => p.id === photoId);
      if (!photo) throw new Error('Foto no encontrada');

      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('animal-photos')
        .remove([photo.file_path]);

      if (storageError) {
        console.warn('Error eliminando archivo del storage:', storageError);
      }

      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from('animal_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Actualizar lista local
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      
    } catch (err) {
      console.error('Error eliminando foto:', err);
      setError('Error al eliminar la foto');
    } finally {
      setLoading(false);
    }
  };

  // Cargar fotos cuando cambie el animalId
  useEffect(() => {
    loadPhotos();
  }, [animalId]);

  return {
    photos,
    loading,
    error,
    uploading,
    uploadPhoto,
    deletePhoto,
    loadPhotos
  };
};
