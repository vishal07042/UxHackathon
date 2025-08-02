/**
 * RedBus API Integration Service
 * Provides comprehensive bus booking functionality
 */



export interface BusRoute {
  id: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare: number;
  availableSeats: number;
  totalSeats: number;
  amenities: string[];
  rating: number;
  cancellationPolicy: string;
  pickupPoints: PickupPoint[];
  dropPoints: DropPoint[];
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  landmark: string;
  time: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface DropPoint {
  id: string;
  name: string;
  address: string;
  landmark: string;
  time: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Seat {
  id: string;
  number: string;
  type: 'window' | 'aisle' | 'middle';
  position: 'upper' | 'lower';
  isAvailable: boolean;
  fare: number;
  row: number;
  column: number;
  gender?: 'male' | 'female' | 'any';
}

export interface BookingRequest {
  routeId: string;
  selectedSeats: string[];
  pickupPointId: string;
  dropPointId: string;
  passengerDetails: PassengerDetail[];
  contactInfo: ContactInfo;
  paymentMethod: PaymentMethod;
}

export interface PassengerDetail {
  name: string;
  age: number;
  gender: 'male' | 'female';
  seatId: string;
  idType?: string;
  idNumber?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  emergencyContact?: string;
}

export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  details: any;
}

export interface BookingResponse {
  bookingId: string;
  pnr: string;
  status: 'confirmed' | 'pending' | 'failed';
  totalAmount: number;
  ticketUrl?: string;
  cancellationDeadline: string;
}

export interface SearchFilters {
  departureTimeRange?: {
    start: string;
    end: string;
  };
  busTypes?: string[];
  operators?: string[];
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'price' | 'duration' | 'rating' | 'departure';
  sortOrder?: 'asc' | 'desc';
}

class RedBusApiService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = import.meta.env.VITE_REDBUS_API_KEY || 'demo-key';
    this.baseUrl = import.meta.env.VITE_REDBUS_API_URL || 'https://api.redbus.in/v1';
  }

  /**
   * Search for available buses between source and destination
   */
  async searchBuses(
    source: string,
    destination: string,
    date: string,
    filters?: SearchFilters
  ): Promise<BusRoute[]> {
    const cacheKey = `search-${source}-${destination}-${date}-${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // In production, this would make actual API calls
      const routes = await this.simulateBusSearch(source, destination, date, filters);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: routes,
        timestamp: Date.now()
      });

      return routes;
    } catch (error) {
      console.error('Failed to search buses:', error);
      return [];
    }
  }

  /**
   * Get seat layout and availability for a specific bus
   */
  async getSeatLayout(routeId: string): Promise<Seat[]> {
    const cacheKey = `seats-${routeId}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache for seats
      return cached.data;
    }

    try {
      const seats = await this.simulateSeatLayout(routeId);
      
      this.cache.set(cacheKey, {
        data: seats,
        timestamp: Date.now()
      });

      return seats;
    } catch (error) {
      console.error('Failed to get seat layout:', error);
      return [];
    }
  }

  /**
   * Book selected seats
   */
  async bookSeats(bookingRequest: BookingRequest): Promise<BookingResponse> {
    try {
      // Validate booking request
      this.validateBookingRequest(bookingRequest);
      
      // Simulate booking process
      const booking = await this.simulateBooking(bookingRequest);
      
      return booking;
    } catch (error) {
      console.error('Booking failed:', error);
      throw error;
    }
  }

  /**
   * Get booking details by PNR or booking ID
   */
  async getBookingDetails(identifier: string): Promise<any> {
    try {
      return await this.simulateBookingDetails(identifier);
    } catch (error) {
      console.error('Failed to get booking details:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    try {
      return await this.simulateCancellation(bookingId, reason);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  }

  // Simulation methods (replace with actual API calls in production)
  private async simulateBusSearch(
    source: string,
    destination: string,
    date: string,
    filters?: SearchFilters
  ): Promise<BusRoute[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const operators = ['Volvo', 'SRS Travels', 'VRL Travels', 'Orange Tours', 'Kallada Travels'];
    const busTypes = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Volvo Multi-Axle'];
    const amenities = ['WiFi', 'Charging Point', 'Blanket', 'Pillow', 'Water Bottle', 'Snacks'];

    const routes: BusRoute[] = [];

    for (let i = 0; i < 15; i++) {
      const departureHour = 6 + Math.floor(Math.random() * 18);
      const departureMinute = Math.floor(Math.random() * 60);
      const duration = 4 + Math.floor(Math.random() * 8);
      
      routes.push({
        id: `route-${i}`,
        operatorName: operators[Math.floor(Math.random() * operators.length)],
        busType: busTypes[Math.floor(Math.random() * busTypes.length)],
        departureTime: `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`,
        arrivalTime: `${((departureHour + duration) % 24).toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`,
        duration: `${duration}h ${Math.floor(Math.random() * 60)}m`,
        fare: 500 + Math.floor(Math.random() * 1500),
        availableSeats: Math.floor(Math.random() * 30) + 5,
        totalSeats: 40,
        amenities: amenities.slice(0, Math.floor(Math.random() * amenities.length) + 1),
        rating: 3.5 + Math.random() * 1.5,
        cancellationPolicy: 'Free cancellation up to 2 hours before departure',
        pickupPoints: this.generatePickupPoints(source),
        dropPoints: this.generateDropPoints(destination)
      });
    }

    return this.applyFilters(routes, filters);
  }

  private async simulateSeatLayout(routeId: string): Promise<Seat[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const seats: Seat[] = [];
    const seatTypes: ('window' | 'aisle' | 'middle')[] = ['window', 'aisle', 'middle'];
    const positions: ('upper' | 'lower')[] = ['upper', 'lower'];

    // Generate 40 seats (typical bus layout)
    for (let row = 1; row <= 10; row++) {
      for (let col = 1; col <= 4; col++) {
        const seatNumber = `${row}${String.fromCharCode(64 + col)}`;
        const isWindow = col === 1 || col === 4;
        const isAisle = col === 2 || col === 3;
        
        seats.push({
          id: `seat-${row}-${col}`,
          number: seatNumber,
          type: isWindow ? 'window' : isAisle ? 'aisle' : 'middle',
          position: positions[Math.floor(Math.random() * positions.length)],
          isAvailable: Math.random() > 0.3, // 70% availability
          fare: 500 + Math.floor(Math.random() * 200),
          row,
          column: col,
          gender: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'male' : 'female') : 'any'
        });
      }
    }

    return seats;
  }

  private async simulateBooking(request: BookingRequest): Promise<BookingResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.1; // 90% success rate

    if (!success) {
      throw new Error('Booking failed: Selected seats are no longer available');
    }

    return {
      bookingId: `BK${Date.now()}`,
      pnr: `PNR${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: 'confirmed',
      totalAmount: request.selectedSeats.length * 600,
      ticketUrl: `https://tickets.redbus.in/ticket/${Date.now()}`,
      cancellationDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    };
  }

  private async simulateBookingDetails(identifier: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      bookingId: identifier,
      pnr: `PNR${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: 'confirmed',
      passengerDetails: [
        { name: 'John Doe', age: 30, gender: 'male', seatNumber: '1A' }
      ],
      journeyDate: new Date().toISOString().split('T')[0],
      source: 'Mumbai',
      destination: 'Pune',
      departureTime: '14:30',
      arrivalTime: '18:00'
    };
  }

  private async simulateCancellation(bookingId: string, reason?: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      cancellationId: `CAN${Date.now()}`,
      refundAmount: 540, // After cancellation charges
      refundStatus: 'processed',
      refundTimeline: '5-7 business days'
    };
  }

  private generatePickupPoints(city: string): PickupPoint[] {
    const points = [
      { name: 'Central Bus Station', landmark: 'Near Railway Station' },
      { name: 'Airport Terminal', landmark: 'Departure Gate 2' },
      { name: 'City Mall', landmark: 'Main Entrance' },
      { name: 'Metro Station', landmark: 'Exit A' }
    ];

    return points.map((point, index) => ({
      id: `pickup-${index}`,
      name: point.name,
      address: `${point.name}, ${city}`,
      landmark: point.landmark,
      time: `${(6 + index).toString().padStart(2, '0')}:00`,
      coordinates: {
        latitude: 19.0760 + Math.random() * 0.1,
        longitude: 72.8777 + Math.random() * 0.1
      }
    }));
  }

  private generateDropPoints(city: string): DropPoint[] {
    const points = [
      { name: 'Main Bus Terminal', landmark: 'Platform 3' },
      { name: 'Railway Station', landmark: 'Bus Stand' },
      { name: 'Airport', landmark: 'Arrival Terminal' },
      { name: 'City Center', landmark: 'Shopping Complex' }
    ];

    return points.map((point, index) => ({
      id: `drop-${index}`,
      name: point.name,
      address: `${point.name}, ${city}`,
      landmark: point.landmark,
      time: `${(14 + index).toString().padStart(2, '0')}:00`,
      coordinates: {
        latitude: 18.5204 + Math.random() * 0.1,
        longitude: 73.8567 + Math.random() * 0.1
      }
    }));
  }

  private applyFilters(routes: BusRoute[], filters?: SearchFilters): BusRoute[] {
    if (!filters) return routes;

    let filtered = [...routes];

    if (filters.priceRange) {
      filtered = filtered.filter(route => 
        route.fare >= filters.priceRange!.min && route.fare <= filters.priceRange!.max
      );
    }

    if (filters.busTypes && filters.busTypes.length > 0) {
      filtered = filtered.filter(route => 
        filters.busTypes!.includes(route.busType)
      );
    }

    if (filters.operators && filters.operators.length > 0) {
      filtered = filtered.filter(route => 
        filters.operators!.includes(route.operatorName)
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'price':
            comparison = a.fare - b.fare;
            break;
          case 'duration':
            comparison = parseInt(a.duration) - parseInt(b.duration);
            break;
          case 'rating':
            comparison = b.rating - a.rating;
            break;
          case 'departure':
            comparison = a.departureTime.localeCompare(b.departureTime);
            break;
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }

  private validateBookingRequest(request: BookingRequest): void {
    if (!request.routeId) throw new Error('Route ID is required');
    if (!request.selectedSeats || request.selectedSeats.length === 0) {
      throw new Error('At least one seat must be selected');
    }
    if (!request.passengerDetails || request.passengerDetails.length !== request.selectedSeats.length) {
      throw new Error('Passenger details must match selected seats');
    }
    if (!request.contactInfo.email || !request.contactInfo.phone) {
      throw new Error('Contact information is required');
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const redBusApi = new RedBusApiService();
export default redBusApi;
