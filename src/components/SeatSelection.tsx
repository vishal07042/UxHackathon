import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	User,
	UserX,
	Crown,
	MapPin,
	CreditCard,
	CheckCircle,
	AlertCircle,
	ArrowLeft,
	Zap,
} from "lucide-react";
import { Button } from "./ui/Button";
import {
	redBusApi,
	Seat,
	BusRoute,
	BookingRequest,
} from "../services/redBusApi";
import { aiBookingAssistant } from "../services/aiBookingAssistant";

interface SeatSelectionProps {
	route: BusRoute;
	passengers: number;
	onBack: () => void;
	onBookingComplete: (bookingDetails: any) => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({
	route,
	passengers,
	onBack,
	onBookingComplete,
}) => {
	const [seats, setSeats] = useState<Seat[]>([]);
	const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isBooking, setIsBooking] = useState(false);
	const [showPayment, setShowPayment] = useState(false);
	const [aiSuggestions, setAiSuggestions] = useState<Seat[]>([]);

	useEffect(() => {
		loadSeats();
	}, [route.id]);

	const loadSeats = async () => {
		setIsLoading(true);
		try {
			const seatLayout = await redBusApi.getSeatLayout(route.id);
			setSeats(seatLayout);

			// Get AI seat suggestions - simulate optimal seat selection
			const availableSeats = seatLayout.filter(
				(seat) => seat.isAvailable
			);
			const windowSeats = availableSeats.filter(
				(seat) => seat.type === "window"
			);
			const suggestions = windowSeats.slice(0, passengers);
			setAiSuggestions(suggestions);
		} catch (error) {
			console.error("Failed to load seats:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSeatClick = (seat: Seat) => {
		if (!seat.isAvailable) return;

		const isSelected = selectedSeats.find((s) => s.id === seat.id);

		if (isSelected) {
			setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
		} else if (selectedSeats.length < passengers) {
			setSelectedSeats([...selectedSeats, seat]);
		}
	};

	const applyAiSuggestions = () => {
		setSelectedSeats(aiSuggestions.slice(0, passengers));
	};

	const proceedToPayment = () => {
		if (selectedSeats.length === passengers) {
			setShowPayment(true);
		}
	};

	const handleBooking = async () => {
		setIsBooking(true);
		try {
			const bookingRequest: BookingRequest = {
				routeId: route.id,
				selectedSeats: selectedSeats.map((seat) => seat.id),
				pickupPointId: route.pickupPoints[0].id,
				dropPointId: route.dropPoints[0].id,
				passengerDetails: selectedSeats.map((seat, index) => ({
					name: `Passenger ${index + 1}`,
					age: 30,
					gender: "male" as const,
					seatId: seat.id,
				})),
				contactInfo: {
					email: "user@example.com",
					phone: "+1234567890",
				},
				paymentMethod: {
					type: "card",
					details: {},
				},
			};

			const booking = await redBusApi.bookSeats(bookingRequest);
			onBookingComplete({
				...booking,
				route,
				selectedSeats,
				totalAmount: selectedSeats.reduce(
					(sum, seat) => sum + seat.fare,
					0
				),
			});
		} catch (error) {
			console.error("Booking failed:", error);
		} finally {
			setIsBooking(false);
		}
	};

	const getSeatIcon = (seat: Seat) => {
		if (!seat.isAvailable) return <UserX className='w-4 h-4' />;
		if (selectedSeats.find((s) => s.id === seat.id))
			return <CheckCircle className='w-4 h-4' />;
		if (seat.type === "window") return <Crown className='w-4 h-4' />;
		return <User className='w-4 h-4' />;
	};

	const getSeatColor = (seat: Seat) => {
		if (!seat.isAvailable) return "bg-error/20 text-error border-error/30";
		if (selectedSeats.find((s) => s.id === seat.id))
			return "bg-success text-white border-success";
		if (aiSuggestions.find((s) => s.id === seat.id))
			return "bg-neon-blue-accessible/20 text-neon-blue-accessible border-neon-blue-accessible/50";
		if (seat.type === "window")
			return "bg-warning/20 text-warning border-warning/30";
		return "bg-surface-elevated text-text-primary border-border-primary hover:border-neon-blue-accessible/50";
	};

	const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.fare, 0);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{
						duration: 1,
						repeat: Infinity,
						ease: "linear",
					}}
					className='w-8 h-8 border-2 border-neon-blue-accessible border-t-transparent rounded-full'
				/>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary p-6'
		>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center gap-3'>
					<Button
						variant='ghost'
						size='sm'
						onClick={onBack}
						leftIcon={<ArrowLeft className='w-4 h-4' />}
					>
						Back
					</Button>
					<div>
						<h3 className='font-semibold text-text-primary'>
							Select Seats
						</h3>
						<p className='text-sm text-text-secondary'>
							{route.operatorName} • {route.busType}
						</p>
					</div>
				</div>

				<div className='text-right'>
					<p className='text-sm text-text-secondary'>
						Selected: {selectedSeats.length}/{passengers}
					</p>
					<p className='font-semibold text-text-primary'>
						₹{totalAmount}
					</p>
				</div>
			</div>

			{/* AI Suggestions */}
			{aiSuggestions.length > 0 && selectedSeats.length === 0 && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-6 p-4 bg-gradient-to-r from-neon-purple-accessible/10 to-neon-blue-accessible/10 rounded-xl border border-neon-blue-accessible/20'
				>
					<div className='flex items-center justify-between'>
						<div>
							<div className='flex items-center gap-2 mb-1'>
								<Zap className='w-4 h-4 text-neon-blue-accessible' />
								<h4 className='font-medium text-text-primary'>
									AI Recommendations
								</h4>
							</div>
							<p className='text-sm text-text-secondary'>
								Optimal seats selected based on your preferences
							</p>
						</div>
						<Button
							size='sm'
							onClick={applyAiSuggestions}
							leftIcon={<Zap className='w-4 h-4' />}
						>
							Apply
						</Button>
					</div>
				</motion.div>
			)}

			{/* Seat Layout */}
			<div className='mb-6'>
				<div className='bg-surface-elevated rounded-xl p-4 mb-4'>
					<div className='flex items-center justify-center mb-4'>
						<div className='w-16 h-8 bg-border-primary rounded-t-lg flex items-center justify-center'>
							<span className='text-xs text-text-secondary'>
								Driver
							</span>
						</div>
					</div>

					<div className='grid grid-cols-4 gap-2 max-w-md mx-auto'>
						{seats.map((seat) => (
							<motion.button
								key={seat.id}
								onClick={() => handleSeatClick(seat)}
								disabled={!seat.isAvailable}
								className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-200
                  ${getSeatColor(seat)}
                  ${
						seat.isAvailable
							? "cursor-pointer hover:scale-105"
							: "cursor-not-allowed"
					}
                `}
								whileHover={
									seat.isAvailable ? { scale: 1.05 } : {}
								}
								whileTap={
									seat.isAvailable ? { scale: 0.95 } : {}
								}
							>
								<div className='text-center'>
									{getSeatIcon(seat)}
									<div className='text-xs mt-1'>
										{seat.number}
									</div>
								</div>
							</motion.button>
						))}
					</div>
				</div>

				{/* Legend */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-surface-elevated border border-border-primary rounded'></div>
						<span className='text-text-secondary'>Available</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-success rounded'></div>
						<span className='text-text-secondary'>Selected</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-error/20 border border-error/30 rounded'></div>
						<span className='text-text-secondary'>Occupied</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-neon-blue-accessible/20 border border-neon-blue-accessible/50 rounded'></div>
						<span className='text-text-secondary'>
							AI Suggested
						</span>
					</div>
				</div>
			</div>

			{/* Selected Seats Summary */}
			<AnimatePresence>
				{selectedSeats.length > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className='mb-6 p-4 bg-surface-elevated rounded-xl border border-border-primary'
					>
						<h4 className='font-medium text-text-primary mb-3'>
							Selected Seats
						</h4>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{selectedSeats.map((seat, index) => (
								<div
									key={seat.id}
									className='flex items-center justify-between p-2 bg-surface-overlay rounded-lg'
								>
									<div>
										<span className='font-medium text-text-primary'>
											Seat {seat.number}
										</span>
										<span className='text-sm text-text-secondary ml-2'>
											({seat.type} • {seat.position})
										</span>
									</div>
									<span className='font-medium text-text-primary'>
										₹{seat.fare}
									</span>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Action Buttons */}
			<div className='flex gap-3'>
				<Button
					onClick={proceedToPayment}
					disabled={selectedSeats.length !== passengers}
					className='flex-1'
					leftIcon={<CreditCard className='w-4 h-4' />}
				>
					Proceed to Payment (₹{totalAmount})
				</Button>
			</div>

			{/* Payment Modal */}
			<AnimatePresence>
				{showPayment && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
						onClick={() => setShowPayment(false)}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className='bg-surface-overlay rounded-2xl p-6 max-w-md w-full mx-4'
							onClick={(e) => e.stopPropagation()}
						>
							<h3 className='font-semibold text-text-primary mb-4'>
								Confirm Booking
							</h3>

							<div className='space-y-3 mb-6'>
								<div className='flex justify-between'>
									<span className='text-text-secondary'>
										Route:
									</span>
									<span className='text-text-primary'>
										{route.operatorName}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-text-secondary'>
										Seats:
									</span>
									<span className='text-text-primary'>
										{selectedSeats
											.map((s) => s.number)
											.join(", ")}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-text-secondary'>
										Total Amount:
									</span>
									<span className='font-semibold text-text-primary'>
										₹{totalAmount}
									</span>
								</div>
							</div>

							<div className='flex gap-3'>
								<Button
									variant='outline'
									onClick={() => setShowPayment(false)}
									className='flex-1'
								>
									Cancel
								</Button>
								<Button
									onClick={handleBooking}
									loading={isBooking}
									loadingText='Booking...'
									className='flex-1'
									leftIcon={
										<CheckCircle className='w-4 h-4' />
									}
								>
									Confirm & Pay
								</Button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default SeatSelection;
