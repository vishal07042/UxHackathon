# Color Usage Analysis - UXplorer 2025

## Current Color Palette Usage

### Primary Brand Colors
- **Blue**: Primary action color
  - `blue-50`, `blue-100`, `blue-200`, `blue-400`, `blue-500`, `blue-600`, `blue-700`
  - Used for: Primary buttons, links, metro transport, primary accents
  
- **Purple**: Secondary brand color  
  - `purple-50`, `purple-100`, `purple-200`, `purple-400`, `purple-500`, `purple-600`, `purple-700`
  - Used for: Gradients, ride transport, secondary accents

### Semantic Colors
- **Green**: Success/Eco
  - `green-50`, `green-100`, `green-400`, `green-500`, `green-600`
  - Used for: Bus transport, cost displays, success states
  
- **Orange**: Warning/Energy
  - `orange-50`, `orange-100`, `orange-500`, `orange-600`
  - Used for: Bike transport, AI planner, energy features

- **Red**: Error/Alert
  - `red-500`
  - Used for: Delays, errors, warnings

- **Gray**: Neutral
  - `gray-50`, `gray-100`, `gray-200`, `gray-300`, `gray-400`, `gray-500`, `gray-600`, `gray-700`, `gray-800`, `gray-900`
  - Used for: Text, borders, backgrounds, disabled states

### Additional Colors
- **Indigo**: `indigo-50` (gradient backgrounds)
- **Pink**: `pink-500` (gradient accents)
- **Yellow**: `yellow-400` (star ratings)

## Color Usage by Category

### 1. Background Colors
```
Primary backgrounds:
- bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
- bg-white/70 backdrop-blur-lg
- bg-white/80 backdrop-blur-lg
- bg-gradient-to-r from-blue-600 to-purple-600

Component backgrounds:
- bg-blue-50, bg-blue-100
- bg-purple-50, bg-purple-100  
- bg-green-50, bg-green-100
- bg-orange-50, bg-orange-100
- bg-gray-50/70
```

### 2. Text Colors
```
- text-gray-900 (primary text)
- text-gray-800 (headings)
- text-gray-700 (secondary text)
- text-gray-600 (tertiary text)
- text-gray-500 (muted text)
- text-blue-600, text-blue-700 (links, accents)
- text-white (on dark backgrounds)
```

### 3. Border Colors
```
- border-white/20 (glassmorphism)
- border-gray-200 (default borders)
- border-gray-300 (hover states)
- border-${color}-400 (selected states - dynamic)
```

### 4. Transport Mode Color Mapping
```javascript
{
  metro: 'blue',
  bus: 'green',
  ride: 'purple',
  bike: 'orange',
  walk: 'gray'
}
```

## Theming Opportunities

### 1. Define Semantic Color Tokens
Instead of hard-coded Tailwind colors, use semantic naming:

```css
/* Current */
bg-blue-600

/* Proposed */
bg-primary-600
```

### 2. Color Variables for Themes

```css
:root {
  /* Brand Colors */
  --color-primary: theme('colors.blue.600');
  --color-secondary: theme('colors.purple.600');
  
  /* Semantic Colors */
  --color-success: theme('colors.green.600');
  --color-warning: theme('colors.orange.600');
  --color-error: theme('colors.red.600');
  
  /* Surface Colors */
  --color-surface: theme('colors.white');
  --color-surface-alt: theme('colors.gray.50');
  
  /* Text Colors */
  --color-text-primary: theme('colors.gray.900');
  --color-text-secondary: theme('colors.gray.700');
  --color-text-muted: theme('colors.gray.500');
}

/* Dark Theme */
[data-theme="dark"] {
  --color-surface: theme('colors.gray.900');
  --color-surface-alt: theme('colors.gray.800');
  --color-text-primary: theme('colors.gray.100');
  /* ... */
}

/* Neon Theme */
[data-theme="neon"] {
  --color-primary: theme('colors.cyan.400');
  --color-secondary: theme('colors.pink.400');
  /* ... */
}
```

### 3. Gradient Definitions
Current gradients that need theming:
- Hero background gradient
- Button gradients
- Card hover effects
- Navigation active states

### 4. Glassmorphism Effects
Current implementation needs theme-aware opacity:
- `bg-white/70` → `bg-surface/70`
- `border-white/20` → `border-surface/20`

## Recommended Color System

### Base Palette (Theme-able)
```
primary: 50-900
secondary: 50-900
accent: 50-900
neutral: 50-950
success: 50-900
warning: 50-900
error: 50-900
```

### Surface Hierarchy
```
surface-base
surface-raised
surface-overlay
surface-accent
```

### Text Hierarchy
```
text-primary
text-secondary
text-tertiary
text-muted
text-inverse
```

### Interactive States
```
state-hover
state-active
state-focus
state-disabled
```

## Implementation Priority

1. **Phase 1**: Fix dynamic color classes
2. **Phase 2**: Implement CSS variables
3. **Phase 3**: Create theme variants
4. **Phase 4**: Add theme switcher
5. **Phase 5**: Persist user preference
