import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Bell, 
  X,
  Bus,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { Button } from './ui/Button';

export interface BookingNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  bookingData?: any;
}

interface BookingNotificationsProps {
  notifications: BookingNotification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const BookingNotifications: React.FC<BookingNotificationsProps> = ({
  notifications,
  onDismiss,
  position = 'top-right'
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<BookingNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);

    // Auto-dismiss notifications
    notifications.forEach(notification => {
      if (notification.autoClose !== false) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          onDismiss(notification.id);
        }, duration);
      }
    });
  }, [notifications, onDismiss]);

  const getIcon = (type: BookingNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'info':
      default:
        return <Bell className="w-5 h-5 text-neon-blue-accessible" />;
    }
  };

  const getColorClasses = (type: BookingNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-success/10';
      case 'warning':
        return 'border-warning/30 bg-warning/10';
      case 'error':
        return 'border-error/30 bg-error/10';
      case 'info':
      default:
        return 'border-neon-blue-accessible/30 bg-neon-blue-accessible/10';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3 max-w-sm w-full`}>
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              p-4 rounded-xl border backdrop-blur-lg shadow-elevation-high
              ${getColorClasses(notification.type)}
            `}
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                {getIcon(notification.type)}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-text-primary text-sm">
                  {notification.title}
                </h4>
                <p className="text-text-secondary text-xs mt-1">
                  {notification.message}
                </p>
                
                {/* Booking Data Display */}
                {notification.bookingData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 p-2 bg-surface-elevated rounded-lg"
                  >
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {notification.bookingData.pnr && (
                        <div>
                          <span className="text-text-secondary">PNR:</span>
                          <span className="text-text-primary font-medium ml-1">
                            {notification.bookingData.pnr}
                          </span>
                        </div>
                      )}
                      {notification.bookingData.totalAmount && (
                        <div>
                          <span className="text-text-secondary">Amount:</span>
                          <span className="text-text-primary font-medium ml-1">
                            ₹{notification.bookingData.totalAmount}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Action Button */}
                {notification.actionButton && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={notification.actionButton.onClick}
                      className="text-xs"
                    >
                      {notification.actionButton.label}
                    </Button>
                  </motion.div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Notification Manager Hook
export const useBookingNotifications = () => {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);

  const addNotification = (notification: Omit<BookingNotification, 'id' | 'timestamp'>) => {
    const newNotification: BookingNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Predefined notification creators
  const notifyBookingSuccess = (bookingData: any) => {
    addNotification({
      type: 'success',
      title: 'Booking Confirmed!',
      message: `Your bus ticket has been booked successfully. PNR: ${bookingData.pnr}`,
      bookingData,
      actionButton: {
        label: 'View Ticket',
        onClick: () => {
          if (bookingData.ticketUrl) {
            window.open(bookingData.ticketUrl, '_blank');
          }
        }
      }
    });
  };

  const notifyBookingPending = (bookingData: any) => {
    addNotification({
      type: 'warning',
      title: 'Payment Pending',
      message: 'Your booking is confirmed but payment is still processing.',
      bookingData,
      autoClose: false
    });
  };

  const notifyBookingFailed = (error: string) => {
    addNotification({
      type: 'error',
      title: 'Booking Failed',
      message: error || 'Unable to complete your booking. Please try again.',
      duration: 8000
    });
  };

  const notifyTrafficUpdate = (route: string, delay: number) => {
    addNotification({
      type: 'info',
      title: 'Traffic Update',
      message: `${delay} minute delay expected on ${route} due to traffic conditions.`,
      duration: 10000
    });
  };

  const notifyPriceAlert = (route: string, savings: number) => {
    addNotification({
      type: 'info',
      title: 'Price Alert',
      message: `Fare dropped by ₹${savings} for ${route}. Book now to save!`,
      duration: 15000,
      actionButton: {
        label: 'Book Now',
        onClick: () => {
          // Handle booking action
        }
      }
    });
  };

  const notifyDepartureReminder = (bookingData: any, timeUntilDeparture: number) => {
    addNotification({
      type: 'warning',
      title: 'Departure Reminder',
      message: `Your bus departs in ${timeUntilDeparture} minutes. PNR: ${bookingData.pnr}`,
      autoClose: false,
      actionButton: {
        label: 'View Details',
        onClick: () => {
          // Show booking details
        }
      }
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    notifyBookingSuccess,
    notifyBookingPending,
    notifyBookingFailed,
    notifyTrafficUpdate,
    notifyPriceAlert,
    notifyDepartureReminder
  };
};

export default BookingNotifications;
