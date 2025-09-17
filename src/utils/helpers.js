export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatDate = (date, options = {}) => {
  if (!date) return 'Sin fecha';
  
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - d);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (options.relative) {
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
    if (diffDays <= 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays <= 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return d.toLocaleDateString('es-AR', defaultOptions);
};

export const formatWeight = (weight) => {
  if (!weight) return '0 kg';
  return `${Number(weight).toFixed(1)} kg`;
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const getHealthStatus = (estadoFisico) => {
  const statusMap = {
    'excelente': { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' },
    'bueno': { label: 'Bueno', color: 'text-green-500', bg: 'bg-green-50' },
    'malo': { label: 'Malo', color: 'text-rural-alert', bg: 'bg-orange-100' },
    'critico': { label: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' }
  };
  
  return statusMap[estadoFisico] || { label: 'Desconocido', color: 'text-gray-500', bg: 'bg-gray-100' };
};

export const getColorCaravana = (color) => {
  const colorMap = {
    'amarillo': '#FEF3C7',
    'rojo': '#FCA5A5', 
    'azul': '#93C5FD',
    'verde': '#86EFAC',
    'blanco': '#F9FAFB',
    'negro': '#374151',
    'naranja': '#FDBA74',
    'rosa': '#F9A8D4',
    'violeta': '#C4B5FD',
    'gris': '#D1D5DB'
  };
  
  return colorMap[color?.toLowerCase()] || '#E5E7EB';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const validateCaravana = (numero, color, animalesExistentes = []) => {
  if (!numero || !color) return { isValid: false, message: 'Número y color son requeridos' };
  
  const exists = animalesExistentes.some(animal => 
    animal.numero_caravana === numero && 
    animal.color_caravana === color && 
    animal.estado === 'en_campo'
  );
  
  if (exists) {
    return { 
      isValid: false, 
      message: 'Ya existe un animal en campo con esta caravana y color' 
    };
  }
  
  return { isValid: true, message: '' };
};

export const calculateAge = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  
  const birth = new Date(fechaNacimiento);
  const now = new Date();
  const ageInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  
  if (ageInMonths < 12) {
    return `${ageInMonths} meses`;
  } else {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return months > 0 ? `${years} años ${months} meses` : `${years} años`;
  }
};
