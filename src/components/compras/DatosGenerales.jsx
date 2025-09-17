import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MapPin, 
  Truck, 
  FileText, 
  Upload,
  Plus,
  Search,
  X
} from 'lucide-react';
import { useProveedores, useTransportadores } from '../../hooks/useCompras';

export default function DatosGenerales({ datos, onChange, errores }) {
  const { proveedores, createProveedor } = useProveedores();
  const { transportadores, createTransportador } = useTransportadores();
  
  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false);
  const [mostrarModalTransportador, setMostrarModalTransportador] = useState(false);
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [busquedaTransportador, setBusquedaTransportador] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [transportadorSeleccionado, setTransportadorSeleccionado] = useState(null);
  
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    contacto: '',
    cuit: '',
    establecimiento: '',
    observaciones: ''
  });
  
  const [nuevoTransportador, setNuevoTransportador] = useState({
    nombre: '',
    contacto: '',
    precio_km: '',
    observaciones: ''
  });

  const proveedoresFiltrados = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(busquedaProveedor.toLowerCase()) ||
    p.cuit?.includes(busquedaProveedor)
  );

  const transportadoresFiltrados = transportadores.filter(t => 
    t.nombre.toLowerCase().includes(busquedaTransportador.toLowerCase())
  );

  // Actualizar el proveedor seleccionado cuando cambie el ID
  useEffect(() => {
    if (datos.proveedor_id) {
      const proveedor = proveedores.find(p => p.id === datos.proveedor_id);
      setProveedorSeleccionado(proveedor);
    } else {
      setProveedorSeleccionado(null);
    }
  }, [datos.proveedor_id, proveedores]);

  // Actualizar el transportador seleccionado cuando cambie el ID
  useEffect(() => {
    if (datos.transportador_id) {
      const transportador = transportadores.find(t => t.id === datos.transportador_id);
      setTransportadorSeleccionado(transportador);
    } else {
      setTransportadorSeleccionado(null);
    }
  }, [datos.transportador_id, transportadores]);

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const numberValue = String(value).replace(/[^\d]/g, '');
    return new Intl.NumberFormat('es-AR').format(numberValue) || '';
  };

  const handlePrecioChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    handleInputChange('precio_total', rawValue);
  };

  const crearProveedor = async () => {
    if (!nuevoProveedor.nombre) return;
    
    const { data, error } = await createProveedor(nuevoProveedor);
    if (!error && data) {
      onChange({ proveedor_id: data.id });
      setMostrarModalProveedor(false);
      setNuevoProveedor({
        nombre: '',
        contacto: '',
        cuit: '',
        establecimiento: '',
        observaciones: ''
      });
    }
  };

  const crearTransportador = async () => {
    if (!nuevoTransportador.nombre) return;
    
    const { data, error } = await createTransportador(nuevoTransportador);
    if (!error && data) {
      onChange({ transportador_id: data.id });
      setMostrarModalTransportador(false);
      setNuevoTransportador({
        nombre: '',
        contacto: '',
        precio_km: '',
        observaciones: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F9E9D0] rounded-lg p-4 border border-[#805A36]/20"
      >
        <h3 className="text-lg font-semibold text-[#3C454A] mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información General de la Compra
        </h3>
        <p className="text-[#805A36] text-sm">
          Complete los datos básicos de la compra. El proveedor es obligatorio y puede crear uno nuevo si no existe.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-[#3C454A] mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha de Compra *
          </label>
          <input
            type="date"
            value={datos.fecha}
            onChange={(e) => handleInputChange('fecha', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
              errores.fecha ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errores.fecha && (
            <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>
          )}
        </div>

        {/* Lugar de Origen */}
        <div>
          <label className="block text-sm font-medium text-[#3C454A] mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Lugar de Origen *
          </label>
          <input
            type="text"
            value={datos.lugar_origen}
            onChange={(e) => handleInputChange('lugar_origen', e.target.value)}
            placeholder="Ej: Estancia Los Alamos, Resistencia"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D] ${
              errores.lugar_origen ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errores.lugar_origen && (
            <p className="text-red-500 text-sm mt-1">{errores.lugar_origen}</p>
          )}
        </div>
      </div>

      {/* Proveedor */}
      <div>
        <label className="block text-sm font-medium text-[#3C454A] mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Proveedor *
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={busquedaProveedor}
                onChange={(e) => setBusquedaProveedor(e.target.value)}
                placeholder={proveedorSeleccionado ? proveedorSeleccionado.nombre : "Buscar proveedor..."}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
            
            {busquedaProveedor && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {proveedoresFiltrados.length > 0 ? (
                  proveedoresFiltrados.map(proveedor => (
                    <button
                      key={proveedor.id}
                      onClick={() => {
                        onChange({ proveedor_id: proveedor.id });
                        setBusquedaProveedor(''); // Limpiar búsqueda tras seleccionar
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm sm:text-base">{proveedor.nombre}</div>
                      {proveedor.cuit && (
                        <div className="text-xs sm:text-sm text-gray-500">CUIT: {proveedor.cuit}</div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No se encontraron proveedores
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setMostrarModalProveedor(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors sm:flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span>
            <span className="sm:hidden">Agregar</span>
          </button>
        </div>
        
        {datos.proveedor_id && proveedorSeleccionado && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ✓ Proveedor seleccionado: <strong>{proveedorSeleccionado.nombre}</strong>
            {proveedorSeleccionado.cuit && (
              <span className="text-gray-600"> (CUIT: {proveedorSeleccionado.cuit})</span>
            )}
          </div>
        )}
        
        {errores.proveedor_id && (
          <p className="text-red-500 text-sm mt-1">{errores.proveedor_id}</p>
        )}
      </div>

      {/* Transportador */}
      <div>
        <label className="block text-sm font-medium text-[#3C454A] mb-2">
          <Truck className="w-4 h-4 inline mr-1" />
          Transportador (Opcional)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={busquedaTransportador}
                onChange={(e) => setBusquedaTransportador(e.target.value)}
                placeholder={transportadorSeleccionado ? transportadorSeleccionado.nombre : "Buscar transportador..."}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
              />
            </div>
            
            {busquedaTransportador && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {transportadoresFiltrados.length > 0 ? (
                  transportadoresFiltrados.map(transportador => (
                    <button
                      key={transportador.id}
                      onClick={() => {
                        onChange({ transportador_id: transportador.id });
                        setBusquedaTransportador(''); // Limpiar búsqueda tras seleccionar
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm sm:text-base">{transportador.nombre}</div>
                      {transportador.precio_km && (
                        <div className="text-xs sm:text-sm text-gray-500">
                          ${transportador.precio_km}/km
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No se encontraron transportadores
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setMostrarModalTransportador(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] transition-colors sm:flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span>
            <span className="sm:hidden">Agregar</span>
          </button>
        </div>
        
        {datos.transportador_id && transportadorSeleccionado && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ✓ Transportador seleccionado: <strong>{transportadorSeleccionado.nombre}</strong>
            {transportadorSeleccionado.precio_km && (
              <span className="text-gray-600"> (${transportadorSeleccionado.precio_km}/km)</span>
            )}
          </div>
        )}
      </div>

      {/* Precio Total */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-[#3C454A] mb-2">
            Precio Total (Opcional)
          </label>
          <input
            type="text"
            value={formatCurrency(datos.precio_total)}
            onChange={handlePrecioChange}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
          />
        </div>

        {/* Documento */}
        <div>
          <label className="block text-sm font-medium text-[#3C454A] mb-2">
            <Upload className="w-4 h-4 inline mr-1" />
            Documento de Compra
          </label>
          <input
            type="file"
            onChange={(e) => handleInputChange('documento', e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos soportados: PDF, JPG, PNG
          </p>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-[#3C454A] mb-2">
          Observaciones
        </label>
        <textarea
          value={datos.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          placeholder="Información adicional sobre la compra..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
        />
      </div>

      {/* Modal Nuevo Proveedor */}
      {mostrarModalProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#3C454A]">Nuevo Proveedor</h3>
              <button
                onClick={() => setMostrarModalProveedor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nuevoProveedor.nombre}
                  onChange={(e) => setNuevoProveedor(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Contacto
                </label>
                <input
                  type="text"
                  value={nuevoProveedor.contacto}
                  onChange={(e) => setNuevoProveedor(prev => ({ ...prev, contacto: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  CUIT
                </label>
                <input
                  type="text"
                  value={nuevoProveedor.cuit}
                  onChange={(e) => setNuevoProveedor(prev => ({ ...prev, cuit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Establecimiento
                </label>
                <input
                  type="text"
                  value={nuevoProveedor.establecimiento}
                  onChange={(e) => setNuevoProveedor(prev => ({ ...prev, establecimiento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setMostrarModalProveedor(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={crearProveedor}
                disabled={!nuevoProveedor.nombre}
                className="flex-1 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Nuevo Transportador */}
      {mostrarModalTransportador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#3C454A]">Nuevo Transportador</h3>
              <button
                onClick={() => setMostrarModalTransportador(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nuevoTransportador.nombre}
                  onChange={(e) => setNuevoTransportador(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Contacto
                </label>
                <input
                  type="text"
                  value={nuevoTransportador.contacto}
                  onChange={(e) => setNuevoTransportador(prev => ({ ...prev, contacto: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3C454A] mb-1">
                  Precio por KM
                </label>
                <input
                  type="number"
                  value={nuevoTransportador.precio_km}
                  onChange={(e) => setNuevoTransportador(prev => ({ ...prev, precio_km: e.target.value }))}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67806D]"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setMostrarModalTransportador(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={crearTransportador}
                disabled={!nuevoTransportador.nombre}
                className="flex-1 px-4 py-2 bg-[#67806D] text-white rounded-lg hover:bg-[#5a6b60] disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
