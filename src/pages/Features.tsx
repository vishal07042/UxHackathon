import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
	Zap,
	Shield,
	Clock,
	DollarSign,
	Leaf,
	Users,
	Bell,
	Smartphone,
	Map,
	BarChart3,
	Globe,
	Lock,
	CheckCircle,
	X,
} from "lucide-react";

const Features = () => {
	const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

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

	const mainFeatures = [
		{
			icon: Zap,
			title: "Lightning Fast Planning",
			description: "Get your journey options in under 2 seconds",
			details:
				"Our parallel processing system queries all transport modes simultaneously, delivering instant results without compromising on quality.",
			stats: "< 2s response time",
			color: "from-neon-yellow to-neon-orange",
		},
		{
			icon: Shield,
			title: "Always Reliable",
			description: "99.9% uptime with failover systems",
			details:
				"Built with redundancy at every level. If one agent fails, others seamlessly take over to ensure you always get your journey plan.",
			stats: "99.9% uptime",
			color: "from-neon-blue to-neon-purple",
		},
		{
			icon: Clock,
			title: "Real-Time Adaptation",
			description: "Dynamic routing that responds to live conditions",
			details:
				"Our system continuously monitors all transport services and automatically adjusts your route if delays or issues arise.",
			stats: "Updates every 30s",
			color: "from-neon-purple to-neon-pink",
		},
		{
			icon: DollarSign,
			title: "Cost Optimization",
			description: "Find the most affordable routes automatically",
			details:
				"Smart algorithms compare prices across all transport modes to find the perfect balance between cost and convenience.",
			stats: "Save up to 40%",
			color: "from-neon-green to-neon-green",
		},
		{
			icon: Leaf,
			title: "Eco-Friendly Routes",
			description: "Reduce your carbon footprint with green options",
			details:
				"Prioritize sustainable transport modes and see the environmental impact of each journey option.",
			stats: "60% less CO2",
			color: "from-neon-green to-neon-blue",
		},
		{
			icon: Users,
			title: "Personalized Experience",
			description: "Learns your preferences over time",
			details:
				"The more you use UXplorer, the better it understands your travel patterns and preferences for truly personalized routing.",
			stats: "AI-powered learning",
			color: "from-neon-blue to-neon-purple",
		},
	];

	const additionalFeatures = [
		{
			icon: Bell,
			title: "Smart Notifications",
			description: "Get alerts only when they matter",
		},
		{
			icon: Smartphone,
			title: "Mobile Optimized",
			description: "Perfect experience on any device",
		},
		{
			icon: Map,
			title: "Offline Mode",
			description: "Access saved routes without internet",
		},
		{
			icon: BarChart3,
			title: "Journey Analytics",
			description: "Track your travel patterns and savings",
		},
		{
			icon: Globe,
			title: "Multi-Language",
			description: "Available in 15+ languages",
		},
		{
			icon: Lock,
			title: "Privacy First",
			description: "Your data is encrypted and secure",
		},
	];

	const comparisonData = [
		{ feature: "Multi-modal planning", uxplorer: true, traditional: false },
		{ feature: "Real-time updates", uxplorer: true, traditional: false },
		{ feature: "AI optimization", uxplorer: true, traditional: false },
		{ feature: "Unified payment", uxplorer: true, traditional: false },
		{ feature: "Predictive delays", uxplorer: true, traditional: false },
		{ feature: "Carbon tracking", uxplorer: true, traditional: false },
		{ feature: "Agent collaboration", uxplorer: true, traditional: false },
		{ feature: "Personalization", uxplorer: true, traditional: false },
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
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<div className='text-center mb-16'>
						<h1 className='text-5xl font-bold mb-6 text-text-primary'>
							Powerful Features for
							<br />
							<span className='bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent'>
								Smarter Journeys
							</span>
						</h1>
						<p className='text-xl text-text-secondary max-w-3xl mx-auto'>
							Discover how our cutting-edge features revolutionize
							urban transportation with AI-powered intelligence
							and seamless integration.
						</p>
					</div>
				</motion.div>
			</section>

			{/* Main Features Grid */}
			<section className='py-20 bg-surface-overlay/80 backdrop-blur-sm'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{mainFeatures.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								viewport={{ once: true }}
								onClick={() =>
									setSelectedFeature(
										selectedFeature === index ? null : index
									)
								}
								className='cursor-pointer'
							>
								<motion.div
									className='bg-surface-elevated rounded-2xl shadow-elevation-high p-8 h-full'
									whileHover={{ scale: 1.03, y: -10 }}
									transition={{ duration: 0.2 }}
								>
									<motion.div
										className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}
										whileHover={{ rotate: 360 }}
										transition={{ duration: 0.6 }}
									>
										<feature.icon className='w-8 h-8 text-bg-primary' />
									</motion.div>
									<h3 className='text-2xl font-bold mb-3 text-text-primary'>
										{feature.title}
									</h3>
									<p className='text-text-secondary mb-4'>
										{feature.description}
									</p>
									<motion.div
										className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${feature.color} text-bg-primary font-semibold`}
										whileHover={{ scale: 1.05 }}
									>
										{feature.stats}
									</motion.div>

									<AnimatePresence>
										{selectedFeature === index && (
											<motion.div
												initial={{
													height: 0,
													opacity: 0,
												}}
												animate={{
													height: "auto",
													opacity: 1,
												}}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.3 }}
												className='mt-4 pt-4 border-t border-border-secondary'
											>
												<p className='text-text-secondary'>
													{feature.details}
												</p>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Additional Features */}
			<section className='py-20'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<motion.h2
						className='text-4xl font-bold text-center mb-16 text-text-primary'
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
					>
						And So Much More...
					</motion.h2>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{additionalFeatures.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.05 }}
								viewport={{ once: true }}
								whileHover={{ scale: 1.05 }}
								className='flex items-center space-x-4 p-6 bg-surface-elevated rounded-xl shadow-elevation-low'
							>
								<motion.div
									className='w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center flex-shrink-0'
									whileHover={{ rotate: 180 }}
									transition={{ duration: 0.3 }}
								>
									<feature.icon className='w-6 h-6 text-bg-primary' />
								</motion.div>
								<div>
									<h4 className='font-semibold text-text-primary'>
										{feature.title}
									</h4>
									<p className='text-sm text-text-secondary'>
										{feature.description}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className='py-20 bg-gradient-to-r from-neon-blue to-neon-purple'>
				<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
					<motion.h2
						className='text-4xl font-bold text-center text-bg-primary mb-16'
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
					>
						See the Difference
					</motion.h2>

					<motion.div
						className='bg-surface-elevated rounded-3xl shadow-elevation-high overflow-hidden'
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<div className='grid grid-cols-3 bg-surface-overlay p-6 font-semibold text-text-primary'>
							<div>Feature</div>
							<div className='text-center'>UXplorer 2025</div>
							<div className='text-center'>Traditional Apps</div>
						</div>
						{comparisonData.map((item, index) => (
							<motion.div
								key={index}
								className='grid grid-cols-3 p-6 border-t border-border-secondary'
								initial={{ x: -50, opacity: 0 }}
								whileInView={{ x: 0, opacity: 1 }}
								transition={{ delay: index * 0.05 }}
								viewport={{ once: true }}
							>
								<div className='font-medium'>
									{item.feature}
								</div>
								<div className='text-center'>
									<motion.div
										initial={{ scale: 0 }}
										whileInView={{ scale: 1 }}
										transition={{
											delay: index * 0.05 + 0.2,
										}}
										viewport={{ once: true }}
									>
										{item.uxplorer ? (
											<CheckCircle className='w-6 h-6 text-neon-green mx-auto' />
										) : (
											<X className='w-6 h-6 text-neon-pink mx-auto' />
										)}
									</motion.div>
								</div>
								<div className='text-center'>
									<motion.div
										initial={{ scale: 0 }}
										whileInView={{ scale: 1 }}
										transition={{
											delay: index * 0.05 + 0.3,
										}}
										viewport={{ once: true }}
									>
										{item.traditional ? (
											<CheckCircle className='w-6 h-6 text-neon-green mx-auto' />
										) : (
											<X className='w-6 h-6 text-neon-pink mx-auto' />
										)}
									</motion.div>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
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
					<h2 className='text-4xl font-bold mb-6 text-text-primary'>
						Experience All These Features Today
					</h2>
					<p className='text-xl text-text-secondary mb-8'>
						Join the future of urban mobility and transform how you
						navigate your city
					</p>
					<Link to='/journey-planner'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='px-10 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary rounded-xl font-semibold shadow-glow-neon-blue hover:shadow-glow-neon-purple transition-shadow'
						>
							Get Started Free
						</motion.button>
					</Link>
				</motion.div>
			</section>
		</motion.div>
	);
};

export default Features;
