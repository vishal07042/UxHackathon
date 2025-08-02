import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Clock,
	DollarSign,
	Star,
	Navigation,
	Train,
	Bus,
	Car,
	Bike,
	MapPin,
	ArrowRight,
} from "lucide-react";
import { JourneyPlan, Journey, TransportStep } from "../types";

interface JourneyResultsProps {
	plans: JourneyPlan[];
	isLoading: boolean;
	journey: Journey | null;
	onBookBus?: () => void;
}

const JourneyResults: React.FC<JourneyResultsProps> = ({
	plans,
	isLoading,
	journey,
	onBookBus,
}) => {
	const getTransportIcon = (mode: TransportStep["mode"]) => {
		switch (mode) {
			case "metro":
				return Train;
			case "bus":
				return Bus;
			case "ride":
				return Car;
			case "bike":
				return Bike;
			case "walk":
				return Navigation;
			default:
				return Navigation;
		}
	};

	const getTransportColor = (mode: TransportStep["mode"]) => {
		switch (mode) {
			case "metro":
				return "neon-blue";
			case "bus":
				return "neon-green";
			case "ride":
				return "neon-purple";
			case "bike":
				return "neon-orange";
			case "walk":
				return "text-secondary";
			default:
				return "text-secondary";
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const planVariants = {
		hidden: { opacity: 0, y: 30, scale: 0.9 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 20,
			},
		},
	};

	if (!journey && plans.length === 0) {
		return (
			<motion.div
				className='bg-surface-overlay/70 backdrop-blur-lg rounded-3xl shadow-xl p-12 border border-border-secondary text-center'
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: "spring", stiffness: 100 }}
			>
				<motion.div
					animate={{ rotate: [0, 10, -10, 0] }}
					transition={{ duration: 2, repeat: Infinity }}
					className='inline-block mb-4'
				>
					<Navigation className='w-16 h-16 text-text-muted' />
				</motion.div>
				<h3 className='text-xl font-semibold text-text-secondary mb-2'>
					Ready to Plan Your Journey
				</h3>
				<p className='text-text-muted'>
					Enter your source and destination to see optimized routes
				</p>
			</motion.div>
		);
	}

	return (
		<motion.div
			className='space-y-6'
			variants={containerVariants}
			initial='hidden'
			animate='visible'
		>
			{journey && (
				<motion.div
					className='bg-surface-overlay/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-border-secondary'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ type: "spring", stiffness: 200 }}
				>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-4'>
							<motion.div
								className='p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg shadow-glow-neon-blue'
								whileHover={{ scale: 1.1, rotate: 5 }}
							>
								<MapPin className='w-5 h-5 text-bg-primary' />
							</motion.div>
							<div>
								<h3 className='font-semibold text-text-primary'>
									{journey.source}
								</h3>
								<p className='text-sm text-text-muted'>
									to {journey.destination}
								</p>
							</div>
						</div>
						<motion.div
							className='px-4 py-2 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-full border border-border-primary'
							whileHover={{ scale: 1.05 }}
						>
							<span className='text-sm font-medium text-neon-blue capitalize'>
								{journey.preference} Route
							</span>
						</motion.div>
					</div>
				</motion.div>
			)}

			
		</motion.div>
	);
};

export default JourneyResults;
