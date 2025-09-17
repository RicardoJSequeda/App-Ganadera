import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany debe ser usado dentro de CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [companyConfig, setCompanyConfig] = useState({
    nombre: 'Gutiérrez Hnos',
    direccion: 'Montería, Córdoba, Colombia',
    telefono: '+57 604 123-4567',
    email: 'contacto@gutierrezhnos.com',
    cuit: '900.123.456-7',
    descripcion: 'Empresa familiar dedicada a la gestión ganadera en Córdoba, Colombia'
  });
  const [loading, setLoading] = useState(true);

  // Cargar configuración de la empresa desde la base de datos
  const loadCompanyConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuraciones')
        .select('clave, valor')
        .like('clave', 'empresa.%');

      if (error) throw error;

      if (data && data.length > 0) {
        const config = {};
        data.forEach(item => {
          const key = item.clave.replace('empresa.', '');
          config[key] = item.valor;
        });

        setCompanyConfig(prev => ({
          ...prev,
          ...config
        }));
      }
    } catch (err) {
      console.error('Error cargando configuración de empresa:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar configuración de la empresa
  const updateCompanyConfig = async (newConfig) => {
    try {
      const configs = Object.entries(newConfig).map(([key, value]) => ({
        clave: `empresa.${key}`,
        valor: value,
        categoria: 'empresa',
        tipo: 'string'
      }));

      const { error } = await supabase
        .from('configuraciones')
        .upsert(configs, { onConflict: 'clave' });

      if (error) throw error;

      // Actualizar estado local
      setCompanyConfig(prev => ({
        ...prev,
        ...newConfig
      }));

      return true;
    } catch (err) {
      console.error('Error actualizando configuración de empresa:', err);
      return false;
    }
  };

  // Escuchar cambios en tiempo real
  useEffect(() => {
    loadCompanyConfig();

    // Suscribirse a cambios en la tabla de configuraciones
    const subscription = supabase
      .channel('company-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'configuraciones',
          filter: 'clave=like.empresa.%'
        },
        (payload) => {
          console.log('Cambio detectado en configuración de empresa:', payload);
          if (payload.new) {
            const key = payload.new.clave.replace('empresa.', '');
            setCompanyConfig(prev => ({
              ...prev,
              [key]: payload.new.valor
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    companyConfig,
    loading,
    updateCompanyConfig,
    loadCompanyConfig
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
