// app/page.tsx (VERSIÓN CON MAPA INTEGRADO)

'use client'; // <-- ¡Importante! Hacemos que la página principal sea un componente de cliente

import locations from './lib/locations.json';
import { calculateOverallRisk } from './lib/riskAnalysis';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Definimos la interfaz para el tipo de dato de una localización
interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}

// Interfaz para la respuesta completa de la API
interface WeatherData {
  current_weather?: { temperature: number };
  // ... aquí irían las otras propiedades daily, hourly, etc.
}

// Interfaz para el objeto de alerta
interface Alert {
  level: string;
  reason: string;
}

// Interfaz para la localización combinada con sus datos
interface LocationWithWeather extends Location {
  weather: WeatherData['current_weather'];
  alert: Alert;
}

// La llamada a la API no cambia
async function getWeatherData(lat: number, lon: number) {
  const dailyParams = ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'windgusts_10m_max'].join(',');
  const hourlyParams = 'relativehumidity_2m';
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=${dailyParams}&hourly=${hourlyParams}&forecast_days=7&timezone=auto`, { next: { revalidate: 900 } });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Mapa de colores para nuestros niveles de alerta
const ALERT_COLORS = {
  GREEN: '#1E1E1E',
  YELLOW: '#4a3d0a',
  ORANGE: '#613000',
  RED: '#6d0f0f',
};

export default function HomePage() {
  // --- ¡CAMBIO IMPORTANTE! Usamos estado para manejar los datos del lado del cliente ---
  const [locationsWithWeather, setLocationsWithWeather] = useState<LocationWithWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Usamos 'dynamic' para importar el mapa solo en el navegador
  const Map = dynamic(() => import('./components/Map'), { 
    loading: () => <p style={{textAlign: 'center', fontSize: '1.2rem'}}>Cargando mapa...</p>,
    ssr: false 
  });

  // Efecto para cargar los datos del clima cuando el componente se monta
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const weatherPromises = locations.map(loc => getWeatherData(loc.lat, loc.lon));
      const weatherResults = await Promise.all(weatherPromises);

      const processedData = locations.map((location, index) => {
        const weatherData = weatherResults[index];
        // Por ahora, la alerta siempre será VERDE para evitar problemas
        const alert = calculateOverallRisk(location, weatherData); 
        
        return {
          ...location,
          weather: weatherData?.current_weather,
          alert: alert || { level: 'GREEN', reason: '' },
        };
      });
      setLocationsWithWeather(processedData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Agrupamos las localizaciones por región para mostrarlas
  const groupedByRegion = locationsWithWeather.reduce((acc, location) => {
    const region = location.region;
    if (!acc[region]) acc[region] = [];
    acc[region].push(location);
    return acc;
  }, {} as Record<string, LocationWithWeather[]>);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#BB86FC' }}>Pueblo Seguro</h1>
        <p style={{ fontSize: '1.2rem', color: '#B3B3B3' }}>Monitor de Riesgos para Caritas Pastoral Social Diocesana</p>
      </header>

      {/* --- AQUÍ INTEGRAMOS EL MAPA --- */}
      <section style={{ marginBottom: '3rem', height: '500px' }}>
        <Map locations={locations} />
      </section>

      {/* Mostramos un mensaje de carga mientras se obtienen los datos */}
      {isLoading && <p style={{textAlign: 'center', fontSize: '1.5rem'}}>Cargando datos de las poblaciones...</p>}

      {/* La lista de regiones solo se muestra cuando los datos están listos */}
      {!isLoading && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {Object.entries(groupedByRegion).map(([region, locsInRegion]) => (
            <section key={region}>
              <h2 style={{ borderBottom: '2px solid #BB86FC', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                {region}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {locsInRegion.map(loc => (
                  <li key={loc.name + loc.zip_code} style={{ 
                    backgroundColor: ALERT_COLORS[loc.alert.level as keyof typeof ALERT_COLORS], 
                    padding: '1rem', 
                    borderRadius: '8px',
                    borderLeft: `5px solid ${loc.alert.level === 'GREEN' ? 'transparent' : '#FFC107'}`
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{loc.name}, {loc.state}</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#03DAC6' }}>
                      {loc.weather ? `${loc.weather.temperature}°C` : 'Sin datos'}
                    </p>
                    {loc.alert.level !== 'GREEN' && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#FFC107', fontWeight: 'bold' }}>
                        {loc.alert.reason}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}