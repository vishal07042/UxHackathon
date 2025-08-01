import React from "react";
import { motion } from "framer-motion";
import { Brain, Zap, MapPin, Navigation } from "lucide-react";

const agentColors: Record<string, { bg: string; text: string; dot: string }> = {
	blue: {
		bg: "bg-neon-blue/10",
		text: "text-neon-blue",
		dot: "bg-neon-blue",
	},
	green: {
		bg: "bg-neon-green/10",
		text: "text-neon-green",
		dot: "bg-neon-green",
	},
	purple: {
		bg: "bg-neon-purple/10",
		text: "text-neon-purple",
		dot: "bg-neon-purple",
	},
	orange: {
		bg: "bg-neon-orange/10",
		text: "text-neon-orange",
		dot: "bg-neon-orange",
	},
};

const LoadingOverlay: React.FC = () => {
	const agents = [
		{ name: "Metro Agent", icon: Navigation, color: "blue", delay: 0 },
		{ name: "Bus Agent", icon: MapPin, color: "green", delay: 0.2 },
		{ name: "Ride Agent", icon: Zap, color: "purple", delay: 0.4 },
		{ name: "AI Planner", icon: Brain, color: "orange", delay: 0.6 },
	];

	return (
		<motion.div
			className='fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.div
				className='bg-surface-overlay/95 backdrop-blur-lg rounded-3xl p-8 shadow-elevation-high border border-border-secondary max-w-md w-full mx-4'
				initial={{ scale: 0.8, y: 50 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.8, y: 50 }}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
			>
				<motion.div
					className='text-center mb-8'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<h3 className='text-2xl font-bold text-text-primary mb-2'>
						Planning Your Journey
					</h3>
					<p className='text-text-secondary'>
						AI agents are collaborating to find the best routes
					</p>
				</motion.div>

				<div className='space-y-4'>
					{agents.map((agent) => {
						const Icon = agent.icon;
						const color = agentColors[agent.color];
						return (
							<motion.div
								key={agent.name}
								className={`flex items-center gap-4 p-3 ${color.bg} rounded-xl`}
								initial={{ x: -50, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{
									delay: agent.delay,
									type: "spring",
								}}
							>
								<motion.div
									className={`p-2 ${color.bg} rounded-lg`}
									animate={{
										scale: [1, 1.2, 1],
										rotate: [0, 180, 360],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										delay: agent.delay,
										ease: "easeInOut",
									}}
								>
									<Icon className={`w-5 h-5 ${color.text}`} />
								</motion.div>

								<div className='flex-1'>
									<div className='font-medium text-text-primary'>
										{agent.name}
									</div>
									<motion.div
										className='text-sm text-text-secondary'
										animate={{ opacity: [0.5, 1, 0.5] }}
										transition={{
											duration: 1.5,
											repeat: Infinity,
											delay: agent.delay,
										}}
									>
										Analyzing routes...
									</motion.div>
								</div>

								<motion.div
									className={`w-3 h-3 ${color.dot} rounded-full`}
									animate={{
										scale: [1, 1.5, 1],
										opacity: [1, 0.5, 1],
									}}
									transition={{
										duration: 1,
										repeat: Infinity,
										delay: agent.delay,
									}}
								/>
							</motion.div>
						);
					})}
				</div>

				<motion.div
					className='mt-6 flex justify-center'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1 }}
				>
					<motion.div
						className='flex space-x-1'
						animate={{ opacity: [0.5, 1, 0.5] }}
						transition={{ duration: 1.5, repeat: Infinity }}
					>
						{[...Array(3)].map((_, i) => (
							<motion.div
								key={i}
								className='w-2 h-2 bg-neon-blue rounded-full'
								animate={{
									scale: [1, 1.5, 1],
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									duration: 1,
									repeat: Infinity,
									delay: i * 0.2,
								}}
							/>
						))}
					</motion.div>
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default LoadingOverlay;
