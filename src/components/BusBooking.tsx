import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Bus,
	Clock,
	MapPin,
	Users,
	Star,
	Wifi,
	Zap,
	Coffee,
	Shield,
	CreditCard,
	CheckCircle,
	AlertCircle,
	Filter,
	SortAsc,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
	redBusApi,
	BusRoute,
	SearchFilters,
	Seat,
} from "../services/redBusApi";
import {
	aiBookingAssistant,
	UserPreferences,
} from "../services/aiBookingAssistant";
import SeatSelection from "./SeatSelection";
import AIBookingChat from "./AIBookingChat";

interface BusBookingProps {
	initialSource?: string;
	initialDestination?: string;
	onBookingComplete?: (bookingDetails: any) => void;
}

export const BusBooking: React.FC<BusBookingProps> = ({
	initialSource = "",
	initialDestination = "",
	onBookingComplete,
}) => {
	const [source, setSource] = useState(initialSource);
	const [destination, setDestination] = useState(initialDestination);
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [passengers, setPassengers] = useState(1);
	const [isSearching, setIsSearching] = useState(false);
	const [routes, setRoutes] = useState<BusRoute[]>([]);
	const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<SearchFilters>({});
	const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
	const [showAiAssistant, setShowAiAssistant] = useState(false);
	const [showSeatSelection, setShowSeatSelection] = useState(false);

	const searchBuses = async () => {
		if (!source || !destination || !date) return;

		setIsSearching(true);
		try {
			const results = await redBusApi.searchBuses(
				source,
				destination,
				date,
				filters
			);
			setRoutes(results);

			// Get AI recommendations
			const userPrefs: UserPreferences = {
				seatPreference: "any",
				timePreference: "any",
				pricePreference: "any",
				operatorPreferences: [],
				amenityPreferences: [],
			};

			const aiResult = await aiBookingAssistant.autoBook(
				source,
				destination,
				date,
				passengers,
				userPrefs,
				"demo-user",
				false
			);

			if (aiResult.recommendations) {
				setAiRecommendations(aiResult.recommendations);
			}
		} catch (error) {
			console.error("Search failed:", error);
		} finally {
			setIsSearching(false);
		}
	};

	const getAmenityIcon = (amenity: string) => {
		switch (amenity.toLowerCase()) {
			case "wifi":
				return <Wifi className='w-4 h-4' />;
			case "charging point":
				return <Zap className='w-4 h-4' />;
			case "snacks":
				return <Coffee className='w-4 h-4' />;
			default:
				return <Shield className='w-4 h-4' />;
		}
	};

	const handleQuickBook = async (route: BusRoute) => {
		const userPrefs: UserPreferences = {
			seatPreference: "window",
			timePreference: "any",
			pricePreference: "comfort",
			operatorPreferences: [],
			amenityPreferences: [],
		};

		try {
			const result = await aiBookingAssistant.autoBook(
				source,
				destination,
				date,
				passengers,
				userPrefs,
				"demo-user",
				true
			);

			if (result.success && onBookingComplete) {
				onBookingComplete(result);
			}
		} catch (error) {
			console.error("Quick booking failed:", error);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	// Show seat selection if a route is selected
	if (showSeatSelection && selectedRoute) {
		return (
			<SeatSelection
				route={selectedRoute}
				passengers={passengers}
				onBack={() => {
					setShowSeatSelection(false);
					setSelectedRoute(null);
				}}
				onBookingComplete={onBookingComplete}
			/>
		);
	}

	return (
		<motion.div
			className='bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary p-6'
			variants={containerVariants}
			initial='hidden'
			animate='visible'
		>
			{/* Header */}
			<motion.div
				variants={itemVariants}
				className='flex items-center gap-3 mb-6'
			>
				<motion.div
					className='p-2 bg-gradient-to-br from-neon-blue-accessible to-neon-purple-accessible rounded-lg'
					whileHover={{ scale: 1.05, rotate: 5 }}
					whileTap={{ scale: 0.95 }}
				>
					<Bus className='w-5 h-5 text-white' />
				</motion.div>
				<div>
					<h3 className='font-semibold text-text-primary'>
						Bus Booking
					</h3>
					<p className='text-sm text-text-secondary'>
						AI-powered smart booking system
					</p>
				</div>
			</motion.div>

			{/* Search Form */}
			<motion.div variants={itemVariants} className='space-y-4 mb-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						label='From'
						value={source}
						onChange={(e) => setSource(e.target.value)}
						placeholder='Enter source city'
						leftIcon={<MapPin className='w-4 h-4' />}
					/>
					<Input
						label='To'
						value={destination}
						onChange={(e) => setDestination(e.target.value)}
						placeholder='Enter destination city'
						leftIcon={<MapPin className='w-4 h-4' />}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						label='Date'
						type='date'
						value={date}
						onChange={(e) => setDate(e.target.value)}
						leftIcon={<Clock className='w-4 h-4' />}
					/>
					<Input
						label='Passengers'
						type='number'
						min='1'
						max='6'
						value={passengers.toString()}
						onChange={(e) =>
							setPassengers(parseInt(e.target.value) || 1)
						}
						leftIcon={<Users className='w-4 h-4' />}
					/>
				</div>

				<div className='flex gap-3'>
					<Button
						onClick={searchBuses}
						loading={isSearching}
						loadingText='Searching...'
						leftIcon={<Bus className='w-4 h-4' />}
						className='flex-1'
					>
						Search Buses
					</Button>

					<Button
						variant='outline'
						onClick={() => setShowFilters(!showFilters)}
						leftIcon={<Filter className='w-4 h-4' />}
					>
						Filters
					</Button>

					<Button
						variant='outline'
						onClick={() => setShowAiAssistant(!showAiAssistant)}
						leftIcon={<Zap className='w-4 h-4' />}
					>
						AI Assistant
					</Button>
				</div>
			</motion.div>

			{/* Filters Panel */}
			<AnimatePresence>
				{showFilters && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className='mb-6 p-4 bg-surface-elevated rounded-xl border border-border-primary'
					>
						<h4 className='font-medium text-text-primary mb-3'>
							Filters
						</h4>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div>
								<label className='block text-sm font-medium text-text-primary mb-2'>
									Price Range
								</label>
								<div className='flex gap-2'>
									<Input
										placeholder='Min'
										type='number'
										size='sm'
										value={
											filters.priceRange?.min?.toString() ||
											""
										}
										onChange={(e) =>
											setFilters({
												...filters,
												priceRange: {
													...filters.priceRange,
													min:
														parseInt(
															e.target.value
														) || 0,
													max:
														filters.priceRange
															?.max || 5000,
												},
											})
										}
									/>
									<Input
										placeholder='Max'
										type='number'
										size='sm'
										value={
											filters.priceRange?.max?.toString() ||
											""
										}
										onChange={(e) =>
											setFilters({
												...filters,
												priceRange: {
													...filters.priceRange,
													min:
														filters.priceRange
															?.min || 0,
													max:
														parseInt(
															e.target.value
														) || 5000,
												},
											})
										}
									/>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-text-primary mb-2'>
									Sort By
								</label>
								<select
									className='w-full px-3 py-2 bg-surface-elevated border border-border-primary rounded-lg text-text-primary'
									value={filters.sortBy || ""}
									onChange={(e) =>
										setFilters({
											...filters,
											sortBy: e.target.value as any,
										})
									}
								>
									<option value=''>Select</option>
									<option value='price'>Price</option>
									<option value='duration'>Duration</option>
									<option value='rating'>Rating</option>
									<option value='departure'>
										Departure Time
									</option>
								</select>
							</div>

							<div className='flex items-end'>
								<Button
									onClick={searchBuses}
									size='sm'
									className='w-full'
								>
									Apply Filters
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* AI Assistant Panel */}
			<AnimatePresence>
				{showAiAssistant && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className='mb-6'
					>
						<AIBookingChat
							onBookingComplete={onBookingComplete || (() => {})}
							initialContext={{
								source,
								destination,
								date,
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* AI Recommendations */}
			<AnimatePresence>
				{aiRecommendations.length > 0 && !showAiAssistant && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className='mb-6 p-4 bg-gradient-to-r from-neon-purple-accessible/10 to-neon-blue-accessible/10 rounded-xl border border-neon-blue-accessible/20'
					>
						<div className='flex items-center gap-2 mb-3'>
							<Zap className='w-4 h-4 text-neon-blue-accessible' />
							<h4 className='font-medium text-text-primary'>
								AI Recommendations
							</h4>
						</div>
						<div className='space-y-2'>
							{aiRecommendations.slice(0, 2).map((rec, index) => (
								<div
									key={index}
									className='flex items-center justify-between p-2 bg-surface-elevated rounded-lg'
								>
									<div>
										<p className='text-sm font-medium text-text-primary'>
											{rec.title}
										</p>
										<p className='text-xs text-text-secondary'>
											{rec.description}
										</p>
									</div>
									<div className='flex items-center gap-2'>
										<span className='text-xs text-neon-green-accessible'>
											{rec.confidence}% confidence
										</span>
										{rec.savings && (
											<span className='text-xs text-success'>
												Save ₹{rec.savings}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Search Results */}
			<AnimatePresence>
				{routes.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='space-y-4'
					>
						<div className='flex items-center justify-between'>
							<h4 className='font-medium text-text-primary'>
								{routes.length} buses found
							</h4>
							<Button
								variant='ghost'
								size='sm'
								leftIcon={<SortAsc className='w-4 h-4' />}
							>
								Sort
							</Button>
						</div>

						{routes.map((route, index) => (
							<motion.div
								key={route.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className='p-4 bg-surface-elevated rounded-xl border border-border-primary hover:border-neon-blue-accessible/50 transition-all duration-200'
							>
								<div className='flex items-center justify-between mb-3'>
									<div>
										<h5 className='font-semibold text-text-primary'>
											{route.operatorName}
										</h5>
										<p className='text-sm text-text-secondary'>
											{route.busType}
										</p>
									</div>
									<div className='flex items-center gap-1'>
										<Star className='w-4 h-4 text-warning fill-current' />
										<span className='text-sm text-text-primary'>
											{route.rating.toFixed(1)}
										</span>
									</div>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
									<div>
										<p className='text-xs text-text-secondary'>
											Departure
										</p>
										<p className='font-medium text-text-primary'>
											{route.departureTime}
										</p>
									</div>
									<div>
										<p className='text-xs text-text-secondary'>
											Arrival
										</p>
										<p className='font-medium text-text-primary'>
											{route.arrivalTime}
										</p>
									</div>
									<div>
										<p className='text-xs text-text-secondary'>
											Duration
										</p>
										<p className='font-medium text-text-primary'>
											{route.duration}
										</p>
									</div>
									<div>
										<p className='text-xs text-text-secondary'>
											Available Seats
										</p>
										<p className='font-medium text-text-primary'>
											{route.availableSeats}
										</p>
									</div>
								</div>

								<div className='flex items-center gap-2 mb-4'>
									{route.amenities
										.slice(0, 4)
										.map((amenity, i) => (
											<div
												key={i}
												className='flex items-center gap-1 px-2 py-1 bg-surface-overlay rounded-lg'
											>
												{getAmenityIcon(amenity)}
												<span className='text-xs text-text-secondary'>
													{amenity}
												</span>
											</div>
										))}
								</div>

								<div className='flex items-center justify-between'>
									<div>
										<span className='text-2xl font-bold text-text-primary'>
											₹{route.fare}
										</span>
										<span className='text-sm text-text-secondary ml-1'>
											per seat
										</span>
									</div>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => {
												setSelectedRoute(route);
												setShowSeatSelection(true);
											}}
										>
											View Seats
										</Button>
										<Button
											size='sm'
											onClick={() =>
												handleQuickBook(route)
											}
											leftIcon={
												<Zap className='w-4 h-4' />
											}
										>
											Quick Book
										</Button>
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Empty State */}
			{!isSearching && routes.length === 0 && source && destination && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='text-center py-12'
				>
					<Bus className='w-16 h-16 text-text-muted mx-auto mb-4' />
					<h4 className='font-medium text-text-primary mb-2'>
						No buses found
					</h4>
					<p className='text-text-secondary'>
						Try adjusting your search criteria or date
					</p>
				</motion.div>
			)}
		</motion.div>
	);
};

export default BusBooking;
