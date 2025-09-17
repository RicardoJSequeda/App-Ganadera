import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { useCompany } from '../context/CompanyContext';
import { 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Heart, 
  Truck, 
  Users, 
  Settings, 
  HelpCircle, 
  UserCheck,
  Scale,
  Package2,
  X,
  UserPlus,
  Receipt
} from 'lucide-react';

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/animales", label: "Animales", icon: FileText },
  { to: "/lotes", label: "Lotes", icon: Package2 },
  { to: "/compras", label: "Compras", icon: ShoppingCart },
  { to: "/ventas", label: "Ventas", icon: TrendingUp },
  { to: "/facturacion", label: "Facturación", icon: Receipt },
  { to: "/pesadas", label: "Pesadas", icon: Scale },
  { to: "/sanidad", label: "Sanidad", icon: Heart },
  { to: "/proveedores", label: "Proveedores", icon: Users },
  { to: "/transporte", label: "Transporte", icon: Truck },
  { to: "/compradores", label: "Compradores", icon: UserPlus },
  { to: "/configuracion", label: "Configuración", icon: Settings },
  { to: "/ayuda", label: "Ayuda", icon: HelpCircle },
  { to: "/usuarios", label: "Usuarios", icon: UserCheck, adminOnly: true } // Solo admin
];

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuthStore();
  const { companyConfig } = useCompany();

  // Filtrar elementos según el rol del usuario
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin(); // Solo mostrar si es admin
    }
    return true; // Mostrar para todos los demás elementos
  });

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40
      }
    },
    closed: {
      x: isMobile ? "-100%" : 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40
      }
    }
  };

  const itemVariants = {
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav 
        className={`
          ${isMobile ? 'fixed' : 'sticky'} 
          ${isMobile ? 'top-0' : 'top-0'} 
          left-0 h-screen w-72 bg-rural-alternate border-r border-rural-secondary/20 
          z-50 flex flex-col overflow-y-auto
          ${isMobile ? 'pt-4' : 'pt-2'}
        `}
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        initial={isMobile ? "closed" : "open"}
      >
        {/* Header del sidebar - Siempre visible */}
        <div className="flex items-center justify-between p-4 border-b border-rural-secondary/20">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Gutiérrez Hnos Logo" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h2 className="text-lg font-bold text-rural-text">{companyConfig.nombre}</h2>
              <p className="text-sm text-rural-text/70">Gestión Ganadera</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-rural-background rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-rural-text" />
            </button>
          )}
        </div>

        {/* Lista de navegación */}
        <div className="flex-1 px-6 py-4 space-y-2">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.to;
            
            return (
              <motion.div
                key={item.to}
                custom={index}
                variants={itemVariants}
                animate="open"
                initial="closed"
              >
                <Link
                  to={item.to}
                  onClick={isMobile ? onClose : undefined}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? "bg-rural-primary text-white shadow-md" 
                      : "text-rural-text hover:bg-rural-background hover:text-rural-primary"
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-rural-primary'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer del sidebar */}
        <div className="p-6 border-t border-rural-secondary/20">
          <div className="text-center text-sm text-rural-text/60">
            <p>© 2025 {companyConfig.nombre}</p>
            <p>Gestión Ganadera</p>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Sidebar;
