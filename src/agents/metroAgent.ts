import { Journey, TransportStep, AgentResponse } from '../types';

export class MetroAgent {
  async getRouteOptions(journey: Journey, hasDisruption = false): Promise<AgentResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 600));

    const baseOptions: TransportStep[] = [
      {
        id: `metro-${Date.now()}-1`,
        mode: 'metro',
        from: journey.source,
        to: journey.destination,
        duration: 25,
        cost: 3.50,
        details: 'Blue Line - Express service',
        eta: '08:15 AM',
        distance: 12.5,
        comfort: 4,
        delay: hasDisruption ? 5 : undefined
      },
      {
        id: `metro-${Date.now()}-2`,
        mode: 'metro',
        from: journey.source,
        to: 'Transfer Station',
        duration: 15,
        cost: 2.25,
        details: 'Red Line to transfer point',
        eta: '08:20 AM',
        distance: 8.2,
        comfort: 3,
        delay: hasDisruption ? 3 : undefined
      }
    ];

    // Apply journey preference optimizations
    let options = baseOptions;
    let confidence = 0.9;

    if (hasDisruption) {
      confidence = 0.7;
      options = options.map(opt => ({
        ...opt,
        duration: opt.duration + (opt.delay || 0),
        details: opt.details + (opt.delay ? ' - Service Alert: Delays expected' : '')
      }));
    }

    // Adjust based on preference
    if (journey.preference === 'fastest') {
      options = options.filter(opt => opt.duration <= 20 || !hasDisruption);
      confidence = hasDisruption ? 0.6 : 0.95;
    } else if (journey.preference === 'cheapest') {
      options = options.sort((a, b) => a.cost - b.cost);
      confidence = 0.85;
    } else if (journey.preference === 'comfortable') {
      options = options.filter(opt => (opt.comfort || 3) >= 3);
      confidence = 0.8;
    }

    return {
      agent: 'Metro',
      available: true,
      options,
      processingTime: 600,
      confidence,
      reasoning: `Metro system ${hasDisruption ? 'experiencing delays but ' : ''}provides efficient urban transit with ${options.length} route options`
    };
  }
}