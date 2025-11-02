// Importamos nuestra lista de localizaciones
import locations from '@/lib/locations.json';

// Esta función se ejecutará en el servidor para obtener los datos del clima
async function getWeatherData(lat: number, lon: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    // Esto asegura que los datos se actualicen periódicamente y no se queden "pegados"
    { next: { revalidate: 600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
}

// Esta es nuestra página principal
export default async function HomePage() {
  // Para este primer sprint, tomaremos la primera ciudad de nuestra lista: Actopan
  const firstLocation = locations[0];
  const weatherData = await getWeatherData(firstLocation.lat, firstLocation.lon);

  // Extraemos la temperatura del resultado de la API
  const currentTemperature = weatherData.current_weather.temperature;

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Pronóstico Meteorológico Comunitario</h1>
      <div style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
        <h2>Condiciones Actuales en: {firstLocation.name}, {firstLocation.state}</h2>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {currentTemperature}°C
        </p>
      </div>
    </main>
  );
}