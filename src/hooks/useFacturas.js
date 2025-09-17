import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { descargarPDFFactura, abrirPDFFactura, generarDatosVenta, generarDatosCompra, generarFacturaDataUri } from '../utils/generadorPDF';

export const useFacturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todas las facturas con datos relacionados
  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('facturas')
        .select(`
          *,
          ventas (
            id,
            fecha,
            tipo,
            compradores (id, nombre, cuit)
          ),
          compras (
            id,
            fecha,
            proveedores (id, nombre, cuit)
          ),
          usuarios (id, nombre)
        `)
        .order('fecha_emision', { ascending: false });

      if (error) throw error;
      setFacturas(data || []);
    } catch (error) {
      console.error('Error fetching facturas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva factura
  const createFactura = async (facturaData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generar número de factura automático
      const { data: numeroFactura, error: errorNumero } = await supabase
        .rpc('generar_numero_factura', { tipo_comp: facturaData.tipo_comprobante });

      if (errorNumero) throw errorNumero;

      const nuevaFactura = {
        ...facturaData,
        numero_factura: numeroFactura,
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('facturas')
        .insert([nuevaFactura])
        .select()
        .single();

      if (error) throw error;
      
      // Refrescar la lista
      await fetchFacturas();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating factura:', error);
      return { data: null, error: error.message };
    }
  };

  // Actualizar factura
  const updateFactura = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refrescar la lista
      await fetchFacturas();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating factura:', error);
      return { data: null, error: error.message };
    }
  };

  // Eliminar factura
  const deleteFactura = async (id) => {
    try {
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refrescar la lista
      await fetchFacturas();
      return { error: null };
    } catch (error) {
      console.error('Error deleting factura:', error);
      return { error: error.message };
    }
  };

  // Obtener configuración de facturación
  const fetchConfiguracion = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion_facturacion')
        .select('*')
        .order('tipo_comprobante');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching configuracion:', error);
      return { data: [], error: error.message };
    }
  };

  // Actualizar configuración
  const updateConfiguracion = async (configData) => {
    try {
      const { data, error } = await supabase
        .from('configuracion_facturacion')
        .upsert(configData, { onConflict: 'tipo_comprobante' })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating configuracion:', error);
      return { data: null, error: error.message };
    }
  };

  // Generar factura desde venta
  const generarFacturaVenta = async (venta, tipoComprobante = 'B') => {
    try {
      const facturaData = {
        tipo_comprobante: tipoComprobante,
        venta_id: venta.id,
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
        monto_total: venta.valor_total || venta.precio_total || 0,
        iva_total: tipoComprobante === 'A' ? (venta.valor_total || 0) * 0.21 : 0,
        monto_neto: tipoComprobante === 'A' ? (venta.valor_total || 0) / 1.21 : (venta.valor_total || 0),
        estado: 'emitida',
        observaciones: `Factura generada automáticamente desde venta ${venta.id}`
      };

      return await createFactura(facturaData);
    } catch (error) {
      console.error('Error generando factura de venta:', error);
      return { data: null, error: error.message };
    }
  };

  // Generar factura desde compra
  const generarFacturaCompra = async (compra, tipoComprobante = 'A') => {
    try {
      const facturaData = {
        tipo_comprobante: tipoComprobante,
        compra_id: compra.id,
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
        monto_total: compra.precio_total || 0,
        iva_total: tipoComprobante === 'A' ? (compra.precio_total || 0) * 0.21 : 0,
        monto_neto: tipoComprobante === 'A' ? (compra.precio_total || 0) / 1.21 : (compra.precio_total || 0),
        estado: 'emitida',
        observaciones: `Factura generada automáticamente desde compra ${compra.id}`
      };

      return await createFactura(facturaData);
    } catch (error) {
      console.error('Error generando factura de compra:', error);
      return { data: null, error: error.message };
    }
  };

  // Generar y descargar PDF de factura
  const generarPDF = async (factura, empresaConfig = {}) => {
    try {
      let datosTransaccion;
      
      if (factura.venta_id && factura.ventas) {
        datosTransaccion = generarDatosVenta(factura.ventas);
      } else if (factura.compra_id && factura.compras) {
        datosTransaccion = generarDatosCompra(factura.compras);
      } else {
        throw new Error('No se encontraron datos de la transacción');
      }

      descargarPDFFactura(factura, datosTransaccion, empresaConfig);
      return { success: true };
    } catch (error) {
      console.error('Error generando PDF:', error);
      return { success: false, error: error.message };
    }
  };

  // Abrir PDF en nueva ventana
  const abrirPDF = async (factura, empresaConfig = {}) => {
    try {
      let datosTransaccion;
      
      if (factura.venta_id && factura.ventas) {
        datosTransaccion = generarDatosVenta(factura.ventas);
      } else if (factura.compra_id && factura.compras) {
        datosTransaccion = generarDatosCompra(factura.compras);
      } else {
        throw new Error('No se encontraron datos de la transacción');
      }

      abrirPDFFactura(factura, datosTransaccion, empresaConfig);
      return { success: true };
    } catch (error) {
      console.error('Error abriendo PDF:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtener DataURI para previsualización (función nombrada para hoisting)
  function generarPreviewDataUri(factura, empresaConfig = {}) {
    try {
      let datosTransaccion;
      if (factura.venta_id && factura.ventas) {
        datosTransaccion = generarDatosVenta(factura.ventas);
      } else if (factura.compra_id && factura.compras) {
        datosTransaccion = generarDatosCompra(factura.compras);
      } else {
        throw new Error('No se encontraron datos de la transacción');
      }

      const dataUri = generarFacturaDataUri(factura, datosTransaccion, empresaConfig);
      return { success: true, dataUri };
    } catch (error) {
      console.error('Error generando previsualización PDF:', error);
      return { success: false, error: error.message };
    }
  }

  useEffect(() => {
    fetchFacturas();
  }, []);

  return {
    facturas,
    loading,
    error,
    fetchFacturas,
    createFactura,
    updateFactura,
    deleteFactura,
    fetchConfiguracion,
    updateConfiguracion,
    generarFacturaVenta,
    generarFacturaCompra,
    generarPDF,
    abrirPDF,
    generarPreviewDataUri
  };
};
