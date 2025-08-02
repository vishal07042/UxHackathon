# Framer Motion Animation Patterns - UrbanOrchestrator

## Animation Inventory

### 1. Page Transitions

**Standard Page Variant**

```typescript
const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: "easeOut" },
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: { duration: 0.3 },
	},
};
```

**Usage**: All page components (Home, About, Features, etc.)

### 2. Stagger Animations

**Container with Staggered Children**

```typescript
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
		transition: { duration: 0.6, ease: "easeOut" },
	},
};
```

**Usage**: Feature grids, card lists, menu items

### 3. Micro-interactions

**Button Interactions**

```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Card Hover Effects**

```typescript
whileHover={{
  scale: 1.02,
  y: -5,
  transition: { type: "spring", stiffness: 200, damping: 20 }
}}
```

### 4. Continuous Animations

**Rotating Elements**

```typescript
animate={{ rotate: 360 }}
transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
```

**Floating Orbs**

```typescript
animate={{
  scale: [1, 1.2, 1],
  rotate: [0, 180, 360],
}}
transition={{
  duration: 20,
  repeat: Infinity,
  ease: "linear"
}}
```

**Pulsing Elements**

```typescript
animate={{
  scale: [1, 1.5, 1],
  opacity: [1, 0.5, 1]
}}
transition={{
  duration: 1,
  repeat: Infinity,
  delay: index * 0.2
}}
```

### 5. Loading States

**Spinner Animation**

```typescript
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
```

**Sequential Agent Loading**

```typescript
initial={{ x: -50, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: agent.delay, type: "spring" }}
```

### 6. Spring Animations

**Navigation Items**

```typescript
variants={{
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}}
```

**Modal/Overlay Entry**

```typescript
initial={{ scale: 0.8, y: 50 }}
animate={{ scale: 1, y: 0 }}
exit={{ scale: 0.8, y: 50 }}
transition={{ type: "spring", stiffness: 200, damping: 20 }}
```

### 7. Layout Animations

**Auto-animate Layout Changes**

```typescript
<motion.div layout transition={{ type: "spring", stiffness: 100, damping: 20 }}>
```

### 8. Gesture-based Animations

**Drag Constraints** (Currently unused but available)

```typescript
drag="x"
dragConstraints={{ left: -100, right: 100 }}
dragElastic={0.2}
```

## Performance Considerations

### Current Issues

1. **Multiple Infinite Animations**: Background orbs, loading spinners running simultaneously
2. **No GPU Optimization**: Missing `will-change` properties
3. **No Reduced Motion Support**: Animations always active

### Optimization Opportunities

**1. Add Reduced Motion Support**

```typescript
const prefersReducedMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)"
).matches;

const safeAnimation = prefersReducedMotion
	? {}
	: {
			animate: { scale: [1, 1.2, 1] },
			transition: { duration: 2, repeat: Infinity },
	  };
```

**2. Use CSS Variables for Continuous Animations**

```css
@keyframes float {
	0%,
	100% {
		transform: translateY(0) rotate(0deg);
	}
	50% {
		transform: translateY(-20px) rotate(180deg);
	}
}

.floating-element {
	animation: float 6s ease-in-out infinite;
	will-change: transform;
}
```

**3. Implement Animation Toggle**

```typescript
const { animationsEnabled } = useTheme();
const animations = animationsEnabled ? normalAnimations : {};
```

## Animation Patterns by Component Type

### Headers/Navigation

-   Slide down on mount
-   Hover scale on items
-   Active state morphing

### Cards/Panels

-   Fade in up on scroll
-   Hover lift effect
-   Click scale feedback

### Buttons/CTAs

-   Hover scale up
-   Tap scale down
-   Loading state rotation

### Backgrounds

-   Continuous floating orbs
-   Gradient position shifts
-   Parallax effects (potential)

### Modals/Overlays

-   Spring scale entry
-   Backdrop fade
-   Content stagger

## Theming Considerations

### Theme-able Animation Properties

1. **Duration**: Fast/Normal/Slow modes
2. **Spring Stiffness**: Snappy vs Smooth
3. **Easing Functions**: Theme-specific curves
4. **Animation Intensity**: Subtle vs Dramatic

### Theme-specific Animations

-   **Neon Theme**: Glitch effects, sharp transitions
-   **Dark Theme**: Subtle glows, smooth fades
-   **Minimal Theme**: Reduced animations, instant transitions
-   **Cyberpunk Theme**: Matrix-like cascades, tech transitions

## Recommended Animation System

### 1. Create Animation Presets

```typescript
// animations/presets.ts
export const animations = {
	fadeInUp: {
		/* ... */
	},
	slideIn: {
		/* ... */
	},
	scaleIn: {
		/* ... */
	},
	// ...
};
```

### 2. Theme-aware Animations

```typescript
// animations/themed.ts
export const getThemeAnimations = (theme: string) => {
	switch (theme) {
		case "neon":
			return neonAnimations;
		case "minimal":
			return minimalAnimations;
		default:
			return defaultAnimations;
	}
};
```

### 3. Performance Controls

```typescript
// hooks/useAnimationSettings.ts
export const useAnimationSettings = () => {
	const prefersReduced = usePrefersReducedMotion();
	const { animationSpeed, animationsEnabled } = useUserPreferences();

	return {
		duration: prefersReduced ? 0 : baseSpeed * animationSpeed,
		enabled: !prefersReduced && animationsEnabled,
	};
};
```
