import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Share2, 
  Calendar,
  MapPin,
  Bus,
  User,
  Phone,
  Mail,
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react';
import { Button } from './ui/Button';
import { redBusApi } from '../services/redBusApi';

interface BookingDetails {
  bookingId: string;
  pnr: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  route: any;
  selectedSeats: any[];
  totalAmount: number;
  passengerDetails?: any[];
  journeyDate?: string;
  contactInfo?: any;
  ticketUrl?: string;
  cancellationDeadline?: string;
}

interface BookingStatusProps {
  booking: BookingDetails;
  onClose?: () => void;
  showFullDetails?: boolean;
}

export const BookingStatus: React.FC<BookingStatusProps> = ({
  booking,
  onClose,
  showFullDetails = true
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(booking);

  const refreshBookingStatus = async () => {
    setIsRefreshing(true);
    try {
      const updated = await redBusApi.getBookingDetails(booking.bookingId);
      setBookingDetails({ ...bookingDetails, ...updated });
    } catch (error) {
      console.error('Failed to refresh booking status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    switch (bookingDetails.status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-warning" />;
      case 'cancelled':
        return <X className="w-6 h-6 text-error" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-success" />;
      default:
        return <AlertCircle className="w-6 h-6 text-text-secondary" />;
    }
  };

  const getStatusColor = () => {
    switch (bookingDetails.status) {
      case 'confirmed':
        return 'from-success/20 to-success/10 border-success/30';
      case 'pending':
        return 'from-warning/20 to-warning/10 border-warning/30';
      case 'cancelled':
        return 'from-error/20 to-error/10 border-error/30';
      case 'completed':
        return 'from-success/20 to-success/10 border-success/30';
      default:
        return 'from-text-secondary/20 to-text-secondary/10 border-text-secondary/30';
    }
  };

  const getStatusText = () => {
    switch (bookingDetails.status) {
      case 'confirmed':
        return 'Booking Confirmed';
      case 'pending':
        return 'Payment Pending';
      case 'cancelled':
        return 'Booking Cancelled';
      case 'completed':
        return 'Journey Completed';
      default:
        return 'Unknown Status';
    }
  };

  const handleDownloadTicket = () => {
    if (bookingDetails.ticketUrl) {
      window.open(bookingDetails.ticketUrl, '_blank');
    }
  };

  const handleShareBooking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bus Booking Details',
          text: `Booking confirmed! PNR: ${bookingDetails.pnr}`,
          url: bookingDetails.ticketUrl || window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Booking Details\nPNR: ${bookingDetails.pnr}\nBooking ID: ${bookingDetails.bookingId}`
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-high border border-border-secondary overflow-hidden"
    >
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${getStatusColor()} border-b border-border-secondary`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {getStatusIcon()}
            </motion.div>
            <div>
              <h3 className="font-semibold text-text-primary text-lg">
                {getStatusText()}
              </h3>
              <p className="text-sm text-text-secondary">
                PNR: {bookingDetails.pnr}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBookingStatus}
              disabled={isRefreshing}
              leftIcon={
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              }
            >
              Refresh
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                leftIcon={<X className="w-4 h-4" />}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details */}
      {showFullDetails && (
        <div className="p-6 space-y-6">
          {/* Journey Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-elevated rounded-xl p-4"
          >
            <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <Bus className="w-4 h-4" />
              Journey Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Operator</p>
                <p className="font-medium text-text-primary">{bookingDetails.route?.operatorName}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Bus Type</p>
                <p className="font-medium text-text-primary">{bookingDetails.route?.busType}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Departure</p>
                <p className="font-medium text-text-primary">{bookingDetails.route?.departureTime}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Arrival</p>
                <p className="font-medium text-text-primary">{bookingDetails.route?.arrivalTime}</p>
              </div>
            </div>
          </motion.div>

          {/* Seat Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-elevated rounded-xl p-4"
          >
            <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Seat Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bookingDetails.selectedSeats?.map((seat, index) => (
                <div key={index} className="text-center p-2 bg-surface-overlay rounded-lg">
                  <p className="font-medium text-text-primary">{seat.number}</p>
                  <p className="text-xs text-text-secondary">{seat.type}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-elevated rounded-xl p-4"
          >
            <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Details
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Amount</span>
              <span className="text-2xl font-bold text-text-primary">
                ₹{bookingDetails.totalAmount}
              </span>
            </div>
          </motion.div>

          {/* Contact Information */}
          {bookingDetails.contactInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-surface-elevated rounded-xl p-4"
            >
              <h4 className="font-medium text-text-primary mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-primary">{bookingDetails.contactInfo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-primary">{bookingDetails.contactInfo.phone}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            {bookingDetails.status === 'confirmed' && (
              <>
                <Button
                  onClick={handleDownloadTicket}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="flex-1"
                >
                  Download Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareBooking}
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Share
                </Button>
              </>
            )}
          </motion.div>

          {/* Cancellation Info */}
          {bookingDetails.cancellationDeadline && bookingDetails.status === 'confirmed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-3 bg-warning/10 border border-warning/30 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">Cancellation Policy</span>
              </div>
              <p className="text-xs text-text-secondary">
                Free cancellation until {new Date(bookingDetails.cancellationDeadline).toLocaleString()}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Booking History Component
interface BookingHistoryProps {
  userId: string;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);

  useEffect(() => {
    loadBookingHistory();
  }, [userId]);

  const loadBookingHistory = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from an API
      const mockBookings: BookingDetails[] = [
        {
          bookingId: 'BK123456',
          pnr: 'PNR789ABC',
          status: 'confirmed',
          route: {
            operatorName: 'Volvo Travels',
            busType: 'AC Sleeper',
            departureTime: '22:30',
            arrivalTime: '06:00'
          },
          selectedSeats: [
            { number: '12A', type: 'window' },
            { number: '12B', type: 'aisle' }
          ],
          totalAmount: 1200,
          journeyDate: '2024-01-20'
        }
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to load booking history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-neon-blue-accessible border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-text-primary">Booking History</h3>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Bus className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h4 className="font-medium text-text-primary mb-2">No bookings found</h4>
          <p className="text-text-secondary">Your booking history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <motion.div
              key={booking.bookingId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-surface-elevated rounded-xl border border-border-primary hover:border-neon-blue-accessible/50 cursor-pointer transition-all duration-200"
              onClick={() => setSelectedBooking(booking)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">{booking.route.operatorName}</h4>
                  <p className="text-sm text-text-secondary">PNR: {booking.pnr}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-primary">₹{booking.totalAmount}</p>
                  <div className="flex items-center gap-1">
                    {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3 text-success" />}
                    <span className="text-xs text-text-secondary capitalize">{booking.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <BookingStatus
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
                showFullDetails={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingStatus;
