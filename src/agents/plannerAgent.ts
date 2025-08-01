import { Journey, JourneyPlan, AgentResponse, PlannerCallbacks, AgentLog, RealtimeUpdate } from '../types';
import { MetroAgent } from './metroAgent';
import { BusAgent } from './busAgent';
import { RideAgent } from './rideAgent';
import { BikeAgent } from './bikeAgent';

export class PlannerAgent {
  private metroAgent = new MetroAgent();
  private busAgent = new BusAgent();
  private rideAgent = new RideAgent();
  private bikeAgent = new BikeAgent();

  async planJourney(journey: Journey, callbacks: PlannerCallbacks): Promise<{ plans: JourneyPlan[] }> {
    callbacks.onAgentLog({
      id: Date.now().toString(),
      agent: 'Planner',
      message: `Starting journey planning from ${journey.source} to ${journey.destination}`,
      timestamp: new Date(),
      type: 'info',
      data: { preference: journey.preference }
    });

    callbacks.onRealtimeUpdate({
      id: Date.now().toString(),
      type: 'replanning',
      agent: 'Planner',
      message: 'Initializing multi-agent coordination...',
      timestamp: new Date(),
      severity: 'info'
    });

    // Query all agents concurrently
    const agentPromises = [
      this.queryAgent(this.metroAgent, journey, callbacks),
      this.queryAgent(this.busAgent, journey, callbacks),
      this.queryAgent(this.rideAgent, journey, callbacks),
      this.queryAgent(this.bikeAgent, journey, callbacks)
    ];

    const agentResponses = await Promise.all(agentPromises);

    callbacks.onAgentLog({
      id: (Date.now() + 1).toString(),
      agent: 'Planner',
      message: 'All agents have responded. Analyzing optimal combinations...',
      timestamp: new Date(),
      type: 'success'
    });

    // Generate optimized journey plans
    const plans = this.generateOptimizedPlans(agentResponses, journey, callbacks);

    callbacks.onAgentLog({
      id: (Date.now() + 2).toString(),
      agent: 'Planner',
      message: `Generated ${plans.length} optimized journey plans`,
      timestamp: new Date(),
      type: 'success',
      data: { plansCount: plans.length }
    });

    callbacks.onRealtimeUpdate({
      id: (Date.now() + 3).toString(),
      type: 'complete',
      agent: 'Planner',
      message: 'Journey planning completed successfully',
      timestamp: new Date(),
      severity: 'success'
    });

    return { plans };
  }

  async replanJourney(journey: Journey, disruption: RealtimeUpdate, callbacks: PlannerCallbacks): Promise<{ plans: JourneyPlan[] }> {
    callbacks.onAgentLog({
      id: Date.now().toString(),
      agent: 'Planner',
      message: `Re-planning journey due to ${disruption.type}: ${disruption.message}`,
      timestamp: new Date(),
      type: 'warning',
      data: { disruption }
    });

    // Simulate re-planning with updated conditions
    await new Promise(resolve => setTimeout(resolve, 1500));

    const agentPromises = [
      this.queryAgent(this.metroAgent, journey, callbacks, true),
      this.queryAgent(this.busAgent, journey, callbacks),
      this.queryAgent(this.rideAgent, journey, callbacks),
      this.queryAgent(this.bikeAgent, journey, callbacks)
    ];

    const agentResponses = await Promise.all(agentPromises);
    const plans = this.generateOptimizedPlans(agentResponses, journey, callbacks, true);

    callbacks.onRealtimeUpdate({
      id: Date.now().toString(),
      type: 'complete',
      agent: 'Planner',
      message: 'Re-planning completed with updated routes',
      timestamp: new Date(),
      severity: 'success'
    });

    return { plans };
  }

  private async queryAgent(agent: any, journey: Journey, callbacks: PlannerCallbacks, hasDisruption = false): Promise<AgentResponse> {
    const agentName = agent.constructor.name.replace('Agent', '');
    
    callbacks.onAgentLog({
      id: Date.now().toString(),
      agent: agentName,
      message: `Querying ${agentName} agent for route options...`,
      timestamp: new Date(),
      type: 'info'
    });

    // Simulate agent processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const response = await agent.getRouteOptions(journey, hasDisruption);

    callbacks.onAgentLog({
      id: (Date.now() + 1).toString(),
      agent: agentName,
      message: `${agentName} agent found ${response.options.length} route options (confidence: ${Math.round(response.confidence * 100)}%)`,
      timestamp: new Date(),
      type: response.available ? 'success' : 'warning',
      data: { optionsCount: response.options.length, confidence: response.confidence }
    });

    return response;
  }

  private generateOptimizedPlans(responses: AgentResponse[], journey: Journey, callbacks: PlannerCallbacks, isReplanning = false): JourneyPlan[] {
    const plans: JourneyPlan[] = [];

    // Generate different combination strategies
    const strategies = [
      { name: 'Multi-modal Fast', preference: 'fastest' },
      { name: 'Budget Conscious', preference: 'cheapest' },
      { name: 'Comfort Priority', preference: 'comfortable' }
    ];

    strategies.forEach((strategy, index) => {
      const plan = this.createOptimalPlan(responses, journey, strategy, callbacks, isReplanning);
      if (plan) {
        plans.push(plan);
      }
    });

    return plans.sort((a, b) => {
      // Sort by preference match and confidence
      if (journey.preference === 'fastest') return a.totalDuration - b.totalDuration;
      if (journey.preference === 'cheapest') return a.totalCost - b.totalCost;
      if (journey.preference === 'comfortable') return b.comfortScore - a.comfortScore;
      return b.confidence - a.confidence;
    });
  }

  private createOptimalPlan(responses: AgentResponse[], journey: Journey, strategy: any, callbacks: PlannerCallbacks, isReplanning = false): JourneyPlan | null {
    // Combine best options from different agents
    const availableOptions = responses.filter(r => r.available).flatMap(r => r.options);
    
    if (availableOptions.length === 0) return null;

    // Select optimal combination based on strategy
    const selectedSteps = this.selectOptimalSteps(availableOptions, strategy.preference);
    
    const totalDuration = selectedSteps.reduce((sum, step) => sum + step.duration + (step.delay || 0), 0);
    const totalCost = selectedSteps.reduce((sum, step) => sum + step.cost, 0);
    const comfortScore = Math.round(selectedSteps.reduce((sum, step) => sum + (step.comfort || 3), 0) / selectedSteps.length);
    const confidence = Math.min(...responses.filter(r => r.available).map(r => r.confidence));

    return {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      totalDuration,
      totalCost: Math.round(totalCost * 100) / 100,
      comfortScore,
      steps: selectedSteps,
      optimizedFor: strategy.name,
      confidence
    };
  }

  private selectOptimalSteps(options: any[], preference: string): any[] {
    // Smart step selection logic
    const steps = [];
    
    // Primary transport (longest segment)
    const primaryOptions = options.filter(opt => ['metro', 'bus', 'ride'].includes(opt.mode));
    let primary;
    
    if (preference === 'fastest') {
      primary = primaryOptions.sort((a, b) => a.duration - b.duration)[0];
    } else if (preference === 'cheapest') {
      primary = primaryOptions.sort((a, b) => a.cost - b.cost)[0];
    } else {
      primary = primaryOptions.sort((a, b) => (b.comfort || 3) - (a.comfort || 3))[0];
    }
    
    if (primary) steps.push(primary);
    
    // Add connecting segments (walk/bike)
    const connectingOptions = options.filter(opt => ['walk', 'bike'].includes(opt.mode));
    if (connectingOptions.length > 0) {
      const connecting = preference === 'comfortable' 
        ? connectingOptions.find(opt => opt.mode === 'bike') || connectingOptions[0]
        : connectingOptions[0];
      steps.push(connecting);
    }
    
    // If not enough segments, add more options
    if (steps.length < 2 && options.length > steps.length) {
      const remaining = options.filter(opt => !steps.includes(opt));
      if (remaining.length > 0) {
        steps.push(remaining[0]);
      }
    }
    
    return steps;
  }
}