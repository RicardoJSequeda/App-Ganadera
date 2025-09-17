import { motion } from 'framer-motion';
import { Menu, Bell, User, LogOut, Shield, Loader } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { useSystemNotifications } from '../hooks/useSystemNotifications';
import { useCompany } from '../context/CompanyContext';
import NotificationCenter from './NotificationCenter';

const Header = ({ onMenuToggle, isMobile }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { userProfile, signOut } = useAuthStore();
  const { notifications, loading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications();
  const { unreadCount: systemUnreadCount } = useSystemNotifications();
  const { companyConfig } = useCompany();

  const handleLogout = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      setShowNotifications(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'alert': return '🚨';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <motion.header 
      className="bg-rural-card shadow-sm border-b border-rural-alternate h-16 flex items-center justify-between px-4 lg:px-6 fixed top-0 left-0 right-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo y nombre - Solo en móvil */}
      <div className="flex items-center space-x-3">
        {isMobile && (
          <>
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-rural-alternate rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-rural-text" />
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Gutiérrez Hnos Logo" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-rural-text">{companyConfig.nombre}</h1>
                <p className="text-sm text-rural-text/70">Gestión Ganadera</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Acciones del header */}
      <div className="flex items-center space-x-2">
        {/* Notificaciones */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-rural-alternate rounded-lg transition-colors relative"
          >
            <Bell className="h-5 w-5 text-rural-text" />
            {(notifications.length > 0 || systemUnreadCount > 0) && (
              <span className="absolute -top-1 -right-1 bg-rural-alert text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length + systemUnreadCount}
              </span>
            )}
          </button>

          {/* Centro de notificaciones */}
          <NotificationCenter 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        </div>
        
        {/* Perfil de usuario */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-2 hover:bg-rural-alternate rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              {/* Avatar */}
              <div className="h-8 w-8 bg-rural-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userProfile?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              
              {/* Info usuario (ocultar en móvil) */}
              {!isMobile && (
                <div className="text-left">
                  <p className="text-sm font-medium text-rural-text">
                    {userProfile?.nombre || 'Usuario'}
                  </p>
                  <div className="flex items-center space-x-1">
                    {userProfile?.rol === 'administrador' && (
                      <Shield className="h-3 w-3 text-rural-primary" />
                    )}
                    <p className="text-xs text-rural-text/60 capitalize">
                      {userProfile?.rol || 'operador'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Menú desplegable del perfil */}
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-rural-card rounded-xl shadow-lg border border-rural-alternate/50 py-2 z-50"
            >
              {/* Info del usuario */}
              <div className="px-4 py-3 border-b border-rural-alternate/30">
                <p className="font-medium text-rural-text">{userProfile?.nombre}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {userProfile?.rol === 'administrador' && (
                    <Shield className="h-3 w-3 text-rural-primary" />
                  )}
                  <p className="text-sm text-rural-text/60 capitalize">
                    {userProfile?.rol}
                  </p>
                </div>
              </div>

              {/* Opciones del menú */}
              <div className="py-1">
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar menús en móvil */}
      {(showProfileMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </motion.header>
  );
};

export default Header;
