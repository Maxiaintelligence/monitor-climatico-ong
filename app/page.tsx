// app/page.tsx

// Importamos tanto las localizaciones como nuestro nuevo motor de análisis
import locations from './lib/locations.json';
import { calculateFloodRisk } from './lib/riskAnalysis';

// ... (El resto de las interfaces se quedan igual)
interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}

// --- CAMBIO IMPORTANTE AQUÍ ---
// Actualizamos la función para pedir también el pronóstico de lluvia por hora
async function getWeatherData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation&forecast_days=1`,
      { next: { revalidate: 900 } }
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Creamos un mapa de colores para nuestros niveles de alerta
const ALERT_COLORS = {
  GREEN: '#1E1E1E', // Fondo normal
  YELLOW: '#4a3d0a', // Amarillo oscuro
  ORANGE: '#613000', // Naranja oscuro
  RED: '#6d0f0f',    // Rojo oscuro
};

export default async function HomePage() {
  const weatherPromises = locations.map(loc => getWeatherData(loc.lat, loc.lon));
  const weatherResults = await Promise.all(weatherPromises);

  const locationsWithWeather = locations.map((location, index) => {
    const weatherData = weatherResults[index];
    // --- CAMBIO IMPORTANTE AQUÍ ---
    // Calculamos el nivel de alerta para cada localización
    const alertLevel = calculateFloodRisk(location, weatherData);

    return {
      ...location,
      weather: weatherData?.current_weather,
      alertLevel: alertLevel, // Guardamos el nivel de alerta
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
                // --- CAMBIO IMPORTANTE AQUÍ ---
                // El color de fondo de la tarjeta ahora depende del nivel de alerta
                <li key={loc.name + loc.zip_code} style={{ backgroundColor: ALERT_COLORS[loc.alertLevel as keyof typeof ALERT_COLORS], padding: '1rem', borderRadius: '8px', borderLeft: `5px solid ${ALERT_COLORS[loc.alertLevel as keyof typeof ALERT_COLORS] === '#1E1E1E' ? 'transparent' : ALERT_COLORS[loc.alertLevel as keyof typeof ALERT_COLORS].replace('1E1E1E', 'FFC107')}` }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{loc.name}, {loc.state}</h3>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#03DAC6' }}>
                    {loc.weather ? `${loc.weather.temperature}°C` : 'Dato no disponible'}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}