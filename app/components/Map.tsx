// app/components/Map.tsx (VERSIÓN CORREGIDA PARA ICONOS)

'use client'; // ¡Muy importante! Esto le dice a Next.js que es un componente de cliente

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE! ---
// Borramos la solución anterior y usamos esta nueva y más robusta.
// Le decimos explícitamente a Leaflet dónde encontrar sus imágenes.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- FIN DE LA CORRECCIÓN ---


// Definimos el tipo de dato para las localizaciones que el mapa recibirá
interface Location {
  name: string;
  state: string;
  lat: number;
  lon: number;
}

interface MapProps {
  locations: Location[];
}

export default function Map({ locations }: MapProps) {
  return (
    <MapContainer 
      center={[20.1213, -98.7344]} // Centrado en Pachuca
      zoom={8} 
      scrollWheelZoom={false} // Desactivamos el zoom con la rueda del mouse para mejorar la experiencia en móvil
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {locations.map((loc, index) => (
        <Marker key={index} position={[loc.lat, loc.lon]}>
          <Popup>
            {loc.name}, {loc.state}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}