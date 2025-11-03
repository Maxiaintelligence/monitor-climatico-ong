// app/poblacion/[locationId]/page.tsx (VERSIÓN DE DEPURACIÓN)

'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';
import locationsData from '@/lib/locations.json'; 
import ForecastChart from '@/components/ForecastChart';

interface Location {
  name: string;
  state: string;
  zip_code: string;
  lat: number;
  lon: number;
  region: string;
}

const locations: Location[] = locationsData;

const generateLocationId = (loc: { name: string, state: string }) => {
  return `${loc.name.toLowerCase().replace(/\s+/g, '-')}-${loc.state.toLowerCase().replace('.', '')}`;
};

// ... (El resto de las funciones como getDetailedForecast no necesitan cambios)

export default function LocationDetailPage({ params }: { params: { locationId: string } }) {
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const locationData = locations.find(loc => generateLocationId(loc) === params.locationId);

  // ... (El useEffect no necesita cambios)

  // --- ¡AQUÍ ESTÁ LA ESTRATEGIA DE DEPURACIÓN! ---
  if (!locationData) {
    // Generamos una lista de los primeros 5 IDs para comparar
    const generatedIdsSample = locations.slice(0, 5).map(generateLocationId);

    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
        <h1 style={{color: '#dc3545'}}>Error: Población no encontrada</h1>
        <p>Esto significa que el ID de la URL no coincide con ningún ID generado.</p>
        
        <div style={{ backgroundColor: '#1E1E1E', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
          <h3 style={{marginTop: 0}}>Información de Depuración:</h3>
          
          <p style={{color: '#B3B3B3'}}>ID recibido de la URL:</p>
          <code style={{ color: '#ffc107', backgroundColor: '#333', padding: '0.5rem', borderRadius: '4px', display: 'block' }}>
            {params.locationId}
          </code>

          <p style={{color: '#B3B3B3', marginTop: '1.5rem'}}>Ejemplos de IDs generados por la página (los primeros 5):</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {generatedIdsSample.map(id => (
              <li key={id}>
                <code style={{ color: '#03DAC6', backgroundColor: '#333', padding: '0.5rem', borderRadius: '4px', display: 'block', marginBottom: '0.5rem' }}>
                  {id}
                </code>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" style={{ color: '#BB86FC', display: 'block', marginTop: '2rem' }}>Volver al monitor principal</Link>
      </main>
    );
  }

  // Si sí encuentra la población, renderiza la página normal (este código no cambia)
  return (
    <main>
      {/* ... El resto de tu página de detalle exitosa ... */}
    </main>
  );
}