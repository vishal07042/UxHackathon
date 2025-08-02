import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { VBBLocation, VBBJourney, VBBLeg } from '../services/vbbApi';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different transport modes
const createTransportIcon = (mode: string, color: string) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 14px;
      color: white;
      font-weight: bold;
    ">
      ${getTransportSymbol(mode)}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-transport-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const getTransportSymbol = (mode: string): string => {
  switch (mode) {
    case 'bus': return '🚌';
    case 'subway': return '🚇';
    case 'tram': return '🚊';
    case 'regional': return '🚆';
    case 'ferry': return '⛴️';
    case 'walking': return '🚶';
    default: return '🚌';
  }
};

const getTransportColor = (mode: string): string => {
  switch (mode) {
    case 'bus': return '#22c55e';
    case 'subway': return '#3b82f6';
    case 'tram': return '#f59e0b';
    case 'regional': return '#8b5cf6';
    case 'ferry': return '#06b6d4';
    case 'walking': return '#6b7280';
    default: return '#22c55e';
  }
};

// Component to fit map bounds to show all markers
const MapBounds: React.FC<{ locations: VBBLocation[] }> = ({ locations }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);
  
  return null;
};

// Component to draw journey route
const JourneyRoute: React.FC<{ journey: VBBJourney }> = ({ journey }) => {
  const routeSegments = journey.legs.map((leg, index) => {
    const positions: [number, number][] = [
      [leg.origin.latitude, leg.origin.longitude],
      [leg.destination.latitude, leg.destination.longitude]
    ];
    
    const color = getTransportColor(leg.mode);
    
    return (
      <Polyline
        key={index}
        positions={positions}
        color={color}
        weight={4}
        opacity={0.8}
        dashArray={leg.mode === 'walking' ? '10, 10' : undefined}
      />
    );
  });

  return <>{routeSegments}</>;
};

interface JourneyMapProps {
  origin?: VBBLocation;
  destination?: VBBLocation;
  journeys: VBBJourney[];
  selectedJourney?: VBBJourney;
  nearbyStops: VBBLocation[];
  onLocationSelect?: (location: VBBLocation) => void;
  className?: string;
}

const JourneyMap: React.FC<JourneyMapProps> = ({
  origin,
  destination,
  journeys,
  selectedJourney,
  nearbyStops,
  onLocationSelect,
  className = ''
}) => {
  const [mapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin center
  const [mapZoom] = useState(12);

  // Collect all locations to show on map
  const allLocations: VBBLocation[] = [
    ...(origin ? [origin] : []),
    ...(destination ? [destination] : []),
    ...nearbyStops
  ];

  // Add journey stops if a journey is selected
  if (selectedJourney) {
    selectedJourney.legs.forEach(leg => {
      if (!allLocations.find(loc => loc.id === leg.origin.id)) {
        allLocations.push(leg.origin);
      }
      if (!allLocations.find(loc => loc.id === leg.destination.id)) {
        allLocations.push(leg.destination);
      }
    });
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds locations={allLocations} />
        
        {/* Origin marker */}
        {origin && (
          <Marker 
            position={[origin.latitude, origin.longitude]}
            icon={L.divIcon({
              html: `<div style="
                background-color: #22c55e;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>`,
              className: 'origin-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-sm">
                <strong>Origin</strong><br />
                {origin.name}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Destination marker */}
        {destination && (
          <Marker 
            position={[destination.latitude, destination.longitude]}
            icon={L.divIcon({
              html: `<div style="
                background-color: #ef4444;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>`,
              className: 'destination-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-sm">
                <strong>Destination</strong><br />
                {destination.name}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Nearby stops */}
        {nearbyStops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={createTransportIcon('bus', '#6b7280')}
            eventHandlers={{
              click: () => onLocationSelect?.(stop)
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{stop.name}</strong><br />
                {stop.distance && `${Math.round(stop.distance)}m away`}
                <br />
                <button 
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  onClick={() => onLocationSelect?.(stop)}
                >
                  Select as {!origin ? 'Origin' : 'Destination'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Journey route */}
        {selectedJourney && <JourneyRoute journey={selectedJourney} />}
        
        {/* Journey stops */}
        {selectedJourney?.legs.map((leg, legIndex) => (
          <React.Fragment key={legIndex}>
            {/* Origin stop of each leg */}
            <Marker
              position={[leg.origin.latitude, leg.origin.longitude]}
              icon={createTransportIcon(leg.mode, getTransportColor(leg.mode))}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{leg.origin.name}</strong><br />
                  Mode: {leg.mode}<br />
                  {leg.line && `Line: ${leg.line.name}`}<br />
                  Departure: {new Date(leg.departure).toLocaleTimeString()}<br />
                  {leg.direction && `Direction: ${leg.direction}`}
                </div>
              </Popup>
            </Marker>
            
            {/* Destination stop of each leg */}
            <Marker
              position={[leg.destination.latitude, leg.destination.longitude]}
              icon={createTransportIcon(leg.mode, getTransportColor(leg.mode))}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{leg.destination.name}</strong><br />
                  Mode: {leg.mode}<br />
                  {leg.line && `Line: ${leg.line.name}`}<br />
                  Arrival: {new Date(leg.arrival).toLocaleTimeString()}<br />
                  {leg.direction && `Direction: ${leg.direction}`}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
      
      {/* Map legend */}
      <motion.div 
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-xs font-semibold mb-2">Transport Modes</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Bus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Subway</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span>Tram</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>Regional</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JourneyMap;