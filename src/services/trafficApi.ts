/**
 * Traffic Data Service
 * Provides real-time traffic information using multiple data sources
 */

export interface TrafficCondition {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  severity: 'free' | 'light' | 'moderate' | 'heavy' | 'blocked';
  speed: number; // km/h
  delay: number; // minutes
  description: string;
  timestamp: Date;
  source: string;
}

export interface TrafficSegment {
  id: string;
  coordinates: [number, number][];
  severity: TrafficCondition['severity'];
  speed: number;
  freeFlowSpeed: number;
  length: number; // meters
  travelTime: number; // seconds
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'closure' | 'event' | 'weather';
  location: {
    latitude: number;
    longitude: number;
  };
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  startTime: Date;
  estimatedEndTime?: Date;
  affectedRoutes: string[];
}

export interface TrafficRoute {
  id: string;
  coordinates: [number, number][];
  segments: TrafficSegment[];
  totalTravelTime: number;
  totalDistance: number;
  averageSpeed: number;
  incidents: TrafficIncident[];
}

class TrafficApiService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // In a real implementation, these would come from environment variables
    this.apiKey = process.env.VITE_TRAFFIC_API_KEY || 'demo-key';
    this.baseUrl = 'https://api.mapbox.com/directions/v5'; // Using Mapbox as example
  }

  /**
   * Get traffic conditions for a specific area
   */
  async getTrafficConditions(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }
  ): Promise<TrafficCondition[]> {
    const cacheKey = `traffic-${bounds.north}-${bounds.south}-${bounds.east}-${bounds.west}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Simulate API call - in real implementation, this would call actual traffic API
      const conditions = await this.simulateTrafficConditions(bounds);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: conditions,
        timestamp: Date.now()
      });

      return conditions;
    } catch (error) {
      console.error('Failed to fetch traffic conditions:', error);
      return [];
    }
  }

  /**
   * Get traffic-aware route between two points
   */
  async getTrafficRoute(
    origin: [number, number],
    destination: [number, number],
    options: {
      avoidTraffic?: boolean;
      departureTime?: Date;
      routeType?: 'fastest' | 'shortest' | 'balanced';
    } = {}
  ): Promise<TrafficRoute | null> {
    const cacheKey = `route-${origin.join(',')}-${destination.join(',')}-${JSON.stringify(options)}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Simulate traffic-aware routing
      const route = await this.simulateTrafficRoute(origin, destination, options);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: route,
        timestamp: Date.now()
      });

      return route;
    } catch (error) {
      console.error('Failed to get traffic route:', error);
      return null;
    }
  }

  /**
   * Get current traffic incidents in an area
   */
  async getTrafficIncidents(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }
  ): Promise<TrafficIncident[]> {
    try {
      // Simulate incident data
      return this.simulateTrafficIncidents(bounds);
    } catch (error) {
      console.error('Failed to fetch traffic incidents:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time traffic updates
   */
  subscribeToTrafficUpdates(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    callback: (conditions: TrafficCondition[]) => void
  ): () => void {
    const interval = setInterval(async () => {
      try {
        const conditions = await this.getTrafficConditions(bounds);
        callback(conditions);
      } catch (error) {
        console.error('Traffic update failed:', error);
      }
    }, 30000); // Update every 30 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  // Simulation methods (replace with actual API calls in production)
  private async simulateTrafficConditions(bounds: any): Promise<TrafficCondition[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const conditions: TrafficCondition[] = [];
    const severities: TrafficCondition['severity'][] = ['free', 'light', 'moderate', 'heavy', 'blocked'];
    
    // Generate random traffic conditions
    for (let i = 0; i < 20; i++) {
      conditions.push({
        id: `condition-${i}`,
        location: {
          latitude: bounds.south + Math.random() * (bounds.north - bounds.south),
          longitude: bounds.west + Math.random() * (bounds.east - bounds.west),
        },
        severity: severities[Math.floor(Math.random() * severities.length)],
        speed: Math.floor(Math.random() * 80) + 20,
        delay: Math.floor(Math.random() * 30),
        description: `Traffic condition ${i + 1}`,
        timestamp: new Date(),
        source: 'simulation'
      });
    }

    return conditions;
  }

  private async simulateTrafficRoute(
    origin: [number, number],
    destination: [number, number],
    options: any
  ): Promise<TrafficRoute> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create a simple route with traffic segments
    const segments: TrafficSegment[] = [
      {
        id: 'segment-1',
        coordinates: [origin, destination],
        severity: 'light',
        speed: 45,
        freeFlowSpeed: 60,
        length: 5000,
        travelTime: 400
      }
    ];

    return {
      id: `route-${Date.now()}`,
      coordinates: [origin, destination],
      segments,
      totalTravelTime: 400,
      totalDistance: 5000,
      averageSpeed: 45,
      incidents: []
    };
  }

  private async simulateTrafficIncidents(bounds: any): Promise<TrafficIncident[]> {
    const incidents: TrafficIncident[] = [];
    const types: TrafficIncident['type'][] = ['accident', 'construction', 'closure', 'event', 'weather'];
    const severities: TrafficIncident['severity'][] = ['minor', 'moderate', 'major'];

    // Generate random incidents
    for (let i = 0; i < 5; i++) {
      incidents.push({
        id: `incident-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        location: {
          latitude: bounds.south + Math.random() * (bounds.north - bounds.south),
          longitude: bounds.west + Math.random() * (bounds.east - bounds.west),
        },
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: `Traffic incident ${i + 1}`,
        startTime: new Date(Date.now() - Math.random() * 3600000),
        affectedRoutes: [`Route ${i + 1}`]
      });
    }

    return incidents;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const trafficApi = new TrafficApiService();
export default trafficApi;
