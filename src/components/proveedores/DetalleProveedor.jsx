import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Phone,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  CreditCard,
  User,
  MessageSquare,
  Download,
  Eye,
  ShoppingCart,
  Truck,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const DetalleProveedor = ({ 
  proveedor, 
  onClose, 
  onEdit 
}) => {
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalCompras: 0,
    montoTotal: 0,
    promedioMensual: 0,
    ultimaCompra: null,
    animalesComprados: 0
  });

  useEffect(() => {
    if (proveedor?.id) {
      cargarHistorialDetallado();
    }
  }, [proveedor]);

  const cargarHistorialDetallado = async () => {
    try {
      setLoading(true);

      // Obtener compras detalladas con información de animales
      const { data: compras, error } = await supabase
        .from('compras')
        .select(`
          *,
          transportador:transportadores(nombre),
          animales:animales(
            id,
            numero_caravana,
            color_caravana,
            categoria,
            peso_ingreso,
            estado_fisico,
            precio_compra
          )
        `)
        .eq('proveedor_id', proveedor.id)
        .order('fecha', { ascending: false });

      if (error) throw error;

      setHistorialCompras(compras || []);

      // Calcular estadísticas detalladas
      const totalCompras = compras?.length || 0;
      const montoTotal = compras?.reduce((sum, compra) => sum + (compra.precio_total || 0), 0) || 0;
      
      // Calcular animales comprados
      const animalesComprados = compras?.reduce((sum, compra) => 
        sum + (compra.animales?.length || 0), 0) || 0;

      // Calcular promedio mensual (últimos 12 meses)
      const hace12Meses = new Date();
      hace12Meses.setFullYear(hace12Meses.getFullYear() - 1);
      
      const comprasUltimo12Meses = compras?.filter(compra => 
        new Date(compra.fecha) >= hace12Meses) || [];
      
      const promedioMensual = comprasUltimo12Meses.length > 0 ? 
        comprasUltimo12Meses.reduce((sum, compra) => sum + (compra.precio_total || 0), 0) / 12 : 0;

      setEstadisticas({
        totalCompras,
        montoTotal,
        promedioMensual,
        ultimaCompra: compras?.[0] || null,
        animalesComprados
      });

    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rural-primary mx-auto mb-4"></div>
            <p className="text-rural-text/60">Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-rural-alternate/20">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-rural-alternate/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-rural-text/60" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rural-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-rural-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-rural-text">
                  {proveedor.nombre || 'Sin nombre'}
                </h2>
                <p className="text-rural-text/60">
                  {proveedor.establecimiento || 'Sin establecimiento'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onEdit(proveedor)}
            className="flex items-center gap-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Editar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Información del Proveedor */}
            <div className="lg:col-span-1 space-y-6">
              {/* Datos de Contacto */}
              <div className="bg-rural-alternate/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  {proveedor.contacto && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-rural-primary" />
                      <span className="text-rural-text">{proveedor.contacto}</span>
                    </div>
                  )}
                  {proveedor.establecimiento && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-rural-primary" />
                      <span className="text-rural-text">{proveedor.establecimiento}</span>
                    </div>
                  )}
                  {proveedor.cuit && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-rural-primary" />
                      <span className="text-rural-text">CUIT: {proveedor.cuit}</span>
                    </div>
                  )}
                  {proveedor.renspa && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-rural-primary" />
                      <span className="text-rural-text">RENSPA: {proveedor.renspa}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas Clave */}
              <div className="bg-rural-alternate/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-2xl font-bold text-rural-primary">
                      {estadisticas.totalCompras}
                    </p>
                    <p className="text-sm text-rural-text/60">Total Compras</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-2xl font-bold text-green-600">
                      {estadisticas.animalesComprados}
                    </p>
                    <p className="text-sm text-rural-text/60">Animales</p>
                  </div>
                  <div className="col-span-2 text-center p-3 bg-white rounded-xl">
                    <p className="text-xl font-bold text-rural-text">
                      {formatearMoneda(estadisticas.montoTotal)}
                    </p>
                    <p className="text-sm text-rural-text/60">Monto Total</p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              {proveedor.boleto_marca && (
                <div className="bg-rural-alternate/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentos
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-rural-primary" />
                      <span className="text-rural-text">Boleto de Marca</span>
                    </div>
                    <button
                      onClick={() => window.open(proveedor.boleto_marca, '_blank')}
                      className="p-2 text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {(proveedor.observaciones || proveedor.datos_personales) && (
                <div className="bg-rural-alternate/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-rural-text mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Observaciones
                  </h3>
                  <div className="space-y-3">
                    {proveedor.datos_personales && (
                      <div className="p-3 bg-white rounded-xl">
                        <p className="text-sm font-medium text-rural-text mb-1">Datos Personales:</p>
                        <p className="text-rural-text/80">{proveedor.datos_personales}</p>
                      </div>
                    )}
                    {proveedor.observaciones && (
                      <div className="p-3 bg-white rounded-xl">
                        <p className="text-sm font-medium text-rural-text mb-1">Observaciones:</p>
                        <p className="text-rural-text/80">{proveedor.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Historial de Compras */}
            <div className="lg:col-span-2">
              <div className="bg-rural-card rounded-2xl border border-rural-alternate/50">
                <div className="p-6 border-b border-rural-alternate/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-rural-text flex items-center gap-2">
                      <ShoppingCart className="w-6 h-6" />
                      Historial de Compras ({historialCompras.length})
                    </h3>
                    {estadisticas.ultimaCompra && (
                      <div className="text-sm text-rural-text/60">
                        Última: {formatearFecha(estadisticas.ultimaCompra.fecha)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {historialCompras.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-rural-text/40 mx-auto mb-3" />
                      <p className="text-rural-text/60">Sin compras registradas</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-rural-alternate/20">
                      {historialCompras.map((compra, index) => (
                        <motion.div
                          key={compra.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="p-6 hover:bg-rural-alternate/5 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-rural-primary" />
                                <span className="font-medium text-rural-text">
                                  {formatearFecha(compra.fecha)}
                                </span>
                              </div>
                              {compra.lugar_origen && (
                                <div className="flex items-center gap-2 text-sm text-rural-text/60">
                                  <MapPin className="w-3 h-3" />
                                  {compra.lugar_origen}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-rural-primary">
                                {formatearMoneda(compra.precio_total || 0)}
                              </div>
                              <div className="text-sm text-rural-text/60">
                                {compra.animales?.length || 0} animales
                              </div>
                            </div>
                          </div>

                          {compra.transportador && (
                            <div className="flex items-center gap-2 text-sm text-rural-text/60 mb-2">
                              <Truck className="w-3 h-3" />
                              Transporte: {compra.transportador.nombre}
                            </div>
                          )}

                          {compra.observaciones && (
                            <div className="mt-2 p-2 bg-rural-alternate/10 rounded-lg">
                              <p className="text-sm text-rural-text/80">{compra.observaciones}</p>
                            </div>
                          )}

                          {compra.animales && compra.animales.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-rural-text mb-2">
                                Animales comprados:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                {compra.animales.slice(0, 6).map((animal) => (
                                  <div
                                    key={animal.id}
                                    className="p-2 bg-rural-alternate/10 rounded border"
                                  >
                                    <div className="font-medium">
                                      {animal.numero_caravana || 'S/N'} - {animal.color_caravana || 'S/C'}
                                    </div>
                                    <div className="text-rural-text/60">
                                      {animal.categoria} - {animal.peso_ingreso}kg
                                    </div>
                                  </div>
                                ))}
                                {compra.animales.length > 6 && (
                                  <div className="p-2 bg-rural-alternate/5 rounded border border-dashed flex items-center justify-center">
                                    <span className="text-rural-text/60">
                                      +{compra.animales.length - 6} más
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DetalleProveedor;
