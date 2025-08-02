/**
 * AI-Powered Auto Booking Assistant
 * Intelligent booking system with natural language processing and smart recommendations
 */

import { redBusApi, BusRoute, Seat, BookingRequest, SearchFilters } from './redBusApi';
import { trafficApi } from './trafficApi';

export interface UserPreferences {
  seatPreference: 'window' | 'aisle' | 'any';
  timePreference: 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  pricePreference: 'budget' | 'comfort' | 'luxury' | 'any';
  operatorPreferences: string[];
  amenityPreferences: string[];
  genderPreference?: 'male' | 'female' | 'any';
}

export interface BookingCommand {
  type: 'search' | 'book' | 'cancel' | 'modify';
  source: string;
  destination: string;
  date: string;
  passengers: number;
  preferences?: UserPreferences;
  naturalLanguageQuery?: string;
}

export interface SmartRecommendation {
  id: string;
  type: 'route' | 'timing' | 'price' | 'alternative';
  title: string;
  description: string;
  confidence: number;
  savings?: number;
  route?: BusRoute;
  reason: string;
  action: {
    type: 'select_route' | 'change_time' | 'upgrade_seat' | 'alternative_date';
    data: any;
  };
}

export interface AutoBookingResult {
  success: boolean;
  bookingId?: string;
  pnr?: string;
  selectedRoute?: BusRoute;
  selectedSeats?: Seat[];
  totalAmount?: number;
  recommendations?: SmartRecommendation[];
  error?: string;
}

class AIBookingAssistant {
  private userPreferences: Map<string, UserPreferences> = new Map();
  private bookingHistory: Map<string, any[]> = new Map();

  /**
   * Process natural language booking command
   */
  async processBookingCommand(
    command: string,
    userId: string,
    context?: any
  ): Promise<BookingCommand> {
    const parsedCommand = await this.parseNaturalLanguage(command);
    
    // Apply user preferences if available
    const userPrefs = this.userPreferences.get(userId);
    if (userPrefs) {
      parsedCommand.preferences = { ...userPrefs, ...parsedCommand.preferences };
    }

    return parsedCommand;
  }

  /**
   * Auto-book optimal bus based on preferences and AI analysis
   */
  async autoBook(
    source: string,
    destination: string,
    date: string,
    passengers: number,
    preferences: UserPreferences,
    userId: string,
    autoConfirm: boolean = false
  ): Promise<AutoBookingResult> {
    try {
      // Step 1: Search for available buses
      const filters = this.convertPreferencesToFilters(preferences);
      const routes = await redBusApi.searchBuses(source, destination, date, filters);

      if (routes.length === 0) {
        return {
          success: false,
          error: 'No buses available for the selected route and date'
        };
      }

      // Step 2: Analyze routes with AI
      const analysis = await this.analyzeRoutes(routes, preferences, source, destination);
      const optimalRoute = analysis.bestRoute;

      // Step 3: Get seat layout and select optimal seats
      const seats = await redBusApi.getSeatLayout(optimalRoute.id);
      const selectedSeats = await this.selectOptimalSeats(seats, passengers, preferences);

      if (selectedSeats.length < passengers) {
        return {
          success: false,
          error: 'Not enough seats available matching your preferences',
          recommendations: analysis.recommendations
        };
      }

      // Step 4: Generate smart recommendations
      const recommendations = await this.generateSmartRecommendations(
        routes,
        optimalRoute,
        preferences,
        source,
        destination,
        date
      );

      if (!autoConfirm) {
        return {
          success: true,
          selectedRoute: optimalRoute,
          selectedSeats,
          totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.fare, 0),
          recommendations
        };
      }

      // Step 5: Auto-book if confirmed
      const bookingRequest: BookingRequest = {
        routeId: optimalRoute.id,
        selectedSeats: selectedSeats.map(seat => seat.id),
        pickupPointId: optimalRoute.pickupPoints[0].id,
        dropPointId: optimalRoute.dropPoints[0].id,
        passengerDetails: this.generatePassengerDetails(selectedSeats, passengers),
        contactInfo: {
          email: 'user@example.com', // This would come from user profile
          phone: '+1234567890'
        },
        paymentMethod: {
          type: 'card',
          details: {} // This would be handled by payment gateway
        }
      };

      const booking = await redBusApi.bookSeats(bookingRequest);

      // Update booking history
      this.updateBookingHistory(userId, {
        ...booking,
        route: optimalRoute,
        seats: selectedSeats,
        preferences
      });

      return {
        success: true,
        bookingId: booking.bookingId,
        pnr: booking.pnr,
        selectedRoute: optimalRoute,
        selectedSeats,
        totalAmount: booking.totalAmount,
        recommendations
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking failed'
      };
    }
  }

  /**
   * Generate smart recommendations based on AI analysis
   */
  async generateSmartRecommendations(
    routes: BusRoute[],
    selectedRoute: BusRoute,
    preferences: UserPreferences,
    source: string,
    destination: string,
    date: string
  ): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];

    // Price optimization recommendations
    const cheaperRoutes = routes.filter(route => route.fare < selectedRoute.fare);
    if (cheaperRoutes.length > 0) {
      const cheapest = cheaperRoutes.reduce((prev, current) => 
        prev.fare < current.fare ? prev : current
      );
      
      recommendations.push({
        id: 'price-optimization',
        type: 'price',
        title: 'Save Money with Alternative Route',
        description: `Save ₹${selectedRoute.fare - cheapest.fare} by choosing ${cheapest.operatorName}`,
        confidence: 85,
        savings: selectedRoute.fare - cheapest.fare,
        route: cheapest,
        reason: 'Lower fare with similar amenities and timing',
        action: {
          type: 'select_route',
          data: { routeId: cheapest.id }
        }
      });
    }

    // Timing optimization with traffic analysis
    const trafficConditions = await this.analyzeTrafficForRoute(source, destination, date);
    if (trafficConditions.hasHeavyTraffic) {
      const earlierRoutes = routes.filter(route => 
        this.parseTime(route.departureTime) < this.parseTime(selectedRoute.departureTime)
      );

      if (earlierRoutes.length > 0) {
        recommendations.push({
          id: 'traffic-optimization',
          type: 'timing',
          title: 'Avoid Traffic Congestion',
          description: 'Depart earlier to avoid predicted heavy traffic',
          confidence: 78,
          reason: 'Traffic analysis shows congestion during your selected time',
          action: {
            type: 'change_time',
            data: { suggestedRoutes: earlierRoutes.slice(0, 3) }
          }
        });
      }
    }

    // Comfort upgrade recommendations
    const luxuryRoutes = routes.filter(route => 
      route.busType.includes('Volvo') || route.busType.includes('Multi-Axle')
    );
    
    if (luxuryRoutes.length > 0 && preferences.pricePreference !== 'budget') {
      const bestLuxury = luxuryRoutes.reduce((prev, current) => 
        prev.rating > current.rating ? prev : current
      );

      recommendations.push({
        id: 'comfort-upgrade',
        type: 'route',
        title: 'Upgrade for Better Comfort',
        description: `Upgrade to ${bestLuxury.busType} for enhanced comfort`,
        confidence: 70,
        route: bestLuxury,
        reason: 'Higher rated bus with premium amenities',
        action: {
          type: 'upgrade_seat',
          data: { routeId: bestLuxury.id }
        }
      });
    }

    // Alternative date recommendations
    const alternativeDates = await this.analyzeAlternativeDates(source, destination, date);
    if (alternativeDates.hasCheaperOptions) {
      recommendations.push({
        id: 'date-alternative',
        type: 'alternative',
        title: 'Cheaper Fares on Alternative Dates',
        description: 'Travel a day earlier or later for better prices',
        confidence: 65,
        savings: alternativeDates.maxSavings,
        reason: 'Dynamic pricing shows lower fares on nearby dates',
        action: {
          type: 'alternative_date',
          data: { suggestedDates: alternativeDates.dates }
        }
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Parse natural language commands
   */
  private async parseNaturalLanguage(command: string): Promise<BookingCommand> {
    // Simulate NLP processing
    const lowerCommand = command.toLowerCase();
    
    // Extract cities
    const cityPattern = /(?:from|to)\s+([a-zA-Z\s]+?)(?:\s+to|\s+on|\s+for|$)/g;
    const cities = [];
    let match;
    while ((match = cityPattern.exec(lowerCommand)) !== null) {
      cities.push(match[1].trim());
    }

    // Extract date
    const datePattern = /(?:on|for)\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|today|tomorrow|next\s+\w+)/;
    const dateMatch = lowerCommand.match(datePattern);
    
    // Extract preferences
    const preferences: UserPreferences = {
      seatPreference: 'any',
      timePreference: 'any',
      pricePreference: 'any',
      operatorPreferences: [],
      amenityPreferences: []
    };

    if (lowerCommand.includes('window')) preferences.seatPreference = 'window';
    if (lowerCommand.includes('aisle')) preferences.seatPreference = 'aisle';
    if (lowerCommand.includes('early') || lowerCommand.includes('morning')) preferences.timePreference = 'morning';
    if (lowerCommand.includes('evening')) preferences.timePreference = 'evening';
    if (lowerCommand.includes('cheap') || lowerCommand.includes('budget')) preferences.pricePreference = 'budget';
    if (lowerCommand.includes('luxury') || lowerCommand.includes('premium')) preferences.pricePreference = 'luxury';

    return {
      type: lowerCommand.includes('book') ? 'book' : 'search',
      source: cities[0] || '',
      destination: cities[1] || '',
      date: this.parseDate(dateMatch?.[1] || 'today'),
      passengers: this.extractPassengerCount(lowerCommand),
      preferences,
      naturalLanguageQuery: command
    };
  }

  /**
   * Analyze routes using AI algorithms
   */
  private async analyzeRoutes(
    routes: BusRoute[],
    preferences: UserPreferences,
    source: string,
    destination: string
  ): Promise<{ bestRoute: BusRoute; recommendations: SmartRecommendation[] }> {
    // Score each route based on preferences
    const scoredRoutes = routes.map(route => ({
      route,
      score: this.calculateRouteScore(route, preferences)
    }));

    // Sort by score
    scoredRoutes.sort((a, b) => b.score - a.score);

    return {
      bestRoute: scoredRoutes[0].route,
      recommendations: []
    };
  }

  /**
   * Calculate route score based on user preferences
   */
  private calculateRouteScore(route: BusRoute, preferences: UserPreferences): number {
    let score = 0;

    // Price preference scoring
    if (preferences.pricePreference === 'budget' && route.fare < 800) score += 30;
    if (preferences.pricePreference === 'comfort' && route.fare >= 800 && route.fare <= 1500) score += 30;
    if (preferences.pricePreference === 'luxury' && route.fare > 1500) score += 30;

    // Time preference scoring
    const departureHour = this.parseTime(route.departureTime);
    if (preferences.timePreference === 'morning' && departureHour >= 6 && departureHour <= 10) score += 25;
    if (preferences.timePreference === 'evening' && departureHour >= 18 && departureHour <= 22) score += 25;

    // Rating scoring
    score += route.rating * 10;

    // Availability scoring
    score += (route.availableSeats / route.totalSeats) * 15;

    // Amenities scoring
    score += route.amenities.length * 2;

    return score;
  }

  /**
   * Select optimal seats based on preferences
   */
  private async selectOptimalSeats(
    seats: Seat[],
    passengers: number,
    preferences: UserPreferences
  ): Promise<Seat[]> {
    const availableSeats = seats.filter(seat => seat.isAvailable);
    
    // Filter by seat preference
    let preferredSeats = availableSeats;
    if (preferences.seatPreference !== 'any') {
      preferredSeats = availableSeats.filter(seat => seat.type === preferences.seatPreference);
    }

    // If not enough preferred seats, fall back to any available
    if (preferredSeats.length < passengers) {
      preferredSeats = availableSeats;
    }

    // Sort by preference and select best seats
    preferredSeats.sort((a, b) => {
      // Prefer lower fare
      if (a.fare !== b.fare) return a.fare - b.fare;
      
      // Prefer window seats if no specific preference
      if (preferences.seatPreference === 'any') {
        if (a.type === 'window' && b.type !== 'window') return -1;
        if (b.type === 'window' && a.type !== 'window') return 1;
      }
      
      // Prefer seats together
      return Math.abs(a.row - b.row) - Math.abs(a.row - b.row);
    });

    return preferredSeats.slice(0, passengers);
  }

  // Helper methods
  private convertPreferencesToFilters(preferences: UserPreferences): SearchFilters {
    const filters: SearchFilters = {};

    if (preferences.pricePreference === 'budget') {
      filters.priceRange = { min: 0, max: 800 };
    } else if (preferences.pricePreference === 'luxury') {
      filters.priceRange = { min: 1500, max: 5000 };
    }

    if (preferences.operatorPreferences.length > 0) {
      filters.operators = preferences.operatorPreferences;
    }

    return filters;
  }

  private parseTime(timeString: string): number {
    const [hours] = timeString.split(':').map(Number);
    return hours;
  }

  private parseDate(dateString: string): string {
    if (dateString === 'today') {
      return new Date().toISOString().split('T')[0];
    }
    if (dateString === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    return dateString;
  }

  private extractPassengerCount(command: string): number {
    const match = command.match(/(\d+)\s*(?:passenger|person|people|seat)/i);
    return match ? parseInt(match[1]) : 1;
  }

  private generatePassengerDetails(seats: Seat[], count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      name: `Passenger ${i + 1}`,
      age: 30,
      gender: 'male',
      seatId: seats[i]?.id
    }));
  }

  private async analyzeTrafficForRoute(source: string, destination: string, date: string): Promise<any> {
    // Simulate traffic analysis
    return {
      hasHeavyTraffic: Math.random() > 0.6,
      peakHours: ['08:00-10:00', '18:00-20:00']
    };
  }

  private async analyzeAlternativeDates(source: string, destination: string, date: string): Promise<any> {
    // Simulate alternative date analysis
    return {
      hasCheaperOptions: Math.random() > 0.5,
      maxSavings: Math.floor(Math.random() * 300) + 100,
      dates: [
        { date: '2024-01-15', savings: 150 },
        { date: '2024-01-17', savings: 200 }
      ]
    };
  }

  private updateBookingHistory(userId: string, booking: any): void {
    const history = this.bookingHistory.get(userId) || [];
    history.push(booking);
    this.bookingHistory.set(userId, history);
  }

  /**
   * Learn from user behavior and update preferences
   */
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const existing = this.userPreferences.get(userId) || {
      seatPreference: 'any',
      timePreference: 'any',
      pricePreference: 'any',
      operatorPreferences: [],
      amenityPreferences: []
    };

    this.userPreferences.set(userId, { ...existing, ...preferences });
  }

  /**
   * Get user's booking history
   */
  getBookingHistory(userId: string): any[] {
    return this.bookingHistory.get(userId) || [];
  }
}

export const aiBookingAssistant = new AIBookingAssistant();
export default aiBookingAssistant;
