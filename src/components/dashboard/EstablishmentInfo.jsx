import { motion } from 'framer-motion';
import { MapPin, Calendar, Sun, Cloud, CloudRain, Users, RefreshCw } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useWeather } from '../../hooks/useWeather';

const EstablishmentInfo = () => {
  const { companyConfig } = useCompany();
  const { weather, getWeatherIcon, getWeatherColor, loadWeather, isLoading } = useWeather();
  
  // Datos del establecimiento desde la configuración de la empresa
  const establishmentData = {
    nombre: companyConfig.nombre || "Establecimiento",
    ubicacion: companyConfig.direccion || "Dirección no configurada",
    hectareas: "30 has", // Esto podría venir de la configuración también
  };

  const currentDate = new Date();

  const getWeatherIconComponent = (condition) => {
    switch (condition) {
      case 'sunny': return Sun;
      case 'cloudy': return Cloud;
      case 'partly-cloudy': return Cloud;
      case 'rainy': return CloudRain;
      default: return Sun;
    }
  };

  const WeatherIcon = getWeatherIconComponent(weather.condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      className="bg-gradient-to-br from-rural-primary/5 to-rural-secondary/5 rounded-2xl p-5 shadow-sm border border-rural-alternate/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-rural-primary/20 rounded-lg">
            <MapPin className="h-4 w-4 text-rural-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-rural-text">
              {establishmentData.nombre}
            </h3>
            <p className="text-rural-text/60 text-xs">
              {establishmentData.ubicacion}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1">
            {isLoading ? (
              <RefreshCw className="h-5 w-5 text-rural-primary animate-spin" />
            ) : (
              <WeatherIcon className={`h-5 w-5 ${getWeatherColor(weather.condition)}`} />
            )}
            <span className="text-xl font-bold text-rural-text">
              {weather.temperature ? `${weather.temperature}°C` : '--°C'}
            </span>
          </div>
          <p className="text-rural-text/60 text-xs">
            {weather.humidity ? `${weather.humidity}% humedad` : 'Cargando...'}
          </p>
          {weather.description && (
            <p className="text-rural-text/50 text-xs">
              {weather.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white/50 rounded-xl p-2.5">
          <div className="flex items-center space-x-1.5 mb-1">
            <Calendar className="h-3 w-3 text-rural-primary" />
            <span className="text-xs font-medium text-rural-text">Hoy</span>
          </div>
          <p className="text-rural-text/70 text-xs">
            {currentDate.toLocaleDateString('es-AR', { 
              weekday: 'long',
              day: 'numeric',
              month: 'short'
            })}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-rural-alternate/30">
        <div className="flex justify-between items-center text-xs">
          <span className="text-rural-text/60">Superficie total:</span>
          <span className="font-semibold text-rural-text">
            {establishmentData.hectareas}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default EstablishmentInfo;
