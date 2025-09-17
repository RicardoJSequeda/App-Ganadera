import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Plus, 
  Shield, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check,
  Edit,
  Trash2,
  Search,
  UserX,
  Calendar
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { supabase } from '../utils/supabaseClient';
import { useConfirm, confirmDelete, confirmAction } from '../hooks/useConfirm.jsx';

const Usuarios = () => {
  const { isAdmin, signUp, userProfile } = useAuthStore();
  const { showConfirm, ConfirmComponent } = useConfirm();
  
  // Verificación adicional de permisos (aunque AdminRoute ya lo protege)
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-rural-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-rural-card rounded-xl p-8 shadow-lg">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-rural-text mb-4">Acceso Restringido</h2>
            <p className="text-rural-text/70 mb-6">
              Solo los administradores pueden gestionar usuarios del sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'operador'
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (isAdmin()) {
      fetchUsuarios();
    }
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      
      await fetchUsuarios(); // Recargar lista
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
    }
  };

  const deleteUser = async (userId) => {
    const userToDelete = usuarios.find(u => u.id === userId);
    const userName = userToDelete?.nombre || 'usuario';
    
    const confirmed = await showConfirm(confirmDelete(
      'usuario',
      `¿Estás seguro que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer y el usuario perderá acceso al sistema.`
    ));
    
    if (!confirmed) return;
    
    try {
      const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Error en el servidor');
        } catch (e) {
          throw new Error(errorText || 'Error en el servidor');
        }
      }

      // Si la respuesta es exitosa pero no tiene contenido, no intentes parsear JSON
      const responseText = await response.text();
      let result = {};
      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.warn('La respuesta del servidor no es un JSON válido, pero la operación fue exitosa.');
        }
      }

      if (result.warning) {
        console.warn('⚠️ Advertencia:', result.warning);
      }

      console.log('✅ Usuario eliminado exitosamente');
      await fetchUsuarios(); // Recargar lista
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      alert(`Error al eliminar usuario: ${error.message}`);
    }
  };

  const updateUser = async (userData) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: userData.nombre,
          rol: userData.rol
        })
        .eq('id', userData.id);

      if (error) throw error;
      
      await fetchUsuarios(); // Recargar lista
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setCreateError('');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setCreateError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setCreateError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      const result = await signUp(formData.email, formData.password, formData.nombre, formData.rol);
      
      if (result.success) {
        setCreateSuccess(`Usuario ${formData.nombre} creado exitosamente`);
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'operador'
        });
        await fetchUsuarios(); // Recargar lista de usuarios
        setTimeout(() => {
          setShowCreateForm(false);
          setCreateSuccess('');
        }, 2000);
      } else {
        setCreateError(result.error || 'Error al crear el usuario');
      }
    } catch (error) {
      setCreateError('Error al crear el usuario');
    } finally {
      setIsCreating(false);
    }
  };

  const actions = isAdmin() && (
    <button 
      onClick={() => setShowCreateForm(!showCreateForm)}
      className="flex items-center space-x-2 px-4 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
    >
      <Plus className="h-4 w-4" />
      <span>Nuevo Usuario</span>
    </button>
  );

  const userTypes = [
    { 
      title: 'Administradores', 
      count: usuarios.filter(u => u.rol === 'administrador').length, 
      icon: Shield, 
      color: 'text-red-600', 
      bg: 'bg-red-100' 
    },
    { 
      title: 'Operadores', 
      count: usuarios.filter(u => u.rol === 'operador').length, 
      icon: UserCheck, 
      color: 'text-rural-primary', 
      bg: 'bg-rural-primary/10' 
    },
    { 
      title: 'Usuarios Activos', 
      count: usuarios.filter(u => u.activo).length, 
      icon: User, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rural-primary/10 rounded-xl">
              <UserCheck className="h-6 w-6 text-rural-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-rural-text">Usuarios</h1>
              <p className="text-rural-text/60">Gestión de usuarios y permisos del sistema</p>
            </div>
          </div>
          {actions}
        </div>
      </div>

      {/* Formulario de creación de usuario */}
      {showCreateForm && isAdmin() && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <h3 className="text-lg font-semibold text-rural-text mb-4">Crear Nuevo Usuario</h3>
          
          {createError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{createError}</span>
            </div>
          )}

          {createSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">{createSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-rural-text mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-rural-text mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                  placeholder="juan@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-rural-text mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rural-text/40 hover:text-rural-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-rural-text mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Rol */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-rural-text mb-2">
                Rol del usuario
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
              >
                <option value="operador">Operador</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            {/* Botones */}
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-rural-text hover:bg-rural-alternate rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Crear Usuario</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rural-text/60 text-sm font-medium">{type.title}</p>
                  <p className="text-3xl font-bold text-rural-text mt-1">{type.count}</p>
                </div>
                <div className={`p-3 rounded-xl ${type.bg}`}>
                  <Icon className={`h-6 w-6 ${type.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lista de usuarios */}
      {isAdmin() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-rural-text">Lista de Usuarios</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-rural-text/40" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rural-primary mx-auto"></div>
              <p className="text-rural-text/60 mt-2">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 text-rural-primary/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-rural-text mb-2">Sin usuarios</h3>
              <p className="text-rural-text/60">No hay usuarios registrados en el sistema</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rural-alternate/20">
                    <th className="text-left py-3 px-4 font-semibold text-rural-text">Usuario</th>
                    <th className="text-left py-3 px-4 font-semibold text-rural-text">Rol</th>
                    <th className="text-left py-3 px-4 font-semibold text-rural-text">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-rural-text">Creado</th>
                    <th className="text-center py-3 px-4 font-semibold text-rural-text">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios
                    .filter(usuario => 
                      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      usuario.rol?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((usuario, index) => (
                      <tr key={usuario.id} className="border-b border-rural-alternate/10 hover:bg-rural-alternate/5">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              usuario.rol === 'administrador' ? 'bg-red-100' : 'bg-rural-primary/10'
                            }`}>
                              {usuario.rol === 'administrador' ? (
                                <Shield className={`h-5 w-5 text-red-600`} />
                              ) : (
                                <User className="h-5 w-5 text-rural-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-rural-text">{usuario.nombre}</div>
                              <div className="text-sm text-rural-text/60">{usuario.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.rol === 'administrador' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-rural-primary/10 text-rural-primary'
                          }`}>
                            {usuario.rol === 'administrador' ? 'Administrador' : 'Operador'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.activo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm text-rural-text/60">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(usuario.created_at).toLocaleDateString('es-AR')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingUser(usuario);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-rural-text/60 hover:text-rural-primary hover:bg-rural-primary/10 rounded-lg transition-colors"
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => toggleUserStatus(usuario.id, usuario.activo)}
                              className={`p-2 rounded-lg transition-colors ${
                                usuario.activo 
                                  ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                            >
                              {usuario.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>

                            {usuario.id !== userProfile?.id && (
                              <button
                                onClick={() => deleteUser(usuario.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal para editar usuario */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rural-card rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-rural-text mb-4">Editar Usuario</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              updateUser(editingUser);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-rural-text mb-2">Nombre</label>
                <input
                  type="text"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                  className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rural-text mb-2">Rol</label>
                <select
                  value={editingUser.rol}
                  onChange={(e) => setEditingUser({...editingUser, rol: e.target.value})}
                  className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                >
                  <option value="operador">Operador</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-rural-text hover:bg-rural-alternate rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Perfil propio para operadores */}
      {!isAdmin() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50"
        >
          <h3 className="text-lg font-semibold text-rural-text mb-4">Mi Perfil</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-rural-text mb-2">Nombre</label>
              <div className="text-rural-text">{userProfile?.nombre}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-rural-text mb-2">Rol</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rural-primary/10 text-rural-primary">
                {userProfile?.rol === 'administrador' ? 'Administrador' : 'Operador'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Modal de confirmación */}
      <ConfirmComponent />
    </div>
  );
};

export default Usuarios;