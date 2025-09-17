import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const DatabaseDebug = () => {
  const [status, setStatus] = useState({
    connection: 'checking',
    tables: {},
    error: null
  });

  const checkConnection = async () => {
    setStatus({ connection: 'checking', tables: {}, error: null });

    try {
      // Verificar conexión básica
      const { data: connectionTest, error: connectionError } = await supabase
        .from('animales')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw new Error(`Conexión: ${connectionError.message}`);
      }

      // Verificar cada tabla
      const tables = ['animales', 'proveedores', 'lotes', 'animal_lote', 'transportadores'];
      const tableStatus = {};

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          if (error) {
            tableStatus[table] = { status: 'error', error: error.message, count: 0 };
          } else {
            // Obtener conteo real
            const { count, error: countError } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true });

            tableStatus[table] = { 
              status: 'ok', 
              count: countError ? 0 : count,
              error: countError?.message 
            };
          }
        } catch (err) {
          tableStatus[table] = { status: 'error', error: err.message, count: 0 };
        }
      }

      setStatus({
        connection: 'ok',
        tables: tableStatus,
        error: null
      });

    } catch (error) {
      setStatus({
        connection: 'error',
        tables: {},
        error: error.message
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-rural-card rounded-2xl p-6 shadow-sm border border-rural-alternate/50 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-rural-primary" />
          <h3 className="text-lg font-semibold text-rural-text">Estado de la Base de Datos</h3>
        </div>
        <button
          onClick={checkConnection}
          className="flex items-center space-x-2 px-3 py-2 bg-rural-primary text-white rounded-xl hover:bg-rural-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Verificar</span>
        </button>
      </div>

      {/* Estado de conexión */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 p-3 bg-rural-background rounded-xl">
          {getStatusIcon(status.connection)}
          <span className="font-medium text-rural-text">
            Conexión a Supabase: {status.connection === 'ok' ? 'Exitosa' : status.connection === 'error' ? 'Error' : 'Verificando...'}
          </span>
        </div>
      </div>

      {/* Error general */}
      {status.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{status.error}</p>
        </div>
      )}

      {/* Estado de tablas */}
      {Object.keys(status.tables).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-rural-text mb-3">Estado de las Tablas:</h4>
          {Object.entries(status.tables).map(([table, info]) => (
            <div key={table} className="flex items-center justify-between p-3 bg-rural-background rounded-xl">
              <div className="flex items-center space-x-2">
                {getStatusIcon(info.status)}
                <span className="font-medium text-rural-text">{table}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-rural-text/60">
                  {info.status === 'ok' ? `${info.count} registros` : 'Error'}
                </span>
                {info.error && (
                  <p className="text-xs text-red-600">{info.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-blue-600 text-sm">
          💡 <strong>Tip:</strong> Si hay errores, verifica que las tablas existan en Supabase y que las RLS policies permitan el acceso.
        </p>
      </div>
    </motion.div>
  );
};

export default DatabaseDebug;
