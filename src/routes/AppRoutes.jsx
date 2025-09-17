import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

// Páginas públicas
import Login from "../pages/Login";

// Páginas protegidas
import Dashboard from "../pages/Dashboard";
import Animales from "../pages/Animales";
import Lotes from "../pages/Lotes";
import Compras from "../pages/Compras";
import Ventas from "../pages/Ventas";
import Pesadas from "../pages/Pesadas";
import Sanidad from "../pages/Sanidad";
import Proveedores from "../pages/Proveedores";
import Transportadores from "../pages/Transportadores";
import Compradores from "../pages/Compradores";
import Configuracion from "../pages/Configuracion";
import Ayuda from "../pages/Ayuda";
import Usuarios from "../pages/Usuarios";
import Facturacion from "../pages/Facturacion";

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/animales" element={
        <ProtectedRoute>
          <Animales />
        </ProtectedRoute>
      } />
      
      <Route path="/lotes" element={
        <ProtectedRoute>
          <Lotes />
        </ProtectedRoute>
      } />
      
      <Route path="/compras" element={
        <ProtectedRoute>
          <Compras />
        </ProtectedRoute>
      } />
      
      <Route path="/ventas" element={
        <ProtectedRoute>
          <Ventas />
        </ProtectedRoute>
      } />
      
      <Route path="/pesadas" element={
        <ProtectedRoute>
          <Pesadas />
        </ProtectedRoute>
      } />
      
      <Route path="/sanidad" element={
        <ProtectedRoute>
          <Sanidad />
        </ProtectedRoute>
      } />
      
      <Route path="/proveedores" element={
        <ProtectedRoute>
          <Proveedores />
        </ProtectedRoute>
      } />
      
      <Route path="/transporte" element={
        <ProtectedRoute>
          <Transportadores />
        </ProtectedRoute>
      } />
      
      <Route path="/compradores" element={
        <ProtectedRoute>
          <Compradores />
        </ProtectedRoute>
      } />
      
      <Route path="/facturacion" element={
        <ProtectedRoute>
          <Facturacion />
        </ProtectedRoute>
      } />
      
      <Route path="/configuracion" element={
        <ProtectedRoute>
          <Configuracion />
        </ProtectedRoute>
      } />
      
      <Route path="/ayuda" element={
        <ProtectedRoute>
          <Ayuda />
        </ProtectedRoute>
      } />
      
      <Route path="/usuarios" element={
        <AdminRoute>
          <Usuarios />
        </AdminRoute>
      } />
      
      {/* Ruta por defecto - redirigir al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
