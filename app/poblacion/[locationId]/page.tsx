// app/poblacion/[locationId]/page.tsx (VERSIÓN COMPLETA Y FINAL)

'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';

// --- Usamos los alias de ruta correctos y explícitos ---
import locationsData from '@/lib/locations.json'; 
import ForecastChart from '@/components/ForecastChart';

// Definimos el tipo para una sola localización
interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}

// Le damos el tipo a nuestro array de localizaciones
const locations: Location[] = locationsData;

// --- FUNCIÓN AUXILIAR PARA CREAR IDs ---
const generateLocationId = (loc: { name: string, state: string }) => {
  return `${loc.name.toLowerCase().replace(/\s+/g, '-')}-${loc.state.toLowerCase().replace('.', '')}`;
};

// --- FUNCIÓN PARA OBTENER EL PRONÓSTICO DETALLADO ---
async function getDetailedForecast(lat: number, lon: number) {
  const hourlyParams = 'temperature_2m,precipitation_probability';
  const dailyParams = 'temperature_2m_max,temperature_2m_min,weathercode';
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParams}&daily=${dailyParams}&forecast_days=7&timezone=auto`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching detailed forecast:", error);
    return null;
  }
}

export default function LocationDetailPage({ params }: { params: { locationId: string } }) {
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const locationData = locations.find(loc => generateLocationId(loc) === params.locationId);

  useEffect(() => {
    const loadForecast = async () => {
      if (locationData) {
        setIsLoading(true);
        const data = await getDetailedForecast(locationData.lat, locationData.lon);
        setForecast(data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    loadForecast();
    
  }, [params.locationId, locationData]);

  if (isLoading) {
    return <p style={{textAlign: 'center', fontSize: '1.5rem', color: 'white', paddingTop: '5rem'}}>Cargando pronóstico detallado...</p>;
  }
  
  if (!locationData) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh', textAlign: 'center' }}>
        <h1>Población no encontrada</h1>
        <Link href="/" style={{ color: '#BB86FC' }}>Volver al monitor principal</Link>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#BB86FC', textDecoration: 'none' }}>
          &larr; Volver al Monitor Principal
        </Link>
        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>
          Pronóstico para {locationData.name}, {locationData.state}
        </h1>
      </header>
      
      {forecast ? (
        <div>
          <section style={{ height: '400px', backgroundColor: '#1E1E1E', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <ForecastChart hourlyData={forecast.hourly} />
          </section>

          <section>
            <h2 style={{borderBottom: '1px solid #444', paddingBottom: '0.5rem'}}>Pronóstico para 7 Días</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
              {forecast.daily.time.map((date: string, index: number) => (
                <div key={date} style={{ backgroundColor: '#1E1E1E', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })}</p>
                  <p style={{ margin: '0.5rem 0', fontSize: '1.5rem' }}>{/* Icono del tiempo */}</p>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: '#FFF', fontWeight: 'bold' }}>{Math.round(forecast.daily.temperature_2m_max[index])}°</span> / <span style={{ color: '#B3B3B3' }}>{Math.round(forecast.daily.temperature_2m_min[index])}°</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <p>No se pudieron cargar los datos del pronóstico.</p>
      )}
    </main>
  );
}