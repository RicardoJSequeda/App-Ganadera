import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useAnimales = () => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crear múltiples animales
  const createAnimales = async (animalesData) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Agregar created_by a cada animal y limpiar campos problemáticos
      const animalesConUsuario = animalesData.map(animal => {
        // Excluir campos que no deben enviarse a la base de datos
        const { id, ...animalLimpio } = animal;
        
        return {
          ...animalLimpio,
          created_by: user?.id,
          estado: 'en_campo',
          fecha_ingreso: new Date().toISOString().split('T')[0] // Solo fecha, sin tiempo
        };
      });

      const { data, error } = await supabase
        .from('animales')
        .insert(animalesConUsuario)
        .select();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating animales:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Validar caravanas duplicadas
  const validateCaravanas = async (animales) => {
    try {
      const duplicadas = [];
      
      for (const animal of animales) {
        if (animal.numero_caravana && animal.color_caravana) {
          const { data, error } = await supabase
            .from('animales')
            .select('id, numero_caravana, color_caravana')
            .eq('numero_caravana', animal.numero_caravana)
            .eq('color_caravana', animal.color_caravana)
            .eq('estado', 'en_campo');

          if (error) throw error;
          
          if (data && data.length > 0) {
            duplicadas.push({
              numero_caravana: animal.numero_caravana,
              color_caravana: animal.color_caravana
            });
          }
        }
      }
      
      return { duplicadas, error: null };
    } catch (error) {
      console.error('Error validating caravanas:', error);
      return { duplicadas: [], error: error.message };
    }
  };

  // Obtener animales por compra
  const getAnimalesByCompra = async (compraId) => {
    try {
      const { data, error } = await supabase
        .from('animales')
        .select(`
          *,
          proveedores (nombre),
          transportadores (nombre)
        `)
        .eq('compra_id', compraId)
        .order('numero_caravana');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching animales by compra:', error);
      return { data: [], error: error.message };
    }
  };

  return {
    animales,
    loading,
    error,
    createAnimales,
    validateCaravanas,
    getAnimalesByCompra
  };
};
