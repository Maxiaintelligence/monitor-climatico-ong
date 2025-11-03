// app/components/RiskSummary.tsx
'use client';

// Definimos los tipos de datos que este componente espera recibir
interface LocationInfo {
  name: string;
  state: string;
  alert: {
    level: string;
    reason: string;
  };
}

interface RiskSummaryProps {
  redCount: number;
  orangeCount: number;
  yellowCount: number;
  criticalLocations: LocationInfo[];
}

// Mapa de colores específico para el texto del resumen
const SUMMARY_TEXT_COLORS = {
  RED: '#dc3545',
  ORANGE: '#fd7e14',
  YELLOW: '#ffc107',
};

export default function RiskSummary({ redCount, orangeCount, yellowCount, criticalLocations }: RiskSummaryProps) {
  const hasAlerts = redCount > 0 || orangeCount > 0 || yellowCount > 0;

  return (
    <section style={{ 
      backgroundColor: '#1E1E1E', 
      padding: '1.5rem', 
      borderRadius: '8px', 
      marginBottom: '3rem',
      border: `1px solid ${hasAlerts ? SUMMARY_TEXT_COLORS.YELLOW : '#444'}`
    }}>
      <h2 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '1rem' }}>Resumen de Estado</h2>
      
      {/* Contadores de Alertas */}
      <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: SUMMARY_TEXT_COLORS.RED }}>{redCount}</p>
          <p style={{ margin: 0, color: '#B3B3B3' }}>En Alerta Roja</p>
        </div>
        <div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: SUMMARY_TEXT_COLORS.ORANGE }}>{orangeCount}</p>
          <p style={{ margin: 0, color: '#B3B3B3' }}>En Alerta Naranja</p>
        </div>
        <div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: SUMMARY_TEXT_COLORS.YELLOW }}>{yellowCount}</p>
          <p style={{ margin: 0, color: '#B3B3B3' }}>En Alerta Amarilla</p>
        </div>
      </div>

      {/* Lista de Poblaciones Críticas */}
      {criticalLocations.length > 0 && (
        <div>
          <h3 style={{ color: '#FFC107' }}>Poblaciones con Mayor Riesgo</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {criticalLocations.map((loc, index) => (
              <li key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
                <span style={{ fontWeight: 'bold' }}>{loc.name}, {loc.state}: </span>
                <span style={{ color: SUMMARY_TEXT_COLORS[loc.alert.level as keyof typeof SUMMARY_TEXT_COLORS] }}>
                  {loc.alert.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}