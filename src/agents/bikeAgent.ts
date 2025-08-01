import { Journey, TransportStep, AgentResponse } from '../types';

export class BikeAgent {
  async getRouteOptions(journey: Journey, hasDisruption = false): Promise<AgentResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const baseOptions: TransportStep[] = [
      {
        id: `walk-${Date.now()}-1`,
        mode: 'walk',
        from: journey.source,
        to: journey.destination,
        duration: 45,
        cost: 0,
        details: 'Walking route via Main Street',
        eta: '08:45 AM',
        distance: 3.2,
        comfort: 2
      },
      {
        id: `bike-${Date.now()}-1`,
        mode: 'bike',
        from: journey.source,
        to: journey.destination,
        duration: 20,
        cost: 4.50,
        details: 'City bike-share - Station available',
        eta: '08:20 AM',
        distance: 5.8,
        comfort: 3
      },
      {
        id: `bike-${Date.now()}-2`,
        mode: 'bike',
        from: journey.source,
        to: 'Park Connector',
        duration: 12,
        cost: 3.00,
        details: 'Scenic bike path through city park',
        eta: '08:12 AM',
        distance: 3.5,
        comfort: 4
      }
    ];

    let options = baseOptions;
    let confidence = 0.8;

    // Weather and distance considerations
    const distance = parseFloat(journey.source.length.toString()) + parseFloat(journey.destination.length.toString());
    
    if (distance > 10) {
      // Too far for comfortable biking/walking
      options = options.filter(opt => opt.mode === 'bike');
      confidence = 0.6;
    }

    if (journey.preference === 'fastest') {
      options = options.filter(opt => opt.mode === 'bike');
      confidence = 0.85;
    } else if (journey.preference === 'cheapest') {
      options = options.sort((a, b) => a.cost - b.cost);
      confidence = 0.95;
    } else if (journey.preference === 'comfortable') {
      options = options.filter(opt => (opt.comfort || 3) >= 3);
      confidence = 0.75;
    }

    return {
      agent: 'Bike',
      available: options.length > 0,
      options,
      processingTime: 400,
      confidence,
      reasoning: `Active transport ${options.length > 0 ? 'available' : 'limited by distance'} - eco-friendly and healthy options`
    };
  }
}