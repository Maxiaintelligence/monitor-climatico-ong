// app/poblacion/[locationId]/page.tsx

import locations from '@/app/lib/locations.json'; // Usamos un alias para la ruta
import Link from 'next/link';

// --- FUNCIÓN AUXILIAR PARA CREAR IDs ---
// Debe ser idéntica a la que usamos en la página principal
const generateLocationId = (loc: { name: string, state: string }) => {
  return `${loc.name.toLowerCase().replace(/\s+/g, '-')}-${loc.state.toLowerCase().replace('.', '')}`;
};

// Esta es nuestra página de detalle
export default function LocationDetailPage({ params }: { params: { locationId: string } }) {
  // 1. Buscamos la información de la población usando el ID de la URL
  const locationData = locations.find(loc => generateLocationId(loc) === params.locationId);

  // 2. Si no se encuentra la población, mostramos un mensaje de error
  if (!locationData) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh', textAlign: 'center' }}>
        <h1>Población no encontrada</h1>
        <Link href="/" style={{ color: '#BB86FC' }}>Volver al monitor principal</Link>
      </main>
    );
  }

  // 3. Si se encuentra, mostramos su información (por ahora, solo el título)
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
      
      {/* --- AQUÍ IRÁN LAS GRÁFICAS Y TABLAS EN FUTUROS PASOS --- */}
      <div style={{
        border: '2px dashed #444',
        padding: '4rem',
        textAlign: 'center',
        borderRadius: '8px',
        color: '#888'
      }}>
        <p>Próximamente: Gráficas de pronóstico por hora y diario.</p>
      </div>
    </main>
  );
}