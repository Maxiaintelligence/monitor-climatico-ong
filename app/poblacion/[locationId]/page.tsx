// app/poblacion/[locationId]/page.tsx (VERSIÓN DE DEPURACIÓN FINAL)
'use client';

import Link from 'next/link';
import locationsData from '../../lib/locations.json'; 

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

export default function LocationDetailPage({ params }: { params: { locationId: string } }) {

  // Generamos un ID de ejemplo para comparar
  const exampleGeneratedId = generateLocationId(locations[0]); // ID para Actopan

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <h1 style={{color: '#dc3545'}}>Página de Depuración de IDs</h1>
      <p>Vamos a comparar el ID de la URL con un ID de ejemplo generado.</p>
      
      <div style={{ backgroundColor: '#1E1E1E', padding: '1rem', borderRadius: '8px', marginTop: '2rem', fontSize: '1.2rem' }}>
        
        <h3 style={{marginTop: 0, color: '#B3B3B3'}}>ID Recibido de la URL:</h3>
        <code style={{ color: '#ffc107', backgroundColor: '#333', padding: '0.5rem', borderRadius: '4px', display: 'block' }}>
          {params.locationId}
        </code>
        <p style={{fontSize: '0.8rem', color: '#888'}}>Longitud: {params.locationId.length} caracteres</p>

        <h3 style={{marginTop: '2rem', color: '#B3B3B3'}}>ID de Ejemplo Generado (para Actopan):</h3>
        <code style={{ color: '#03DAC6', backgroundColor: '#333', padding: '0.5rem', borderRadius: '4px', display: 'block' }}>
          {exampleGeneratedId}
        </code>
        <p style={{fontSize: '0.8rem', color: '#888'}}>Longitud: {exampleGeneratedId.length} caracteres</p>

      </div>

      <Link href="/" style={{ color: '#BB86FC', display: 'block', marginTop: '2rem' }}>Volver al monitor principal</Link>
    </main>
  );
}