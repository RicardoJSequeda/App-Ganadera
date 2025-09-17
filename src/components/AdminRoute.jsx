import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuthStore();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-rural-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rural-primary mx-auto mb-4"></div>
          <p className="text-rural-text/70">Verificando permisos...</p>
        </motion.div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero no es admin, redirigir al dashboard
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-rural-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="bg-rural-card rounded-xl p-8 shadow-lg">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-rural-text mb-4">Acceso Denegado</h2>
            <p className="text-rural-text/70 mb-6">
              No tienes permisos para acceder a esta página. Solo los administradores pueden ver este contenido.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-rural-primary text-white px-6 py-3 rounded-lg hover:bg-rural-primary/90 transition-colors"
            >
              Volver atrás
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Si está autenticado y es admin, mostrar el contenido protegido
  return children;
};

export default AdminRoute;
