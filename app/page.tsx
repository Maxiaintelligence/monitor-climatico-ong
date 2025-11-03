// Paso 1: Importar nuestra nueva lista de localizaciones
import locations from './lib/locations.json';

// Definimos una interfaz para el tipo de dato de una localización
// Esto ayuda a que el código sea más seguro y fácil de entender
interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}

// La función para obtener el clima no cambia
async function getWeatherData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
      { next: { revalidate: 900 } } // Actualizar cada 15 minutos
    );
    if (!response.ok) return null; // Si falla la petición, devolvemos null
    return response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null; // Si hay un error de red, devolvemos null
  }
}

// Nuestra nueva página principal
export default async function HomePage() {
  // Paso 2: Obtener los datos del clima para TODAS las localizaciones en paralelo
  const weatherPromises = locations.map(loc => getWeatherData(loc.lat, loc.lon));
  const weatherResults = await Promise.all(weatherPromises);

  // Paso 3: Combinar los datos de localización con los datos del clima
  const locationsWithWeather = locations.map((location, index) => ({
    ...location,
    weather: weatherResults[index]?.current_weather,
  }));

  // Paso 4: Agrupar las localizaciones por región
  const groupedByRegion = locationsWithWeather.reduce((acc, location) => {
    const region = location.region;
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(location);
    return acc;
  }, {} as Record<string, typeof locationsWithWeather>);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#BB86FC' }}>Pueblo Seguro</h1>
        <p style={{ fontSize: '1.2rem', color: '#B3B3B3' }}>Monitor de Riesgos para Caritas Pastoral Social Diocesana</p>
      </header>

      {/* Paso 5: Mostrar las localizaciones agrupadas por región */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {Object.entries(groupedByRegion).map(([region, locsInRegion]) => (
          <section key={region}>
            <h2 style={{ borderBottom: '2px solid #BB86FC', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              {region}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {locsInRegion.map(loc => (
                <li key={loc.name + loc.zip_code} style={{ backgroundColor: '#1E1E1E', padding: '1rem', borderRadius: '8px' }}>
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