// app/poblacion/[locationId]/page.tsx (VERSIÓN DE DEPURACIÓN FINAL Y A PRUEBA DE FALLOS)
'use client';

import Link from 'next/link';

export default function LocationDetailPage({ params }: { params: { locationId: string } }) {

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <h1 style={{color: '#dc3545'}}>Página de Depuración de Parámetros</h1>
      
      <div style={{ backgroundColor: '#1E1E1E', padding: '1rem', borderRadius: '8px', marginTop: '2rem', fontSize: '1.2rem' }}>
        
        <h3 style={{marginTop: 0, color: '#B3B3B3'}}>Contenido del objeto `params`:</h3>
        <pre style={{ color: '#ffc107', backgroundColor: '#333', padding: '0.5rem', borderRadius: '4px', display: 'block' }}>
          {JSON.stringify(params, null, 2)}
        </pre>

      </div>

      <Link href="/" style={{ color: '#BB86FC', display: 'block', marginTop: '2rem' }}>Volver al monitor principal</Link>
    </main>
  );
}