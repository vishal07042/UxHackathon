import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          className="min-h-screen flex items-center justify-center bg-bg-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-surface-overlay/90 backdrop-blur-lg rounded-3xl shadow-elevation-high p-8 border border-border-secondary text-center max-w-md mx-4"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <AlertTriangle className="w-16 h-16 text-neon-orange mx-auto mb-4" />
            </motion.div>
            
            <motion.h2 
              className="text-2xl font-bold text-text-primary mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Something went wrong
            </motion.h2>
            
            <motion.p 
              className="text-text-secondary mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              The application encountered an unexpected error. This might be due to network issues or temporary service unavailability.
            </motion.p>
            
            {this.state.error && (
              <motion.details 
                className="mb-6 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <summary className="cursor-pointer text-sm text-text-muted hover:text-text-secondary">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-bg-secondary rounded-lg text-xs text-text-muted overflow-auto">
                  {this.state.error.message}
                </pre>
              </motion.details>
            )}
            
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary font-bold rounded-xl shadow-glow-neon-blue hover:shadow-glow-neon-purple transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
              
              <motion.button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-border-primary text-text-primary font-medium rounded-xl hover:bg-surface-elevated transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Go Home
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;