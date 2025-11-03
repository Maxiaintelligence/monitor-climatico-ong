// app/components/Map.tsx
'use client'; // ¡Muy importante! Esto le dice a Next.js que es un componente de cliente

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo para un problema común con los iconos en react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src
});
L.Marker.prototype.options.icon = DefaultIcon;

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
      style={{ height: '500px', width: '100%', borderRadius: '8px' }}
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