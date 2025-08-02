import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import Home from "./pages/Home";
import JourneyPage from "./pages/JourneyPage";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import { useEffect, useState } from "react";
import {
	navItemVariants as baseNavItemVariants,
	buttonVariants as baseButtonVariants,
	iconVariants as baseIconVariants,
} from "./animations/micro";

// Patch variants to cast 'type' to 'spring' as const for Framer Motion strict types
const navItemVariants = {
	rest: { ...baseNavItemVariants.rest },
	hover: {
		...baseNavItemVariants.hover,
		transition: {
			...baseNavItemVariants.hover.transition,
			type: "spring" as const,
		},
	},
	active: {
		...baseNavItemVariants.active,
		transition: {
			...baseNavItemVariants.active.transition,
			type: "spring" as const,
		},
	},
};
const buttonVariants = {
	rest: { ...baseButtonVariants.rest },
	hover: {
		...baseButtonVariants.hover,
		transition: {
			...baseButtonVariants.hover.transition,
			type: "spring" as const,
		},
	},
	tap: {
		...baseButtonVariants.tap,
		transition: {
			...baseButtonVariants.tap.transition,
			type: "spring" as const,
		},
	},
	focus: {
		...baseButtonVariants.focus,
		transition: {
			...baseButtonVariants.focus.transition,
			type: "spring" as const,
		},
	},
};
const iconVariants = {
	rest: { ...baseIconVariants.rest },
	hover: {
		...baseIconVariants.hover,
		transition: {
			...baseIconVariants.hover.transition,
			type: "spring" as const,
		},
	},
	tap: {
		...baseIconVariants.tap,
		transition: {
			...baseIconVariants.tap.transition,
			type: "spring" as const,
		},
	},
};

function App() {
	const location = useLocation();
	const [theme, setTheme] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("theme") || "dark";
		}
		return "dark";
	});

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.8,
				staggerChildren: 0.1,
			},
		},
	};

	const headerVariants = {
		hidden: { y: -50, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: "spring" as const,
				stiffness: 100,
				damping: 20,
			},
		},
	};

	return (
		<motion.div
			className='min-h-screen bg-bg-primary relative overflow-hidden'
			initial='hidden'
			animate='visible'
			variants={containerVariants}
		>
			{/* Animated Background Elements */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<motion.div
					className='absolute -top-40 -right-40 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl'
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 180, 360],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "linear",
					}}
				/>
				<motion.div
					className='absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl'
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [360, 180, 0],
					}}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: "linear",
					}}
				/>
			</div>

			{/* Navigation Header */}
			<motion.header
				className='bg-surface-overlay/70 backdrop-blur-lg border-b border-border-secondary sticky top-0 z-50'
				variants={headerVariants}
			>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
					<nav className='flex items-center justify-between'>
						{/* Logo */}
						<Link to='/'>
							<motion.div
								initial={{ x: -50, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{
									delay: 0.2,
									type: "spring" as const,
								}}
								whileHover={{ scale: 1.05 }}
							>
								<h1 className='text-2xl font-bold bg-clip-text text-white'>
									UrbanOrchestrator{" "}
								</h1>
								<p className='text-xs text-text-secondary'>
									Urban Mobility Coordination
								</p>
							</motion.div>
						</Link>

						{/* Navigation Links */}
						<motion.div
							className='flex space-x-6'
							initial={{ x: 50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.3, type: "spring" as const }}
						>
							{[
								{ path: "/", label: "Home" },
								{
									path: "/journey-planner",
									label: "Journey Planner",
								},
								{ path: "/about", label: "About" },
								{
									path: "/how-it-works",
									label: "How It Works",
								},
								{ path: "/features", label: "Features" },
							].map((item) => (
								<Link key={item.path} to={item.path}>
									<motion.div
										variants={navItemVariants}
										initial='rest'
										whileHover='hover'
										animate={
											location.pathname === item.path
												? "active"
												: "rest"
										}
										className={`px-4 py-2 rounded-lg font-medium transition-colors ${
											location.pathname === item.path
												? "bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary shadow-glow-neon-blue"
												: "text-text-secondary hover:text-neon-blue hover:bg-surface-elevated"
										}`}
									>
										{item.label}
									</motion.div>
								</Link>
							))}
						</motion.div>

						{/* Theme Toggle Button */}
						<motion.button
							className='ml-6 p-2 rounded-full border border-border-secondary bg-surface-elevated shadow-elevation-low focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue transition-colors'
							aria-label={
								theme === "dark"
									? "Switch to light mode"
									: "Switch to dark mode"
							}
							onClick={toggleTheme}
							initial='rest'
							whileHover='hover'
							whileTap='tap'
							variants={buttonVariants}
						>
							<motion.span
								key={theme}
								initial={{ rotate: 0, opacity: 0 }}
								animate={{
									rotate: theme === "dark" ? 0 : 180,
									opacity: 1,
								}}
								exit={{ opacity: 0 }}
								transition={{
									type: "spring" as const,
									stiffness: 300,
									damping: 20,
								}}
								variants={iconVariants}
								whileHover='hover'
								whileTap='tap'
							>
								{theme === "dark" ? (
									<Moon className='w-5 h-5 text-neon-blue' />
								) : (
									<Sun className='w-5 h-5 text-neon-yellow' />
								)}
							</motion.span>
						</motion.button>
					</nav>
				</div>
			</motion.header>

			{/* Main Content with Page Transitions */}
			<AnimatePresence mode='wait'>
				<Routes location={location} key={location.pathname}>
					<Route path='/' element={<Home />} />
					<Route path='/journey-planner' element={<JourneyPage />} />
					<Route path='/about' element={<About />} />
					<Route path='/how-it-works' element={<HowItWorks />} />
					<Route path='/features' element={<Features />} />
				</Routes>
			</AnimatePresence>
		</motion.div>
	);
}

export default App;
