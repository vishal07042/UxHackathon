import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to concatenate class names
 * Combines clsx for conditional classes with proper handling of undefined/null values
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export default cn;
