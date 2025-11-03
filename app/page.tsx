// Esta es la forma correcta ahora que tsconfig.json está configurado
import locations from '@/lib/locations.json';

// La función para obtener el clima no cambia
async function getWeatherData(lat: number, lon: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    { next: { revalidate: 600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
}

// Nuestra página principal
export default async function HomePage() {
  const firstLocation = locations[0];
  const weatherData = await getWeatherData(firstLocation.lat, firstLocation.lon);
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