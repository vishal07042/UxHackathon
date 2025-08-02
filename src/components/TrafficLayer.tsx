import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Navigation, Zap } from 'lucide-react';
import { trafficApi, TrafficCondition, TrafficIncident } from '../services/trafficApi';

interface TrafficLayerProps {
  enabled?: boolean;
  showIncidents?: boolean;
  showConditions?: boolean;
  updateInterval?: number;
}

export const TrafficLayer: React.FC<TrafficLayerProps> = ({
  enabled = true,
  showIncidents = true,
  showConditions = true,
  updateInterval = 30000 // 30 seconds
}) => {
  const map = useMap();
  const [trafficConditions, setTrafficConditions] = useState<TrafficCondition[]>([]);
  const [trafficIncidents, setTrafficIncidents] = useState<TrafficIncident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Get map bounds for traffic data requests
  const getMapBounds = () => {
    const bounds = map.getBounds();
    return {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
  };

  // Fetch traffic data
  const fetchTrafficData = async () => {
    if (!enabled) return;

    setIsLoading(true);
    try {
      const bounds = getMapBounds();
      
      const [conditions, incidents] = await Promise.all([
        showConditions ? trafficApi.getTrafficConditions(bounds) : Promise.resolve([]),
        showIncidents ? trafficApi.getTrafficIncidents(bounds) : Promise.resolve([])
      ]);

      setTrafficConditions(conditions);
      setTrafficIncidents(incidents);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and periodic updates
  useEffect(() => {
    if (!enabled) return;

    fetchTrafficData();

    const interval = setInterval(fetchTrafficData, updateInterval);
    return () => clearInterval(interval);
  }, [enabled, updateInterval]);

  // Update when map moves
  useEffect(() => {
    if (!enabled) return;

    const handleMoveEnd = () => {
      fetchTrafficData();
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [enabled, map]);

  // Create traffic condition markers
  useEffect(() => {
    if (!enabled || !showConditions) return;

    const markers: L.Marker[] = [];

    trafficConditions.forEach(condition => {
      const icon = createTrafficIcon(condition.severity);
      const marker = L.marker([condition.location.latitude, condition.location.longitude], { icon })
        .bindPopup(createTrafficPopup(condition));
      
      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [trafficConditions, enabled, showConditions, map]);

  // Create incident markers
  useEffect(() => {
    if (!enabled || !showIncidents) return;

    const markers: L.Marker[] = [];

    trafficIncidents.forEach(incident => {
      const icon = createIncidentIcon(incident.type, incident.severity);
      const marker = L.marker([incident.location.latitude, incident.location.longitude], { icon })
        .bindPopup(createIncidentPopup(incident));
      
      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [trafficIncidents, enabled, showIncidents, map]);

  return null; // This component doesn't render anything directly
};

// Helper functions for creating icons and popups
const createTrafficIcon = (severity: TrafficCondition['severity']) => {
  const colors = {
    free: '#10b981',
    light: '#f59e0b',
    moderate: '#f97316',
    heavy: '#ef4444',
    blocked: '#dc2626'
  };

  const color = colors[severity];
  
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'traffic-condition-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const createIncidentIcon = (type: TrafficIncident['type'], severity: TrafficIncident['severity']) => {
  const typeIcons = {
    accident: '🚗',
    construction: '🚧',
    closure: '🚫',
    event: '📅',
    weather: '🌧️'
  };

  const severityColors = {
    minor: '#f59e0b',
    moderate: '#f97316',
    major: '#ef4444'
  };

  const icon = typeIcons[type];
  const color = severityColors[severity];

  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      animation: bounce 1s infinite;
    ">
      ${icon}
    </div>
    <style>
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-5px); }
        60% { transform: translateY(-3px); }
      }
    </style>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'traffic-incident-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const createTrafficPopup = (condition: TrafficCondition) => {
  const severityLabels = {
    free: 'Free Flow',
    light: 'Light Traffic',
    moderate: 'Moderate Traffic',
    heavy: 'Heavy Traffic',
    blocked: 'Blocked'
  };

  const severityColors = {
    free: '#10b981',
    light: '#f59e0b',
    moderate: '#f97316',
    heavy: '#ef4444',
    blocked: '#dc2626'
  };

  return `
    <div style="min-width: 200px; font-family: system-ui;">
      <div style="
        background: linear-gradient(135deg, ${severityColors[condition.severity]}, ${severityColors[condition.severity]}aa);
        color: white;
        padding: 8px 12px;
        margin: -8px -12px 8px -12px;
        border-radius: 4px 4px 0 0;
        font-weight: bold;
      ">
        ${severityLabels[condition.severity]}
      </div>
      <div style="padding: 4px 0;">
        <div style="margin-bottom: 4px;">
          <strong>Speed:</strong> ${condition.speed} km/h
        </div>
        <div style="margin-bottom: 4px;">
          <strong>Delay:</strong> ${condition.delay} minutes
        </div>
        <div style="font-size: 12px; color: #666;">
          Updated: ${condition.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  `;
};

const createIncidentPopup = (incident: TrafficIncident) => {
  const typeLabels = {
    accident: 'Accident',
    construction: 'Construction',
    closure: 'Road Closure',
    event: 'Event',
    weather: 'Weather'
  };

  const severityColors = {
    minor: '#f59e0b',
    moderate: '#f97316',
    major: '#ef4444'
  };

  return `
    <div style="min-width: 200px; font-family: system-ui;">
      <div style="
        background: linear-gradient(135deg, ${severityColors[incident.severity]}, ${severityColors[incident.severity]}aa);
        color: white;
        padding: 8px 12px;
        margin: -8px -12px 8px -12px;
        border-radius: 4px 4px 0 0;
        font-weight: bold;
      ">
        ${typeLabels[incident.type]} - ${incident.severity.toUpperCase()}
      </div>
      <div style="padding: 4px 0;">
        <div style="margin-bottom: 8px;">
          ${incident.description}
        </div>
        <div style="margin-bottom: 4px;">
          <strong>Started:</strong> ${incident.startTime.toLocaleString()}
        </div>
        ${incident.estimatedEndTime ? `
          <div style="margin-bottom: 4px;">
            <strong>Estimated End:</strong> ${incident.estimatedEndTime.toLocaleString()}
          </div>
        ` : ''}
        ${incident.affectedRoutes.length > 0 ? `
          <div style="font-size: 12px; color: #666;">
            Affected Routes: ${incident.affectedRoutes.join(', ')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

export default TrafficLayer;
