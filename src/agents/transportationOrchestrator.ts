/**
 * Transportation Orchestrator - Multi-Modal Agent Coordination System
 * Coordinates between different transportation service agents to provide
 * seamless, end-to-end travel planning for urban commuters
 */

// Browser-compatible EventEmitter
class EventEmitter {
	private events: { [key: string]: Function[] } = {};

	on(event: string, listener: Function): void {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(listener);
	}

	off(event: string, listener: Function): void {
		if (!this.events[event]) return;
		this.events[event] = this.events[event].filter((l) => l !== listener);
	}

	emit(event: string, ...args: any[]): void {
		if (!this.events[event]) return;
		this.events[event].forEach((listener) => listener(...args));
	}

	removeAllListeners(event?: string): void {
		if (event) {
			delete this.events[event];
		} else {
			this.events = {};
		}
	}
}

export interface TransportMode {
	id: string;
	name: string;
	type: "public" | "private" | "shared" | "active";
	category:
		| "bus"
		| "metro"
		| "tram"
		| "train"
		| "ridehail"
		| "bikeshare"
		| "scooter"
		| "walking"
		| "taxi";
	availability: "available" | "limited" | "unavailable";
	realTimeData: boolean;
	bookingRequired: boolean;
	costPerKm?: number;
	averageSpeed?: number; // km/h
	co2PerKm?: number; // grams
	accessibilityScore?: number; // 1-10
}

export interface JourneySegment {
	id: string;
	mode: TransportMode;
	origin: LocationPoint;
	destination: LocationPoint;
	departureTime: Date;
	arrivalTime: Date;
	duration: number; // minutes
	distance: number; // meters
	cost: number;
	co2Emissions: number;
	reliability: number; // 0-1
	comfort: number; // 1-10
	accessibility: number; // 1-10
	realTimeUpdates: boolean;
	bookingInfo?: BookingInfo;
	alternatives?: JourneySegment[];
}

export interface LocationPoint {
	latitude: number;
	longitude: number;
	name: string;
	address?: string;
	type: "address" | "stop" | "station" | "poi";
}

export interface BookingInfo {
	required: boolean;
	provider: string;
	bookingUrl?: string;
	estimatedWaitTime?: number;
	cancellationPolicy?: string;
}

export interface JourneyPlan {
	id: string;
	segments: JourneySegment[];
	totalDuration: number;
	totalCost: number;
	totalDistance: number;
	totalCo2: number;
	reliability: number;
	comfort: number;
	accessibility: number;
	multiModalScore: number;
	createdAt: Date;
	validUntil: Date;
}

export interface UserPreferences {
	maxWalkingDistance: number; // meters
	preferredModes: string[];
	avoidModes: string[];
	maxCost: number;
	prioritizeSpeed: boolean;
	prioritizeCost: boolean;
	prioritizeComfort: boolean;
	prioritizeEnvironment: boolean;
	accessibilityNeeds: string[];
	realTimeUpdatesRequired: boolean;
}

export interface RealTimeUpdate {
	segmentId: string;
	type:
		| "delay"
		| "cancellation"
		| "platform_change"
		| "disruption"
		| "capacity";
	severity: "low" | "medium" | "high" | "critical";
	message: string;
	estimatedDelay?: number;
	alternativeOptions?: JourneySegment[];
	timestamp: Date;
}

export interface AgentCapabilities {
	canPlanJourneys: boolean;
	canProvideRealTimeUpdates: boolean;
	canHandleBookings: boolean;
	canProvideAlternatives: boolean;
	canIntegrateWithOtherModes: boolean;
	coverageArea: {
		city: string;
		bounds: {
			north: number;
			south: number;
			east: number;
			west: number;
		};
	};
}

export abstract class TransportationAgent extends EventEmitter {
	protected agentId: string;
	protected name: string;
	protected capabilities: AgentCapabilities;
	protected isActive: boolean = false;

	constructor(
		agentId: string,
		name: string,
		capabilities: AgentCapabilities
	) {
		super();
		this.agentId = agentId;
		this.name = name;
		this.capabilities = capabilities;
	}

	abstract initialize(): Promise<void>;
	abstract planJourney(
		origin: LocationPoint,
		destination: LocationPoint,
		preferences: UserPreferences
	): Promise<JourneySegment[]>;
	abstract getRealTimeUpdates(segmentId: string): Promise<RealTimeUpdate[]>;
	abstract bookJourney(segment: JourneySegment): Promise<BookingInfo>;
	abstract getAlternatives(
		segment: JourneySegment
	): Promise<JourneySegment[]>;

	getCapabilities(): AgentCapabilities {
		return this.capabilities;
	}

	getId(): string {
		return this.agentId;
	}

	getName(): string {
		return this.name;
	}

	isAgentActive(): boolean {
		return this.isActive;
	}

	protected setActive(active: boolean): void {
		this.isActive = active;
		this.emit("statusChange", { agentId: this.agentId, active });
	}
}

export class TransportationOrchestrator extends EventEmitter {
	private agents: Map<string, TransportationAgent> = new Map();
	private activeJourneys: Map<string, JourneyPlan> = new Map();
	private realTimeMonitoring: boolean = false;

	constructor() {
		super();
		this.startRealTimeMonitoring();
	}

	/**
	 * Register a transportation agent
	 */
	registerAgent(agent: TransportationAgent): void {
		this.agents.set(agent.getId(), agent);

		// Listen to agent events
		agent.on("statusChange", (data) => {
			this.emit("agentStatusChange", data);
		});

		agent.on("realTimeUpdate", (update: RealTimeUpdate) => {
			this.handleRealTimeUpdate(update);
		});

		console.log(`Agent registered: ${agent.getName()} (${agent.getId()})`);
	}

	/**
	 * Unregister a transportation agent
	 */
	unregisterAgent(agentId: string): void {
		const agent = this.agents.get(agentId);
		if (agent) {
			agent.removeAllListeners();
			this.agents.delete(agentId);
			console.log(`Agent unregistered: ${agentId}`);
		}
	}

	/**
	 * Get all registered agents
	 */
	getAgents(): TransportationAgent[] {
		return Array.from(this.agents.values());
	}

	/**
	 * Get agents by capability
	 */
	getAgentsByCapability(
		capability: keyof AgentCapabilities
	): TransportationAgent[] {
		return this.getAgents().filter(
			(agent) => agent.getCapabilities()[capability] === true
		);
	}

	/**
	 * Plan comprehensive multi-modal journey
	 */
	async planJourney(
		origin: LocationPoint,
		destination: LocationPoint,
		preferences: UserPreferences,
		departureTime?: Date
	): Promise<JourneyPlan[]> {
		const planningAgents = this.getAgentsByCapability("canPlanJourneys");

		if (planningAgents.length === 0) {
			throw new Error("No planning agents available");
		}

		// Get journey segments from all capable agents
		const allSegments: JourneySegment[] = [];

		for (const agent of planningAgents) {
			try {
				const segments = await agent.planJourney(
					origin,
					destination,
					preferences
				);
				allSegments.push(...segments);
			} catch (error) {
				console.warn(
					`Agent ${agent.getName()} failed to plan journey:`,
					error
				);
			}
		}

		// Generate multi-modal combinations
		const journeyPlans = this.generateMultiModalPlans(
			allSegments,
			preferences
		);

		// Score and rank plans
		const rankedPlans = this.rankJourneyPlans(journeyPlans, preferences);

		// Store active journeys for monitoring
		rankedPlans.forEach((plan) => {
			this.activeJourneys.set(plan.id, plan);
		});

		return rankedPlans;
	}

	/**
	 * Generate multi-modal journey combinations
	 */
	private generateMultiModalPlans(
		segments: JourneySegment[],
		preferences: UserPreferences
	): JourneyPlan[] {
		const plans: JourneyPlan[] = [];

		// Single-mode journeys
		segments.forEach((segment) => {
			plans.push({
				id: `plan-${Date.now()}-${Math.random()
					.toString(36)
					.substr(2, 9)}`,
				segments: [segment],
				totalDuration: segment.duration,
				totalCost: segment.cost,
				totalDistance: segment.distance,
				totalCo2: segment.co2Emissions,
				reliability: segment.reliability,
				comfort: segment.comfort,
				accessibility: segment.accessibility,
				multiModalScore: this.calculateMultiModalScore(
					[segment],
					preferences
				),
				createdAt: new Date(),
				validUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
			});
		});

		// Multi-modal combinations (simplified for demo)
		// In a real implementation, this would use sophisticated routing algorithms
		const publicTransportSegments = segments.filter(
			(s) => s.mode.type === "public"
		);
		const lastMileSegments = segments.filter(
			(s) =>
				s.mode.category === "bikeshare" ||
				s.mode.category === "scooter" ||
				s.mode.category === "walking"
		);

		publicTransportSegments.forEach((ptSegment) => {
			lastMileSegments.forEach((lmSegment) => {
				const combinedPlan: JourneyPlan = {
					id: `plan-${Date.now()}-${Math.random()
						.toString(36)
						.substr(2, 9)}`,
					segments: [ptSegment, lmSegment],
					totalDuration: ptSegment.duration + lmSegment.duration + 5, // 5 min transfer
					totalCost: ptSegment.cost + lmSegment.cost,
					totalDistance: ptSegment.distance + lmSegment.distance,
					totalCo2: ptSegment.co2Emissions + lmSegment.co2Emissions,
					reliability: Math.min(
						ptSegment.reliability,
						lmSegment.reliability
					),
					comfort: (ptSegment.comfort + lmSegment.comfort) / 2,
					accessibility: Math.min(
						ptSegment.accessibility,
						lmSegment.accessibility
					),
					multiModalScore: this.calculateMultiModalScore(
						[ptSegment, lmSegment],
						preferences
					),
					createdAt: new Date(),
					validUntil: new Date(Date.now() + 30 * 60 * 1000),
				};
				plans.push(combinedPlan);
			});
		});

		return plans;
	}

	/**
	 * Calculate multi-modal score based on user preferences
	 */
	private calculateMultiModalScore(
		segments: JourneySegment[],
		preferences: UserPreferences
	): number {
		let score = 0;
		const weights = {
			speed: preferences.prioritizeSpeed ? 0.3 : 0.2,
			cost: preferences.prioritizeCost ? 0.3 : 0.2,
			comfort: preferences.prioritizeComfort ? 0.25 : 0.15,
			environment: preferences.prioritizeEnvironment ? 0.25 : 0.15,
			reliability: 0.2,
			accessibility:
				preferences.accessibilityNeeds.length > 0 ? 0.3 : 0.1,
		};

		const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
		const totalCost = segments.reduce((sum, s) => sum + s.cost, 0);
		const totalCo2 = segments.reduce((sum, s) => sum + s.co2Emissions, 0);
		const avgComfort =
			segments.reduce((sum, s) => sum + s.comfort, 0) / segments.length;
		const avgReliability =
			segments.reduce((sum, s) => sum + s.reliability, 0) /
			segments.length;
		const minAccessibility = Math.min(
			...segments.map((s) => s.accessibility)
		);

		// Normalize and score (simplified scoring)
		score += weights.speed * Math.max(0, (120 - totalDuration) / 120); // 120 min max
		score += weights.cost * Math.max(0, (50 - totalCost) / 50); // €50 max
		score += weights.environment * Math.max(0, (5000 - totalCo2) / 5000); // 5kg CO2 max
		score += weights.comfort * (avgComfort / 10);
		score += weights.reliability * avgReliability;
		score += weights.accessibility * (minAccessibility / 10);

		return Math.min(1, Math.max(0, score));
	}

	/**
	 * Rank journey plans by score and preferences
	 */
	private rankJourneyPlans(
		plans: JourneyPlan[],
		preferences: UserPreferences
	): JourneyPlan[] {
		return plans
			.filter((plan) => plan.totalCost <= preferences.maxCost)
			.sort((a, b) => b.multiModalScore - a.multiModalScore)
			.slice(0, 5); // Return top 5 plans
	}

	/**
	 * Handle real-time updates from agents
	 */
	private handleRealTimeUpdate(update: RealTimeUpdate): void {
		// Find affected journeys
		const affectedJourneys = Array.from(
			this.activeJourneys.values()
		).filter((journey) =>
			journey.segments.some((segment) => segment.id === update.segmentId)
		);

		affectedJourneys.forEach((journey) => {
			this.emit("journeyUpdate", {
				journeyId: journey.id,
				update,
				journey,
			});
		});

		// If critical update, find alternatives
		if (update.severity === "critical" || update.type === "cancellation") {
			this.findAlternativesForUpdate(update);
		}
	}

	/**
	 * Find alternatives for disrupted segments
	 */
	private async findAlternativesForUpdate(
		update: RealTimeUpdate
	): Promise<void> {
		const alternativeAgents = this.getAgentsByCapability(
			"canProvideAlternatives"
		);

		for (const agent of alternativeAgents) {
			try {
				// This would need the original segment - simplified for demo
				const alternatives = await agent.getAlternatives(
					{} as JourneySegment
				);

				this.emit("alternativesFound", {
					originalSegmentId: update.segmentId,
					alternatives,
					update,
				});
			} catch (error) {
				console.warn(
					`Failed to get alternatives from ${agent.getName()}:`,
					error
				);
			}
		}
	}

	/**
	 * Start real-time monitoring of active journeys
	 */
	private startRealTimeMonitoring(): void {
		if (this.realTimeMonitoring) return;

		this.realTimeMonitoring = true;

		// Monitor every 30 seconds
		setInterval(() => {
			this.monitorActiveJourneys();
		}, 30000);
	}

	/**
	 * Monitor active journeys for updates
	 */
	private async monitorActiveJourneys(): Promise<void> {
		const updateAgents = this.getAgentsByCapability(
			"canProvideRealTimeUpdates"
		);

		for (const [journeyId, journey] of this.activeJourneys) {
			// Remove expired journeys
			if (journey.validUntil < new Date()) {
				this.activeJourneys.delete(journeyId);
				continue;
			}

			// Check for updates on each segment
			for (const segment of journey.segments) {
				for (const agent of updateAgents) {
					try {
						const updates = await agent.getRealTimeUpdates(
							segment.id
						);
						updates.forEach((update) =>
							this.handleRealTimeUpdate(update)
						);
					} catch (error) {
						// Silently handle monitoring errors
					}
				}
			}
		}
	}

	/**
	 * Book a complete journey
	 */
	async bookJourney(journeyId: string): Promise<BookingInfo[]> {
		const journey = this.activeJourneys.get(journeyId);
		if (!journey) {
			throw new Error("Journey not found");
		}

		const bookingResults: BookingInfo[] = [];
		const bookingAgents = this.getAgentsByCapability("canHandleBookings");

		for (const segment of journey.segments) {
			if (segment.bookingInfo?.required) {
				const agent = bookingAgents.find((a) =>
					a.getName().toLowerCase().includes(segment.mode.category)
				);

				if (agent) {
					try {
						const booking = await agent.bookJourney(segment);
						bookingResults.push(booking);
					} catch (error) {
						console.error(
							`Booking failed for segment ${segment.id}:`,
							error
						);
						throw error;
					}
				}
			}
		}

		return bookingResults;
	}

	/**
	 * Get journey status
	 */
	getJourneyStatus(journeyId: string): JourneyPlan | null {
		return this.activeJourneys.get(journeyId) || null;
	}

	/**
	 * Cancel journey monitoring
	 */
	cancelJourneyMonitoring(journeyId: string): void {
		this.activeJourneys.delete(journeyId);
	}
}

export const transportationOrchestrator = new TransportationOrchestrator();
export default transportationOrchestrator;
