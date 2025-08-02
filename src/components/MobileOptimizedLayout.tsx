import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  List, 
  Lightbulb, 
  ChevronUp, 
  ChevronDown,
  Menu,
  X,
  Navigation
} from 'lucide-react';
import { Button, IconButton } from './ui/Button';

interface MobileTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface MobileOptimizedLayoutProps {
  tabs: MobileTab[];
  defaultTab?: string;
  className?: string;
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  tabs,
  defaultTab,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide tab bar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsTabBarVisible(false);
      } else {
        setIsTabBarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const tabVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-bg-primary ${className}`}>
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-full w-full"
          >
            {activeTabData?.component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Tab Bar */}
      <AnimatePresence>
        {isTabBarVisible && (
          <motion.div
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-overlay/95 backdrop-blur-lg border-t border-border-secondary"
          >
            <div className="flex items-center justify-around px-2 py-3 safe-area-bottom">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 max-w-20 ${
                      isActive 
                        ? 'bg-neon-blue-accessible/20 text-neon-blue-accessible' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.1 : 1,
                        rotate: isActive ? 5 : 0
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      {tab.icon}
                    </motion.div>
                    <span className="text-xs font-medium truncate w-full text-center">
                      {tab.label}
                    </span>
                    
                    {/* Active indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="w-1 h-1 bg-neon-blue-accessible rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Swipeable content container for mobile gestures
interface SwipeableContentProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableContent: React.FC<SwipeableContentProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 100; // Minimum swipe distance
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  const swipeOffset = isDragging ? currentX - startX : 0;

  return (
    <motion.div
      className={`touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      animate={{ x: swipeOffset * 0.1 }} // Subtle visual feedback
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  collapsible = false,
  defaultExpanded = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      className={`bg-surface-overlay/90 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary overflow-hidden ${className}`}
      layout
    >
      {/* Header */}
      {(title || subtitle || icon) && (
        <motion.div
          className={`p-4 ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
          whileTap={collapsible ? { scale: 0.98 } : {}}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <motion.div
                  className="p-2 bg-gradient-to-br from-neon-blue-accessible to-neon-purple-accessible rounded-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {icon}
                </motion.div>
              )}
              <div>
                {title && (
                  <h3 className="font-semibold text-text-primary text-lg">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-sm text-text-secondary">{subtitle}</p>
                )}
              </div>
            </div>
            
            {collapsible && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={title || subtitle || icon ? 'px-4 pb-4' : 'p-4'}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Touch-optimized button for mobile
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'lg', // Default to large for better touch targets
  fullWidth = false,
  disabled = false,
  className = ''
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      className={`min-h-12 touch-manipulation ${className}`} // Ensure minimum touch target size
    >
      {children}
    </Button>
  );
};

export default MobileOptimizedLayout;
