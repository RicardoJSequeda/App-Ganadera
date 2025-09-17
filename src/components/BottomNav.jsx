import { Link, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Heart,
  Menu
} from 'lucide-react';

const navItems = [
  { to: "/", label: "Inicio", icon: BarChart3 },
  { to: "/animales", label: "Animales", icon: FileText },
  { to: "/compras", label: "Compras", icon: ShoppingCart },
  { to: "/ventas", label: "Ventas", icon: TrendingUp },
  { to: "/sanidad", label: "Sanidad", icon: Heart },
];

const BottomNav = ({ onMenuToggle }) => {
  const { pathname } = useLocation();

  return (
    <motion.nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-rural-card border-t border-rural-alternate z-30 safe-area-inset-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 40 }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1
                ${isActive 
                  ? "text-rural-primary" 
                  : "text-rural-text/60 hover:text-rural-primary"
                }
              `}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-rural-primary rounded-full"
                    layoutId="bottomIndicator"
                    style={{ x: "-50%" }}
                  />
                )}
              </div>
              <span className="text-xs font-medium mt-1 truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Botón de menú */}
        <button
          onClick={onMenuToggle}
          className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 text-rural-text/60 hover:text-rural-primary"
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs font-medium mt-1">Más</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
