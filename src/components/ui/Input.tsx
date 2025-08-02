import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  showPasswordToggle?: boolean;
}

const sizeVariants = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg'
};

const variantStyles = {
  default: 'border-2 border-border-primary bg-surface-elevated focus:border-neon-blue-accessible',
  filled: 'border-0 bg-surface-overlay focus:bg-surface-elevated',
  outline: 'border-2 border-neon-blue-accessible bg-transparent focus:border-neon-purple-accessible'
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    success,
    hint,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    showPasswordToggle = false,
    type = 'text',
    className,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const successId = success ? `${inputId}-success` : undefined;
    
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;
    
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    
    const inputVariants = {
      rest: { scale: 1 },
      focus: { 
        scale: 1.01,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }
    };

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <motion.label
            htmlFor={inputId}
            className="block text-sm font-semibold text-text-primary"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-label="required">*</span>
            )}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <motion.div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              animate={{ 
                color: isFocused ? '#3b82f6' : hasError ? '#ef4444' : hasSuccess ? '#10b981' : '#a0a0a0',
                rotate: isFocused ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              {leftIcon}
            </motion.div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            id={inputId}
            type={actualType}
            className={cn(
              // Base styles
              'w-full rounded-xl font-medium placeholder-text-muted text-text-primary transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-neon-blue-accessible focus:ring-offset-2 focus:ring-offset-bg-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Size variants
              sizeVariants[size],
              // Variant styles
              variantStyles[variant],
              // Icon padding
              leftIcon && 'pl-10',
              (rightIcon || (isPassword && showPasswordToggle)) && 'pr-10',
              // State styles
              hasError && 'border-error focus:border-error focus:ring-error',
              hasSuccess && 'border-success focus:border-success focus:ring-success',
              className
            )}
            variants={inputVariants}
            initial="rest"
            animate={isFocused ? "focus" : "rest"}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={hasError}
            aria-describedby={cn(
              errorId,
              hintId,
              successId
            ).trim() || undefined}
            {...props}
          />

          {/* Right Icon / Password Toggle */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Success/Error Icons */}
            <AnimatePresence>
              {hasError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="text-error"
                >
                  <AlertCircle className="w-4 h-4" />
                </motion.div>
              )}
              {hasSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="text-success"
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Toggle */}
            {isPassword && showPasswordToggle && (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-secondary hover:text-text-primary focus:outline-none focus:text-neon-blue-accessible"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.button>
            )}

            {/* Custom Right Icon */}
            {rightIcon && !hasError && !hasSuccess && (
              <motion.div
                className="text-text-secondary"
                animate={{ 
                  color: isFocused ? '#3b82f6' : '#a0a0a0'
                }}
                transition={{ duration: 0.2 }}
              >
                {rightIcon}
              </motion.div>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <AnimatePresence>
          {(error || success || hint) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {error && (
                <p
                  id={errorId}
                  className="text-sm text-error flex items-center gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              )}
              {success && !error && (
                <p
                  id={successId}
                  className="text-sm text-success flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </p>
              )}
              {hint && !error && !success && (
                <p
                  id={hintId}
                  className="text-sm text-text-muted"
                >
                  {hint}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
