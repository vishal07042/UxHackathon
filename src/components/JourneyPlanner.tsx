import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	MapPin,
	Clock,
	DollarSign,
	Heart,
	Navigation,
	ArrowRight,
	Zap,
	Route,
} from "lucide-react";
import { Journey } from "../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface JourneyPlannerProps {
	onPlan: (journey: Journey) => void;
	isPlanning: boolean;
}

const JourneyPlanner: React.FC<JourneyPlannerProps> = ({
	onPlan,
	isPlanning,
}) => {
	const [source, setSource] = useState("");
	const [destination, setDestination] = useState("");
	const [preference, setPreference] =
		useState<Journey["preference"]>("fastest");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (source.trim() && destination.trim()) {
			onPlan({
				source: source.trim(),
				destination: destination.trim(),
				preference,
				departureTime: new Date(),
			});
		}
	};

	const preferences = [
		{
			id: "fastest",
			label: "Fastest Route",
			icon: Clock,
			color: "neon-blue",
			description: "Minimize travel time",
		},
		{
			id: "cheapest",
			label: "Most Affordable",
			icon: DollarSign,
			color: "neon-green",
			description: "Save on costs",
		},
		{
			id: "comfortable",
			label: "Most Comfortable",
			icon: Heart,
			color: "neon-purple",
			description: "Premium experience",
		},
	];

	const containerVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: { type: "spring", stiffness: 100 },
		},
	};

	return (
		<motion.div
			className='bg-surface-overlay/90 backdrop-blur-lg rounded-3xl shadow-elevation-high p-8 border border-border-secondary'
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
		>
			<motion.div
				className='flex items-center gap-4 mb-8'
				variants={itemVariants}
			>
				<motion.div
					className='p-3 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl shadow-glow-neon-blue flex items-center justify-center'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
				>
					<Navigation className='w-7 h-7 text-bg-primary' />
				</motion.div>
				<div>
					<h2 className='text-2xl font-bold text-text-primary'>
						Plan Your Journey
					</h2>
					<p className='text-sm text-text-secondary'>
						Smart AI-powered route optimization
					</p>
				</div>
			</motion.div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Source Input */}
				<motion.div variants={itemVariants}>
					<Input
						id='source'
						label='From'
						value={source}
						onChange={(e) => setSource(e.target.value)}
						placeholder='Enter starting location'
						leftIcon={<MapPin className='w-5 h-5' />}
						required
						disabled={isPlanning}
						size='lg'
						variant='default'
						hint='Enter your starting location or address'
					/>
				</motion.div>

				{/* Arrow Connector */}
				<motion.div
					className='flex justify-center'
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.3, type: "spring" }}
				>
					<motion.div
						className='p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-glow-neon-blue flex items-center justify-center'
						animate={{
							scale: [1, 1.1, 1],
							rotate: [0, 5, -5, 0],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						<ArrowRight className='w-5 h-5 text-bg-primary' />
					</motion.div>
				</motion.div>

				{/* Destination Input */}
				<motion.div variants={itemVariants}>
					<Input
						id='destination'
						label='To'
						value={destination}
						onChange={(e) => setDestination(e.target.value)}
						placeholder='Enter destination'
						leftIcon={
							<MapPin className='w-5 h-5 text-neon-pink-accessible' />
						}
						required
						disabled={isPlanning}
						size='lg'
						variant='default'
						hint='Enter your destination or address'
					/>
				</motion.div>

				{/* Preferences */}
				<motion.div variants={itemVariants}>
					<label className='block text-sm font-semibold text-text-primary mb-4'>
						Travel Preference
					</label>
					<div className='space-y-3'>
						<AnimatePresence>
							{preferences.map((pref, index) => {
								const Icon = pref.icon;
								const isSelected = preference === pref.id;

								return (
									<motion.button
										key={pref.id}
										type='button'
										onClick={() =>
											setPreference(
												pref.id as Journey["preference"]
											)
										}
										disabled={isPlanning}
										className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
											isSelected
												? `border-${pref.color} bg-surface-elevated shadow-glow-${pref.color}`
												: "border-border-primary hover:border-border-secondary bg-surface-elevated hover:shadow-elevation-low"
										} ${
											isPlanning
												? "opacity-50 cursor-not-allowed"
												: "cursor-pointer"
										}`}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										whileHover={
											!isPlanning
												? { scale: 1.02, x: 5 }
												: {}
										}
										whileTap={
											!isPlanning ? { scale: 0.98 } : {}
										}
									>
										<motion.div
											className={`p-2 rounded-lg flex items-center justify-center ${
												isSelected
													? `bg-${pref.color}`
													: "bg-bg-secondary"
											}`}
											animate={{
												scale: isSelected ? 1.1 : 1,
											}}
											transition={{
												duration: 0.3,
												type: "spring",
											}}
										>
											<Icon
												className={`w-5 h-5 ${
													isSelected
														? "text-bg-primary"
														: `text-${pref.color}`
												}`}
											/>
										</motion.div>
										<div className='flex-1 text-left'>
											<div
												className={`font-semibold ${
													isSelected
														? `text-${pref.color}`
														: "text-text-secondary"
												}`}
											>
												{pref.label}
											</div>
											<div className='text-sm text-text-muted'>
												{pref.description}
											</div>
										</div>
										<AnimatePresence>
											{isSelected && (
												<motion.div
													initial={{
														scale: 0,
														rotate: -180,
													}}
													animate={{
														scale: 1,
														rotate: 0,
													}}
													exit={{
														scale: 0,
														rotate: 180,
													}}
													className={`w-6 h-6 rounded-full bg-${pref.color} flex items-center justify-center`}
												>
													<div className='w-2 h-2 bg-bg-primary rounded-full' />
												</motion.div>
											)}
										</AnimatePresence>
									</motion.button>
								);
							})}
						</AnimatePresence>
					</div>
				</motion.div>

				{/* Submit Button */}
				<motion.div variants={itemVariants}>
					<Button
						type='submit'
						disabled={
							isPlanning || !source.trim() || !destination.trim()
						}
						loading={isPlanning}
						loadingText='Planning Your Journey...'
						leftIcon={<Route className='w-5 h-5' />}
						size='lg'
						variant='primary'
						fullWidth
						className='mt-6'
					>
						Find Best Route
					</Button>
				</motion.div>
			</form>
		</motion.div>
	);
};

export default JourneyPlanner;
