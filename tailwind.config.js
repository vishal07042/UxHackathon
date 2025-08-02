/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Black shades
				"black-900": "#000",
				"black-800": "#0a0a0a",
				"black-700": "#141414",

				// Enhanced neon colors with better accessibility
				"neon-green": "#39ff14",
				"neon-green-accessible": "#4ade80", // Better contrast for accessibility
				"neon-pink": "#ff10f0",
				"neon-pink-accessible": "#f472b6", // Better contrast for accessibility
				"neon-blue": "#00d4ff",
				"neon-blue-accessible": "#3b82f6", // Better contrast for accessibility
				"neon-purple": "#bf00ff",
				"neon-purple-accessible": "#8b5cf6", // Better contrast for accessibility
				"neon-yellow": "#ffff00",
				"neon-yellow-accessible": "#fbbf24", // Better contrast for accessibility
				"neon-orange": "#ff6600",
				"neon-orange-accessible": "#f97316", // Better contrast for accessibility

				// Traffic status colors
				"traffic-free": "#10b981",
				"traffic-light": "#f59e0b",
				"traffic-moderate": "#f97316",
				"traffic-heavy": "#ef4444",
				"traffic-blocked": "#dc2626",

				// Semantic tokens
				"bg-primary": "#000",
				"bg-secondary": "#0a0a0a",
				"bg-tertiary": "#141414",
				"text-primary": "#ffffff",
				"text-secondary": "#a0a0a0",
				"text-muted": "#666666",
				"surface-elevated": "#1a1a1a",
				"surface-overlay": "#2a2a2a",
				"border-primary": "#333333",
				"border-secondary": "#1a1a1a",

				// Status colors
				success: "#10b981",
				warning: "#f59e0b",
				error: "#ef4444",
				info: "#3b82f6",

				// Interactive states
				"interactive-hover": "#374151",
				"interactive-active": "#4b5563",
				"interactive-disabled": "#1f2937",
			},
			boxShadow: {
				// Custom shadows
				"glow-sm": "0 0 10px rgba(255, 255, 255, 0.1)",
				"glow-md": "0 0 20px rgba(255, 255, 255, 0.2)",
				"glow-lg": "0 0 30px rgba(255, 255, 255, 0.3)",
				"glow-neon-green": "0 0 20px rgba(57, 255, 20, 0.5)",
				"glow-neon-pink": "0 0 20px rgba(255, 16, 240, 0.5)",
				"glow-neon-blue": "0 0 20px rgba(0, 212, 255, 0.5)",
				"elevation-low": "0 2px 8px rgba(0, 0, 0, 0.8)",
				"elevation-medium": "0 4px 16px rgba(0, 0, 0, 0.9)",
				"elevation-high": "0 8px 32px rgba(0, 0, 0, 1)",
			},
			dropShadow: {
				glow: "0 0 8px rgba(255, 255, 255, 0.25)",
				"glow-lg": "0 0 16px rgba(255, 255, 255, 0.35)",
				"neon-green": "0 0 8px rgba(57, 255, 20, 0.7)",
				"neon-pink": "0 0 8px rgba(255, 16, 240, 0.7)",
				"neon-blue": "0 0 8px rgba(0, 212, 255, 0.7)",
			},
			ringWidth: {
				DEFAULT: "2px",
				3: "3px",
			},
			ringColor: {
				DEFAULT: "#333333",
				"neon-green": "#39ff14",
				"neon-pink": "#ff10f0",
				"neon-blue": "#00d4ff",
			},
			ringOffsetColor: {
				black: "#000",
			},
			// Opacity variants for overlays and gradients
			opacity: {
				5: "0.05",
				10: "0.1",
				15: "0.15",
				85: "0.85",
				95: "0.95",
			},
			backgroundOpacity: {
				5: "0.05",
				10: "0.1",
				15: "0.15",
				85: "0.85",
				95: "0.95",
			},
			// Custom gradient color stops
			gradientColorStops: {
				"black-transparent": "rgba(0, 0, 0, 0)",
				"black-semi": "rgba(0, 0, 0, 0.5)",
				"black-opaque": "rgba(0, 0, 0, 1)",
			},
			// Enhanced spacing scale
			spacing: {
				18: "4.5rem",
				88: "22rem",
				128: "32rem",
				144: "36rem",
			},
			// Enhanced font sizes with better line heights
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1rem" }],
				sm: ["0.875rem", { lineHeight: "1.25rem" }],
				base: ["1rem", { lineHeight: "1.5rem" }],
				lg: ["1.125rem", { lineHeight: "1.75rem" }],
				xl: ["1.25rem", { lineHeight: "1.75rem" }],
				"2xl": ["1.5rem", { lineHeight: "2rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "1" }],
				"6xl": ["3.75rem", { lineHeight: "1" }],
				"7xl": ["4.5rem", { lineHeight: "1" }],
				"8xl": ["6rem", { lineHeight: "1" }],
				"9xl": ["8rem", { lineHeight: "1" }],
			},
			// Enhanced border radius
			borderRadius: {
				none: "0",
				sm: "0.125rem",
				DEFAULT: "0.25rem",
				md: "0.375rem",
				lg: "0.5rem",
				xl: "0.75rem",
				"2xl": "1rem",
				"3xl": "1.5rem",
				"4xl": "2rem",
				full: "9999px",
			},
			// Typography plugin customization
			typography: (theme) => ({
				DEFAULT: {
					css: {
						color: theme("colors.text-primary"),
						a: {
							color: theme("colors.neon-blue"),
							"&:hover": {
								color: theme("colors.neon-green"),
							},
						},
						h1: {
							color: theme("colors.text-primary"),
						},
						h2: {
							color: theme("colors.text-primary"),
						},
						h3: {
							color: theme("colors.text-primary"),
						},
						h4: {
							color: theme("colors.text-primary"),
						},
						strong: {
							color: theme("colors.text-primary"),
						},
						code: {
							color: theme("colors.neon-green"),
							backgroundColor: theme("colors.black-700"),
						},
						"blockquote p:first-of-type::before": {
							content: "none",
						},
						"blockquote p:last-of-type::after": {
							content: "none",
						},
						blockquote: {
							color: theme("colors.text-secondary"),
							borderLeftColor: theme("colors.neon-purple"),
						},
					},
				},
				// Dark mode overrides (when using class strategy)
				dark: {
					css: {
						color: theme("colors.text-primary"),
						a: {
							color: theme("colors.neon-blue"),
						},
						h1: {
							color: theme("colors.text-primary"),
						},
						h2: {
							color: theme("colors.text-primary"),
						},
						h3: {
							color: theme("colors.text-primary"),
						},
						h4: {
							color: theme("colors.text-primary"),
						},
						strong: {
							color: theme("colors.text-primary"),
						},
						code: {
							color: theme("colors.neon-green"),
							backgroundColor: theme("colors.black-700"),
						},
						blockquote: {
							color: theme("colors.text-secondary"),
							borderLeftColor: theme("colors.neon-purple"),
						},
					},
				},
			}),
		},
	},
	darkMode: "class",
	plugins: [
		require("@tailwindcss/typography"),
		// Custom plugin for glow utilities
		function ({ addUtilities }) {
			const glowUtilities = {
				".glow-text-neon-green": {
					textShadow:
						"0 0 10px rgba(57, 255, 20, 0.8), 0 0 20px rgba(57, 255, 20, 0.6), 0 0 30px rgba(57, 255, 20, 0.4)",
				},
				".glow-text-neon-pink": {
					textShadow:
						"0 0 10px rgba(255, 16, 240, 0.8), 0 0 20px rgba(255, 16, 240, 0.6), 0 0 30px rgba(255, 16, 240, 0.4)",
				},
				".glow-text-neon-blue": {
					textShadow:
						"0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 212, 255, 0.4)",
				},
				".glow-border-neon-green": {
					boxShadow:
						"inset 0 0 5px rgba(57, 255, 20, 0.5), 0 0 10px rgba(57, 255, 20, 0.5)",
				},
				".glow-border-neon-pink": {
					boxShadow:
						"inset 0 0 5px rgba(255, 16, 240, 0.5), 0 0 10px rgba(255, 16, 240, 0.5)",
				},
				".glow-border-neon-blue": {
					boxShadow:
						"inset 0 0 5px rgba(0, 212, 255, 0.5), 0 0 10px rgba(0, 212, 255, 0.5)",
				},
			};
			addUtilities(glowUtilities);
		},
	],
};
