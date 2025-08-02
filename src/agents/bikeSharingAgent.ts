/**
 * Bike Sharing Agent
 * Integrates with bike sharing services (Nextbike, Call a Bike, etc.)
 * Provides eco-friendly last-mile transportation options
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

export interface BikeStation {
  id: string;
  name: string;
  location: LocationPoint;
  availableBikes: number;
  availableDocks: number;
  totalCapacity: number;
  bikeTypes: BikeType[];
  status: 'active' | 'maintenance' | 'inactive';
  lastUpdated: Date;
}

export interface BikeType {
  id: string;
  name: string;
  type: 'standard' | 'electric' | 'cargo' | 'accessible';
  pricePerMinute: number;
  maxSpeed: number;
  range?: number; // for electric bikes
  features: string[];
}

export class BikeSharingAgent extends TransportationAgent {
  private supportedModes: Map<string, TransportMode> = new Map();
  private bikeStations: Map<string, BikeStation> = new Map();
  private activeBikes: Map<string, any> = new Map();

  constructor() {
    const capabilities: AgentCapabilities = {
      canPlanJourneys: true,
      canProvideRealTimeUpdates: true,
      canHandleBookings: true,
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

    super('bike-sharing', 'Bike Sharing Services', capabilities);
    this.initializeSupportedModes();
  }

  private initializeSupportedModes(): void {
    this.supportedModes.set('bike-standard', {
      id: 'bike-standard',
      name: 'Standard Bike',
      type: 'shared',
      category: 'bikeshare',
      availability: 'available',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 0.15,
      averageSpeed: 15,
      co2PerKm: 0,
      accessibilityScore: 4
    });

    this.supportedModes.set('bike-electric', {
      id: 'bike-electric',
      name: 'Electric Bike',
      type: 'shared',
      category: 'bikeshare',
      availability: 'available',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 0.25,
      averageSpeed: 22,
      co2PerKm: 5, // minimal for charging
      accessibilityScore: 6
    });

    this.supportedModes.set('bike-cargo', {
      id: 'bike-cargo',
      name: 'Cargo Bike',
      type: 'shared',
      category: 'bikeshare',
      availability: 'limited',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 0.35,
      averageSpeed: 12,
      co2PerKm: 0,
      accessibilityScore: 3
    });
  }

  async initialize(): Promise<void> {
    try {
      // Initialize bike stations
      await this.loadBikeStations();
      this.setActive(true);
      console.log('Bike Sharing Agent initialized successfully');
      
      // Start real-time station monitoring
      this.startStationMonitoring();
    } catch (error) {
      console.error('Failed to initialize Bike Sharing Agent:', error);
      this.setActive(false);
    }
  }

  private async loadBikeStations(): Promise<void> {
    // Simulate loading bike stations from API
    const mockStations: BikeStation[] = [
      {
        id: 'station-001',
        name: 'Alexanderplatz',
        location: {
          latitude: 52.5219,
          longitude: 13.4132,
          name: 'Alexanderplatz',
          type: 'station'
        },
        availableBikes: 8,
        availableDocks: 4,
        totalCapacity: 12,
        bikeTypes: [
          {
            id: 'standard-001',
            name: 'City Bike',
            type: 'standard',
            pricePerMinute: 0.15,
            maxSpeed: 25,
            features: ['basket', 'lights']
          },
          {
            id: 'electric-001',
            name: 'E-Bike',
            type: 'electric',
            pricePerMinute: 0.25,
            maxSpeed: 25,
            range: 50,
            features: ['electric_assist', 'basket', 'lights', 'phone_holder']
          }
        ],
        status: 'active',
        lastUpdated: new Date()
      },
      {
        id: 'station-002',
        name: 'Brandenburg Gate',
        location: {
          latitude: 52.5163,
          longitude: 13.3777,
          name: 'Brandenburg Gate',
          type: 'station'
        },
        availableBikes: 5,
        availableDocks: 7,
        totalCapacity: 12,
        bikeTypes: [
          {
            id: 'standard-002',
            name: 'City Bike',
            type: 'standard',
            pricePerMinute: 0.15,
            maxSpeed: 25,
            features: ['basket', 'lights']
          }
        ],
        status: 'active',
        lastUpdated: new Date()
      },
      {
        id: 'station-003',
        name: 'Potsdamer Platz',
        location: {
          latitude: 52.5096,
          longitude: 13.3760,
          name: 'Potsdamer Platz',
          type: 'station'
        },
        availableBikes: 12,
        availableDocks: 3,
        totalCapacity: 15,
        bikeTypes: [
          {
            id: 'standard-003',
            name: 'City Bike',
            type: 'standard',
            pricePerMinute: 0.15,
            maxSpeed: 25,
            features: ['basket', 'lights']
          },
          {
            id: 'electric-003',
            name: 'E-Bike',
            type: 'electric',
            pricePerMinute: 0.25,
            maxSpeed: 25,
            range: 50,
            features: ['electric_assist', 'basket', 'lights']
          },
          {
            id: 'cargo-003',
            name: 'Cargo Bike',
            type: 'cargo',
            pricePerMinute: 0.35,
            maxSpeed: 20,
            features: ['cargo_box', 'electric_assist', 'lights']
          }
        ],
        status: 'active',
        lastUpdated: new Date()
      }
    ];

    mockStations.forEach(station => {
      this.bikeStations.set(station.id, station);
    });
  }

  private startStationMonitoring(): void {
    // Update station data every 2 minutes
    setInterval(() => {
      this.updateStationData();
    }, 120000);
  }

  private updateStationData(): void {
    // Simulate real-time updates to bike availability
    this.bikeStations.forEach(station => {
      // Random changes in bike availability
      const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      station.availableBikes = Math.max(0, Math.min(station.totalCapacity, station.availableBikes + change));
      station.availableDocks = station.totalCapacity - station.availableBikes;
      station.lastUpdated = new Date();
    });
  }

  async planJourney(
    origin: LocationPoint, 
    destination: LocationPoint, 
    preferences: UserPreferences
  ): Promise<JourneySegment[]> {
    const segments: JourneySegment[] = [];
    
    // Skip if bikes are in avoid list
    if (preferences.avoidModes.includes('bikeshare')) {
      return segments;
    }

    // Find nearby stations
    const nearbyOriginStations = this.findNearbyStations(origin, 500);
    const nearbyDestinationStations = this.findNearbyStations(destination, 500);

    if (nearbyOriginStations.length === 0 || nearbyDestinationStations.length === 0) {
      return segments;
    }

    const distance = this.calculateDistance(origin, destination);
    
    // Don't suggest bikes for very short distances (< 500m) or very long (> 10km)
    if (distance < 500 || distance > 10000) {
      return segments;
    }

    // Create segments for different bike types
    for (const [modeId, mode] of this.supportedModes) {
      const availableStations = nearbyOriginStations.filter(station => 
        station.bikeTypes.some(bike => bike.type === mode.name.toLowerCase().split(' ')[0])
      );

      if (availableStations.length === 0) continue;

      const bestOriginStation = availableStations.reduce((best, current) => 
        current.availableBikes > best.availableBikes ? current : best
      );

      const bestDestinationStation = nearbyDestinationStations.reduce((best, current) => 
        current.availableDocks > best.availableDocks ? current : best
      );

      const bikeType = bestOriginStation.bikeTypes.find(bike => 
        bike.type === mode.name.toLowerCase().split(' ')[0]
      );

      if (!bikeType) continue;

      const travelTime = this.estimateTravelTime(distance, mode.averageSpeed || 15);
      const walkToStationTime = 3; // 3 minutes to walk to station
      const walkFromStationTime = 3; // 3 minutes to walk from station

      const segment: JourneySegment = {
        id: `bike-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mode,
        origin,
        destination,
        departureTime: new Date(Date.now() + walkToStationTime * 60 * 1000),
        arrivalTime: new Date(Date.now() + (walkToStationTime + travelTime + walkFromStationTime) * 60 * 1000),
        duration: travelTime + walkToStationTime + walkFromStationTime,
        distance,
        cost: this.calculateCost(travelTime, bikeType),
        co2Emissions: (distance / 1000) * (mode.co2PerKm || 0),
        reliability: this.getReliabilityScore(bestOriginStation),
        comfort: this.getComfortScore(bikeType),
        accessibility: mode.accessibilityScore || 4,
        realTimeUpdates: true,
        bookingInfo: {
          required: true,
          provider: 'BikeShare',
          estimatedWaitTime: walkToStationTime,
          cancellationPolicy: 'Free cancellation before bike pickup'
        }
      };

      segments.push(segment);
    }

    return segments;
  }

  private findNearbyStations(location: LocationPoint, radius: number): BikeStation[] {
    const stations: BikeStation[] = [];
    
    this.bikeStations.forEach(station => {
      const distance = this.calculateDistance(location, station.location);
      if (distance <= radius && station.status === 'active') {
        stations.push(station);
      }
    });

    return stations.sort((a, b) => {
      const distA = this.calculateDistance(location, a.location);
      const distB = this.calculateDistance(location, b.location);
      return distA - distB;
    });
  }

  private calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private estimateTravelTime(distance: number, averageSpeed: number): number {
    return Math.round((distance / 1000) / averageSpeed * 60); // minutes
  }

  private calculateCost(travelTimeMinutes: number, bikeType: BikeType): number {
    return travelTimeMinutes * bikeType.pricePerMinute;
  }

  private getReliabilityScore(station: BikeStation): number {
    // Reliability based on bike availability
    const availabilityRatio = station.availableBikes / station.totalCapacity;
    
    if (availabilityRatio > 0.5) return 0.95;
    if (availabilityRatio > 0.25) return 0.85;
    if (availabilityRatio > 0.1) return 0.75;
    return 0.6;
  }

  private getComfortScore(bikeType: BikeType): number {
    const comfortMap: { [key: string]: number } = {
      'standard': 6,
      'electric': 8,
      'cargo': 5,
      'accessible': 7
    };

    return comfortMap[bikeType.type] || 6;
  }

  async getRealTimeUpdates(segmentId: string): Promise<RealTimeUpdate[]> {
    const updates: RealTimeUpdate[] = [];
    const activeBike = this.activeBikes.get(segmentId);

    if (activeBike) {
      // Simulate bike-specific updates
      if (Math.random() < 0.05) { // 5% chance of issue
        updates.push({
          segmentId,
          type: 'disruption',
          severity: 'medium',
          message: 'Bike requires maintenance. Please find alternative bike.',
          timestamp: new Date()
        });
      }
    }

    // Weather-related updates
    if (this.isWeatherUnfavorable()) {
      updates.push({
        segmentId,
        type: 'delay',
        severity: 'low',
        message: 'Weather conditions may affect cycling comfort',
        timestamp: new Date()
      });
    }

    return updates;
  }

  private isWeatherUnfavorable(): boolean {
    // Simulate weather check - in real implementation, integrate with weather API
    return Math.random() < 0.1; // 10% chance of unfavorable weather
  }

  async bookJourney(segment: JourneySegment): Promise<BookingInfo> {
    try {
      const bookingId = `bike-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Find best station for pickup
      const nearbyStations = this.findNearbyStations(segment.origin, 500);
      const pickupStation = nearbyStations.find(station => 
        station.availableBikes > 0 && 
        station.bikeTypes.some(bike => bike.type === segment.mode.name.toLowerCase().split(' ')[0])
      );

      if (!pickupStation) {
        throw new Error('No bikes available at nearby stations');
      }

      // Reserve bike
      const bikeId = `bike-${pickupStation.id}-${Math.random().toString(36).substr(2, 4)}`;
      
      this.activeBikes.set(segment.id, {
        bookingId,
        bikeId,
        pickupStation: pickupStation.id,
        status: 'reserved',
        reservedUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });

      // Update station availability
      pickupStation.availableBikes--;
      pickupStation.availableDocks++;

      return {
        required: true,
        provider: 'BikeShare',
        bookingUrl: `https://bikeshare.app/bike/${bookingId}`,
        estimatedWaitTime: 3,
        cancellationPolicy: 'Free cancellation before bike pickup'
      };
    } catch (error) {
      throw new Error(`Failed to book bike: ${error}`);
    }
  }

  async getAlternatives(segment: JourneySegment): Promise<JourneySegment[]> {
    // Get different bike types as alternatives
    const alternatives = await this.planJourney(
      segment.origin,
      segment.destination,
      {
        maxWalkingDistance: 1000,
        preferredModes: ['bikeshare'],
        avoidModes: [],
        maxCost: 20,
        prioritizeSpeed: true,
        prioritizeCost: false,
        prioritizeComfort: false,
        prioritizeEnvironment: true,
        accessibilityNeeds: [],
        realTimeUpdatesRequired: true
      }
    );

    return alternatives.filter(alt => alt.mode.id !== segment.mode.id);
  }

  /**
   * Get nearby bike stations
   */
  getNearbyStations(location: LocationPoint, radius = 1000): BikeStation[] {
    return this.findNearbyStations(location, radius);
  }

  /**
   * Get station details
   */
  getStationDetails(stationId: string): BikeStation | null {
    return this.bikeStations.get(stationId) || null;
  }

  /**
   * Cancel bike reservation
   */
  async cancelBikeReservation(segmentId: string): Promise<boolean> {
    const activeBike = this.activeBikes.get(segmentId);
    if (activeBike && activeBike.status === 'reserved') {
      // Return bike to station availability
      const station = this.bikeStations.get(activeBike.pickupStation);
      if (station) {
        station.availableBikes++;
        station.availableDocks--;
      }
      
      this.activeBikes.delete(segmentId);
      return true;
    }
    return false;
  }

  /**
   * Start bike trip
   */
  async startTrip(segmentId: string): Promise<boolean> {
    const activeBike = this.activeBikes.get(segmentId);
    if (activeBike && activeBike.status === 'reserved') {
      activeBike.status = 'in_use';
      activeBike.tripStarted = new Date();
      return true;
    }
    return false;
  }

  /**
   * End bike trip
   */
  async endTrip(segmentId: string, returnStationId: string): Promise<{ cost: number; duration: number }> {
    const activeBike = this.activeBikes.get(segmentId);
    if (activeBike && activeBike.status === 'in_use') {
      const duration = Math.round((Date.now() - activeBike.tripStarted.getTime()) / (1000 * 60));
      const cost = duration * 0.15; // €0.15 per minute
      
      // Return bike to station
      const returnStation = this.bikeStations.get(returnStationId);
      if (returnStation) {
        returnStation.availableBikes++;
        returnStation.availableDocks--;
      }
      
      this.activeBikes.delete(segmentId);
      
      return { cost, duration };
    }
    
    throw new Error('No active trip found');
  }
}

export default BikeSharingAgent;
