// app/page.tsx (VERSIÓN FINAL CON ALIAS DE RUTA CORRECTOS)

'use client';

// --- ¡CORRECCIÓN EN LAS IMPORTACIONES USANDO ALIAS! ---
import locations from '@/lib/locations.json';
import { calculateOverallRisk } from '@/lib/riskAnalysis';
import RiskSummary from '@/components/RiskSummary';
// Map se importa dinámicamente, por lo que no necesita un import estático aquí

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// --- FUNCIÓN AUXILIAR PARA CREAR IDs ÚNICOS Y SEGUROS ---
const generateLocationId = (loc: { name: string, state: string }) => {
  return `${loc.name.toLowerCase().replace(/\s+/g, '-')}-${loc.state.toLowerCase().replace('.', '')}`;
};

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
  id: string; // <-- ID ÚNICO
  weather?: { temperature: number };
  alert: Alert;
  forecast?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    windgusts_10m_max?: number[];
  };
}

// --- LLAMADA A LA API ---
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

// --- COLORES PARA LAS TARJETAS ---
const ALERT_CARD_COLORS = {
  GREEN: '#1E1E1E',
  YELLOW: '#4a3d0a',
  ORANGE: '#613000',
  RED: '#6d0f0f',
};

// --- COMPONENTE AUXILIAR PARA MOSTRAR EL DATO DE RIESGO ---
function AlertReasonDetail({ loc }: { loc: LocationWithWeather }) {
  if (loc.alert.level === 'GREEN' || !loc.forecast) return null;
  let detail = null;
  const reason = loc.alert.reason;
  if (reason.includes('Helada')) {
    detail = `Mínima: ${loc.forecast.temperature_2m_min?.[0]}°C`;
  } else if (reason.includes('Inundación')) {
    detail = `Lluvia 24h: ${loc.forecast.precipitation_sum?.[0]}mm`;
  } else if (reason.includes('Calor')) {
    detail = `Máxima: ${loc.forecast.temperature_2m_max?.[0]}°C`;
  } else if (reason.includes('Viento')) {
    detail = `Ráfagas: ${loc.forecast.windgusts_10m_max?.[0]} km/h`;
  }
  if (!detail) return null;
  return (<p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#FFC107', fontWeight: 'bold' }}>{detail}</p>);
}

export default function HomePage() {
  const [locationsWithData, setLocationsWithData] = useState<LocationWithWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // La importación dinámica también debe usar el alias de ruta
  const Map = dynamic(() => import('@/components/Map'), { 
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
        const alert = calculateOverallRisk(location, weatherData); 
        return { 
          ...location,
          id: generateLocationId(location),
          weather: weatherData?.current_weather, 
          alert: alert || { level: 'GREEN', reason: 'Sin datos' },
          forecast: weatherData?.daily
        };
      });
      setLocationsWithData(processedData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleMarkerClick = (locationId: string) => {
    const element = document.getElementById(locationId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.transition = 'background-color 0.5s, box-shadow 0.5s';
      element.style.backgroundColor = '#444';
      element.style.boxShadow = '0 0 15px #FFC107';
      setTimeout(() => {
        element.style.backgroundColor = '';
        element.style.boxShadow = '';
      }, 2000);
    }
  };

  const redCount = locationsWithData.filter(l => l.alert.level === 'RED').length;
  const orangeCount = locationsWithData.filter(l => l.alert.level === 'ORANGE').length;
  const yellowCount = locationsWithData.filter(l => l.alert.level === 'YELLOW').length;
  const criticalLocations = locationsWithData.filter(l => l.alert.level === 'RED' || l.alert.level === 'ORANGE').slice(0, 5);
  
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

      {!isLoading && <RiskSummary redCount={redCount} orangeCount={orangeCount} yellowCount={yellowCount} criticalLocations={criticalLocations} />}
      
      <section style={{ marginBottom: '3rem', height: '500px' }}>
        <Map locations={locationsWithData} onMarkerClick={handleMarkerClick} />
      </section>

      {isLoading && <p style={{textAlign: 'center', fontSize: '1.5rem'}}>Analizando riesgos para 64 poblaciones...</p>}
      
      {!isLoading && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {Object.entries(groupedByRegion).map(([region, locsInRegion]) => (
            <section key={region}>
              <h2 style={{ borderBottom: '2px solid #BB86FC', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{region}</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {locsInRegion.map(loc => (
                  <Link key={loc.id} href={`/poblacion/prueba`} style={{...}}>
                    <li id={loc.id} style={{ 
                      height: '100%', 
                      cursor: 'pointer',
                      backgroundColor: ALERT_CARD_COLORS[loc.alert.level as keyof typeof ALERT_CARD_COLORS], 
                      padding: '1rem', 
                      borderRadius: '8px',
                      borderLeft: `5px solid ${loc.alert.level === 'GREEN' ? 'transparent' : '#FFC107'}`
                    }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{loc.name}, {loc.state}</h3>
                      <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#03DAC6' }}>{loc.weather ? `${loc.weather.temperature}°C` : 'Sin datos'}</p>
                      {loc.forecast && (
                        <div style={{ fontSize: '0.9rem', color: '#B3B3B3', marginTop: '0.5rem' }}>
                          <span>Max: {loc.forecast.temperature_2m_max?.[0]}°C</span> / <span>Min: {loc.forecast.temperature_2m_min?.[0]}°C</span>
                        </div>
                      )}
                      {loc.alert.level !== 'GREEN' && (<p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#FFF' }}>{loc.alert.reason}</p>)}
                      <AlertReasonDetail loc={loc} />
                    </li>
                  </Link>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}