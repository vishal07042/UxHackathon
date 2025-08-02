import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, List, Map, Bus, Route, Activity } from "lucide-react";
import JourneyPlanner from "../components/JourneyPlanner";
import JourneyResults from "../components/JourneyResults";
import LoadingOverlay from "../components/LoadingOverlay";
import UniversalMap, {
	MapLocation,
	MapRoute,
} from "../components/UniversalMap";
import ErrorBoundary from "../components/ErrorBoundary";
import SmartSuggestions from "../components/SmartSuggestions";
import {
	MobileOptimizedLayout,
	MobileCard,
} from "../components/MobileOptimizedLayout";
import BusBooking from "../components/BusBooking";
import BookingStatus from "../components/BookingStatus";
import BookingNotifications, {
	useBookingNotifications,
} from "../components/BookingNotifications";
import MultiModalPlanner from "../components/MultiModalPlanner";
import AgentCoordinationDashboard from "../components/AgentCoordinationDashboard";
import { PlannerAgent } from "../agents/plannerAgent";
import { Journey, JourneyPlan } from "../types";
import "../styles/journey.css";

const JourneyPageContent = () => {
	const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
	const [journeyPlans, setJourneyPlans] = useState<JourneyPlan[]>([]);
	const [isPlanning, setIsPlanning] = useState(false);
	const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
	const [mapRoutes, setMapRoutes] = useState<MapRoute[]>([]);
	const [showBooking, setShowBooking] = useState(false);
	const [completedBooking, setCompletedBooking] = useState<any>(null);
	const {
		notifications,
		dismissNotification,
		notifyBookingSuccess,
		notifyBookingFailed,
	} = useBookingNotifications();

	const plannerAgent = new PlannerAgent();

	const handleJourneyPlan = async (journey: Journey) => {
		setIsPlanning(true);
		setCurrentJourney(journey);
		setJourneyPlans([]);

		try {
			// Plan the journey
			const result = await plannerAgent.planJourney(journey, {
				onAgentLog: () => {}, // Simplified - no logs
				onRealtimeUpdate: () => {}, // Simplified - no updates
			});

			setJourneyPlans(result.plans);

			// Update map with journey locations
			await updateMapLocations(journey, result.plans);
		} catch (error) {
			console.error("Journey planning failed:", error);
		} finally {
			setIsPlanning(false);
		}
	};

	const updateMapLocations = async (
		journey: Journey,
		plans: JourneyPlan[]
	) => {
		try {
			// Import geocoding function
			const { geocodeLocation } = await import(
				"../components/UniversalMap"
			);

			const locations: MapLocation[] = [];
			const routes: MapRoute[] = [];

			// Geocode origin and destination
			const originLocation = await geocodeLocation(journey.source);
			const destinationLocation = await geocodeLocation(
				journey.destination
			);

			if (originLocation) {
				locations.push({
					...originLocation,
					type: "origin",
				});
			}

			if (destinationLocation) {
				locations.push({
					...destinationLocation,
					type: "destination",
				});
			}

			// Add route visualization for the best plan
			if (plans.length > 0 && originLocation && destinationLocation) {
				routes.push({
					id: "main-route",
					name: "Journey Route",
					coordinates: [
						[originLocation.latitude, originLocation.longitude],
						[
							destinationLocation.latitude,
							destinationLocation.longitude,
						],
					],
					color: "#3b82f6",
					mode: "mixed",
				});
			}

			setMapLocations(locations);
			setMapRoutes(routes);
		} catch (error) {
			console.error("Failed to update map locations:", error);
		}
	};

	const handleApplySuggestion = (suggestion: any) => {
		console.log("Applying suggestion:", suggestion);
		// Here you would implement the logic to apply the suggestion
		// For example, re-planning with different parameters
		if (currentJourney) {
			const modifiedJourney = { ...currentJourney };

			if (suggestion.action?.data?.departureOffset) {
				const newDepartureTime = new Date(currentJourney.departureTime);
				newDepartureTime.setMinutes(
					newDepartureTime.getMinutes() +
						suggestion.action.data.departureOffset
				);
				modifiedJourney.departureTime = newDepartureTime;
			}

			if (suggestion.action?.data?.weatherOptimized) {
				modifiedJourney.preference = "comfortable";
			}

			// Re-plan with modified journey
			handleJourneyPlan(modifiedJourney);
		}
	};

	const handleBookingComplete = (bookingDetails: any) => {
		setCompletedBooking(bookingDetails);
		setShowBooking(false);

		// Show success notification
		if (bookingDetails.success) {
			notifyBookingSuccess(bookingDetails);
		} else {
			notifyBookingFailed(bookingDetails.error || "Booking failed");
		}
	};

	const pageVariants = {
		initial: { opacity: 0, y: 20 },
		animate: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: "easeOut",
			},
		},
		exit: {
			opacity: 0,
			y: -20,
			transition: {
				duration: 0.3,
			},
		},
	};

	return (
		<motion.div
			variants={pageVariants}
			initial='initial'
			animate='animate'
			exit='exit'
			className='min-h-screen'
		>
			{/* Loading Overlay */}
			<AnimatePresence>
				{isPlanning && <LoadingOverlay />}
			</AnimatePresence>

			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Desktop Layout */}
				<motion.div className='hidden lg:grid lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)] items-start'>
					{/* Left Half - Journey Planner & Results */}
					<motion.div
						className='space-y-6 w-full'
						initial={{ x: -100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{
							delay: 0.2,
							type: "spring",
							stiffness: 100,
						}}
					>
						{/* Journey Planner */}
						<motion.div
							className='journey-planner-component relative z-10'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
						>
							<JourneyPlanner
								onPlan={handleJourneyPlan}
								isPlanning={isPlanning}
							/>
						</motion.div>

						{/* Journey Results */}
						<motion.div
							className='journey-results-component relative z-10'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<JourneyResults
								plans={journeyPlans}
								isLoading={isPlanning}
								journey={currentJourney}
								onBookBus={() => setShowBooking(true)}
							/>
						</motion.div>

						{/* Multi-Modal Planner */}
						{!showBooking && !completedBooking && (
							<motion.div
								className='multimodal-planner-component relative z-10'
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<MultiModalPlanner
									initialOrigin={currentJourney?.source || ""}
									initialDestination={
										currentJourney?.destination || ""
									}
									onJourneySelected={(journey) => {
										console.log(
											"Journey selected:",
											journey
										);
									}}
								/>
							</motion.div>
						)}

						{/* Smart Suggestions */}
						{currentJourney &&
							journeyPlans.length > 0 &&
							!showBooking && (
								<motion.div
									className='smart-suggestions-component relative z-10'
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
								>
									<SmartSuggestions
										journey={currentJourney}
										currentPlans={journeyPlans}
										onApplySuggestion={
											handleApplySuggestion
										}
										isVisible={!isPlanning}
									/>
								</motion.div>
							)}

						{/* Bus Booking */}
						{showBooking && (
							<motion.div
								className='booking-component relative z-10'
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<BusBooking
									initialSource={currentJourney?.source || ""}
									initialDestination={
										currentJourney?.destination || ""
									}
									onBookingComplete={handleBookingComplete}
								/>
							</motion.div>
						)}

						{/* Booking Status */}
						{completedBooking && (
							<motion.div
								className='booking-status-component relative z-10'
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<BookingStatus
									booking={completedBooking}
									onClose={() => setCompletedBooking(null)}
								/>
							</motion.div>
						)}

						{/* Agent Coordination Dashboard */}
						<motion.div
							className='coordination-dashboard-component relative z-10'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
						>
							<AgentCoordinationDashboard />
						</motion.div>
					</motion.div>

					{/* Right Half - Large Map */}
					<motion.div
						className='w-full h-full'
						initial={{ x: 100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{
							delay: 0.3,
							type: "spring",
							stiffness: 100,
						}}
					>
						<motion.div
							className='map-component bg-surface-overlay/90 backdrop-blur-lg rounded-3xl shadow-elevation-medium p-4 border border-border-secondary sticky top-8 w-full h-[calc(100vh-200px)] z-20'
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.4 }}
						>
							<motion.div
								className='flex items-center justify-between mb-6 w-full px-2'
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								<div>
									<h3 className='text-lg font-bold text-text-primary'>
										Live Journey Map
									</h3>
									<p className='text-sm text-text-secondary'>
										Interactive route & vehicle tracking
									</p>
								</div>
								<motion.div
									className='flex items-center gap-2'
									whileHover={{ scale: 1.05 }}
								>
									<motion.div
										className='w-2 h-2 bg-neon-green rounded-full'
										animate={{ opacity: [1, 0.3, 1] }}
										transition={{
											duration: 2,
											repeat: Infinity,
										}}
									/>
									<span className='text-xs font-medium text-neon-green'>
										Live Tracking
									</span>
								</motion.div>
							</motion.div>

							<div className='h-[calc(100vh-300px)] rounded-2xl overflow-hidden'>
								<UniversalMap
									locations={mapLocations}
									routes={mapRoutes}
									showSearch={true}
									showVehicles={true}
									showTraffic={true}
									showTrafficControls={true}
									journey={currentJourney}
									className='h-full w-full'
								/>
							</div>
						</motion.div>
					</motion.div>
				</motion.div>

				{/* Mobile Layout */}
				<div className='lg:hidden'>
					<MobileOptimizedLayout
						tabs={[
							{
								id: "planner",
								label: "Plan",
								icon: <Navigation className='w-5 h-5' />,
								component: (
									<div className='p-4 space-y-4'>
										<MobileCard
											title='Plan Your Journey'
											subtitle='Smart AI-powered route optimization'
											icon={
												<Navigation className='w-5 h-5 text-white' />
											}
										>
											<JourneyPlanner
												onPlan={handleJourneyPlan}
												isPlanning={isPlanning}
											/>
										</MobileCard>
									</div>
								),
							},
							{
								id: "results",
								label: "Routes",
								icon: <List className='w-5 h-5' />,
								component: (
									<div className='p-4 space-y-4'>
										<MobileCard
											title='Journey Options'
											subtitle={`${journeyPlans.length} routes found`}
											collapsible={false}
										>
											<JourneyResults
												plans={journeyPlans}
												isLoading={isPlanning}
												journey={currentJourney}
											/>
										</MobileCard>

										{currentJourney &&
											journeyPlans.length > 0 && (
												<MobileCard
													title='Smart Suggestions'
													subtitle='AI-powered recommendations'
													collapsible={true}
													defaultExpanded={false}
												>
													<SmartSuggestions
														journey={currentJourney}
														currentPlans={
															journeyPlans
														}
														onApplySuggestion={
															handleApplySuggestion
														}
														isVisible={!isPlanning}
													/>
												</MobileCard>
											)}
									</div>
								),
							},
							{
								id: "multimodal",
								label: "Multi-Modal",
								icon: <Route className='w-5 h-5' />,
								component: (
									<div className='p-4 space-y-4'>
										<MobileCard
											title='Multi-Modal Journey Planner'
											subtitle='AI-powered collaborative transportation'
											collapsible={false}
										>
											<MultiModalPlanner
												initialOrigin={
													currentJourney?.source || ""
												}
												initialDestination={
													currentJourney?.destination ||
													""
												}
												onJourneySelected={(
													journey
												) => {
													console.log(
														"Journey selected:",
														journey
													);
												}}
											/>
										</MobileCard>
									</div>
								),
							},
							{
								id: "booking",
								label: "Book",
								icon: <Bus className='w-5 h-5' />,
								component: (
									<div className='p-4 space-y-4'>
										{!completedBooking ? (
											<MobileCard
												title='Bus Booking'
												subtitle='AI-powered smart booking'
												collapsible={false}
											>
												<BusBooking
													initialSource={
														currentJourney?.source ||
														""
													}
													initialDestination={
														currentJourney?.destination ||
														""
													}
													onBookingComplete={
														handleBookingComplete
													}
												/>
											</MobileCard>
										) : (
											<MobileCard
												title='Booking Confirmed'
												subtitle={`PNR: ${completedBooking.pnr}`}
												collapsible={false}
											>
												<BookingStatus
													booking={completedBooking}
													onClose={() =>
														setCompletedBooking(
															null
														)
													}
													showFullDetails={true}
												/>
											</MobileCard>
										)}
									</div>
								),
							},
							{
								id: "coordination",
								label: "Agents",
								icon: <Activity className='w-5 h-5' />,
								component: (
									<div className='p-4 space-y-4'>
										<MobileCard
											title='Agent Coordination'
											subtitle='Real-time transportation collaboration'
											collapsible={false}
										>
											<AgentCoordinationDashboard />
										</MobileCard>
									</div>
								),
							},
							{
								id: "map",
								label: "Map",
								icon: <Map className='w-5 h-5' />,
								component: (
									<div className='h-full'>
										<UniversalMap
											locations={mapLocations}
											routes={mapRoutes}
											showSearch={true}
											showVehicles={true}
											showTraffic={true}
											showTrafficControls={true}
											journey={currentJourney}
											className='h-full w-full'
										/>
									</div>
								),
							},
						]}
						defaultTab='planner'
					/>
				</div>
			</main>

			{/* Booking Notifications */}
			<BookingNotifications
				notifications={notifications}
				onDismiss={dismissNotification}
				position='top-right'
			/>
		</motion.div>
	);
};

const JourneyPage = () => {
	return (
		<ErrorBoundary>
			<JourneyPageContent />
		</ErrorBoundary>
	);
};

export default JourneyPage;
