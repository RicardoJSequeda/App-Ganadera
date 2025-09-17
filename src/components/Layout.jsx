import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Header from "./Header";
import PWABanner from "./PWABanner";
import ConnectionStatus from "./ConnectionStatus";
import { useAuthStore } from "../store/authStore";
import { useCompany } from "../context/CompanyContext";

function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { companyConfig } = useCompany();

  // Páginas públicas donde no se muestra la navegación
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(location.pathname);
  const showNavigation = user && !isPublicPage;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // En desktop, el sidebar debe estar siempre abierto
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Título dinámico con el nombre de la empresa
  useEffect(() => {
    if (companyConfig?.nombre) {
      const base = 'Gestión Ganadera';
      document.title = `${companyConfig.nombre} - ${base}`;
    }
  }, [companyConfig?.nombre]);

  // Layout simple para páginas públicas
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-rural-background">
        <motion.main 
          className="w-full min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    );
  }

  // Layout completo para páginas protegidas
  return (
    <div className="min-h-screen bg-rural-background flex">
      {/* Sidebar - Solo si hay usuario autenticado */}
      {showNavigation && (
        <div className={`${isMobile ? '' : 'w-72'} ${isMobile ? '' : 'flex-shrink-0'}`}>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={closeSidebar} 
            isMobile={isMobile} 
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Solo si hay usuario autenticado */}
        {showNavigation && (
          <Header 
            onMenuToggle={toggleSidebar} 
            isMobile={isMobile} 
          />
        )}

        {/* Main content */}
        <motion.main 
          className={`
            flex-1 overflow-auto
            ${showNavigation 
              ? (isMobile ? 'pt-16 pb-20' : 'pt-16') 
              : ''
            } 
            ${showNavigation ? 'px-4 lg:px-6 py-6' : ''}
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={showNavigation ? "max-w-7xl mx-auto" : "w-full"}>
            {children}
          </div>
        </motion.main>

        {/* Bottom navigation - solo en móvil y con usuario autenticado */}
        {showNavigation && <BottomNav onMenuToggle={toggleSidebar} />}
      </div>

      {/* Componentes PWA */}
      <PWABanner />
      <ConnectionStatus />
    </div>
  );
}

export default Layout;
