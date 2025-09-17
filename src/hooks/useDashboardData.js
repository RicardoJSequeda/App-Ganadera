import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatCurrency, formatDate } from '../utils/helpers';

export const useDashboardData = () => {
  const [data, setData] = useState({
    stats: {
      totalAnimalesEnCampo: 0,
      totalAnimalesVendidos: 0,
      animalesCriticos: 0,
      tiempoPromedioEnCampo: 0,
      diferenciaPrecios: 0
    },
    categorias: [],
    ultimasCompras: [],
    ultimasVentas: [],
    ultimosEventos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Stats básicos de animales - sin joins complejos
      const { data: animales, error: animalesError } = await supabase
        .from('animales')
        .select('id, estado, categoria, estado_fisico, fecha_ingreso, peso_ingreso, precio_compra');

      if (animalesError) {
        console.error('Error fetching animales:', animalesError);
        throw new Error('Error al obtener datos de animales');
      }

      // 2. Datos de ventas para calcular diferencia de precios - separado
      const { data: ventasDetalle, error: ventasError } = await supabase
        .from('detalle_venta')
        .select('peso_salida, precio_final, venta_id, animal_id');

      if (ventasError) {
        console.error('Error fetching ventas detalle:', ventasError);
        // No lanzar error, continuar sin datos de ventas
      }

      const { data: ventasInfo, error: ventasInfoError } = await supabase
        .from('ventas')
        .select('id, precio_kilo');

      if (ventasInfoError) {
        console.error('Error fetching ventas info:', ventasInfoError);
      }

      // 3. Últimas compras - separado
      const { data: comprasData, error: comprasError } = await supabase
        .from('compras')
        .select('id, fecha, precio_total, proveedor_id, transportador_id')
        .order('fecha', { ascending: false })
        .limit(5);

      if (comprasError) {
        console.error('Error fetching compras:', comprasError);
      }

      // 4. Datos de proveedores para compras
      const { data: proveedores, error: proveedoresError } = await supabase
        .from('proveedores')
        .select('id, nombre');

      if (proveedoresError) {
        console.error('Error fetching proveedores:', proveedoresError);
      }

      // 5. Últimas ventas - separado
      const { data: ventasData, error: ventasUltimasError } = await supabase
        .from('ventas')
        .select('id, fecha, tipo, precio_kilo, comprador_id')
        .order('fecha', { ascending: false })
        .limit(5);

      if (ventasUltimasError) {
        console.error('Error fetching ultimas ventas:', ventasUltimasError);
      }

      // 6. Datos de compradores para ventas
      const { data: compradores, error: compradoresError } = await supabase
        .from('compradores')
        .select('id, nombre');

      if (compradoresError) {
        console.error('Error fetching compradores:', compradoresError);
      }

      // 7. Últimos eventos sanitarios - separado
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos_sanitarios')
        .select('id, fecha, tipo, descripcion, animal_id')
        .order('fecha', { ascending: false })
        .limit(5);

      if (eventosError) {
        console.error('Error fetching eventos:', eventosError);
      }

      // Procesar datos de animales
      const animalesEnCampo = (animales || []).filter(animal => animal.estado === 'en_campo');
      const animalesVendidos = (animales || []).filter(animal => animal.estado === 'vendido');
      const animalesCriticos = animalesEnCampo.filter(animal => 
        animal.estado_fisico === 'critico' || animal.estado_fisico === 'malo'
      );

      // Calcular tiempo promedio en campo
      const now = new Date();
      const tiemposEnCampo = animalesEnCampo
        .filter(animal => animal.fecha_ingreso)
        .map(animal => {
          const fechaIngreso = new Date(animal.fecha_ingreso);
          return Math.floor((now - fechaIngreso) / (1000 * 60 * 60 * 24)); // días
        });
      
      const tiempoPromedio = tiemposEnCampo.length > 0 
        ? Math.round(tiemposEnCampo.reduce((sum, tiempo) => sum + tiempo, 0) / tiemposEnCampo.length)
        : 0;

      // Calcular diferencia de precios promedio
      let diferenciaPrecios = 0;
      if (ventasDetalle && ventasDetalle.length > 0 && ventasInfo && ventasInfo.length > 0) {
        try {
          const diferencias = ventasDetalle
            .map(detalle => {
              const venta = ventasInfo.find(v => v.id === detalle.venta_id);
              const animal = animales.find(a => a.id === detalle.animal_id);
              
              if (venta && animal && venta.precio_kilo && animal.precio_compra) {
                return venta.precio_kilo - animal.precio_compra;
              }
              return null;
            })
            .filter(diff => diff !== null && !isNaN(diff));
          
          if (diferencias.length > 0) {
            diferenciaPrecios = diferencias.reduce((sum, diff) => sum + diff, 0) / diferencias.length;
          }
        } catch (err) {
          console.error('Error calculating price difference:', err);
        }
      }

      // Agrupar por categorías
      const categorias = animalesEnCampo.reduce((acc, animal) => {
        const categoria = animal.categoria || 'Sin categoría';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {});

      // Procesar compras con proveedores
      const ultimasCompras = (comprasData || []).map(compra => {
        const proveedor = (proveedores || []).find(p => p.id === compra.proveedor_id);
        return {
          ...compra,
          proveedor: proveedor ? { nombre: proveedor.nombre } : { nombre: 'Proveedor desconocido' }
        };
      });

      // Procesar ventas con compradores
      const ultimasVentas = (ventasData || []).map(venta => {
        const comprador = (compradores || []).find(c => c.id === venta.comprador_id);
        return {
          ...venta,
          comprador: comprador ? { nombre: comprador.nombre } : { nombre: 'Comprador desconocido' }
        };
      });

      // Procesar eventos con animales
      const ultimosEventos = (eventosData || []).map(evento => {
        const animal = (animales || []).find(a => a.id === evento.animal_id);
        return {
          ...evento,
          animal: animal ? { 
            numero_caravana: animal.numero_caravana || 'S/N', 
            color_caravana: animal.color_caravana || 'S/C' 
          } : { numero_caravana: 'S/N', color_caravana: 'S/C' }
        };
      });

      setData({
        stats: {
          totalAnimalesEnCampo: animalesEnCampo.length,
          totalAnimalesVendidos: animalesVendidos.length,
          animalesCriticos: animalesCriticos.length,
          tiempoPromedioEnCampo: tiempoPromedio,
          diferenciaPrecios: Math.round(diferenciaPrecios * 100) / 100
        },
        categorias: Object.entries(categorias).map(([nombre, cantidad]) => ({ nombre, cantidad })),
        ultimasCompras,
        ultimasVentas,
        ultimosEventos
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { data, loading, error, refetch: fetchDashboardData };
};
