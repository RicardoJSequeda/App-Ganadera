/**
 * Utilitarios para manejo de fechas
 */

/**
 * Formatea una fecha en formato YYYY-MM-DD a formato local sin problemas de timezone
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada en formato DD/MM/YYYY
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  
  console.log('📅 dateUtils - Formateando fecha:', fecha);
  
  try {
    // Dividir la fecha para evitar problemas de timezone
    const [año, mes, dia] = fecha.split('-');
    
    // Crear fecha local sin conversión UTC
    const fechaLocal = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    
    const fechaFormateada = fechaLocal.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    console.log('📅 dateUtils - Fecha formateada:', fechaFormateada);
    return fechaFormateada;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return fecha; // Devolver la fecha original si hay error
  }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} - Fecha actual en formato YYYY-MM-DD
 */
export const obtenerFechaActual = () => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const fechaFormateada = `${año}-${mes}-${dia}`;
  
  console.log('📅 dateUtils - Fecha actual generada:', fechaFormateada);
  return fechaFormateada;
};
