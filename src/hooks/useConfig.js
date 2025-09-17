import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useConfig = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todas las configuraciones
  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuraciones')
        .select('*');

      if (error) throw error;

      // Convertir array a objeto usando la clave como key
      const configObj = {};
      data?.forEach(item => {
        // Convertir valor según el tipo
        let value = item.valor;
        switch (item.tipo) {
          case 'number':
            value = parseFloat(item.valor);
            break;
          case 'boolean':
            value = item.valor === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(item.valor);
            } catch (e) {
              value = item.valor;
            }
            break;
          default:
            value = item.valor;
        }
        
        configObj[item.clave] = {
          valor: value,
          descripcion: item.descripcion,
          tipo: item.tipo,
          categoria: item.categoria,
          editable: item.editable
        };
      });

      setConfig(configObj);
      setError(null);
    } catch (err) {
      console.error('Error cargando configuraciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener configuración por clave
  const getConfig = (clave, defaultValue = null) => {
    return config[clave]?.valor ?? defaultValue;
  };

  // Obtener configuraciones por categoría
  const getConfigByCategory = (categoria) => {
    const result = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value.categoria === categoria) {
        result[key] = value;
      }
    });
    return result;
  };

  // Establecer configuración
  const setConfigValue = async (clave, valor, descripcion = null, tipo = 'string', categoria = 'sistema') => {
    try {
      const configData = {
        clave,
        valor: typeof valor === 'object' ? JSON.stringify(valor) : String(valor),
        tipo,
        categoria
      };

      if (descripcion) {
        configData.descripcion = descripcion;
      }

      const { error } = await supabase
        .from('configuraciones')
        .upsert(configData, { onConflict: 'clave' });

      if (error) throw error;

      // Actualizar estado local
      setConfig(prev => ({
        ...prev,
        [clave]: {
          valor,
          descripcion,
          tipo,
          categoria,
          editable: true
        }
      }));

      return true;
    } catch (err) {
      console.error('Error estableciendo configuración:', err);
      setError(err.message);
      return false;
    }
  };

  // Establecer múltiples configuraciones
  const setMultipleConfig = async (configs) => {
    try {
      const configData = configs.map(({ clave, valor, descripcion, tipo, categoria }) => ({
        clave,
        valor: typeof valor === 'object' ? JSON.stringify(valor) : String(valor),
        descripcion,
        tipo: tipo || 'string',
        categoria: categoria || 'sistema'
      }));

      const { error } = await supabase
        .from('configuraciones')
        .upsert(configData, { onConflict: 'clave' });

      if (error) throw error;

      // Actualizar estado local
      const newConfig = { ...config };
      configs.forEach(({ clave, valor, descripcion, tipo, categoria }) => {
        newConfig[clave] = {
          valor,
          descripcion,
          tipo: tipo || 'string',
          categoria: categoria || 'sistema',
          editable: true
        };
      });

      setConfig(newConfig);
      return true;
    } catch (err) {
      console.error('Error estableciendo múltiples configuraciones:', err);
      setError(err.message);
      return false;
    }
  };

  // Resetear configuración a valores por defecto
  const resetConfig = async () => {
    try {
      // Eliminar todas las configuraciones editables
      const { error } = await supabase
        .from('configuraciones')
        .delete()
        .eq('editable', true);

      if (error) throw error;

      // Recargar configuraciones (esto cargará los valores por defecto)
      await loadConfig();
      return true;
    } catch (err) {
      console.error('Error reseteando configuraciones:', err);
      setError(err.message);
      return false;
    }
  };

  // Cargar configuraciones al montar el hook
  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    loadConfig,
    getConfig,
    getConfigByCategory,
    setConfig: setConfigValue,
    setMultipleConfig,
    resetConfig
  };
};

// Hook específico para configuraciones de empresa
export const useEmpresaConfig = () => {
  const { getConfigByCategory, setMultipleConfig, loading, error } = useConfig();
  
  const empresaConfig = getConfigByCategory('empresa');
  
  const updateEmpresaConfig = async (newConfig) => {
    const configs = Object.entries(newConfig).map(([key, value]) => ({
      clave: `empresa.${key}`,
      valor: value,
      categoria: 'empresa',
      tipo: 'string'
    }));
    
    return await setMultipleConfig(configs);
  };

  return {
    empresaConfig,
    updateEmpresaConfig,
    loading,
    error
  };
};

// Hook específico para configuraciones del sistema
export const useSistemaConfig = () => {
  const { getConfigByCategory, setMultipleConfig, loading, error } = useConfig();
  
  const sistemaConfig = getConfigByCategory('sistema');
  
  const updateSistemaConfig = async (newConfig) => {
    const configs = Object.entries(newConfig).map(([key, value]) => ({
      clave: `sistema.${key}`,
      valor: value,
      categoria: 'sistema',
      tipo: key.includes('decimales') ? 'number' : 'string'
    }));
    
    return await setMultipleConfig(configs);
  };

  return {
    sistemaConfig,
    updateSistemaConfig,
    loading,
    error
  };
};

// Hook específico para valores por defecto
export const useValoresConfig = () => {
  const { getConfigByCategory, setMultipleConfig, loading, error } = useConfig();
  
  const valoresConfig = getConfigByCategory('valores');
  
  const updateValoresConfig = async (newConfig) => {
    const configs = Object.entries(newConfig).map(([key, value]) => ({
      clave: `valores.${key}`,
      valor: value,
      categoria: 'valores',
      tipo: key.includes('peso') || key.includes('dias') ? 'number' : 'string'
    }));
    
    return await setMultipleConfig(configs);
  };

  return {
    valoresConfig,
    updateValoresConfig,
    loading,
    error
  };
};
