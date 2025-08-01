export interface Journey {
  source: string;
  destination: string;
  preference: 'cheapest' | 'fastest' | 'comfortable';
  departureTime?: Date;
}

export interface TransportStep {
  id: string;
  mode: 'metro' | 'bus' | 'ride' | 'walk' | 'bike';
  from: string;
  to: string;
  duration: number; // minutes
  cost: number; // dollars
  details: string;
  eta: string;
  distance?: number; // km
  comfort?: number; // 1-5 scale
  delay?: number; // minutes
}

export interface JourneyPlan {
  id: string;
  totalDuration: number;
  totalCost: number;
  comfortScore: number;
  steps: TransportStep[];
  optimizedFor: string;
  confidence: number;
}

export interface AgentResponse {
  agent: string;
  available: boolean;
  options: TransportStep[];
  processingTime: number;
  confidence: number;
  reasoning: string;
}

export interface AgentLog {
  id: string;
  agent: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
}

export interface RealtimeUpdate {
  id: string;
  type: 'delay' | 'closure' | 'alternative' | 'replanning' | 'complete';
  agent: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
  affectedPlans?: string[];
}

export interface PlannerCallbacks {
  onAgentLog: (log: AgentLog) => void;
  onRealtimeUpdate: (update: RealtimeUpdate) => void;
}