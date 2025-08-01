// Micro-interaction animation variants for Framer Motion

export const buttonVariants = {
	rest: { scale: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
	hover: {
		scale: 1.04,
		boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
		transition: { type: "spring" as const, stiffness: 300, damping: 18 },
	},
	tap: {
		scale: 0.97,
		boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
		transition: { type: "spring" as const, stiffness: 400, damping: 20 },
	},
	focus: {
		scale: 1.02,
		boxShadow: "0 0 0 3px rgba(0,212,255,0.25)",
		transition: { type: "spring" as const, stiffness: 300, damping: 18 },
	},
};

export const cardVariants = {
	rest: { scale: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" },
	hover: {
		scale: 1.015,
		y: -4,
		boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
		transition: { type: "spring" as const, stiffness: 200, damping: 18 },
	},
	tap: {
		scale: 0.98,
		y: 0,
		boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
		transition: { type: "spring" as const, stiffness: 400, damping: 20 },
	},
};

export const iconVariants = {
	rest: { rotate: 0, scale: 1 },
	hover: {
		rotate: 8,
		scale: 1.08,
		transition: { type: "spring" as const, stiffness: 400, damping: 18 },
	},
	tap: {
		rotate: -8,
		scale: 0.95,
		transition: { type: "spring" as const, stiffness: 400, damping: 18 },
	},
};

export const navItemVariants = {
	rest: { scale: 1, backgroundColor: "transparent" },
	hover: {
		scale: 1.06,
		backgroundColor: "rgba(0,212,255,0.08)",
		transition: { type: "spring" as const, stiffness: 400, damping: 18 },
	},
	active: {
		scale: 1.08,
		backgroundColor: "rgba(0,212,255,0.16)",
		transition: { type: "spring" as const, stiffness: 400, damping: 18 },
	},
};
