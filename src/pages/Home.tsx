import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
	ArrowRight,
	Bus,
	Train,
	Bike,
	Car,
	Users,
	Clock,
	Shield,
	Zap,
} from "lucide-react";

const Home = () => {
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

	const staggerContainer = {
		animate: {
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.3,
			},
		},
	};

	const fadeInUp = {
		initial: { opacity: 0, y: 60 },
		animate: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: "easeOut",
			},
		},
	};

	const scaleIn = {
		initial: { scale: 0.8, opacity: 0 },
		animate: {
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		},
	};

	const transportModes = [
		{
			icon: Bus,
			color: "text-neon-green",
			bg: "bg-neon-green/10",
			name: "Bus",
		},
		{
			icon: Train,
			color: "text-neon-blue",
			bg: "bg-neon-blue/10",
			name: "Metro",
		},
		{
			icon: Bike,
			color: "text-neon-orange",
			bg: "bg-neon-orange/10",
			name: "Bike",
		},
		{
			icon: Car,
			color: "text-neon-purple",
			bg: "bg-neon-purple/10",
			name: "Ride",
		},
	];

	const features = [
		{
			icon: Users,
			title: "Multi-Agent Collaboration",
			description:
				"Intelligent agents work together to find the best route for you",
			color: "text-neon-blue",
			bg: "bg-surface-elevated",
		},
		{
			icon: Clock,
			title: "Real-Time Updates",
			description:
				"Get instant notifications about delays and route changes",
			color: "text-neon-purple",
			bg: "bg-surface-elevated",
		},
		{
			icon: Shield,
			title: "Reliable Planning",
			description:
				"Trust our system to get you where you need to be on time",
			color: "text-neon-green",
			bg: "bg-surface-elevated",
		},
		{
			icon: Zap,
			title: "Smart Optimization",
			description:
				"AI-powered route optimization for fastest, cheapest, or most comfortable journeys",
			color: "text-neon-orange",
			bg: "bg-surface-elevated",
		},
	];

	return (
		<motion.div
			variants={pageVariants}
			initial='initial'
			animate='animate'
			exit='exit'
			className='min-h-screen bg-bg-primary'
		>
			{/* Hero Section */}
			<section className='relative py-20 overflow-hidden'>
				<motion.div
					className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
					variants={staggerContainer}
					initial='initial'
					animate='animate'
				>
					<div className='text-center'>
						<motion.h1
							variants={fadeInUp}
							className='text-5xl md:text-6xl font-bold mb-6'
						>
							<span className='bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent'>
								Seamless Urban Mobility
							</span>
							<br />
							<span className='text-text-primary'>
								for Smart Cities
							</span>
						</motion.h1>

						<motion.p
							variants={fadeInUp}
							className='text-xl text-text-secondary mb-8 max-w-3xl mx-auto'
						>
							Experience the future of urban transportation with
							our AI-powered multi-agent system that coordinates
							buses, metros, bikes, and ride-sharing services for
							your perfect journey.
						</motion.p>

						<motion.div
							variants={fadeInUp}
							className='flex flex-wrap justify-center gap-4 mb-12'
						>
							<Link to='/journey-planner'>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className='px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary rounded-xl font-semibold shadow-glow-neon-blue hover:shadow-glow-neon-purple transition-shadow flex items-center gap-2'
								>
									Start Planning{" "}
									<ArrowRight className='w-5 h-5' />
								</motion.button>
							</Link>
							<Link to='/how-it-works'>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className='px-8 py-4 bg-surface-overlay text-text-primary rounded-xl font-semibold shadow-elevation-low hover:shadow-elevation-medium transition-shadow border border-border-primary'
								>
									Learn More
								</motion.button>
							</Link>
						</motion.div>

						{/* Transport Mode Icons */}
						<motion.div
							variants={staggerContainer}
							className='flex justify-center gap-8 mb-16'
						>
							{transportModes.map((mode) => (
								<motion.div
									key={mode.name}
									variants={scaleIn}
									whileHover={{
										scale: 1.1,
										rotate: [0, -5, 5, 0],
										transition: { duration: 0.3 },
									}}
									className={`p-4 ${mode.bg} rounded-2xl shadow-elevation-low`}
								>
									<mode.icon
										className={`w-12 h-12 ${mode.color}`}
									/>
								</motion.div>
							))}
						</motion.div>
					</div>
				</motion.div>

				{/* Animated Background Shapes */}
				<motion.div
					className='absolute top-0 left-0 w-64 h-64 bg-neon-blue/10 rounded-full opacity-20 blur-3xl'
					animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className='absolute bottom-0 right-0 w-96 h-96 bg-neon-purple/10 rounded-full opacity-20 blur-3xl'
					animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			</section>

			{/* Features Grid */}
			<section className='py-20 bg-surface-overlay/80 backdrop-blur-sm'>
				<motion.div
					className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
					variants={staggerContainer}
					initial='initial'
					whileInView='animate'
					viewport={{ once: true, amount: 0.3 }}
				>
					<motion.h2
						variants={fadeInUp}
						className='text-4xl font-bold text-center mb-16 text-text-primary'
					>
						Why Choose{" "}
						<span className='bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent'>
							UXplorer 2025
						</span>
					</motion.h2>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{features.map((feature) => (
							<motion.div
								key={feature.title}
								variants={fadeInUp}
								whileHover={{
									y: -10,
									transition: { duration: 0.2 },
								}}
								className='relative'
							>
								<motion.div
									className={`p-8 rounded-2xl ${feature.bg} border border-border-secondary shadow-elevation-low hover:shadow-elevation-medium transition-shadow`}
									whileHover={{ scale: 1.02 }}
								>
									<motion.div
										className={`w-16 h-16 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
										whileHover={{ rotate: 360 }}
										transition={{ duration: 0.6 }}
									>
										<feature.icon
											className={`w-8 h-8 ${feature.color}`}
										/>
									</motion.div>
									<h3 className='text-xl font-semibold mb-2 text-text-primary'>
										{feature.title}
									</h3>
									<p className='text-text-secondary'>
										{feature.description}
									</p>
								</motion.div>
							</motion.div>
						))}
					</div>
				</motion.div>
			</section>

			{/* CTA Section */}
			<section className='py-20'>
				<motion.div
					className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<motion.div
						className='bg-gradient-to-r from-neon-blue to-neon-purple rounded-3xl p-12 shadow-elevation-high'
						whileHover={{ scale: 1.02 }}
						transition={{ duration: 0.2 }}
					>
						<h2 className='text-4xl font-bold text-bg-primary mb-4'>
							Ready to Transform Your Commute?
						</h2>
						<p className='text-xl text-bg-primary/90 mb-8'>
							Join thousands of smart commuters who save time and
							stress every day
						</p>
						<Link to='/journey-planner'>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className='px-10 py-4 bg-surface-overlay text-text-primary rounded-xl font-semibold shadow-elevation-low hover:shadow-elevation-medium transition-shadow'
							>
								Plan Your Journey Now
							</motion.button>
						</Link>
					</motion.div>
				</motion.div>
			</section>
		</motion.div>
	);
};

export default Home;
