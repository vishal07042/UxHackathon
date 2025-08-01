import { Journey, TransportStep, AgentResponse } from '../types';

export class BusAgent {
  async getRouteOptions(journey: Journey, hasDisruption = false): Promise<AgentResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const baseOptions: TransportStep[] = [
      {
        id: `bus-${Date.now()}-1`,
        mode: 'bus',
        from: journey.source,
        to: journey.destination,
        duration: 35,
        cost: 2.75,
        details: 'Route 42 - Direct service',
        eta: '08:25 AM',
        distance: 15.3,
        comfort: 3
      },
      {
        id: `bus-${Date.now()}-2`,
        mode: 'bus',
        from: journey.source,
        to: 'Bus Hub Central',
        duration: 20,
        cost: 1.50,
        details: 'Route 15 - Express to hub',
        eta: '08:18 AM',
        distance: 9.1,
        comfort: 2
      },
      {
        id: `bus-${Date.now()}-3`,
        mode: 'bus',
        from: journey.source,
        to: journey.destination,
        duration: 45,
        cost: 2.25,
        details: 'Route 88 - Scenic route with stops',
        eta: '08:30 AM',
        distance: 18.7,
        comfort: 4
      }
    ];

    let options = baseOptions;
    let confidence = 0.85;

    // Bus system is generally reliable but slower
    if (journey.preference === 'fastest') {
      options = options.filter(opt => opt.duration <= 30);
      confidence = 0.75;
    } else if (journey.preference === 'cheapest') {
      options = options.sort((a, b) => a.cost - b.cost);
      confidence = 0.9;
    } else if (journey.preference === 'comfortable') {
      options = options.filter(opt => (opt.comfort || 3) >= 3);
      confidence = 0.8;
    }

    return {
      agent: 'Bus',
      available: options.length > 0,
      options,
      processingTime: 800,
      confidence,
      reasoning: `Bus network offers ${options.length} affordable routes with extensive city coverage`
    };
  }
}