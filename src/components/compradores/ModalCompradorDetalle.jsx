import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  CreditCard, 
  Calendar, 
  ShoppingBag, 
  TrendingUp,
  Scale,
  FileText,
  DollarSign
} from 'lucide-react';

const ModalCompradorDetalle = ({ comprador, isOpen, onClose }) => {
  if (!comprador) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const preciosPromedio = comprador.estadisticas?.preciosPromedioPorCategoria || {};
  const hasPrecios = Object.keys(preciosPromedio).length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#67806D] to-[#67806D]/80 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{comprador.nombre || 'Sin nombre'}</h2>
                    <p className="text-white/80">Detalles del comprador</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F5F2E7] rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-[#3C454A]/70 block mb-1">Nombre</label>
                      <p className="text-[#3C454A] font-medium">{comprador.nombre || 'No especificado'}</p>
                    </div>
                    
                    {comprador.contacto && (
                      <div>
                        <label className="text-sm text-[#3C454A]/70 block mb-1">Contacto</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#67806D]" />
                          <p className="text-[#3C454A]">{comprador.contacto}</p>
                        </div>
                      </div>
                    )}
                    
                    {comprador.cuit && (
                      <div>
                        <label className="text-sm text-[#3C454A]/70 block mb-1">CUIT</label>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#67806D]" />
                          <p className="text-[#3C454A]">{comprador.cuit}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#F9E9D0] rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Estadísticas de Compras
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#3C454A]/70">Total de compras</span>
                      <span className="font-bold text-[#67806D] text-xl">
                        {comprador.estadisticas?.totalVentas || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[#3C454A]/70">Compras este año</span>
                      <span className="font-semibold text-[#3C454A]">
                        {comprador.estadisticas?.ventasEsteAno || 0}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-[#805A36]/20">
                      <span className="text-[#3C454A]/70 text-sm">Última compra</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-[#67806D]" />
                        <span className="text-[#3C454A]">
                          {formatearFecha(comprador.estadisticas?.ultimaVenta)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Precios promedio por categoría */}
              <div className="bg-white border border-[#67806D]/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#67806D]" />
                  Precios Promedio por Categoría
                </h3>
                
                {hasPrecios ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(preciosPromedio).map(([categoria, precio]) => (
                      <div key={categoria} className="bg-[#F5F2E7] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[#3C454A]/70 capitalize">{categoria}</p>
                            <p className="text-xl font-bold text-[#67806D]">
                              {formatearMoneda(precio)}/kg
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-[#67806D]/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="w-12 h-12 text-[#3C454A]/30 mx-auto mb-3" />
                    <p className="text-[#3C454A]/60">No hay datos de precios disponibles</p>
                    <p className="text-sm text-[#3C454A]/40">
                      Los precios se calculan automáticamente cuando se realizan ventas
                    </p>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              {comprador.observaciones && (
                <div className="bg-[#F5F2E7] rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-[#3C454A] mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Observaciones
                  </h3>
                  <p className="text-[#3C454A] leading-relaxed">
                    {comprador.observaciones}
                  </p>
                </div>
              )}

              {/* Análisis de precios */}
              {hasPrecios && (
                <div className="bg-gradient-to-r from-[#67806D]/5 to-[#F8B36A]/5 rounded-xl p-6 border border-[#67806D]/10">
                  <h3 className="text-lg font-semibold text-[#3C454A] mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#F8B36A]" />
                    Análisis de Precios
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-[#3C454A]/70">Precio más alto</p>
                      <p className="text-xl font-bold text-[#67806D]">
                        {formatearMoneda(Math.max(...Object.values(preciosPromedio)))}/kg
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-[#3C454A]/70">Precio más bajo</p>
                      <p className="text-xl font-bold text-[#F8B36A]">
                        {formatearMoneda(Math.min(...Object.values(preciosPromedio)))}/kg
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-[#3C454A]/70">Promedio general</p>
                      <p className="text-xl font-bold text-[#3C454A]">
                        {formatearMoneda(
                          Object.values(preciosPromedio).reduce((a, b) => a + b, 0) / 
                          Object.values(preciosPromedio).length
                        )}/kg
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#F5F2E7] p-4 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#67806D] text-white rounded-xl hover:bg-[#67806D]/90 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalCompradorDetalle;
