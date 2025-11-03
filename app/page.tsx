// app/page.tsx (VERSIÓN FINAL LIMPIA)

// Importamos tanto las localizaciones como nuestro motor de análisis multi-riesgo
import locations from './lib/locations.json';
import { calculateOverallRisk } from './lib/riskAnalysis';

// Definimos la interfaz para el tipo de dato de una localización
interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}

// --- LLAMADA A LA API COMPLETA Y CORRECTA ---
// Pedimos TODOS los datos que nuestro motor de análisis necesita
async function getWeatherData(lat: number, lon: number) {
  const dailyParams = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'windgusts_10m_max',
  ].join(',');

  const hourlyParams = 'relativehumidity_2m';

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=${dailyParams}&hourly=${hourlyParams}&forecast_days=1&timezone=auto`,
      { next: { revalidate: 900 } } // Revalidar cada 15 minutos
    );
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

export default async function HomePage() {
  // Obtenemos los datos del clima para todas las localizaciones
  const weatherPromises = locations.map(loc => getWeatherData(loc.lat, loc.lon));
  const weatherResults = await Promise.all(weatherPromises);

  // Combinamos los datos de localización con los datos del clima y el análisis de riesgo
  const locationsWithWeather = locations.map((location, index) => {
    const weatherData = weatherResults[index];
    const alert = calculateOverallRisk(location, weatherData);

    return {
      ...location,
      weather: weatherData?.current_weather,
      alert: alert,
    };
  });

  // Agrupamos las localizaciones por región para mostrarlas
  const groupedByRegion = locationsWithWeather.reduce((acc, location) => {
    const region = location.region;
    if (!acc[region]) acc[region] = [];
    acc[region].push(location);
    return acc;
  }, {} as Record<string, typeof locationsWithWeather>);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#BB86FC' }}>Pueblo Seguro</h1>
        <p style={{ fontSize: '1.2rem', color: '#B3B3B3' }}>Monitor de Riesgos para Caritas Pastoral Social Diocesana</p>
      </header>

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
                  borderLeft: `5px solid ${loc.alert.level === 'GREEN' ? 'transparent' : '#FFC107'}` // Borde de acento para alertas
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
    </main>
  );
}