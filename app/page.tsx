// app/page.tsx

// Importamos tanto las localizaciones como nuestro nuevo motor de análisis MULTI-RIESGO
import locations from './lib/locations.json';
import { calculateOverallRisk } from './lib/riskAnalysis';

// ... (Las interfaces se quedan igual)
interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}

// Pedimos a la API TODOS los datos que nuestro motor necesita
async function getWeatherData(lat: number, lon: number) {
  const params = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'windgusts_10m_max',
  ].join(',');

  const hourlyParams = 'relativehumidity_2m';

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=${params}&hourly=${hourlyParams}&forecast_days=1&timezone=auto`,
      { next: { revalidate: 10 } } // Revalidar más rápido para la prueba
    );
    if (!response.ok) return { error: `API request failed with status ${response.status}` };
    return response.json();
  } catch (error: any) {
    return { error: `Network error: ${error.message}` };
  }
}

// --- NUEVO COMPONENTE DE DEPURACIÓN ---
// Este componente especial solo sirve para mostrarnos los datos crudos.
function DebugData({ data }: { data: any }) {
  return (
    <div style={{ backgroundColor: '#222', padding: '1rem', marginTop: '3rem', borderRadius: '8px', border: '1px solid #FFC107' }}>
      <h2 style={{ color: '#FFC107', marginTop: 0 }}>Datos Crudos de la API (para Actopan)</h2>
      <pre style={{ color: 'white', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.8rem' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}


// El mapa de colores se queda igual. ¡OJO! Lo moví aquí para que no de error.
const ALERT_COLORS = {
  GREEN: '#1E1E1E',
  YELLOW: '#4a3d0a',
  ORANGE: '#613000',
  RED: '#6d0f0f',
};

export default async function HomePage() {
  const weatherPromises = locations.map(loc => getWeatherData(loc.lat, loc.lon));
  const weatherResults = await Promise.all(weatherPromises);
  
  // Tomamos los datos de la primera localización para pasarlos a nuestro componente de depuración
  const firstLocationData = weatherResults[0];

  const locationsWithWeather = locations.map((location, index) => {
    const weatherData = weatherResults[index];
    const alert = calculateOverallRisk(location, weatherData);

    return {
      ...location,
      weather: weatherData?.current_weather,
      alert: alert,
    };
  });

  const groupedByRegion = locationsWithWeather.reduce((acc, location) => {
    const region = location.region;
    if (!acc[region]) acc[region] = [];
    acc[region].push(location);
    return acc;
  }, {} as Record<string, typeof locationsWithWeather>);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      {/* --- EL HEADER NO CAMBIA --- */}
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#BB86FC' }}>Pueblo Seguro</h1>
        <p style={{ fontSize: '1.2rem', color: '#B3B3B3' }}>Monitor de Riesgos para Caritas Pastoral Social Diocesana</p>
      </header>

      {/* --- LA LISTA DE REGIONES NO CAMBIA --- */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {Object.entries(groupedByRegion).map(([region, locsInRegion]) => (
          <section key={region}>
            <h2 style={{ borderBottom: '2px solid #BB86FC', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              {region}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {locsInRegion.map(loc => (
                <li key={loc.name + loc.zip_code} style={{ backgroundColor: ALERT_COLORS[loc.alert.level as keyof typeof ALERT_COLORS], padding: '1rem', borderRadius: '8px' }}>
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

      {/* --- MOSTRAMOS EL COMPONENTE DE DEPURACIÓN AL FINAL DE LA PÁGINA --- */}
      <DebugData data={firstLocationData} />
    </main>
  );
}