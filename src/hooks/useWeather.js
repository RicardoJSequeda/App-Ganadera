import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';

export const useWeather = () => {
  const { companyConfig } = useCompany();
  const [weather, setWeather] = useState({
    temperature: null,
    condition: 'sunny',
    humidity: null,
    description: '',
    loading: true,
    error: null
  });

  // Función para obtener coordenadas de una dirección
  const getCoordinates = async (address) => {
    try {
      // Usar una API de geocodificación gratuita (OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo coordenadas:', error);
      return null;
    }
  };

  // Función para obtener el clima
  const getWeatherData = async (coordinates) => {
    try {
      // Usar OpenWeatherMap API (requiere API key gratuita)
      // Para este ejemplo, usaremos datos simulados basados en la ubicación
      const { lat, lon } = coordinates;
      
      // Simular datos de clima basados en la ubicación
      let temperature, condition, humidity, description;
      
      if (lat >= -35 && lat <= -20) { // Argentina/Colombia
        temperature = Math.floor(Math.random() * 15 + 20); // 20-35°C
        humidity = Math.floor(Math.random() * 30 + 50); // 50-80%
        
        const conditions = ['sunny', 'cloudy', 'partly-cloudy'];
        condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        switch (condition) {
          case 'sunny':
            description = 'Soleado';
            break;
          case 'cloudy':
            description = 'Nublado';
            break;
          case 'partly-cloudy':
            description = 'Parcialmente nublado';
            break;
        }
      } else {
        // Datos por defecto
        temperature = 25;
        condition = 'sunny';
        humidity = 60;
        description = 'Soleado';
      }
      
      return {
        temperature,
        condition,
        humidity,
        description
      };
    } catch (error) {
      console.error('Error obteniendo datos del clima:', error);
      return null;
    }
  };

  // Cargar datos del clima
  const loadWeather = async () => {
    if (!companyConfig.direccion) {
      setWeather(prev => ({ ...prev, loading: false, error: 'No hay dirección configurada' }));
      return;
    }

    setWeather(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Obtener coordenadas de la dirección
      const coordinates = await getCoordinates(companyConfig.direccion);
      
      if (!coordinates) {
        setWeather(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'No se pudo obtener la ubicación' 
        }));
        return;
      }

      // Obtener datos del clima
      const weatherData = await getWeatherData(coordinates);
      
      if (weatherData) {
        setWeather({
          temperature: weatherData.temperature,
          condition: weatherData.condition,
          humidity: weatherData.humidity,
          description: weatherData.description,
          loading: false,
          error: null
        });
      } else {
        setWeather(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'No se pudieron obtener datos del clima' 
        }));
      }
    } catch (error) {
      console.error('Error cargando clima:', error);
      setWeather(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error al cargar datos del clima' 
      }));
    }
  };

  // Cargar clima cuando cambie la dirección
  useEffect(() => {
    if (companyConfig.direccion) {
      loadWeather();
    }
  }, [companyConfig.direccion]);

  // Función para obtener el icono del clima
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'partly-cloudy':
        return '⛅';
      case 'rainy':
        return '🌧️';
      case 'stormy':
        return '⛈️';
      default:
        return '☀️';
    }
  };

  // Función para obtener el color del clima
  const getWeatherColor = (condition) => {
    switch (condition) {
      case 'sunny':
        return 'text-yellow-500';
      case 'cloudy':
        return 'text-gray-500';
      case 'partly-cloudy':
        return 'text-blue-400';
      case 'rainy':
        return 'text-blue-600';
      case 'stormy':
        return 'text-purple-600';
      default:
        return 'text-yellow-500';
    }
  };

  return {
    weather,
    loadWeather,
    getWeatherIcon,
    getWeatherColor,
    isLoading: weather.loading,
    error: weather.error
  };
};
