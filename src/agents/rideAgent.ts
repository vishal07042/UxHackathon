import { Journey, TransportStep, AgentResponse } from '../types';

export class RideAgent {
  async getRouteOptions(journey: Journey, hasDisruption = false): Promise<AgentResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const baseOptions: TransportStep[] = [
      {
        id: `ride-${Date.now()}-1`,
        mode: 'ride',
        from: journey.source,
        to: journey.destination,
        duration: 18,
        cost: 12.50,
        details: 'UberX - 4 min pickup time',
        eta: '08:12 AM',
        distance: 11.2,
        comfort: 5
      },
      {
        id: `ride-${Date.now()}-2`,
        mode: 'ride',
        from: journey.source,
        to: journey.destination,
        duration: 16,
        cost: 18.75,
        details: 'Premium - Luxury vehicle',
        eta: '08:10 AM',
        distance: 11.2,
        comfort: 5
      },
      {
        id: `ride-${Date.now()}-3`,
        mode: 'ride',
        from: journey.source,
        to: journey.destination,
        duration: 22,
        cost: 8.25,
        details: 'Pool - Shared ride',
        eta: '08:15 AM',
        distance: 13.1,
        comfort: 3
      }
    ];

    let options = baseOptions;
    let confidence = 0.95;

    // High surge pricing during disruptions
    if (hasDisruption) {
      options = options.map(opt => ({
        ...opt,
        cost: opt.cost * 1.5,
        details: opt.details + ' - High demand pricing'
      }));
      confidence = 0.85;
    }

    if (journey.preference === 'fastest') {
      options = options.sort((a, b) => a.duration - b.duration);
      confidence = 0.98;
    } else if (journey.preference === 'cheapest') {
      options = options.sort((a, b) => a.cost - b.cost);
      if (hasDisruption) confidence = 0.6; // Expensive during surge
    } else if (journey.preference === 'comfortable') {
      options = options.filter(opt => (opt.comfort || 3) >= 4);
      confidence = 0.95;
    }

    return {
      agent: 'Ride',
      available: true,
      options,
      processingTime: 500,
      confidence,
      reasoning: `Ride-hailing ${hasDisruption ? 'with surge pricing ' : ''}offers ${options.length} door-to-door options with high comfort`
    };
  }
}