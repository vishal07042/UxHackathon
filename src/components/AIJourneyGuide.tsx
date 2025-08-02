import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	MapPin,
	Navigation,
	Settings,
	Clock,
	ArrowRight,
	Bus,
	Train,
	Bike,
	Car,
	CheckCircle,
} from "lucide-react";
import { Journey, JourneyPlan } from "../types";

interface JourneyPageProps {
	journey: Journey | null;
	journeyPlans: JourneyPlan[];
	currentStep?: number;
	isActive: boolean;
}

const modeIcons: Record<string, React.ElementType> = {
	BUS: Bus,
	TRAIN: Train,
	BIKE: Bike,
	CAR: Car,
};

const JourneyPage: React.FC<JourneyPageProps> = ({
	journey,
	journeyPlans,
	currentStep = 0,
	isActive,
}) => {
	const [bestPlan, setBestPlan] = useState<JourneyPlan | null>(null);

	useEffect(() => {
		if (journeyPlans.length > 0) {
			setBestPlan(journeyPlans[0]);
		}
	}, [journeyPlans]);

	if (!journey || !bestPlan) {
		return (
			<div className='flex items-center justify-center h-screen text-gray-500 text-lg'>
				Plan a journey to see guidance
			</div>
		);
	}

	return (
		<div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
			{/* Left Sidebar - Journey Info */}
			<motion.aside
				className='w-72 bg-white dark:bg-gray-800 shadow-lg p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col'
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
			>
				<h2 className='text-lg font-bold text-gray-900 dark:text-gray-100 mb-6'>
					Journey Planner
				</h2>

				<div className='space-y-4'>
					<div>
						<label className='text-xs font-medium text-gray-500'>
							From
						</label>
						<div className='flex items-center mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'>
							<MapPin className='w-4 h-4 mr-2' />
							{journey.source}
						</div>
					</div>

					<div>
						<label className='text-xs font-medium text-gray-500'>
							To
						</label>
						<div className='flex items-center mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'>
							<Navigation className='w-4 h-4 mr-2' />
							{journey.destination}
						</div>
					</div>

					<div>
						<label className='text-xs font-medium text-gray-500'>
							Preference
						</label>
						<div className='flex items-center mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'>
							<Settings className='w-4 h-4 mr-2' />
							{journey.preference}
						</div>
					</div>

					<div className='mt-6 text-sm text-gray-600 dark:text-gray-400'>
						<Clock className='inline w-4 h-4 mr-1' />
						Estimated Time: {bestPlan.totalDuration} min
					</div>

					<div className='text-sm text-gray-600 dark:text-gray-400'>
						💰 Total Cost: ${bestPlan.totalCost}
					</div>
				</div>
			</motion.aside>

			{/* Center Map Area */}
			<main className='flex-1 relative'>
				{/* Placeholder for map */}
				<div className='h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500'>
					🗺️ Map View (Integrate Google Maps or Leaflet here)
				</div>
			</main>

			{/* Right Sidebar - Journey Guidance */}
			<motion.aside
				className='w-80 bg-white dark:bg-gray-800 shadow-lg p-6 border-l border-gray-200 dark:border-gray-700 flex flex-col'
				initial={{ x: 100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
			>
				<h2 className='text-lg font-bold text-gray-900 dark:text-gray-100 mb-4'>
					Journey Guidance
				</h2>

				{/* Current Step Banner */}
				<div className='mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-300 dark:border-blue-700'>
					<div className='flex items-center gap-3'>
						<Navigation className='w-5 h-5 text-blue-600 dark:text-blue-300' />
						<div>
							<div className='text-sm font-semibold text-blue-700 dark:text-blue-200'>
								Current Step
							</div>
							<div className='text-sm text-gray-800 dark:text-gray-300'>
								{bestPlan.steps[currentStep]
									? `Head to ${bestPlan.steps[currentStep].from} for the ${bestPlan.steps[currentStep].mode}.`
									: "You're done! Enjoy your destination."}
							</div>
						</div>
					</div>
				</div>

				{/* Steps */}
				<div className='space-y-4 overflow-y-auto flex-1'>
					{bestPlan.steps.map((step, index) => {
						const Icon = modeIcons[step.mode.toUpperCase()] || Car;
						const isCompleted = index < currentStep;
						const isCurrent = index === currentStep;

						return (
							<motion.div
								key={index}
								className={`relative flex items-start gap-4 p-4 rounded-xl border ${
									isCurrent
										? "border-blue-400 bg-blue-50 dark:bg-blue-900/30"
										: "border-gray-200 dark:border-gray-700"
								}`}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<div
									className={`p-2 rounded-full ${
										isCompleted
											? "bg-green-100 dark:bg-green-800"
											: isCurrent
											? "bg-blue-100 dark:bg-blue-800"
											: "bg-gray-100 dark:bg-gray-800"
									}`}
								>
									{isCompleted ? (
										<CheckCircle className='w-5 h-5 text-green-600 dark:text-green-300' />
									) : (
										<Icon
											className={`w-5 h-5 ${
												isCurrent
													? "text-blue-600 dark:text-blue-300"
													: "text-gray-600 dark:text-gray-400"
											}`}
										/>
									)}
								</div>

								<div className='flex-1'>
									<h4 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
										{step.mode} – {step.from}{" "}
										<ArrowRight className='inline w-4 h-4 mx-1' />{" "}
										{step.to}
									</h4>
									<p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
										Duration: {step.duration} min • Cost: $
										{step.cost}
									</p>
								</div>
							</motion.div>
						);
					})}
				</div>
			</motion.aside>

			{/* Floating Assistant Button */}
			{isActive && (
				<motion.button
					className='fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700'
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
				>
					<Navigation className='w-6 h-6' />
				</motion.button>
			)}
		</div>
	);
};

export default JourneyPage;
