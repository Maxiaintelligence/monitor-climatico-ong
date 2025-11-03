// app/page.tsx (VERSIÓN FINAL CON MAPA Y ALERTAS ACTIVAS)

'use client';

import locations from './lib/locations.json';
import { calculateOverallRisk } from './lib/riskAnalysis';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// --- DEFINICIÓN DE TIPOS ---
interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}
interface Alert {
  level: string;
  reason: string;
}
interface LocationWithWeather extends Location {
  weather?: { temperature: number };
  alert: Alert;
}

// --- LLAMADA A LA API (SIN CAMBIOS) ---
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

// --- COLORES PARA LAS TARJETAS DE LA LISTA ---
const ALERT_CARD_COLORS = {
  GREEN: '#1E1E1E',
  YELLOW: '#4a3d0a',
  ORANGE: '#613000',
  RED: '#6d0f0f',
};

export default function HomePage() {
  const [locationsWithData, setLocationsWithData] = useState<LocationWithWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const Map = dynamic(() => import('./components/Map'), { 
    loading: () => <p style={{textAlign: 'center', fontSize: '1.2rem'}}>Cargando mapa...</p>,
    ssr: false 
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const weatherPromises = locations.map(loc => getWeatherData(loc.lat, loc.lon));
      const weatherResults = await Promise.all(weatherPromises);

      const processedData = locations.map((location, index) => {
        const weatherData = weatherResults[index];
        // --- ¡CEREBRO REACTIVADO! ---
        const alert = calculateOverallRisk(location, weatherData); 
        
        return {
          ...location,
          weather: weatherData?.current_weather,
          alert: alert || { level: 'GREEN', reason: 'Sin datos' },
        };
      });
      setLocationsWithData(processedData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const groupedByRegion = locationsWithData.reduce((acc, location) => {
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
      
      <section style={{ marginBottom: '3rem', height: '500px' }}>
        {/* Le pasamos los datos completos (con alertas) al mapa */}
        <Map locations={locationsWithData} />
      </section>

      {isLoading && <p style={{textAlign: 'center', fontSize: '1.5rem'}}>Analizando riesgos para 64 poblaciones...</p>}

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
                    backgroundColor: ALERT_CARD_COLORS[loc.alert.level as keyof typeof ALERT_CARD_COLORS], 
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