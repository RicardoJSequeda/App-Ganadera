import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todas las compras con datos relacionados
  const fetchCompras = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compras')
        .select(`
          *,
          proveedores (id, nombre, cuit),
          transportadores (id, nombre),
          usuarios (id, nombre)
        `)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setCompras(data || []);
    } catch (error) {
      console.error('Error fetching compras:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva compra
  const createCompra = async (compraData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('compras')
        .insert([{
          ...compraData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCompras(); // Recargar lista
      return { data, error: null };
    } catch (error) {
      console.error('Error creating compra:', error);
      return { data: null, error: error.message };
    }
  };

  // Obtener animales de una compra específica
  const getAnimalesByCompra = async (compraId) => {
    try {
      const { data, error } = await supabase
        .from('animales')
        .select('*')
        .eq('compra_id', compraId)
        .order('numero_caravana');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching animales by compra:', error);
      return { data: [], error: error.message };
    }
  };

  // Eliminar compra
  const deleteCompra = async (compraId) => {
    try {
      const { error } = await supabase
        .from('compras')
        .delete()
        .eq('id', compraId);

      if (error) throw error;
      
      await fetchCompras(); // Recargar lista
      return { error: null };
    } catch (error) {
      console.error('Error deleting compra:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  return {
    compras,
    loading,
    error,
    fetchCompras,
    createCompra,
    getAnimalesByCompra,
    deleteCompra
  };
};

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProveedor = async (proveedorData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('proveedores')
        .insert([{
          ...proveedorData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchProveedores();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating proveedor:', error);
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  return {
    proveedores,
    loading,
    fetchProveedores,
    createProveedor
  };
};

export const useTransportadores = () => {
  const [transportadores, setTransportadores] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransportadores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transportadores')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setTransportadores(data || []);
    } catch (error) {
      console.error('Error fetching transportadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTransportador = async (transportadorData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('transportadores')
        .insert([{
          ...transportadorData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTransportadores();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating transportador:', error);
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    fetchTransportadores();
  }, []);

  return {
    transportadores,
    loading,
    fetchTransportadores,
    createTransportador
  };
};
