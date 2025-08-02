// VBB (Verkehrsverbund Berlin-Brandenburg) API Service
// Documentation: https://v6.vbb.transport.rest/

const VBB_API_BASE = "https://v6.vbb.transport.rest";

export interface VBBLocation {
	type: "location" | "stop" | "station";
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	address?: string;
	distance?: number;
}

export interface VBBJourney {
	type: "journey";
	legs: VBBLeg[];
	refreshToken?: string;
	price?: {
		amount: number;
		currency: string;
	};
}

export interface VBBLeg {
	origin: VBBLocation;
	destination: VBBLocation;
	departure: string;
	arrival: string;
	mode: "walking" | "bus" | "subway" | "tram" | "regional" | "ferry";
	line?: {
		type: string;
		id: string;
		name: string;
		mode: string;
		product: string;
	};
	direction?: string;
	distance?: number;
	duration?: number;
	polyline?: string;
}

export interface VBBDeparture {
	tripId: string;
	stop: VBBLocation;
	when: string;
	plannedWhen: string;
	delay?: number;
	platform?: string;
	line: {
		type: string;
		id: string;
		name: string;
		mode: string;
		product: string;
	};
	direction: string;
}

class VBBApiService {
	private async fetchApi(
		endpoint: string,
		params: Record<string, any> = {}
	): Promise<any> {
		const url = new URL(`${VBB_API_BASE}${endpoint}`);

		// Add common parameters
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				url.searchParams.append(key, value.toString());
			}
		});

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

			const response = await fetch(url.toString(), {
				signal: controller.signal,
				headers: {
					Accept: "application/json",
					"User-Agent": "UrbanOrchestrator/1.0",
				},
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(
					`VBB API error: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error("VBB API request failed:", error);

			// Return mock data for development/demo purposes
			if (endpoint.includes("/locations")) {
				return this.getMockLocations(params.query);
			} else if (endpoint.includes("/stops/nearby")) {
				return this.getMockNearbyStops();
			} else if (endpoint.includes("/journeys")) {
				return { journeys: this.getMockJourneys() };
			}

			throw error;
		}
	}

	private getMockLocations(query: string): any[] {
		const mockLocations = [
			{
				type: "station",
				id: "mock-alexanderplatz",
				name: "Alexanderplatz",
				location: { latitude: 52.5219, longitude: 13.4132 },
				address: "Alexanderplatz, Berlin",
			},
			{
				type: "station",
				id: "mock-potsdamer-platz",
				name: "Potsdamer Platz",
				location: { latitude: 52.5096, longitude: 13.3765 },
				address: "Potsdamer Platz, Berlin",
			},
			{
				type: "station",
				id: "mock-brandenburg-gate",
				name: "Brandenburg Gate",
				location: { latitude: 52.5163, longitude: 13.3777 },
				address: "Brandenburg Gate, Berlin",
			},
			{
				type: "station",
				id: "mock-hauptbahnhof",
				name: "Berlin Hauptbahnhof",
				location: { latitude: 52.5251, longitude: 13.3694 },
				address: "Hauptbahnhof, Berlin",
			},
		];

		if (!query) return mockLocations;

		return mockLocations.filter((loc) =>
			loc.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	private getMockNearbyStops(): any[] {
		return [
			{
				type: "station",
				id: "mock-nearby-1",
				name: "Nearby Station 1",
				location: { latitude: 52.52, longitude: 13.405 },
				distance: 150,
			},
			{
				type: "station",
				id: "mock-nearby-2",
				name: "Nearby Station 2",
				location: { latitude: 52.518, longitude: 13.408 },
				distance: 300,
			},
		];
	}

	private getMockJourneys(): any[] {
		return [
			{
				type: "journey",
				legs: [
					{
						origin: {
							name: "Origin Station",
							latitude: 52.52,
							longitude: 13.405,
						},
						destination: {
							name: "Destination Station",
							latitude: 52.51,
							longitude: 13.39,
						},
						departure: new Date(
							Date.now() + 5 * 60000
						).toISOString(),
						arrival: new Date(
							Date.now() + 25 * 60000
						).toISOString(),
						mode: "subway",
						line: { name: "U2", type: "subway", product: "subway" },
						direction: "Pankow",
					},
				],
				price: { amount: 3.2, currency: "EUR" },
			},
		];
	}

	// Search for locations (stations, stops, addresses)
	async searchLocations(query: string, results = 10): Promise<VBBLocation[]> {
		const data = await this.fetchApi("/locations", {
			query,
			results,
			addresses: true,
			poi: true,
			linesOfStops: true,
		});

		return data
			.map((item: any) => ({
				type: item.type,
				id: item.id,
				name: item.name,
				latitude: item.location?.latitude || item.latitude,
				longitude: item.location?.longitude || item.longitude,
				address: item.address,
				distance: item.distance,
			}))
			.filter(
				(item: VBBLocation) =>
					item.latitude !== undefined &&
					item.longitude !== undefined &&
					!isNaN(item.latitude) &&
					!isNaN(item.longitude)
			);
	}

	// Get nearby locations
	async getNearbyLocations(
		latitude: number,
		longitude: number,
		distance = 1000
	): Promise<VBBLocation[]> {
		const data = await this.fetchApi("/stops/nearby", {
			latitude,
			longitude,
			distance,
			results: 20,
		});

		return data
			.map((item: any) => ({
				type: item.type,
				id: item.id,
				name: item.name,
				latitude: item.location?.latitude || item.latitude,
				longitude: item.location?.longitude || item.longitude,
				distance: item.distance,
			}))
			.filter(
				(item: VBBLocation) =>
					item.latitude !== undefined &&
					item.longitude !== undefined &&
					!isNaN(item.latitude) &&
					!isNaN(item.longitude)
			);
	}

	// Plan journeys between two locations
	async planJourney(
		from: string | { latitude: number; longitude: number },
		to: string | { latitude: number; longitude: number },
		options: {
			departure?: Date;
			arrival?: Date;
			results?: number;
			walkingSpeed?: "slow" | "normal" | "fast";
			accessibility?: "partial" | "complete";
			bike?: boolean;
			products?: {
				suburban?: boolean;
				subway?: boolean;
				tram?: boolean;
				bus?: boolean;
				ferry?: boolean;
				express?: boolean;
				regional?: boolean;
			};
		} = {}
	): Promise<VBBJourney[]> {
		const params: any = {
			from:
				typeof from === "string"
					? from
					: `${from.latitude},${from.longitude}`,
			to: typeof to === "string" ? to : `${to.latitude},${to.longitude}`,
			results: options.results || 5,
			walkingSpeed: options.walkingSpeed || "normal",
		};

		if (options.departure) {
			params.departure = options.departure.toISOString();
		}
		if (options.arrival) {
			params.arrival = options.arrival.toISOString();
		}
		if (options.accessibility) {
			params.accessibility = options.accessibility;
		}
		if (options.bike) {
			params.bike = true;
		}

		// Add product filters
		if (options.products) {
			Object.entries(options.products).forEach(([product, enabled]) => {
				params[product] = enabled;
			});
		}

		const data = await this.fetchApi("/journeys", params);
		return data.journeys || [];
	}

	// Get departures from a station
	async getDepartures(
		stationId: string,
		duration = 60
	): Promise<VBBDeparture[]> {
		const data = await this.fetchApi(`/stops/${stationId}/departures`, {
			duration,
			linesOfStops: true,
		});

		return data.departures || [];
	}

	// Get real-time information for a trip
	async getTripInfo(tripId: string): Promise<any> {
		return await this.fetchApi(`/trips/${tripId}`);
	}

	// Get radar (vehicles in area)
	async getRadar(
		north: number,
		west: number,
		south: number,
		east: number,
		results = 256
	): Promise<any[]> {
		const data = await this.fetchApi("/radar", {
			north,
			west,
			south,
			east,
			results,
			duration: 30,
		});

		return data.movements || [];
	}
}

export const vbbApi = new VBBApiService();
