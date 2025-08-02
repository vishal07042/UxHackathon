/**
 * Ride-Hailing Agent
 * Integrates with ride-hailing services (Uber, Lyft, local providers)
 * Provides on-demand transportation with real-time pricing and availability
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

export interface RideOption {
  id: string;
  name: string;
  description: string;
  capacity: number;
  estimatedArrival: number; // minutes
  priceEstimate: {
    min: number;
    max: number;
    currency: string;
  };
  vehicleType: string;
  provider: string;
  surge: number; // multiplier
  accessibility: boolean;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicleInfo: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  estimatedArrival: number;
}

export class RideHailingAgent extends TransportationAgent {
  private supportedModes: Map<string, TransportMode> = new Map();
  private activeRides: Map<string, any> = new Map();

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

    super('ride-hailing', 'Ride-Hailing Services', capabilities);
    this.initializeSupportedModes();
  }

  private initializeSupportedModes(): void {
    this.supportedModes.set('ridehail-economy', {
      id: 'ridehail-economy',
      name: 'Economy Ride',
      type: 'private',
      category: 'ridehail',
      availability: 'available',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 1.2,
      averageSpeed: 30,
      co2PerKm: 120,
      accessibilityScore: 6
    });

    this.supportedModes.set('ridehail-comfort', {
      id: 'ridehail-comfort',
      name: 'Comfort Ride',
      type: 'private',
      category: 'ridehail',
      availability: 'available',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 1.8,
      averageSpeed: 32,
      co2PerKm: 140,
      accessibilityScore: 7
    });

    this.supportedModes.set('ridehail-premium', {
      id: 'ridehail-premium',
      name: 'Premium Ride',
      type: 'private',
      category: 'ridehail',
      availability: 'limited',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 2.5,
      averageSpeed: 35,
      co2PerKm: 180,
      accessibilityScore: 8
    });

    this.supportedModes.set('ridehail-shared', {
      id: 'ridehail-shared',
      name: 'Shared Ride',
      type: 'shared',
      category: 'ridehail',
      availability: 'available',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 0.8,
      averageSpeed: 25,
      co2PerKm: 60,
      accessibilityScore: 5
    });

    this.supportedModes.set('ridehail-accessible', {
      id: 'ridehail-accessible',
      name: 'Accessible Ride',
      type: 'private',
      category: 'ridehail',
      availability: 'limited',
      realTimeData: true,
      bookingRequired: true,
      costPerKm: 1.5,
      averageSpeed: 28,
      co2PerKm: 130,
      accessibilityScore: 10
    });
  }

  async initialize(): Promise<void> {
    try {
      // Simulate API initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.setActive(true);
      console.log('Ride-Hailing Agent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Ride-Hailing Agent:', error);
      this.setActive(false);
    }
  }

  async planJourney(
    origin: LocationPoint, 
    destination: LocationPoint, 
    preferences: UserPreferences
  ): Promise<JourneySegment[]> {
    const segments: JourneySegment[] = [];
    const distance = this.calculateDistance(origin, destination);
    const baseTime = this.estimateTravelTime(distance);

    // Get available ride options
    const rideOptions = await this.getRideOptions(origin, destination);

    for (const option of rideOptions) {
      const mode = this.supportedModes.get(option.id);
      if (!mode) continue;

      // Skip if mode is in avoid list
      if (preferences.avoidModes.includes('ridehail')) continue;

      // Skip if accessibility needed but not available
      if (preferences.accessibilityNeeds.length > 0 && !option.accessibility && option.id !== 'ridehail-accessible') {
        continue;
      }

      const segment: JourneySegment = {
        id: `ridehail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mode,
        origin,
        destination,
        departureTime: new Date(Date.now() + option.estimatedArrival * 60 * 1000),
        arrivalTime: new Date(Date.now() + (option.estimatedArrival + baseTime) * 60 * 1000),
        duration: baseTime,
        distance,
        cost: (option.priceEstimate.min + option.priceEstimate.max) / 2,
        co2Emissions: this.calculateCO2Emissions(distance, mode),
        reliability: this.getReliabilityScore(option),
        comfort: this.getComfortScore(option),
        accessibility: option.accessibility ? 10 : mode.accessibilityScore || 6,
        realTimeUpdates: true,
        bookingInfo: {
          required: true,
          provider: option.provider,
          estimatedWaitTime: option.estimatedArrival,
          cancellationPolicy: 'Free cancellation within 2 minutes of booking'
        }
      };

      segments.push(segment);
    }

    return segments;
  }

  private async getRideOptions(origin: LocationPoint, destination: LocationPoint): Promise<RideOption[]> {
    // Simulate API call to ride-hailing services
    const distance = this.calculateDistance(origin, destination);
    const basePrice = distance * 0.001 * 15; // €15 per km base
    const surge = this.getCurrentSurge();

    const options: RideOption[] = [
      {
        id: 'ridehail-economy',
        name: 'Economy',
        description: 'Affordable rides for everyday trips',
        capacity: 4,
        estimatedArrival: Math.floor(Math.random() * 8) + 2, // 2-10 minutes
        priceEstimate: {
          min: basePrice * 0.8 * surge,
          max: basePrice * 1.2 * surge,
          currency: 'EUR'
        },
        vehicleType: 'Sedan',
        provider: 'RideShare',
        surge,
        accessibility: false
      },
      {
        id: 'ridehail-comfort',
        name: 'Comfort',
        description: 'More space and higher-rated drivers',
        capacity: 4,
        estimatedArrival: Math.floor(Math.random() * 10) + 3,
        priceEstimate: {
          min: basePrice * 1.3 * surge,
          max: basePrice * 1.7 * surge,
          currency: 'EUR'
        },
        vehicleType: 'SUV',
        provider: 'RideShare',
        surge,
        accessibility: false
      },
      {
        id: 'ridehail-shared',
        name: 'Shared',
        description: 'Share your ride and split the cost',
        capacity: 2,
        estimatedArrival: Math.floor(Math.random() * 12) + 5,
        priceEstimate: {
          min: basePrice * 0.5 * surge,
          max: basePrice * 0.8 * surge,
          currency: 'EUR'
        },
        vehicleType: 'Sedan',
        provider: 'RideShare',
        surge,
        accessibility: false
      }
    ];

    // Add accessible option if needed
    if (Math.random() > 0.3) { // 70% availability
      options.push({
        id: 'ridehail-accessible',
        name: 'Accessible',
        description: 'Wheelchair accessible vehicles',
        capacity: 3,
        estimatedArrival: Math.floor(Math.random() * 15) + 5,
        priceEstimate: {
          min: basePrice * 1.1 * surge,
          max: basePrice * 1.5 * surge,
          currency: 'EUR'
        },
        vehicleType: 'Accessible Van',
        provider: 'AccessRide',
        surge,
        accessibility: true
      });
    }

    return options;
  }

  private getCurrentSurge(): number {
    // Simulate surge pricing based on time of day
    const hour = new Date().getHours();
    
    // Rush hours have higher surge
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 1.2 + Math.random() * 0.8; // 1.2x - 2.0x
    }
    
    // Late night surge
    if (hour >= 22 || hour <= 2) {
      return 1.1 + Math.random() * 0.4; // 1.1x - 1.5x
    }
    
    // Normal times
    return 1.0 + Math.random() * 0.2; // 1.0x - 1.2x
  }

  private calculateDistance(origin: LocationPoint, destination: LocationPoint): number {
    // Haversine formula for distance calculation
    const R = 6371000; // Earth's radius in meters
    const φ1 = origin.latitude * Math.PI / 180;
    const φ2 = destination.latitude * Math.PI / 180;
    const Δφ = (destination.latitude - origin.latitude) * Math.PI / 180;
    const Δλ = (destination.longitude - origin.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  private estimateTravelTime(distance: number): number {
    // Estimate travel time based on distance and average speed
    const averageSpeed = 25; // km/h in city traffic
    return Math.round((distance / 1000) / averageSpeed * 60); // minutes
  }

  private calculateCO2Emissions(distance: number, mode: TransportMode): number {
    return (distance / 1000) * (mode.co2PerKm || 120);
  }

  private getReliabilityScore(option: RideOption): number {
    // Reliability based on estimated arrival time and surge
    let score = 0.9;
    
    if (option.estimatedArrival > 10) score -= 0.1;
    if (option.surge > 1.5) score -= 0.1;
    
    return Math.max(0.7, score);
  }

  private getComfortScore(option: RideOption): number {
    const comfortMap: { [key: string]: number } = {
      'ridehail-economy': 6,
      'ridehail-comfort': 8,
      'ridehail-premium': 9,
      'ridehail-shared': 5,
      'ridehail-accessible': 7
    };

    return comfortMap[option.id] || 6;
  }

  async getRealTimeUpdates(segmentId: string): Promise<RealTimeUpdate[]> {
    const updates: RealTimeUpdate[] = [];
    const ride = this.activeRides.get(segmentId);

    if (ride) {
      // Simulate driver updates
      if (Math.random() < 0.1) { // 10% chance of update
        updates.push({
          segmentId,
          type: 'delay',
          severity: 'low',
          message: `Driver is ${Math.floor(Math.random() * 3) + 1} minutes away`,
          estimatedDelay: Math.floor(Math.random() * 3) + 1,
          timestamp: new Date()
        });
      }

      // Simulate traffic updates
      if (Math.random() < 0.05) { // 5% chance
        updates.push({
          segmentId,
          type: 'delay',
          severity: 'medium',
          message: 'Heavy traffic detected. Route being optimized.',
          estimatedDelay: Math.floor(Math.random() * 10) + 5,
          timestamp: new Date()
        });
      }
    }

    return updates;
  }

  async bookJourney(segment: JourneySegment): Promise<BookingInfo> {
    try {
      // Simulate booking process
      const bookingId = `ride-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate driver assignment
      const driver = await this.assignDriver(segment);
      
      // Store active ride
      this.activeRides.set(segment.id, {
        bookingId,
        driver,
        status: 'confirmed',
        estimatedArrival: segment.bookingInfo?.estimatedWaitTime || 5
      });

      return {
        required: true,
        provider: segment.bookingInfo?.provider || 'RideShare',
        bookingUrl: `https://rideshare.app/ride/${bookingId}`,
        estimatedWaitTime: segment.bookingInfo?.estimatedWaitTime || 5,
        cancellationPolicy: 'Free cancellation within 2 minutes of booking'
      };
    } catch (error) {
      throw new Error(`Failed to book ride: ${error}`);
    }
  }

  private async assignDriver(segment: JourneySegment): Promise<Driver> {
    // Simulate driver assignment
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      id: `driver-${Math.random().toString(36).substr(2, 9)}`,
      name: ['Alex', 'Maria', 'David', 'Sarah', 'Michael'][Math.floor(Math.random() * 5)],
      rating: 4.2 + Math.random() * 0.8,
      vehicleInfo: {
        make: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'][Math.floor(Math.random() * 4)],
        model: ['3 Series', 'C-Class', 'A4', 'Passat'][Math.floor(Math.random() * 4)],
        color: ['Black', 'White', 'Silver', 'Blue'][Math.floor(Math.random() * 4)],
        licensePlate: `B-${Math.random().toString(36).substr(2, 2).toUpperCase()} ${Math.floor(Math.random() * 9000) + 1000}`
      },
      location: {
        latitude: segment.origin.latitude + (Math.random() - 0.5) * 0.01,
        longitude: segment.origin.longitude + (Math.random() - 0.5) * 0.01
      },
      estimatedArrival: Math.floor(Math.random() * 8) + 2
    };
  }

  async getAlternatives(segment: JourneySegment): Promise<JourneySegment[]> {
    // Get different ride options as alternatives
    const alternatives = await this.planJourney(
      segment.origin,
      segment.destination,
      {
        maxWalkingDistance: 1000,
        preferredModes: ['ridehail'],
        avoidModes: [],
        maxCost: 100,
        prioritizeSpeed: true,
        prioritizeCost: false,
        prioritizeComfort: false,
        prioritizeEnvironment: false,
        accessibilityNeeds: [],
        realTimeUpdatesRequired: true
      }
    );

    // Filter out the current segment
    return alternatives.filter(alt => alt.mode.id !== segment.mode.id);
  }

  /**
   * Cancel an active ride
   */
  async cancelRide(segmentId: string): Promise<boolean> {
    const ride = this.activeRides.get(segmentId);
    if (ride) {
      this.activeRides.delete(segmentId);
      return true;
    }
    return false;
  }

  /**
   * Get driver location for active ride
   */
  getDriverLocation(segmentId: string): { latitude: number; longitude: number } | null {
    const ride = this.activeRides.get(segmentId);
    return ride?.driver?.location || null;
  }

  /**
   * Get ride status
   */
  getRideStatus(segmentId: string): any {
    return this.activeRides.get(segmentId) || null;
  }
}

export default RideHailingAgent;
