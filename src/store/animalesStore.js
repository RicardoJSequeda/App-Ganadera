import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

const useAnimalesStore = create((set, get) => ({
  // Estado
  animales: [],
  lotes: [],
  pesadas: [],
  compras: [],
  proveedores: [],
  transportadores: [],
  eventosSanitarios: [],
  loading: false,
  error: null,
  selectedAnimales: [],
  filters: {},
  visibleColumns: {
    foto: true,
    caravana: true,
    colorCaravana: true,
    categoria: true,
    peso: true,
    estadoFisico: true,
    fechaIngreso: true,
    proveedor: true,
    precio: false,
    lote: true,
    compra: true
  },

  // Funciones para animales
  fetchAnimales: async () => {
    try {
      set({ loading: true, error: null });
      
      // Query simple para animales
      const { data: animalesData, error: animalesError } = await supabase
        .from('animales')
        .select('*')
        .eq('estado', 'en_campo')
        .order('fecha_ingreso', { ascending: false });

      if (animalesError) throw animalesError;

      // Query separado para obtener datos de proveedores
      const { data: proveedoresData } = await supabase
        .from('proveedores')
        .select('id, nombre, contacto');

      // Query separado para obtener datos de transportadores
      const { data: transportadoresData } = await supabase
        .from('transportadores')
        .select('id, nombre, contacto');

      // Query separado para obtener relaciones de lotes activos
      const { data: animalLoteData } = await supabase
        .from('animal_lote')
        .select('animal_id, lote_id, fecha_asignacion, fecha_salida')
        .is('fecha_salida', null);

      // Query separado para obtener datos de lotes
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('id, nombre, numero, color');

      // Procesar datos para incluir relaciones
      const animalesConRelaciones = animalesData?.map(animal => {
        // Buscar proveedor
        const proveedor = proveedoresData?.find(p => p.id === animal.proveedor_id) || null;
        
        // Buscar transportador
        const transportador = transportadoresData?.find(t => t.id === animal.transportador_id) || null;
        
        // Buscar lote actual (solo relaciones activas)
        const loteRelacion = animalLoteData?.find(al => al.animal_id === animal.id);
        const loteActual = loteRelacion ? lotesData?.find(l => l.id === loteRelacion.lote_id) : null;

        return {
          ...animal,
          lote_actual: loteActual,
          lote_nombre: loteActual?.nombre || null,
          proveedores: proveedor,
          transportadores: transportador
        };
      }) || [];

      set({ animales: animalesConRelaciones, loading: false });
    } catch (error) {
      console.error('Error en fetchAnimales:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchAnimalesSinLote: async () => {
    try {
      set({ loading: true, error: null });
      
      // Obtener animales que no tienen relación activa en animal_lote
      const { data: animalesSinLoteData, error: animalesError } = await supabase
        .from('animales')
        .select('*')
        .eq('estado', 'en_campo');

      if (animalesError) throw animalesError;

      // Obtener relaciones activas
      const { data: animalLoteData } = await supabase
        .from('animal_lote')
        .select('animal_id')
        .is('fecha_salida', null);

      // Filtrar animales que no tienen lote activo
      const animalesIds = animalLoteData?.map(al => al.animal_id) || [];
      const animalesSinLote = animalesSinLoteData?.filter(animal => 
        !animalesIds.includes(animal.id)
      ) || [];

      // Obtener datos de proveedores y transportadores
      const { data: proveedoresData } = await supabase
        .from('proveedores')
        .select('id, nombre, contacto');

      const { data: transportadoresData } = await supabase
        .from('transportadores')
        .select('id, nombre, contacto');

      // Combinar datos
      const animalesConDatos = animalesSinLote.map(animal => ({
        ...animal,
        proveedores: proveedoresData?.find(p => p.id === animal.proveedor_id) || null,
        transportadores: transportadoresData?.find(t => t.id === animal.transportador_id) || null
      }));

      set({ animales: animalesConDatos, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateAnimal: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('animales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar en el estado local
      const animales = get().animales.map(animal => 
        animal.id === id ? { ...animal, ...data } : animal
      );
      
      set({ animales, loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Funciones para lotes
  fetchLotes: async () => {
    try {
      set({ loading: true, error: null });
      
      // Query simple para lotes
      const { data: lotesData, error: lotesError } = await supabase
        .from('lotes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (lotesError) throw lotesError;

      // Query separado para contar animales por lote
      const { data: animalLoteData, error: animalLoteError } = await supabase
        .from('animal_lote')
        .select('lote_id, animal_id, fecha_salida')
        .is('fecha_salida', null); // Solo animales activos

      if (animalLoteError) {
        console.warn('No se pudo cargar animal_lote, usando lotes sin conteo:', animalLoteError.message);
      }

      // Procesar para incluir conteo de animales actuales
      const lotesConConteo = lotesData?.map(lote => {
        const animalesEnLote = animalLoteData?.filter(al => al.lote_id === lote.id) || [];
        return {
          ...lote,
          animales_actuales: animalesEnLote,
          total_animales: animalesEnLote.length,
          cantidad_animales: animalesEnLote.length
        };
      }) || [];

      set({ lotes: lotesConConteo, loading: false });
    } catch (error) {
      console.error('Error en fetchLotes:', error);
      set({ error: error.message, loading: false });
    }
  },

  createLote: async (loteData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('lotes')
        .insert([loteData])
        .select()
        .single();

      if (error) throw error;

      // Refrescar los datos completos
      await get().fetchLotes();
      
      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateLote: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('lotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refrescar los datos completos para mantener consistencia
      await get().fetchLotes();
      
      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteLote: async (id) => {
    try {
      set({ loading: true, error: null });
      
      // Verificar si hay animales activos asignados
      const { data: animalLoteActivos, error: checkError } = await supabase
        .from('animal_lote')
        .select('animal_id')
        .eq('lote_id', id)
        .is('fecha_salida', null);

      if (checkError) throw checkError;

      // Si hay animales activos, quitarlos automáticamente del lote
      if (animalLoteActivos && animalLoteActivos.length > 0) {
        console.log(`Quitando ${animalLoteActivos.length} animales del lote antes de eliminarlo...`);
        
        const { error: updateError } = await supabase
          .from('animal_lote')
          .update({ fecha_salida: new Date().toISOString() })
          .eq('lote_id', id)
          .is('fecha_salida', null);

        if (updateError) throw updateError;
      }

      // Eliminar TODAS las relaciones históricas del lote
      const { error: deleteRelationsError } = await supabase
        .from('animal_lote')
        .delete()
        .eq('lote_id', id);

      if (deleteRelationsError) {
        console.warn('Error al eliminar relaciones del lote:', deleteRelationsError);
        // Continuar con la eliminación del lote aunque falle esto
      }

      // Ahora eliminar el lote
      const { error } = await supabase
        .from('lotes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refrescar datos para mantener sincronización
      await get().fetchLotes();
      await get().fetchAnimales();
      
      set({ loading: false });
      return { success: true, message: `Lote eliminado exitosamente${animalLoteActivos?.length > 0 ? `. Se liberaron ${animalLoteActivos.length} animales.` : '.'}` };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Funciones para gestión de lotes
  asignarAnimalesALote: async (animalIds, loteId) => {
    try {
      set({ loading: true, error: null });
      
      // Primero, sacar animales de sus lotes actuales (marcar fecha_salida)
      const { error: updateError } = await supabase
        .from('animal_lote')
        .update({ fecha_salida: new Date().toISOString() })
        .in('animal_id', animalIds)
        .is('fecha_salida', null);

      if (updateError) throw updateError;

      // Luego, asignar al nuevo lote
      const asignaciones = animalIds.map(animalId => ({
        animal_id: animalId,
        lote_id: loteId,
        fecha_asignacion: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('animal_lote')
        .insert(asignaciones);

      if (insertError) throw insertError;

      // Recargar datos
      await get().fetchAnimales();
      await get().fetchLotes();
      
      set({ loading: false, selectedAnimales: [] });
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  quitarAnimalesDeLote: async (animalIds) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('animal_lote')
        .update({ fecha_salida: new Date().toISOString() })
        .in('animal_id', animalIds)
        .is('fecha_salida', null);

      if (error) throw error;

      // Recargar datos
      await get().fetchAnimales();
      await get().fetchLotes();
      
      set({ loading: false, selectedAnimales: [] });
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Funciones para proveedores
  fetchProveedores: async () => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre');

      if (error) throw error;
      set({ proveedores: data || [] });
    } catch (error) {
      console.error('Error fetching proveedores:', error);
      set({ error: error.message });
    }
  },

  // Funciones para transportadores
  fetchTransportadores: async () => {
    try {
      const { data, error } = await supabase
        .from('transportadores')
        .select('*')
        .order('nombre');

      if (error) throw error;
      set({ transportadores: data || [] });
    } catch (error) {
      console.error('Error fetching transportadores:', error);
      set({ error: error.message });
    }
  },

  // Funciones para eventos sanitarios
  fetchEventosSanitarios: async (animalId = null) => {
    try {
      set({ loading: true, error: null });
      
      let query = supabase
        .from('eventos_sanitarios')
        .select('*')
        .order('fecha', { ascending: false });

      // Si se proporciona animalId, filtrar por ese animal específico
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }

      const { data: eventosData, error: eventosError } = await query;

      if (eventosError) throw eventosError;

      // Si no hay animalId específico, obtener datos relacionados para todos los eventos
      if (!animalId && eventosData?.length > 0) {
        // Query separado para animales
        const { data: animalesData } = await supabase
          .from('animales')
          .select('id, numero_caravana, color_caravana, categoria');

        // Query separado para relaciones animal-lote
        const { data: animalLoteData } = await supabase
          .from('animal_lote')
          .select('animal_id, lote_id, fecha_salida')
          .is('fecha_salida', null);

        // Query separado para lotes
        const { data: lotesData } = await supabase
          .from('lotes')
          .select('id, nombre, numero');

        // Combinar los datos
        const eventosConDatos = eventosData.map(evento => {
          const animal = animalesData?.find(a => a.id === evento.animal_id);
          const loteRelacion = animal ? animalLoteData?.find(al => al.animal_id === animal.id) : null;
          const lote = loteRelacion ? lotesData?.find(l => l.id === loteRelacion.lote_id) : null;

          return {
            ...evento,
            animales: animal ? {
              ...animal,
              animal_lote: lote ? [{ lotes: lote }] : []
            } : null
          };
        });

        set({ eventosSanitarios: eventosConDatos, loading: false });
        return eventosConDatos;
      } else {
        set({ eventosSanitarios: eventosData || [], loading: false });
        return eventosData || [];
      }
    } catch (error) {
      console.error('Error fetching eventos sanitarios:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  createEventoSanitario: async (eventoData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('eventos_sanitarios')
        .insert([eventoData])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista de eventos sanitarios
      await get().fetchEventosSanitarios();
      
      set({ loading: false });
      return data;
    } catch (error) {
      console.error('Error al crear evento sanitario:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateEventoSanitario: async (id, eventoData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('eventos_sanitarios')
        .update(eventoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista de eventos sanitarios
      const { eventosSanitarios } = get();
      set({ 
        eventosSanitarios: eventosSanitarios.map(e => e.id === id ? {...e, ...data} : e),
        loading: false 
      });

      return data;
    } catch (error) {
      console.error('Error al actualizar evento sanitario:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteEventoSanitario: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('eventos_sanitarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar lista de eventos sanitarios
      const { eventosSanitarios } = get();
      set({ 
        eventosSanitarios: eventosSanitarios.filter(e => e.id !== id),
        loading: false 
      });
    } catch (error) {
      console.error('Error al eliminar evento sanitario:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Funciones de filtros
  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  clearFilters: () => set({ filters: {} }),

  // Funciones de UI
  setFilters: (filters) => set({ filters }),
  // Configuración de columnas
  setVisibleColumns: (columns) => set({ visibleColumns: columns }),
  
  toggleColumnVisibility: (columnKey) => set((state) => ({
    visibleColumns: {
      ...state.visibleColumns,
      [columnKey]: !state.visibleColumns[columnKey]
    }
  })),
  setSelectedAnimales: (selected) => set({ selectedAnimales: selected }),
  toggleAnimalSelection: (animalId) => {
    const selected = get().selectedAnimales;
    const newSelected = selected.includes(animalId)
      ? selected.filter(id => id !== animalId)
      : [...selected, animalId];
    set({ selectedAnimales: newSelected });
  },
  clearSelection: () => set({ selectedAnimales: [] }),
  clearError: () => set({ error: null }),

  // Getters
  getFilteredAnimales: () => {
    const { animales, filters } = get();
    let filtered = [...animales];

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        filtered = filtered.filter(animal => {
          switch (key) {
            case 'search':
              // Búsqueda general en múltiples campos
              const searchTerm = value.toLowerCase();
              return (
                animal.numero_caravana?.toLowerCase().includes(searchTerm) ||
                animal.categoria?.toLowerCase().includes(searchTerm) ||
                animal.color_caravana?.toLowerCase().includes(searchTerm) ||
                animal.proveedores?.nombre?.toLowerCase().includes(searchTerm) ||
                animal.lote_nombre?.toLowerCase().includes(searchTerm)
              );
            
            case 'lote_id':
              if (value === 'sin_lote') {
                return !animal.lote_actual;
              }
              return animal.lote_actual?.id === value;
            
            case 'proveedor_id':
              return animal.proveedor_id === value;
            
            case 'fecha_desde':
              return new Date(animal.fecha_ingreso) >= new Date(value);
            
            case 'fecha_hasta':
              return new Date(animal.fecha_ingreso) <= new Date(value);
            
            case 'peso_min':
              return parseFloat(animal.peso_ingreso) >= parseFloat(value);
            
            case 'peso_max':
              return parseFloat(animal.peso_ingreso) <= parseFloat(value);
            
            default:
              // Para campos directos como numero_caravana, categoria, etc.
              if (typeof animal[key] === 'string') {
                return animal[key].toLowerCase().includes(value.toLowerCase());
              }
              return animal[key] === value;
          }
        });
      }
    });

    return filtered;
  },

  getSelectedAnimalesData: () => {
    const { animales, selectedAnimales } = get();
    return animales.filter(animal => selectedAnimales.includes(animal.id));
  },

  // ===== FUNCIONES PARA PESADAS =====
  fetchPesadas: async () => {
    try {
      set({ loading: true, error: null });
      
      // Query simple para pesadas
      const { data: pesadasData, error: pesadasError } = await supabase
        .from('pesadas')
        .select('*')
        .order('fecha_pesada', { ascending: false });

      if (pesadasError) throw pesadasError;

      // Query separado para animales
      const { data: animalesData } = await supabase
        .from('animales')
        .select('id, numero_caravana, color_caravana, categoria, proveedor_id, estado');

      // Query separado para proveedores
      const { data: proveedoresData } = await supabase
        .from('proveedores')
        .select('id, nombre');

      // Query separado para relaciones animal-lote
      const { data: animalLoteData } = await supabase
        .from('animal_lote')
        .select('animal_id, lote_id, fecha_salida')
        .is('fecha_salida', null);

      // Query separado para lotes
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('id, nombre, numero');

      // Combinar los datos
      const pesadasConDatos = pesadasData?.map(pesada => {
        const animal = animalesData?.find(a => a.id === pesada.animal_id);
        const proveedor = animal ? proveedoresData?.find(p => p.id === animal.proveedor_id) : null;
        const loteRelacion = animal ? animalLoteData?.find(al => al.animal_id === animal.id) : null;
        const lote = loteRelacion ? lotesData?.find(l => l.id === loteRelacion.lote_id) : null;

        return {
          ...pesada,
          animales: animal ? {
            ...animal,
            proveedores: proveedor,
            animal_lote: lote ? [{ lotes: lote }] : []
          } : null
        };
      }) || [];

      set({ pesadas: pesadasConDatos, loading: false });
      return pesadasConDatos;
    } catch (error) {
      console.error('Error al cargar pesadas:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  fetchPesadasByAnimal: async (animalId) => {
    try {
      const { data, error } = await supabase
        .from('pesadas')
        .select('*')
        .eq('animal_id', animalId)
        .order('fecha_pesada', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al cargar pesadas del animal:', error);
      return [];
    }
  },

  createPesada: async (pesadaData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('pesadas')
        .insert([pesadaData])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista de pesadas
      const { pesadas } = get();
      set({ pesadas: [data, ...pesadas], loading: false });

      return data;
    } catch (error) {
      console.error('Error al crear pesada:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePesada: async (id, pesadaData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('pesadas')
        .update(pesadaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista de pesadas
      const { pesadas } = get();
      set({ 
        pesadas: pesadas.map(p => p.id === id ? data : p),
        loading: false 
      });

      return data;
    } catch (error) {
      console.error('Error al actualizar pesada:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deletePesada: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('pesadas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar lista de pesadas
      const { pesadas } = get();
      set({ 
        pesadas: pesadas.filter(p => p.id !== id),
        loading: false 
      });
    } catch (error) {
      console.error('Error al eliminar pesada:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // ===== FUNCIONES PARA COMPRAS =====
  fetchCompras: async () => {
    try {
      set({ loading: true, error: null });
      
      // Query simple para compras
      const { data: comprasData, error: comprasError } = await supabase
        .from('compras')
        .select('*')
        .order('fecha', { ascending: false });

      if (comprasError) throw comprasError;

      // Query separado para proveedores
      const { data: proveedoresData } = await supabase
        .from('proveedores')
        .select('id, nombre, contacto');

      // Query separado para transportadores
      const { data: transportadoresData } = await supabase
        .from('transportadores')
        .select('id, nombre, contacto');

      // Combinar los datos
      const comprasConDatos = comprasData?.map(compra => ({
        ...compra,
        proveedores: proveedoresData?.find(p => p.id === compra.proveedor_id) || null,
        transportadores: transportadoresData?.find(t => t.id === compra.transportador_id) || null
      })) || [];

      set({ compras: comprasConDatos, loading: false });
      return comprasConDatos;
    } catch (error) {
      console.error('Error al cargar compras:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Obtener peso actual de un animal (última pesada)
  getCurrentWeight: (animalId) => {
    const { pesadas } = get();
    const animalPesadas = pesadas
      .filter(p => p.animal_id === animalId)
      .sort((a, b) => new Date(b.fecha_pesada) - new Date(a.fecha_pesada));
    
    return animalPesadas.length > 0 ? animalPesadas[0].peso : null;
  },

  // Obtener lote actual de un animal
  getCurrentLote: (animalId) => {
    const { animales } = get();
    const animal = animales.find(a => a.id === animalId);
    if (!animal?.animal_lote) return null;
    
    const activeLote = animal.animal_lote.find(al => !al.fecha_salida);
    return activeLote?.lotes || null;
  },

  // Mover animal entre lotes
  moveAnimalToLote: async (animalId, newLoteId) => {
    try {
      set({ loading: true, error: null });
      
      // Primero cerrar la asignación actual
      const { data: currentAssignment } = await supabase
        .from('animal_lote')
        .select('*')
        .eq('animal_id', animalId)
        .is('fecha_salida', null)
        .single();

      if (currentAssignment) {
        await supabase
          .from('animal_lote')
          .update({ fecha_salida: new Date().toISOString() })
          .eq('id', currentAssignment.id);
      }

      // Crear nueva asignación
      const { error: insertError } = await supabase
        .from('animal_lote')
        .insert([{
          animal_id: animalId,
          lote_id: newLoteId,
          fecha_asignacion: new Date().toISOString(),
          observaciones: 'Movido automáticamente'
        }]);

      if (insertError) throw insertError;

      // Refrescar datos
      await get().fetchAnimales();
      set({ loading: false });
    } catch (error) {
      console.error('Error al mover animal:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Quitar animal de lote
  removeAnimalFromLote: async (animalId) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('animal_lote')
        .update({ fecha_salida: new Date().toISOString() })
        .eq('animal_id', animalId)
        .is('fecha_salida', null);

      if (error) throw error;

      // Refrescar datos
      await get().fetchAnimales();
      set({ loading: false });
    } catch (error) {
      console.error('Error al quitar animal del lote:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export { useAnimalesStore };
export default useAnimalesStore;
