// app/components/Map.tsx (VERSIÓN CORREGIDA Y VERIFICADA)

'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Interfaz para el objeto de alerta que recibirá el mapa
interface Alert {
  level: string;
  reason: string;
}

// Interfaz para la localización combinada con sus datos
interface LocationWithAlert {
  name: string;
  state: string;
  lat: number;
  lon: number;
  alert: Alert;
}

interface MapProps {
  locations: LocationWithAlert[];
}

// Definimos los colores para los marcadores del mapa
const ALERT_MAP_COLORS = {
  GREEN: '#28a745', // Verde
  YELLOW: '#ffc107', // Amarillo
  ORANGE: '#fd7e14', // Naranja
  RED: '#dc3545',    // Rojo
};

export default function Map({ locations }: MapProps) {
  return (
    <MapContainer 
      center={[20.1213, -98.7344]}
      zoom={8} 
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {locations.map((loc) => (
        <CircleMarker
          // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
          // Usamos una combinación de lat y lon para una clave única, en lugar del zip_code que no existe aquí.
          key={`${loc.lat}-${loc.lon}`}
          center={[loc.lat, loc.lon]}
          pathOptions={{ 
            color: ALERT_MAP_COLORS[loc.alert.level as keyof typeof ALERT_MAP_COLORS] || '#888',
            fillColor: ALERT_MAP_COLORS[loc.alert.level as keyof typeof ALERT_MAP_COLORS] || '#888',
            fillOpacity: 0.8
          }}
          radius={6}
        >
          <Popup>
            <b>{loc.name}, {loc.state}</b><br />
            {loc.alert.level !== 'GREEN' ? `Alerta: ${loc.alert.reason}` : 'Sin alertas'}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}