import React, { useEffect, useRef, useState } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import TrafficLayer from "./TrafficLayer";
import TrafficControls from "./TrafficControls";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export interface MapLocation {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	type?: "origin" | "destination" | "stop" | "waypoint";
	address?: string;
}

export interface MapRoute {
	id: string;
	name: string;
	coordinates: [number, number][];
	color: string;
	mode: string;
	dashArray?: string;
}

// Component to fit map bounds to show all markers
const MapBounds: React.FC<{ locations: MapLocation[] }> = ({ locations }) => {
	const map = useMap();

	useEffect(() => {
		if (locations.length > 0) {
			const bounds = L.latLngBounds(
				locations.map((loc) => [loc.latitude, loc.longitude])
			);
			map.fitBounds(bounds, { padding: [20, 20] });
		}
	}, [locations, map]);

	return null;
};

// Geocoding service to get coordinates from place names
const geocodeLocation = async (
	locationName: string
): Promise<MapLocation | null> => {
	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
				locationName
			)}&limit=1`
		);
		const data = await response.json();

		if (data && data.length > 0) {
			const result = data[0];
			return {
				id: `geocoded-${Date.now()}`,
				name: result.display_name,
				latitude: parseFloat(result.lat),
				longitude: parseFloat(result.lon),
				address: result.display_name,
			};
		}
	} catch (error) {
		console.error("Geocoding failed:", error);
	}
	return null;
};

// Create custom icons for different location types
const createLocationIcon = (type: string, color: string) => {
	const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 14px;
      color: white;
      font-weight: bold;
    ">
      ${getLocationSymbol(type)}
    </div>
  `;

	return L.divIcon({
		html: iconHtml,
		className: "custom-location-icon",
		iconSize: [30, 30],
		iconAnchor: [15, 15],
		popupAnchor: [0, -15],
	});
};

const getLocationSymbol = (type: string): string => {
	switch (type) {
		case "origin":
			return "🟢";
		case "destination":
			return "🔴";
		case "stop":
			return "🚏";
		case "waypoint":
			return "📍";
		default:
			return "📍";
	}
};

const getLocationColor = (type: string): string => {
	switch (type) {
		case "origin":
			return "#22c55e";
		case "destination":
			return "#ef4444";
		case "stop":
			return "#3b82f6";
		case "waypoint":
			return "#8b5cf6";
		default:
			return "#6b7280";
	}
};

export interface LiveVehicle {
	id: string;
	type: "bus" | "metro" | "tram" | "taxi" | "bike";
	latitude: number;
	longitude: number;
	heading: number;
	speed: number;
	line?: string;
	destination?: string;
	occupancy?: "low" | "medium" | "high";
	eta?: number; // minutes
}

interface UniversalMapProps {
	locations: MapLocation[];
	routes?: MapRoute[];
	center?: [number, number];
	zoom?: number;
	onLocationSelect?: (location: MapLocation) => void;
	className?: string;
	showSearch?: boolean;
	showVehicles?: boolean;
	showTraffic?: boolean;
	showTrafficControls?: boolean;
	journey?: any;
}

const UniversalMap: React.FC<UniversalMapProps> = ({
	locations,
	routes = [],
	center = [52.52, 13.405], // Default to Berlin
	zoom = 12,
	onLocationSelect,
	className = "",
	showSearch = false,
	showVehicles = false,
	showTraffic = false,
	showTrafficControls = false,
	journey,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<MapLocation[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
	const [showVehicleDetails, setShowVehicleDetails] = useState(false);

	// Traffic state
	const [trafficEnabled, setTrafficEnabled] = useState(showTraffic);
	const [trafficIncidentsEnabled, setTrafficIncidentsEnabled] =
		useState(true);
	const [trafficConditionsEnabled, setTrafficConditionsEnabled] =
		useState(true);
	const [trafficLastUpdate, setTrafficLastUpdate] = useState<Date | null>(
		null
	);

	// Handle location search
	const handleSearch = async (query: string) => {
		if (query.length < 3) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const result = await geocodeLocation(query);
			if (result) {
				setSearchResults([result]);
			} else {
				setSearchResults([]);
			}
		} catch (error) {
			console.error("Search failed:", error);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchQuery) {
				handleSearch(searchQuery);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Generate mock live vehicles around the journey area
	const generateLiveVehicles = (
		journeyLocations: MapLocation[]
	): LiveVehicle[] => {
		if (journeyLocations.length < 2) return [];

		const vehicles: LiveVehicle[] = [];
		const vehicleTypes: LiveVehicle["type"][] = [
			"bus",
			"metro",
			"tram",
			"taxi",
			"bike",
		];

		// Generate vehicles around origin and destination
		journeyLocations.forEach((location, index) => {
			const baseCount = index === 0 ? 8 : 6; // More vehicles around origin

			for (let i = 0; i < baseCount; i++) {
				const offsetLat = (Math.random() - 0.5) * 0.01; // ~500m radius
				const offsetLng = (Math.random() - 0.5) * 0.01;
				const vehicleType =
					vehicleTypes[
						Math.floor(Math.random() * vehicleTypes.length)
					];

				vehicles.push({
					id: `vehicle-${location.id}-${i}`,
					type: vehicleType,
					latitude: location.latitude + offsetLat,
					longitude: location.longitude + offsetLng,
					heading: Math.random() * 360,
					speed: Math.random() * 50 + 10, // 10-60 km/h
					line:
						vehicleType === "bus"
							? `Bus ${Math.floor(Math.random() * 200) + 1}`
							: vehicleType === "metro"
							? `U${Math.floor(Math.random() * 9) + 1}`
							: vehicleType === "tram"
							? `Tram ${Math.floor(Math.random() * 20) + 1}`
							: undefined,
					destination: index === 0 ? "City Center" : "Suburbs",
					occupancy: ["low", "medium", "high"][
						Math.floor(Math.random() * 3)
					] as LiveVehicle["occupancy"],
					eta: Math.floor(Math.random() * 15) + 2, // 2-17 minutes
				});
			}
		});

		// Add some vehicles along the route
		if (routes.length > 0) {
			const route = routes[0];
			for (let i = 0; i < 4; i++) {
				const progress = (i + 1) / 5; // Distribute along route
				const startCoord = route.coordinates[0];
				const endCoord =
					route.coordinates[route.coordinates.length - 1];

				const lat =
					startCoord[0] + (endCoord[0] - startCoord[0]) * progress;
				const lng =
					startCoord[1] + (endCoord[1] - startCoord[1]) * progress;

				vehicles.push({
					id: `route-vehicle-${i}`,
					type: route.mode === "mixed" ? "bus" : "metro",
					latitude: lat + (Math.random() - 0.5) * 0.002,
					longitude: lng + (Math.random() - 0.5) * 0.002,
					heading:
						(Math.atan2(
							endCoord[1] - startCoord[1],
							endCoord[0] - startCoord[0]
						) *
							180) /
						Math.PI,
					speed: Math.random() * 40 + 20,
					line: `Route ${i + 1}`,
					destination: "En Route",
					occupancy: ["medium", "high"][
						Math.floor(Math.random() * 2)
					] as LiveVehicle["occupancy"],
					eta: Math.floor(Math.random() * 10) + 1,
				});
			}
		}

		return vehicles;
	};

	// Update vehicles when locations change
	useEffect(() => {
		if (showVehicles && locations.length > 0) {
			const vehicles = generateLiveVehicles(locations);
			setLiveVehicles(vehicles);

			// Simulate vehicle movement
			const interval = setInterval(() => {
				setLiveVehicles((prevVehicles) =>
					prevVehicles.map((vehicle) => ({
						...vehicle,
						latitude:
							vehicle.latitude + (Math.random() - 0.5) * 0.0001,
						longitude:
							vehicle.longitude + (Math.random() - 0.5) * 0.0001,
						heading: vehicle.heading + (Math.random() - 0.5) * 10,
						eta: Math.max(1, vehicle.eta! - 0.1),
					}))
				);
			}, 3000); // Update every 3 seconds

			return () => clearInterval(interval);
		}
	}, [showVehicles, locations, routes]);

	// Create vehicle icons
	const createVehicleIcon = (vehicle: LiveVehicle) => {
		const colors = {
			bus: "#22c55e",
			metro: "#3b82f6",
			tram: "#f59e0b",
			taxi: "#ef4444",
			bike: "#8b5cf6",
		};

		const symbols = {
			bus: "🚌",
			metro: "🚇",
			tram: "🚊",
			taxi: "🚕",
			bike: "🚲",
		};

		const occupancyColor = {
			low: "#22c55e",
			medium: "#f59e0b",
			high: "#ef4444",
		};

		const iconHtml = `
      <div style="
        position: relative;
        transform: rotate(${vehicle.heading}deg);
      ">
        <div style="
          background-color: ${colors[vehicle.type]};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-size: 12px;
          position: relative;
        ">
          ${symbols[vehicle.type]}
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background-color: ${occupancyColor[vehicle.occupancy!]};
            border-radius: 50%;
            border: 1px solid white;
          "></div>
        </div>
      </div>
    `;

		return L.divIcon({
			html: iconHtml,
			className: "vehicle-icon",
			iconSize: [24, 24],
			iconAnchor: [12, 12],
			popupAnchor: [0, -12],
		});
	};

	// Determine map center based on locations
	const mapCenter =
		locations.length > 0
			? ([locations[0].latitude, locations[0].longitude] as [
					number,
					number
			  ])
			: center;

	return (
		<motion.div
			className={`relative ${className}`}
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Search bar */}
			{showSearch && (
				<motion.div
					className='absolute top-4 left-4 right-4 z-10'
					initial={{ y: -50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<div className='bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg'>
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder='Search for a location...'
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
						{isSearching && (
							<div className='mt-2 text-sm text-gray-600'>
								Searching...
							</div>
						)}
						{searchResults.length > 0 && (
							<div className='mt-2 space-y-1'>
								{searchResults.map((result) => (
									<button
										key={result.id}
										onClick={() =>
											onLocationSelect?.(result)
										}
										className='w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm'
									>
										{result.name}
									</button>
								))}
							</div>
						)}
					</div>
				</motion.div>
			)}

			{/* Live Vehicle Stats Panel */}
			{showVehicles && liveVehicles.length > 0 && (
				<motion.div
					className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10 min-w-48'
					initial={{ x: 50, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					<div className='flex items-center gap-2 mb-2'>
						<motion.div
							className='w-3 h-3 bg-green-500 rounded-full'
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
						<div className='text-sm font-semibold'>
							Live Transport
						</div>
					</div>

					<div className='space-y-1 text-xs'>
						{Object.entries(
							liveVehicles.reduce((acc, vehicle) => {
								acc[vehicle.type] =
									(acc[vehicle.type] || 0) + 1;
								return acc;
							}, {} as Record<string, number>)
						).map(([type, count]) => (
							<div key={type} className='flex justify-between'>
								<span className='capitalize'>{type}s:</span>
								<span className='font-medium'>{count}</span>
							</div>
						))}
					</div>

					<div className='mt-2 pt-2 border-t text-xs text-gray-500'>
						Updated: {new Date().toLocaleTimeString()}
					</div>
				</motion.div>
			)}

			<MapContainer
				center={mapCenter}
				zoom={zoom}
				style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
				className='z-0'
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>

				<MapBounds locations={locations} />

				{/* Routes */}
				{routes.map((route) => (
					<Polyline
						key={route.id}
						positions={route.coordinates}
						color={route.color}
						weight={4}
						opacity={0.8}
						dashArray={route.dashArray}
					/>
				))}

				{/* Location markers */}
				{locations.map((location) => (
					<Marker
						key={location.id}
						position={[location.latitude, location.longitude]}
						icon={createLocationIcon(
							location.type || "waypoint",
							getLocationColor(location.type || "waypoint")
						)}
						eventHandlers={{
							click: () => onLocationSelect?.(location),
						}}
					>
						<Popup>
							<div className='text-sm'>
								<strong>{location.name}</strong>
								<br />
								{location.address && (
									<>
										{location.address}
										<br />
									</>
								)}
								<div className='text-xs text-gray-500 capitalize mt-1'>
									{location.type || "Location"}
								</div>
								{onLocationSelect && (
									<button
										className='mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600'
										onClick={() =>
											onLocationSelect(location)
										}
									>
										Select Location
									</button>
								)}
							</div>
						</Popup>
					</Marker>
				))}

				{/* Search result markers */}
				{searchResults.map((result) => (
					<Marker
						key={result.id}
						position={[result.latitude, result.longitude]}
						icon={createLocationIcon("waypoint", "#f59e0b")}
						eventHandlers={{
							click: () => onLocationSelect?.(result),
						}}
					>
						<Popup>
							<div className='text-sm'>
								<strong>Search Result</strong>
								<br />
								{result.name}
								<br />
								<button
									className='mt-2 px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600'
									onClick={() => onLocationSelect?.(result)}
								>
									Use This Location
								</button>
							</div>
						</Popup>
					</Marker>
				))}

				{/* Live Vehicle Markers */}
				{showVehicles &&
					liveVehicles.map((vehicle) => (
						<Marker
							key={vehicle.id}
							position={[vehicle.latitude, vehicle.longitude]}
							icon={createVehicleIcon(vehicle)}
						>
							<Popup>
								<div className='text-sm'>
									<div className='flex items-center gap-2 mb-2'>
										<strong className='capitalize'>
											{vehicle.type}
										</strong>
										<span
											className={`px-2 py-1 rounded-full text-xs text-white ${
												vehicle.occupancy === "low"
													? "bg-green-500"
													: vehicle.occupancy ===
													  "medium"
													? "bg-yellow-500"
													: "bg-red-500"
											}`}
										>
											{vehicle.occupancy} capacity
										</span>
									</div>
									{vehicle.line && (
										<div>
											<strong>Line:</strong>{" "}
											{vehicle.line}
										</div>
									)}
									{vehicle.destination && (
										<div>
											<strong>To:</strong>{" "}
											{vehicle.destination}
										</div>
									)}
									<div>
										<strong>Speed:</strong>{" "}
										{Math.round(vehicle.speed)} km/h
									</div>
									{vehicle.eta && (
										<div>
											<strong>ETA:</strong>{" "}
											{Math.round(vehicle.eta)} min
										</div>
									)}
									<div className='mt-2 text-xs text-gray-500'>
										Live tracking • Updated{" "}
										{new Date().toLocaleTimeString()}
									</div>
								</div>
							</Popup>
						</Marker>
					))}
			</MapContainer>

			{/* Map legend */}
			<motion.div
				className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10 max-w-xs'
				initial={{ y: 50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.3 }}
			>
				<div className='flex items-center justify-between mb-2'>
					<div className='text-xs font-semibold'>Legend</div>
					{showVehicles && (
						<motion.button
							onClick={() =>
								setShowVehicleDetails(!showVehicleDetails)
							}
							className='text-xs text-blue-600 hover:text-blue-800'
							whileHover={{ scale: 1.05 }}
						>
							{showVehicleDetails ? "Hide" : "Show"} Vehicles
						</motion.button>
					)}
				</div>

				<div className='space-y-1 text-xs'>
					{/* Location Legend */}
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-green-500 rounded-full'></div>
						<span>Origin</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-red-500 rounded-full'></div>
						<span>Destination</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-blue-500 rounded-full'></div>
						<span>Stop</span>
					</div>

					{/* Vehicle Legend */}
					{showVehicles && showVehicleDetails && (
						<motion.div
							className='border-t pt-2 mt-2'
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
						>
							<div className='text-xs font-semibold mb-1'>
								Live Vehicles
							</div>
							<div className='flex items-center gap-2'>
								<span>🚌</span>
								<span>Bus</span>
							</div>
							<div className='flex items-center gap-2'>
								<span>🚇</span>
								<span>Metro</span>
							</div>
							<div className='flex items-center gap-2'>
								<span>🚊</span>
								<span>Tram</span>
							</div>
							<div className='flex items-center gap-2'>
								<span>🚕</span>
								<span>Taxi</span>
							</div>
							<div className='flex items-center gap-2'>
								<span>🚲</span>
								<span>Bike</span>
							</div>

							<div className='text-xs text-gray-500 mt-1'>
								Capacity: 🟢 Low • 🟡 Medium • 🔴 High
							</div>
						</motion.div>
					)}
				</div>

				{showVehicles && (
					<motion.div
						className='mt-2 pt-2 border-t text-xs text-gray-500'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className='flex items-center gap-1'>
							<motion.div
								className='w-2 h-2 bg-green-500 rounded-full'
								animate={{ opacity: [1, 0.3, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
							<span>{liveVehicles.length} vehicles tracked</span>
						</div>
					</motion.div>
				)}
			</motion.div>
		</motion.div>
	);
};

export default UniversalMap;
export { geocodeLocation, type MapLocation, type MapRoute };
