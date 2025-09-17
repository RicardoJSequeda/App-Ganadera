import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  Calendar, 
  User,
  FileText,
  MessageSquare,
  Syringe,
  Pill,
  Activity
} from 'lucide-react';

const EventoSanitarioModal = ({ evento, isOpen, onClose }) => {
  if (!isOpen || !evento) return null;

  const getIconoTipo = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'vacuna':
        return <Syringe className="h-5 w-5" />;
      case 'desparasitario':
        return <Pill className="h-5 w-5" />;
      case 'tratamiento':
        return <Activity className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getColorTipo = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'vacuna':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'desparasitario':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tratamiento':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${getColorTipo(evento.tipo)}`}>
                {getIconoTipo(evento.tipo)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#3C454A]">
                  Evento Sanitario
                </h2>
                <p className="text-[#3C454A] opacity-70">
                  {evento.tipo} - {formatDate(evento.fecha)}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-[#3C454A] opacity-60 hover:opacity-100 hover:bg-[#F5F2E7] rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Información del Animal */}
            <div className="bg-[#F5F2E7] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-[#67806D]" />
                <h3 className="font-semibold text-[#3C454A]">Información del Animal</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#3C454A] opacity-70">Caravana:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: evento.animales?.color_caravana }}
                    ></div>
                    <span className="font-semibold text-[#3C454A]">
                      #{evento.animales?.numero_caravana || 'S/N'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-[#3C454A] opacity-70">Categoría:</span>
                  <div className="font-semibold text-[#3C454A] mt-1">
                    {evento.animales?.categoria || 'No especificada'}
                  </div>
                </div>

                <div>
                  <span className="text-[#3C454A] opacity-70">Estado Físico:</span>
                  <div className="font-semibold text-[#3C454A] mt-1">
                    {evento.animales?.estado_fisico || 'No especificado'}
                  </div>
                </div>

                <div>
                  <span className="text-[#3C454A] opacity-70">Lote:</span>
                  <div className="font-semibold text-[#3C454A] mt-1">
                    {evento.animales?.animal_lote?.[0]?.lotes?.nombre || 'Sin lote'}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del Evento */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#67806D]" />
                <h3 className="font-semibold text-[#3C454A]">Detalles del Evento</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-[#67806D]" />
                    <span className="text-sm text-[#3C454A] opacity-70">Fecha</span>
                  </div>
                  <div className="font-semibold text-[#3C454A]">
                    {formatDate(evento.fecha)}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-[#67806D]" />
                    <span className="text-sm text-[#3C454A] opacity-70">Tipo</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getColorTipo(evento.tipo)}`}>
                    {getIconoTipo(evento.tipo)}
                    {evento.tipo}
                  </div>
                </div>
              </div>

              {evento.descripcion && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-[#67806D]" />
                    <span className="text-sm text-[#3C454A] opacity-70">Descripción</span>
                  </div>
                  <div className="text-[#3C454A]">
                    {evento.descripcion}
                  </div>
                </div>
              )}

              {evento.observaciones && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-[#67806D]" />
                    <span className="text-sm text-[#3C454A] opacity-70">Observaciones</span>
                  </div>
                  <div className="text-[#3C454A]">
                    {evento.observaciones}
                  </div>
                </div>
              )}
            </div>

            {/* Metadatos */}
            <div className="bg-[#F9E9D0] rounded-xl p-4">
              <h4 className="font-semibold text-[#3C454A] mb-3">Información del Registro</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#3C454A] opacity-70">Creado:</span>
                  <div className="font-semibold text-[#3C454A] mt-1">
                    {new Date(evento.created_at).toLocaleString('es-AR')}
                  </div>
                </div>
                
                <div>
                  <span className="text-[#3C454A] opacity-70">Última actualización:</span>
                  <div className="font-semibold text-[#3C454A] mt-1">
                    {new Date(evento.updated_at).toLocaleString('es-AR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#3C454A] hover:bg-[#F5F2E7] rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventoSanitarioModal;
