import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todas las ventas con datos relacionados
  const fetchVentas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          compradores (id, nombre, cuit),
          usuarios (id, nombre)
        `)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setVentas(data || []);
    } catch (error) {
      console.error('Error fetching ventas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva venta con detalle
  const createVenta = async (ventaData, animalesVendidos) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calcular totales automáticamente
      const peso_total = animalesVendidos.reduce((suma, animal) => {
        const peso = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0;
        return suma + peso;
      }, 0);

      const total_animales = animalesVendidos.length;

      // Calcular valor total basado en precios por categoría
      const valor_total = animalesVendidos.reduce((suma, animal) => {
        const peso = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0;
        const precioCategoria = parseFloat(ventaData.precios_categoria?.[animal.categoria] || 0);
        return suma + (peso * precioCategoria);
      }, 0);

      // Calcular precio promedio ponderado para compatibilidad con precio_kilo
      const precio_kilo = peso_total > 0 ? valor_total / peso_total : 0;

      // Construir objeto de nueva venta con todos los campos calculados
      const nuevaVenta = {
        fecha: ventaData.fecha,
        tipo: ventaData.tipo,
        comprador_id: ventaData.comprador_id,
        documentos: ventaData.documentos,
        observaciones: ventaData.observaciones,
        precios_categoria: ventaData.precios_categoria,
        peso_total: peso_total,
        total_animales: total_animales,
        valor_total: valor_total,
        precio_kilo: precio_kilo, // Agregado para compatibilidad
        created_by: user?.id
      };
      
      // Crear la venta con todos los datos calculados
      const { data: ventaCreada, error: errorVenta } = await supabase
        .from('ventas')
        .insert([nuevaVenta])
        .select()
        .single();

      if (errorVenta) throw errorVenta;

      // Crear los detalles de venta con precios calculados por categoría
      const detallesVenta = animalesVendidos.map(animal => {
        const peso = parseFloat(animal.peso_salida) || parseFloat(animal.peso_ingreso) || 0;
        const precioCategoria = parseFloat(ventaData.precios_categoria?.[animal.categoria] || 0);
        const precioFinal = peso * precioCategoria;
        
        return {
          venta_id: ventaCreada.id,
          animal_id: animal.id,
          peso_salida: peso,
          precio_final: precioFinal,
          created_by: user?.id
        };
      });

      const { error: errorDetalles } = await supabase
        .from('detalle_venta')
        .insert(detallesVenta);

      if (errorDetalles) throw errorDetalles;

      // Actualizar el estado de los animales a "vendido"
      const animalesIds = animalesVendidos.map(animal => animal.id);
      const { error: errorAnimales } = await supabase
        .from('animales')
        .update({ estado: 'vendido' })
        .in('id', animalesIds);

      if (errorAnimales) throw errorAnimales;

      await fetchVentas(); // Recargar lista
      return { data: ventaCreada, error: null };
    } catch (error) {
      console.error('Error creating venta:', error);
      return { data: null, error: error.message };
    }
  };

  // Obtener detalle de venta con animales
  const getDetalleVenta = async (ventaId) => {
    try {
      const { data, error } = await supabase
        .from('detalle_venta')
        .select(`
          *,
          animales (
            id,
            numero_caravana,
            color_caravana,
            categoria,
            peso_ingreso,
            estado_fisico,
            proveedores (nombre),
            compras (fecha, lugar_origen)
          )
        `)
        .eq('venta_id', ventaId)
        .order('created_at');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching detalle venta:', error);
      return { data: [], error: error.message };
    }
  };

  // Eliminar venta (y revertir estado de animales)
  const deleteVenta = async (ventaId) => {
    try {
      // Primero obtener los animales de la venta
      const { data: detalles } = await supabase
        .from('detalle_venta')
        .select('animal_id')
        .eq('venta_id', ventaId);

      if (detalles && detalles.length > 0) {
        const animalesIds = detalles.map(d => d.animal_id);
        
        // Revertir estado de animales a "en_campo"
        const { error: errorAnimales } = await supabase
          .from('animales')
          .update({ estado: 'en_campo' })
          .in('id', animalesIds);

        if (errorAnimales) throw errorAnimales;
      }

      // Eliminar detalles de venta
      const { error: errorDetalles } = await supabase
        .from('detalle_venta')
        .delete()
        .eq('venta_id', ventaId);

      if (errorDetalles) throw errorDetalles;

      // Eliminar la venta
      const { error: errorVenta } = await supabase
        .from('ventas')
        .delete()
        .eq('id', ventaId);

      if (errorVenta) throw errorVenta;

      await fetchVentas(); // Recargar lista
      return { error: null };
    } catch (error) {
      console.error('Error deleting venta:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  return {
    ventas,
    loading,
    error,
    fetchVentas,
    createVenta,
    getDetalleVenta,
    deleteVenta
  };
};

export const useCompradores = () => {
  const [compradores, setCompradores] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompradores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compradores')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setCompradores(data || []);
    } catch (error) {
      console.error('Error fetching compradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const createComprador = async (compradorData) => {
    try {
      const { data, error } = await supabase
        .from('compradores')
        .insert([compradorData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCompradores();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating comprador:', error);
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    fetchCompradores();
  }, []);

  return {
    compradores,
    loading,
    fetchCompradores,
    createComprador
  };
};

export const useAnimalesVenta = () => {
  const [animalesDisponibles, setAnimalesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener animales disponibles para venta
  const fetchAnimalesDisponibles = async (filtros = {}) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('animales')
        .select('*')
        .eq('estado', 'en_campo')
        .order('fecha_ingreso', { ascending: false });

      // Aplicar filtros solo si existen
      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busqueda = filtros.busqueda.trim();
        query = query.or(`numero_caravana.ilike.%${busqueda}%,categoria.ilike.%${busqueda}%`);
      }
      
      if (filtros.categoria && filtros.categoria.trim()) {
        query = query.eq('categoria', filtros.categoria);
      }
      
      if (filtros.estado_fisico && filtros.estado_fisico.trim()) {
        query = query.eq('estado_fisico', filtros.estado_fisico);
      }
      
      if (filtros.proveedor_id && filtros.proveedor_id.trim()) {
        query = query.eq('proveedor_id', filtros.proveedor_id);
      }
      
      if (filtros.peso_min && !isNaN(parseFloat(filtros.peso_min))) {
        query = query.gte('peso_ingreso', parseFloat(filtros.peso_min));
      }
      
      if (filtros.peso_max && !isNaN(parseFloat(filtros.peso_max))) {
        query = query.lte('peso_ingreso', parseFloat(filtros.peso_max));
      }
      
      if (filtros.fecha_desde && filtros.fecha_desde.trim()) {
        query = query.gte('fecha_ingreso', filtros.fecha_desde);
      }
      
      if (filtros.fecha_hasta && filtros.fecha_hasta.trim()) {
        query = query.lte('fecha_ingreso', filtros.fecha_hasta);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error en consulta de animales:', error);
        throw error;
      }
      
      // Procesar los datos básicos por ahora
      const animalesConDatos = (data || []).map(animal => ({
        ...animal,
        peso_actual: animal.peso_ingreso // Por ahora usamos peso de ingreso
      }));
      
      setAnimalesDisponibles(animalesConDatos);
      return { data: animalesConDatos, error: null };
    } catch (error) {
      console.error('Error fetching animales disponibles:', error);
      setAnimalesDisponibles([]);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    animalesDisponibles,
    loading,
    fetchAnimalesDisponibles
  };
};

// Hook simplificado para gestión de lotes
export const useLotes = () => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLotes = async () => {
    try {
      setLoading(true);
      
      // Consulta simplificada sin joins complejos
      const { data: lotesData, error } = await supabase
        .from('lotes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      // Para cada lote, contar animales activos de manera simple
      const lotesConConteo = await Promise.all(
        (lotesData || []).map(async (lote) => {
          const { data: animalesActivos, error: errorAnimales } = await supabase
            .from('animal_lote')
            .select(`
              animal_id,
              animales!inner(
                id,
                numero_caravana,
                peso_ingreso,
                categoria,
                estado_fisico,
                estado
              )
            `)
            .eq('lote_id', lote.id)
            .is('fecha_salida', null)
            .eq('animales.estado', 'en_campo');

          if (errorAnimales) {
            console.error('Error fetching animals for lote:', errorAnimales);
            return {
              ...lote,
              animales_activos: [],
              total_animales: 0,
              peso_total: 0,
              peso_promedio: 0,
              distribucion_categorias: {}
            };
          }

          const animales = animalesActivos || [];
          const totalAnimales = animales.length;
          const pesoTotal = animales.reduce((sum, al) => 
            sum + (parseFloat(al.animales?.peso_ingreso) || 0), 0
          );
          const pesoPromedio = totalAnimales > 0 ? pesoTotal / totalAnimales : 0;
          
          const categorias = animales.reduce((acc, al) => {
            const cat = al.animales?.categoria || 'Sin categoría';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {});

          return {
            ...lote,
            animales_activos: animales.map(al => al.animales),
            total_animales: totalAnimales,
            peso_total: pesoTotal,
            peso_promedio: pesoPromedio,
            distribucion_categorias: categorias
          };
        })
      );

      setLotes(lotesConConteo);
      return { data: lotesConConteo, error: null };
    } catch (error) {
      console.error('Error fetching lotes:', error);
      setLotes([]);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotes();
  }, []);

  return {
    lotes,
    loading,
    fetchLotes
  };
};
