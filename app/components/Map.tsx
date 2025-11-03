// app/components/Map.tsx (VERSIÓN CON MANEJADOR DE CLIC)

'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- INTERFACES ACTUALIZADAS ---
interface Alert {
  level: string;
  reason: string;
}

interface LocationWithAlert {
  id: string; // <-- Añadimos un ID único para la interacción
  name: string;
  state: string;
  lat: number;
  lon: number;
  alert: Alert;
}

interface MapProps {
  locations: LocationWithAlert[];
  onMarkerClick: (locationId: string) => void; // <-- 1. AÑADIMOS UNA FUNCIÓN DE CALLBACK
}

const ALERT_MAP_COLORS = { /* ... sin cambios ... */ };

export default function Map({ locations, onMarkerClick }: MapProps) { // <-- 2. RECIBIMOS LA FUNCIÓN
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
          key={loc.id}
          center={[loc.lat, loc.lon]}
          pathOptions={{ /* ... sin cambios ... */ }}
          radius={6}
          // --- 3. AÑADIMOS EL EVENTO DE CLIC ---
          eventHandlers={{
            click: () => {
              onMarkerClick(loc.id); // Al hacer clic, llamamos a la función con el ID de la población
            },
          }}
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