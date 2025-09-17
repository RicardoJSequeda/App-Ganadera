import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { 
  Settings, 
  User, 
  Globe, 
  Shield, 
  Save, 
  RefreshCw,
  Book,
  Phone,
  Mail,
  MapPin,
  Building,
  FileText,
  AlertCircle,
  Check,
  Trash2,
  Database,
  Download,
  Upload
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { supabase } from '../utils/supabaseClient';
import { useConfirm, confirmDelete, confirmAction } from '../hooks/useConfirm.jsx';
import { useConfig, useEmpresaConfig, useSistemaConfig, useValoresConfig } from '../hooks/useConfig';
import { useCompany } from '../context/CompanyContext';

const Configuracion = () => {
  const { userProfile, isAdmin } = useAuthStore();
  const { showConfirm, ConfirmComponent } = useConfirm();
  const [activeTab, setActiveTab] = useState('general');
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(null);

  // Hooks de configuración
  const { config, loading: configLoading, error: configError } = useConfig();
  const { empresaConfig, updateEmpresaConfig, loading: empresaLoading } = useEmpresaConfig();
  const { sistemaConfig, updateSistemaConfig, loading: sistemaLoading } = useSistemaConfig();
  const { valoresConfig, updateValoresConfig, loading: valoresLoading } = useValoresConfig();
  const { updateCompanyConfig } = useCompany();
  const [dbStats, setDbStats] = useState({
    animales: 0,
    compras: 0,
    ventas: 0,
    eventos: 0,
    pesadas: 0,
    lotes: 0,
    transportes: 0,
    proveedores: 0,
    compradores: 0
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'empresa', label: 'Empresa', icon: Building },
    { id: 'valores', label: 'Valores por Defecto', icon: FileText },
    ...(isAdmin() ? [{ id: 'mantenimiento', label: 'Mantenimiento', icon: AlertCircle }] : [])
  ];

  // Estados locales para formularios (se sincronizan con la BD)
  const [empresaForm, setEmpresaForm] = useState({});
  const [sistemaForm, setSistemaForm] = useState({});
  const [valoresForm, setValoresForm] = useState({});

  // Función para guardar configuración de empresa
  const handleSaveEmpresa = async () => {
    setIsLoading(true);
    try {
      const success = await updateEmpresaConfig(empresaForm);
      if (success) {
        // También actualizar el contexto global
        await updateCompanyConfig(empresaForm);
        setSaveMessage('Configuración de empresa guardada correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Error al guardar la configuración de empresa');
      }
    } catch (error) {
      setSaveMessage('Error al guardar la configuración de empresa');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar configuración del sistema
  const handleSaveSistema = async () => {
    setIsLoading(true);
    try {
      const success = await updateSistemaConfig(sistemaForm);
      if (success) {
        setSaveMessage('Configuración del sistema guardada correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Error al guardar la configuración del sistema');
      }
    } catch (error) {
      setSaveMessage('Error al guardar la configuración del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar valores por defecto
  const handleSaveValores = async () => {
    setIsLoading(true);
    try {
      const success = await updateValoresConfig(valoresForm);
      if (success) {
        setSaveMessage('Valores por defecto guardados correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Error al guardar los valores por defecto');
      }
    } catch (error) {
      setSaveMessage('Error al guardar los valores por defecto');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para sincronizar formularios con datos de la BD
  const syncFormsWithConfig = () => {
    if (Object.keys(config).length > 0) {
      // Sincronizar formulario de empresa
      const empresaData = {};
      Object.entries(config).forEach(([key, value]) => {
        if (key.startsWith('empresa.')) {
          const field = key.replace('empresa.', '');
          empresaData[field] = value.valor;
        }
      });
      setEmpresaForm(empresaData);

      // Sincronizar formulario de sistema
      const sistemaData = {};
      Object.entries(config).forEach(([key, value]) => {
        if (key.startsWith('sistema.')) {
          const field = key.replace('sistema.', '');
          sistemaData[field] = value.valor;
        }
      });
      setSistemaForm(sistemaData);

      // Sincronizar formulario de valores
      const valoresData = {};
      Object.entries(config).forEach(([key, value]) => {
        if (key.startsWith('valores.')) {
          const field = key.replace('valores.', '');
          valoresData[field] = value.valor;
        }
      });
      setValoresForm(valoresData);
    }
  };

  // Función para obtener estadísticas de la base de datos
  const loadDatabaseStats = async () => {
    try {
      const [animalesCount, comprasCount, ventasCount, eventosCount, pesadasCount, lotesCount, transportesCount, proveedoresCount, compradoresCount] = await Promise.all([
        supabase.from('animales').select('id', { count: 'exact', head: true }),
        supabase.from('compras').select('id', { count: 'exact', head: true }),
        supabase.from('ventas').select('id', { count: 'exact', head: true }),
        supabase.from('eventos_sanitarios').select('id', { count: 'exact', head: true }),
        supabase.from('pesadas').select('id', { count: 'exact', head: true }),
        supabase.from('lotes').select('id', { count: 'exact', head: true }),
        supabase.from('transportadores').select('id', { count: 'exact', head: true }),
        supabase.from('proveedores').select('id', { count: 'exact', head: true }),
        supabase.from('compradores').select('id', { count: 'exact', head: true })
      ]);

      setDbStats({
        animales: animalesCount.count || 0,
        compras: comprasCount.count || 0,
        ventas: ventasCount.count || 0,
        eventos: eventosCount.count || 0,
        pesadas: pesadasCount.count || 0,
        lotes: lotesCount.count || 0,
        transportes: transportesCount.count || 0,
        proveedores: proveedoresCount.count || 0,
        compradores: compradoresCount.count || 0
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Cargar estadísticas cuando se entra a la pestaña de mantenimiento
  useEffect(() => {
    if (activeTab === 'mantenimiento' && isAdmin()) {
      loadDatabaseStats();
    }
  }, [activeTab]);

  // Sincronizar formularios cuando se carguen las configuraciones
  useEffect(() => {
    if (!configLoading && Object.keys(config).length > 0) {
      syncFormsWithConfig();
    }
  }, [config, configLoading]);

  // Funciones de mantenimiento de base de datos (solo para administradores)
  const handleDeleteData = async (dataType, tableName) => {
    // Verificar que sea administrador
    if (!isAdmin()) {
      await showConfirm({
        type: 'danger',
        title: 'Acceso denegado',
        message: 'Solo los administradores pueden realizar operaciones de mantenimiento.',
        confirmText: 'Entendido'
      });
      return;
    }

    setMaintenanceLoading(tableName);
    try {
      let result;
      
      switch (tableName) {
        case 'animales':
          // Primero eliminar pesadas que referencian animales
          console.log('Eliminando pesadas antes de eliminar animales...');
          const pesadasResult = await supabase.from('pesadas').delete().gt('created_at', '1900-01-01');
          console.log('Pesadas eliminadas:', pesadasResult);
          if (pesadasResult.error) {
            console.error('Error al eliminar pesadas:', pesadasResult.error);
            // No fallar aquí si la tabla no existe
          }
          
          // Luego eliminar animales usando delete directo
          result = await supabase.rpc('delete_all_animales');
          if (!result.data && !result.error) {
            // Si no hay función RPC, usar delete normal
            result = await supabase.from('animales').delete().gt('created_at', '1900-01-01');
          }
          break;
        case 'compras':
          result = await supabase.from('compras').delete().gt('created_at', '1900-01-01');
          break;
        case 'ventas':
          // Primero eliminar detalle_venta, luego ventas
          await supabase.from('detalle_venta').delete().gt('created_at', '1900-01-01');
          result = await supabase.from('ventas').delete().gt('created_at', '1900-01-01');
          break;
        case 'sanidad':
          result = await supabase.from('eventos_sanitarios').delete().gt('created_at', '1900-01-01');
          break;
        case 'lotes':
          // Primero eliminar animal_lote, luego lotes
          await supabase.from('animal_lote').delete().gt('fecha_asignacion', '1900-01-01');
          result = await supabase.from('lotes').delete().gt('created_at', '1900-01-01');
          break;
        case 'pesadas':
          result = await supabase.from('pesadas').delete().gt('created_at', '1900-01-01');
          break;
        case 'transportes':
          result = await supabase.from('transportadores').delete().gt('created_at', '1900-01-01');
          break;
        case 'proveedores':
          result = await supabase.from('proveedores').delete().gt('created_at', '1900-01-01');
          break;
        case 'compradores':
          result = await supabase.from('compradores').delete().gt('created_at', '1900-01-01');
          break;
        case 'todo':
          // Eliminar en orden correcto para respetar las FK
          console.log('Iniciando eliminación completa de datos...');
          
          try {
            // 1. Primero eliminar todas las relaciones que dependen de animales
            console.log('Eliminando detalle_venta...');
            const detalleResult = await supabase.from('detalle_venta').delete().gt('created_at', '1900-01-01');
            console.log('Detalle venta eliminado:', detalleResult);
            
            console.log('Eliminando eventos_sanitarios...');
            const eventosResult = await supabase.from('eventos_sanitarios').delete().gt('created_at', '1900-01-01');
            console.log('Eventos sanitarios eliminados:', eventosResult);
            
            console.log('Eliminando animal_lote...');
            const animalLoteResult = await supabase.from('animal_lote').delete().gt('fecha_asignacion', '1900-01-01');
            console.log('Animal lote eliminado:', animalLoteResult);
            
            // 1.5. IMPORTANTE: Eliminar pesadas antes que animales
            console.log('Eliminando pesadas...');
            const pesadasResult = await supabase.from('pesadas').delete().gt('created_at', '1900-01-01');
            console.log('Pesadas eliminadas:', pesadasResult);
            if (pesadasResult.error) {
              console.error('Error específico al eliminar pesadas:', pesadasResult.error);
              // No lanzar error aquí, la tabla pesadas podría no existir aún
            }
            
            // 2. Después eliminar ventas y lotes (no dependen de animales)
            console.log('Eliminando ventas...');
            const ventasResult = await supabase.from('ventas').delete().gt('created_at', '1900-01-01');
            console.log('Ventas eliminadas:', ventasResult);
            
            console.log('Eliminando lotes...');
            const lotesResult = await supabase.from('lotes').delete().gt('created_at', '1900-01-01');
            console.log('Lotes eliminados:', lotesResult);
            
            // 3. Ahora sí eliminar animales - Intentar diferentes métodos
            console.log('Eliminando animales...');
            
            // Método 1: Intentar eliminación directa por lotes pequeños
            const { data: animalesIds, error: fetchError } = await supabase
              .from('animales')
              .select('id')
              .limit(1000);
            
            if (fetchError) {
              console.error('Error obteniendo IDs de animales:', fetchError);
              throw new Error(`Error obteniendo animales: ${fetchError.message}`);
            }
            
            if (animalesIds && animalesIds.length > 0) {
              console.log(`Eliminando ${animalesIds.length} animales en lotes...`);
              
              // Eliminar por lotes de 50 animales
              for (let i = 0; i < animalesIds.length; i += 50) {
                const batch = animalesIds.slice(i, i + 50);
                const ids = batch.map(a => a.id);
                
                const batchResult = await supabase
                  .from('animales')
                  .delete()
                  .in('id', ids);
                
                console.log(`Lote ${Math.floor(i/50) + 1} eliminado:`, batchResult);
                
                if (batchResult.error) {
                  console.error('Error en lote:', batchResult.error);
                  throw new Error(`Error eliminando lote de animales: ${batchResult.error.message}`);
                }
                
                // Pequeña pausa entre lotes para no sobrecargar la DB
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              console.log('Todos los animales eliminados exitosamente');
            } else {
              console.log('No hay animales para eliminar');
            }
            
            // 4. Eliminar transportes y proveedores (no dependen de otras tablas)
            console.log('Eliminando transportes...');
            const transportesResult = await supabase.from('transportadores').delete().gt('created_at', '1900-01-01');
            console.log('Transportes eliminados:', transportesResult);
            if (transportesResult.error) {
              console.error('Error específico al eliminar transportes:', transportesResult.error);
              // No lanzar error, la tabla podría no existir
            }
            
            console.log('Eliminando proveedores...');
            const proveedoresResult = await supabase.from('proveedores').delete().gt('created_at', '1900-01-01');
            console.log('Proveedores eliminados:', proveedoresResult);
            if (proveedoresResult.error) {
              console.error('Error específico al eliminar proveedores:', proveedoresResult.error);
              // No lanzar error, la tabla podría no existir
            }
            
            console.log('Eliminando compradores...');
            const compradoresResult = await supabase.from('compradores').delete().gt('created_at', '1900-01-01');
            console.log('Compradores eliminados:', compradoresResult);
            if (compradoresResult.error) {
              console.error('Error específico al eliminar compradores:', compradoresResult.error);
              // No lanzar error, la tabla podría no existir
            }
            
            // 5. Finalmente eliminar compras
            console.log('Eliminando compras...');
            const comprasResult = await supabase.from('compras').delete().gt('created_at', '1900-01-01');
            console.log('Compras eliminadas:', comprasResult);
            if (comprasResult.error) {
              console.error('Error específico al eliminar compras:', comprasResult.error);
              throw new Error(`Error eliminando compras: ${comprasResult.error.message}`);
            }
          
            console.log('Eliminación completa finalizada exitosamente');
            result = { error: null };
          } catch (stepError) {
            console.error('Error en eliminación completa:', stepError);
            throw stepError;
          }
          break;
        default:
          throw new Error('Tipo de datos no válido');
      }

      if (result && result.error) {
        console.error('Error en resultado:', result.error);
        throw result.error;
      }
      
      setSaveMessage(`${dataType} eliminados correctamente`);
      setTimeout(() => setSaveMessage(''), 3000);
      
      // Actualizar estadísticas después de eliminar
      await loadDatabaseStats();
    } catch (error) {
      console.error('Error al eliminar datos:', error);
      setSaveMessage(`Error al eliminar ${dataType}: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setMaintenanceLoading(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleExportData = async () => {
    // Verificar que sea administrador
    if (!isAdmin()) {
      await showConfirm({
        type: 'danger',
        title: 'Acceso denegado',
        message: 'Solo los administradores pueden exportar datos del sistema.',
        confirmText: 'Entendido'
      });
      return;
    }

    setMaintenanceLoading('export');
    try {
      // Obtener todos los datos de las tablas principales
      const [animales, compras, ventas, detalle_venta, eventos_sanitarios, lotes, animal_lote, proveedores, compradores, transportadores] = await Promise.all([
        supabase.from('animales').select('*'),
        supabase.from('compras').select('*'),
        supabase.from('ventas').select('*'),
        supabase.from('detalle_venta').select('*'),
        supabase.from('eventos_sanitarios').select('*'),
        supabase.from('lotes').select('*'),
        supabase.from('animal_lote').select('*'),
        supabase.from('proveedores').select('*'),
        supabase.from('compradores').select('*'),
        supabase.from('transportadores').select('*')
      ]);

      // Crear objeto con todos los datos
      const exportData = {
        fecha_exportacion: new Date().toISOString(),
        version: '1.0',
        datos: {
          animales: animales.data || [],
          compras: compras.data || [],
          ventas: ventas.data || [],
          detalle_venta: detalle_venta.data || [],
          eventos_sanitarios: eventos_sanitarios.data || [],
          lotes: lotes.data || [],
          animal_lote: animal_lote.data || [],
          proveedores: proveedores.data || [],
          compradores: compradores.data || [],
          transportadores: transportadores.data || []
        }
      };

      // Crear y descargar archivo JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gutierrez_hnos_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSaveMessage('Datos exportados correctamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error al exportar datos:', error);
      setSaveMessage(`Error al exportar datos: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setMaintenanceLoading(null);
    }
  };

  const handleImportData = async () => {
    // Verificar que sea administrador
    if (!isAdmin()) {
      await showConfirm({
        type: 'danger',
        title: 'Acceso denegado',
        message: 'Solo los administradores pueden importar datos al sistema.',
        confirmText: 'Entendido'
      });
      return;
    }

    // Crear input file para seleccionar archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Confirmar importación con modal personalizado
      const confirmed = await showConfirm(confirmAction(
        'Importar datos',
        '¿Estás seguro de que quieres importar estos datos? Esto puede sobrescribir datos existentes.'
      ));

      if (!confirmed) return;

      setMaintenanceLoading('import');
      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (!importData.datos) {
          throw new Error('Formato de archivo no válido');
        }

        // Importar datos en orden correcto
        const { datos } = importData;
        
        if (datos.proveedores?.length) {
          await supabase.from('proveedores').upsert(datos.proveedores);
        }
        if (datos.compradores?.length) {
          await supabase.from('compradores').upsert(datos.compradores);
        }
        if (datos.transportadores?.length) {
          await supabase.from('transportadores').upsert(datos.transportadores);
        }
        if (datos.compras?.length) {
          await supabase.from('compras').upsert(datos.compras);
        }
        if (datos.lotes?.length) {
          await supabase.from('lotes').upsert(datos.lotes);
        }
        if (datos.animales?.length) {
          await supabase.from('animales').upsert(datos.animales);
        }
        if (datos.animal_lote?.length) {
          await supabase.from('animal_lote').upsert(datos.animal_lote);
        }
        if (datos.eventos_sanitarios?.length) {
          await supabase.from('eventos_sanitarios').upsert(datos.eventos_sanitarios);
        }
        if (datos.ventas?.length) {
          await supabase.from('ventas').upsert(datos.ventas);
        }
        if (datos.detalle_venta?.length) {
          await supabase.from('detalle_venta').upsert(datos.detalle_venta);
        }
        
        setSaveMessage('Datos importados correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Error al importar datos:', error);
        setSaveMessage(`Error al importar datos: ${error.message}`);
        setTimeout(() => setSaveMessage(''), 5000);
      } finally {
        setMaintenanceLoading(null);
      }
    };
    
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rural-primary/10 rounded-xl">
            <Settings className="h-6 w-6 text-rural-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-rural-text">Configuración</h1>
            <p className="text-rural-text/60">Ajustes y preferencias del sistema</p>
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center space-x-2 ${
            saveMessage.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-600' 
              : 'bg-green-50 border border-green-200 text-green-600'
          }`}
        >
          {saveMessage.includes('Error') ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          <span>{saveMessage}</span>
        </motion.div>
      )}

      {/* Indicador de carga de configuraciones */}
      {configLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center space-x-2"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Cargando configuraciones...</span>
        </motion.div>
      )}

      {/* Error de configuración */}
      {configError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5" />
          <span>Error al cargar configuraciones: {configError}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="bg-rural-card rounded-2xl shadow-sm border border-rural-alternate/50">
        <div className="border-b border-rural-alternate/20">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-rural-primary text-rural-primary'
                      : 'border-transparent text-rural-text/60 hover:text-rural-text'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab General */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-rural-text">Configuración General</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Moneda</label>
                  <select
                    value={sistemaForm.moneda || 'COP'}
                    onChange={(e) => setSistemaForm({...sistemaForm, moneda: e.target.value})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  >
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="ARS">Peso Argentino (ARS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Idioma</label>
                  <select
                    value={sistemaForm.idioma || 'es'}
                    onChange={(e) => setSistemaForm({...sistemaForm, idioma: e.target.value})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Formato de Fecha</label>
                  <select
                    value={sistemaForm.formato_fecha || 'dd/MM/yyyy'}
                    onChange={(e) => setSistemaForm({...sistemaForm, formato_fecha: e.target.value})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  >
                    <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                    <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                    <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Zona Horaria</label>
                  <select
                    value={sistemaForm.timezone || 'America/Bogota'}
                    onChange={(e) => setSistemaForm({...sistemaForm, timezone: e.target.value})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  >
                    <option value="America/Bogota">Bogotá (Colombia)</option>
                    <option value="America/Caracas">Caracas (Venezuela)</option>
                    <option value="America/Lima">Lima (Perú)</option>
                    <option value="America/Argentina/Buenos_Aires">Buenos Aires (Argentina)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSistemaForm({
                    moneda: 'COP',
                    idioma: 'es',
                    timezone: 'America/Bogota',
                    formato_fecha: 'dd/MM/yyyy',
                    decimales_peso: 2,
                    decimales_moneda: 2
                  })}
                  className="px-4 py-2 text-rural-text hover:bg-rural-alternate rounded-xl transition-colors flex items-center space-x-2"
                  disabled={configLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Restaurar</span>
                </button>
                <button
                  onClick={handleSaveSistema}
                  disabled={isLoading || configLoading}
                  className="px-6 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Guardar</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab Empresa */}
          {activeTab === 'empresa' && isAdmin() && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-rural-text">Información de la Empresa</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Nombre de la Empresa</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                    <input
                      type="text"
                      value={empresaForm.nombre || ''}
                      onChange={(e) => setEmpresaForm({...empresaForm, nombre: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                      disabled={configLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">CUIT</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                    <input
                      type="text"
                      value={empresaForm.cuit || ''}
                      onChange={(e) => setEmpresaForm({...empresaForm, cuit: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                      disabled={configLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                    <input
                      type="text"
                      value={empresaForm.direccion || ''}
                      onChange={(e) => setEmpresaForm({...empresaForm, direccion: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                      disabled={configLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                    <input
                      type="text"
                      value={empresaForm.telefono || ''}
                      onChange={(e) => setEmpresaForm({...empresaForm, telefono: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                      disabled={configLoading}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-rural-text mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                    <input
                      type="email"
                      value={empresaForm.email || ''}
                      onChange={(e) => setEmpresaForm({...empresaForm, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                      disabled={configLoading}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-rural-text mb-2">Descripción</label>
                  <textarea
                    value={empresaForm.descripcion || ''}
                    onChange={(e) => setEmpresaForm({...empresaForm, descripcion: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background resize-none"
                    disabled={configLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleSaveEmpresa}
                  disabled={isLoading || configLoading}
                  className="px-6 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Guardar</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab Valores por Defecto */}
          {activeTab === 'valores' && isAdmin() && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-rural-text">Valores por Defecto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Categoría de Animal</label>
                  <select
                    value={valoresForm.categoria_animal || 'ternero'}
                    onChange={(e) => setValoresForm({...valoresForm, categoria_animal: e.target.value})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  >
                    <option value="ternero">Ternero</option>
                    <option value="novillo">Novillo</option>
                    <option value="vaca">Vaca</option>
                    <option value="toro">Toro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Estado Físico</label>
                  <select
                    value={valoresForm.estado_fisico || 'bueno'}
                    onChange={(e) => setValoresForm({...valoresForm, estado_fisico: e.target.value})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  >
                    <option value="critico">Crítico</option>
                    <option value="malo">Malo</option>
                    <option value="bueno">Bueno</option>
                    <option value="excelente">Excelente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Tipo de Venta</label>
                  <select
                    value={valoresForm.tipo_venta || 'jaula'}
                    onChange={(e) => setValoresForm({...valoresForm, tipo_venta: e.target.value})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  >
                    <option value="jaula">Jaula</option>
                    <option value="remate">Remate</option>
                    <option value="particular">Particular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Peso Promedio (kg)</label>
                  <input
                    type="number"
                    value={valoresForm.peso_promedio || 180}
                    onChange={(e) => setValoresForm({...valoresForm, peso_promedio: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rural-text mb-2">Días para Alertas</label>
                  <input
                    type="number"
                    value={valoresForm.dias_alertas || 30}
                    onChange={(e) => setValoresForm({...valoresForm, dias_alertas: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                    disabled={configLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setValoresForm({
                    categoria_animal: 'ternero',
                    estado_fisico: 'bueno',
                    tipo_venta: 'jaula',
                    peso_promedio: 180,
                    dias_alertas: 30
                  })}
                  className="px-4 py-2 text-rural-text hover:bg-rural-alternate rounded-xl transition-colors flex items-center space-x-2"
                  disabled={configLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Restaurar</span>
                </button>
                <button
                  onClick={handleSaveValores}
                  disabled={isLoading || configLoading}
                  className="px-6 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Guardar</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab Mantenimiento - Solo Admin */}
          {activeTab === 'mantenimiento' && isAdmin() && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-rural-text mb-2">Mantenimiento de Base de Datos</h3>
                <p className="text-rural-text/60">
                  Herramientas avanzadas para gestión de datos. <span className="text-red-600 font-medium">¡Usar con precaución!</span>
                </p>
              </div>

              {/* Exportar/Importar Datos */}
              <div className="bg-rural-alternate/10 rounded-xl p-6">
                <h4 className="font-semibold text-rural-text mb-4 flex items-center space-x-2">
                  <Database className="h-5 w-5 text-rural-primary" />
                  <span>Respaldo y Restauración</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleExportData}
                    disabled={maintenanceLoading === 'export'}
                    className="flex items-center justify-center space-x-2 p-4 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors disabled:opacity-50"
                  >
                    {maintenanceLoading === 'export' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Exportar Todos los Datos</span>
                  </button>
                  <button
                    onClick={handleImportData}
                    disabled={maintenanceLoading === 'import'}
                    className="flex items-center justify-center space-x-2 p-4 bg-rural-secondary text-white rounded-xl hover:bg-rural-secondary/90 transition-colors disabled:opacity-50"
                  >
                    {maintenanceLoading === 'import' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>Importar Datos</span>
                  </button>
                </div>
              </div>

              {/* Eliminación de Datos por Categoría */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Zona de Peligro - Eliminación de Datos</h4>
                </div>
                <p className="text-red-700 text-sm mb-6">
                  Estas acciones eliminan datos permanentemente y no se pueden deshacer. Asegúrate de tener un respaldo antes de continuar.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'animales', label: 'Todos los Animales', icon: '🐄' },
                    { key: 'compras', label: 'Todas las Compras', icon: '🛒' },
                    { key: 'ventas', label: 'Todas las Ventas', icon: '💰' },
                    { key: 'sanidad', label: 'Eventos Sanitarios', icon: '💉' },
                    { key: 'pesadas', label: 'Todas las Pesadas', icon: '⚖️' },
                    { key: 'lotes', label: 'Todos los Lotes', icon: '📦' },
                    { key: 'transportes', label: 'Todos los Transportes', icon: '🚛' },
                    { key: 'proveedores', label: 'Todos los Proveedores', icon: '🏢' },
                    { key: 'compradores', label: 'Todos los Compradores', icon: '👥' },
                    { key: 'todo', label: 'TODOS LOS DATOS', icon: '⚠️' }
                  ].map((item) => (
                    <div key={item.key} className="bg-white rounded-lg border border-red-200 p-4">
                      <div className="text-center mb-3">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="font-medium text-gray-800">{item.label}</div>
                      </div>
                      
                      {showDeleteConfirm === item.key ? (
                        <div className="space-y-2">
                          <p className="text-xs text-red-600 text-center">¿Estás seguro?</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={async () => {
                                const confirmed = await showConfirm(confirmDelete(
                                  item.label.toLowerCase(),
                                  `Esta acción eliminará permanentemente ${item.label.toLowerCase()} y no se puede deshacer. ¿Estás completamente seguro?`
                                ));
                                if (confirmed) {
                                  handleDeleteData(item.label, item.key);
                                } else {
                                  setShowDeleteConfirm(null);
                                }
                              }}
                              disabled={maintenanceLoading === item.key}
                              className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {maintenanceLoading === item.key ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                              ) : (
                                'SÍ, ELIMINAR'
                              )}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded text-xs hover:bg-gray-400 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(item.key)}
                          className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                            item.key === 'todo' 
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <Trash2 className="h-3 w-3 inline mr-1" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Estadísticas de Base de Datos */}
              <div className="bg-rural-card rounded-xl border border-rural-alternate/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-rural-text flex items-center space-x-2">
                    <Database className="h-5 w-5 text-rural-primary" />
                    <span>Estadísticas de Base de Datos</span>
                  </h4>
                  <button
                    onClick={loadDatabaseStats}
                    className="flex items-center space-x-2 px-3 py-1 bg-rural-primary/10 text-rural-primary rounded-lg hover:bg-rural-primary/20 transition-colors text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Actualizar</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 text-center">
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.animales}</div>
                    <div className="text-sm text-rural-text/60">Animales</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.compras}</div>
                    <div className="text-sm text-rural-text/60">Compras</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.ventas}</div>
                    <div className="text-sm text-rural-text/60">Ventas</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.eventos}</div>
                    <div className="text-sm text-rural-text/60">Eventos</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.pesadas}</div>
                    <div className="text-sm text-rural-text/60">Pesadas</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.lotes}</div>
                    <div className="text-sm text-rural-text/60">Lotes</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.transportes}</div>
                    <div className="text-sm text-rural-text/60">Transportes</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.proveedores}</div>
                    <div className="text-sm text-rural-text/60">Proveedores</div>
                  </div>
                  <div className="bg-rural-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-rural-primary">{dbStats.compradores}</div>
                    <div className="text-sm text-rural-text/60">Compradores</div>
                  </div>
                </div>
              </div>

              {/* Advertencia Final */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Importante</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Siempre realiza un respaldo antes de eliminar datos</li>
                      <li>• Las eliminaciones son permanentes e irreversibles</li>
                      <li>• Coordina con tu equipo antes de realizar mantenimiento</li>
                      <li>• En caso de duda, contacta al soporte técnico</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mensaje para operadores en tabs restringidos */}
          {(activeTab === 'empresa' || activeTab === 'valores' || activeTab === 'mantenimiento') && !isAdmin() && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center py-12"
            >
              <Shield className="h-16 w-16 text-rural-primary/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-rural-text mb-2">Acceso Restringido</h3>
              <p className="text-rural-text/60">
                Solo los administradores pueden acceder a esta configuración
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Modal de confirmación */}
      <ConfirmComponent />
    </div>
  );
};

export default Configuracion;