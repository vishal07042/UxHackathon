/**
 * Berlin Public Transport Agent
 * Integrates with VBB (Verkehrsverbund Berlin-Brandenburg) API
 * Handles buses, metros, trams, and regional trains in Berlin
 */

import { 
  TransportationAgent, 
  LocationPoint, 
  JourneySegment, 
  UserPreferences, 
  RealTimeUpdate, 
  BookingInfo,
  TransportMode,
  AgentCapabilities
} from './transportationOrchestrator';
import { vbbApi, VBBJourney, VBBLeg } from '../services/vbbApi';

export class BerlinPublicTransportAgent extends TransportationAgent {
  private supportedModes: Map<string, TransportMode> = new Map();

  constructor() {
    const capabilities: AgentCapabilities = {
      canPlanJourneys: true,
      canProvideRealTimeUpdates: true,
      canHandleBookings: false, // VBB doesn't handle bookings directly
      canProvideAlternatives: true,
      canIntegrateWithOtherModes: true,
      coverageArea: {
        city: 'Berlin',
        bounds: {
          north: 52.6755,
          south: 52.3382,
          east: 13.7611,
          west: 13.0883
        }
      }
    };

    super('berlin-public-transport', 'Berlin Public Transport (VBB)', capabilities);
    this.initializeSupportedModes();
  }

  private initializeSupportedModes(): void {
    this.supportedModes.set('subway', {
      id: 'berlin-subway',
      name: 'U-Bahn',
      type: 'public',
      category: 'metro',
      availability: 'available',
      realTimeData: true,
      bookingRequired: false,
      costPerKm: 0.15,
      averageSpeed: 35,
      co2PerKm: 20,
      accessibilityScore: 8
    });

    this.supportedModes.set('bus', {
      id: 'berlin-bus',
      name: 'Bus',
      type: 'public',
      category: 'bus',
      availability: 'available',
      realTimeData: true,
      bookingRequired: false,
      costPerKm: 0.12,
      averageSpeed: 20,
      co2PerKm: 25,
      accessibilityScore: 9
    });

    this.supportedModes.set('tram', {
      id: 'berlin-tram',
      name: 'Tram',
      type: 'public',
      category: 'tram',
      availability: 'available',
      realTimeData: true,
      bookingRequired: false,
      costPerKm: 0.13,
      averageSpeed: 25,
      co2PerKm: 18,
      accessibilityScore: 8
    });

    this.supportedModes.set('regional', {
      id: 'berlin-regional',
      name: 'S-Bahn',
      type: 'public',
      category: 'train',
      availability: 'available',
      realTimeData: true,
      bookingRequired: false,
      costPerKm: 0.18,
      averageSpeed: 45,
      co2PerKm: 15,
      accessibilityScore: 7
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test API connectivity
      await vbbApi.searchLocations('Alexanderplatz', 1);
      this.setActive(true);
      console.log('Berlin Public Transport Agent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Berlin Public Transport Agent:', error);
      this.setActive(false);
    }
  }

  async planJourney(
    origin: LocationPoint, 
    destination: LocationPoint, 
    preferences: UserPreferences
  ): Promise<JourneySegment[]> {
    try {
      const journeys = await vbbApi.planJourney(
        { latitude: origin.latitude, longitude: origin.longitude },
        { latitude: destination.latitude, longitude: destination.longitude },
        {
          results: 5,
          walkingSpeed: 'normal',
          products: {
            suburban: !preferences.avoidModes.includes('train'),
            subway: !preferences.avoidModes.includes('metro'),
            tram: !preferences.avoidModes.includes('tram'),
            bus: !preferences.avoidModes.includes('bus'),
            ferry: !preferences.avoidModes.includes('ferry'),
            express: true,
            regional: true
          }
        }
      );

      const segments: JourneySegment[] = [];

      for (const journey of journeys) {
        const segment = this.convertVBBJourneyToSegment(journey, origin, destination);
        if (segment) {
          segments.push(segment);
        }
      }

      return segments;
    } catch (error) {
      console.error('Failed to plan journey with VBB:', error);
      return [];
    }
  }

  private convertVBBJourneyToSegment(
    vbbJourney: VBBJourney, 
    origin: LocationPoint, 
    destination: LocationPoint
  ): JourneySegment | null {
    if (!vbbJourney.legs || vbbJourney.legs.length === 0) {
      return null;
    }

    // For simplicity, we'll create one segment per journey
    // In a real implementation, you might want to create separate segments for each leg
    const firstLeg = vbbJourney.legs[0];
    const lastLeg = vbbJourney.legs[vbbJourney.legs.length - 1];

    const mode = this.getTransportModeForLeg(firstLeg);
    if (!mode) return null;

    const totalDuration = vbbJourney.legs.reduce((sum, leg) => {
      const departure = new Date(leg.departure);
      const arrival = new Date(leg.arrival);
      return sum + (arrival.getTime() - departure.getTime()) / (1000 * 60);
    }, 0);

    const totalDistance = vbbJourney.legs.reduce((sum, leg) => sum + (leg.distance || 0), 0);

    return {
      id: `vbb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mode,
      origin,
      destination,
      departureTime: new Date(firstLeg.departure),
      arrivalTime: new Date(lastLeg.arrival),
      duration: Math.round(totalDuration),
      distance: totalDistance,
      cost: vbbJourney.price?.amount || this.estimateCost(totalDistance, mode),
      co2Emissions: this.calculateCO2Emissions(totalDistance, mode),
      reliability: this.getReliabilityScore(mode),
      comfort: this.getComfortScore(mode),
      accessibility: mode.accessibilityScore || 7,
      realTimeUpdates: true,
      bookingInfo: {
        required: false,
        provider: 'VBB',
        estimatedWaitTime: 2
      }
    };
  }

  private getTransportModeForLeg(leg: VBBLeg): TransportMode | null {
    const modeMap: { [key: string]: string } = {
      'subway': 'subway',
      'bus': 'bus',
      'tram': 'tram',
      'regional': 'regional',
      'ferry': 'ferry'
    };

    const modeKey = modeMap[leg.mode];
    return modeKey ? this.supportedModes.get(modeKey) || null : null;
  }

  private estimateCost(distance: number, mode: TransportMode): number {
    // Berlin public transport uses zone-based pricing
    // This is a simplified calculation
    const basePrice = 3.20; // Zone AB ticket
    const longDistancePrice = 4.40; // Zone ABC ticket
    
    return distance > 15000 ? longDistancePrice : basePrice;
  }

  private calculateCO2Emissions(distance: number, mode: TransportMode): number {
    return (distance / 1000) * (mode.co2PerKm || 20);
  }

  private getReliabilityScore(mode: TransportMode): number {
    // Based on historical data - simplified
    const reliabilityMap: { [key: string]: number } = {
      'subway': 0.92,
      'regional': 0.88,
      'tram': 0.90,
      'bus': 0.85,
      'ferry': 0.95
    };

    return reliabilityMap[mode.category] || 0.85;
  }

  private getComfortScore(mode: TransportMode): number {
    const comfortMap: { [key: string]: number } = {
      'subway': 7,
      'regional': 8,
      'tram': 7,
      'bus': 6,
      'ferry': 9
    };

    return comfortMap[mode.category] || 6;
  }

  async getRealTimeUpdates(segmentId: string): Promise<RealTimeUpdate[]> {
    // In a real implementation, this would fetch real-time data from VBB
    // For now, we'll simulate some updates
    const updates: RealTimeUpdate[] = [];

    // Simulate random delays
    if (Math.random() < 0.1) { // 10% chance of delay
      updates.push({
        segmentId,
        type: 'delay',
        severity: 'medium',
        message: 'Service delayed by 3-5 minutes due to technical issues',
        estimatedDelay: Math.floor(Math.random() * 3) + 3,
        timestamp: new Date()
      });
    }

    // Simulate disruptions
    if (Math.random() < 0.02) { // 2% chance of disruption
      updates.push({
        segmentId,
        type: 'disruption',
        severity: 'high',
        message: 'Service disruption on this line. Alternative routes recommended.',
        timestamp: new Date()
      });
    }

    return updates;
  }

  async bookJourney(segment: JourneySegment): Promise<BookingInfo> {
    // VBB doesn't require advance booking for public transport
    return {
      required: false,
      provider: 'VBB',
      estimatedWaitTime: 2,
      cancellationPolicy: 'No booking required for public transport'
    };
  }

  async getAlternatives(segment: JourneySegment): Promise<JourneySegment[]> {
    try {
      // Get alternative routes
      const alternatives = await this.planJourney(
        segment.origin,
        segment.destination,
        {
          maxWalkingDistance: 1000,
          preferredModes: [],
          avoidModes: [segment.mode.category], // Avoid the current mode
          maxCost: 50,
          prioritizeSpeed: true,
          prioritizeCost: false,
          prioritizeComfort: false,
          prioritizeEnvironment: false,
          accessibilityNeeds: [],
          realTimeUpdatesRequired: true
        }
      );

      return alternatives.slice(0, 3); // Return top 3 alternatives
    } catch (error) {
      console.error('Failed to get alternatives:', error);
      return [];
    }
  }

  /**
   * Get nearby stops for better integration with other modes
   */
  async getNearbyStops(location: LocationPoint, radius = 500): Promise<LocationPoint[]> {
    try {
      const stops = await vbbApi.getNearbyLocations(
        location.latitude,
        location.longitude,
        radius
      );

      return stops.map(stop => ({
        latitude: stop.latitude,
        longitude: stop.longitude,
        name: stop.name,
        address: stop.address,
        type: 'stop' as const
      }));
    } catch (error) {
      console.error('Failed to get nearby stops:', error);
      return [];
    }
  }

  /**
   * Get departures from a specific stop
   */
  async getDepartures(stopId: string): Promise<any[]> {
    try {
      return await vbbApi.getDepartures(stopId, 60);
    } catch (error) {
      console.error('Failed to get departures:', error);
      return [];
    }
  }

  /**
   * Get live vehicle positions in an area
   */
  async getVehiclePositions(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<any[]> {
    try {
      return await vbbApi.getRadar(
        bounds.north,
        bounds.west,
        bounds.south,
        bounds.east
      );
    } catch (error) {
      console.error('Failed to get vehicle positions:', error);
      return [];
    }
  }
}

export default BerlinPublicTransportAgent;
