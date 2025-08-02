import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, DollarSign, Navigation, Train, Bus, Car, Bike, MapPin, ArrowRight, AlertTriangle } from 'lucide-react';
import { VBBJourney, VBBLeg, VBBLocation } from '../services/vbbApi';

interface VBBJourneyResultsProps {
  journeys: VBBJourney[];
  origin?: VBBLocation;
  destination?: VBBLocation;
  isLoading: boolean;
  onJourneySelect?: (journey: VBBJourney) => void;
  selectedJourney?: VBBJourney;
}

const getTransportIcon = (mode: string) => {
  switch (mode) {
    case 'subway': return Train;
    case 'bus': return Bus;
    case 'tram': return Train;
    case 'regional': return Train;
    case 'ferry': return Car;
    case 'walking': return Navigation;
    default: return Bus;
  }
};

const getTransportColor = (mode: string) => {
  switch (mode) {
    case 'subway': return 'neon-blue';
    case 'bus': return 'neon-green';
    case 'tram': return 'neon-orange';
    case 'regional': return 'neon-purple';
    case 'ferry': return 'neon-cyan';
    case 'walking': return 'text-secondary';
    default: return 'neon-green';
  }
};

const formatDuration = (departure: string, arrival: string): number => {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  return Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const VBBJourneyResults: React.FC<VBBJourneyResultsProps> = ({
  journeys,
  origin,
  destination,
  isLoading,
  onJourneySelect,
  selectedJourney
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const journeyVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="bg-surface-overlay/70 backdrop-blur-lg rounded-3xl shadow-xl p-12 border border-border-secondary text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <h3 className="text-xl font-semibold text-text-primary mb-2">Planning Your Journey</h3>
        <p className="text-text-muted">Searching VBB network for optimal routes...</p>
      </motion.div>
    );
  }

  if (!origin && !destination && journeys.length === 0) {
    return (
      <motion.div 
        className="bg-surface-overlay/70 backdrop-blur-lg rounded-3xl shadow-xl p-12 border border-border-secondary text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Navigation className="w-16 h-16 text-text-muted" />
        </motion.div>
        <h3 className="text-xl font-semibold text-text-secondary mb-2">Ready to Plan Your Journey</h3>
        <p className="text-text-muted">Enter your origin and destination to see real VBB routes</p>
      </motion.div>
    );
  }

  if (journeys.length === 0 && origin && destination) {
    return (
      <motion.div 
        className="bg-surface-overlay/70 backdrop-blur-lg rounded-3xl shadow-xl p-12 border border-border-secondary text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertTriangle className="w-16 h-16 text-neon-orange mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">No Routes Found</h3>
        <p className="text-text-muted">No public transport connections found between these locations</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {origin && destination && (
        <motion.div 
          className="bg-surface-overlay/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-border-secondary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-2 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg shadow-glow-neon-green"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <MapPin className="w-5 h-5 text-bg-primary" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-text-primary">{origin.name}</h3>
                <p className="text-sm text-text-muted">to {destination.name}</p>
              </div>
            </div>
            <motion.div 
              className="px-4 py-2 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-full border border-border-primary"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm font-medium text-neon-blue">
                {journeys.length} routes found
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {journeys.length > 0 && (
          <motion.div className="space-y-4">
            <motion.h2 
              className="text-2xl font-bold text-text-primary mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Journey Options
            </motion.h2>
            
            {journeys.map((journey, index) => {
              const totalDuration = formatDuration(
                journey.legs[0].departure,
                journey.legs[journey.legs.length - 1].arrival
              );
              
              const isSelected = selectedJourney === journey;
              
              return (
                <motion.div
                  key={index}
                  className={`bg-surface-overlay/80 backdrop-blur-lg rounded-2xl shadow-elevation-high p-6 border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-neon-blue shadow-glow-neon-blue' 
                      : 'border-border-secondary hover:border-border-primary'
                  }`}
                  variants={journeyVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => onJourneySelect?.(journey)}
                >
                  {/* Journey Header */}
                  <div className="flex items-center justify-between mb-6">
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        index === 0 ? 'bg-gradient-to-r from-neon-green to-neon-blue text-bg-primary' :
                        index === 1 ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary' :
                        'bg-gradient-to-r from-neon-purple to-neon-pink text-bg-primary'
                      }`}>
                        {index === 0 ? 'Fastest' : `Option ${index + 1}`}
                      </div>
                      <span className="text-sm text-text-secondary">
                        {journey.legs.length} {journey.legs.length === 1 ? 'segment' : 'segments'}
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      className="text-right"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <div className="text-sm text-text-muted">Departure</div>
                      <div className="font-semibold text-text-primary">
                        {formatTime(journey.legs[0].departure)}
                      </div>
                    </motion.div>
                  </div>

                  {/* Journey Summary */}
                  <motion.div 
                    className="grid grid-cols-3 gap-4 mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <div className="text-center p-3 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
                      <Clock className="w-6 h-6 text-neon-blue mx-auto mb-2" />
                      <div className="text-xl font-bold text-neon-blue">{totalDuration}m</div>
                      <div className="text-xs text-text-secondary">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-neon-green/10 rounded-xl border border-neon-green/20">
                      <DollarSign className="w-6 h-6 text-neon-green mx-auto mb-2" />
                      <div className="text-xl font-bold text-neon-green">
                        {journey.price ? `€${journey.price.amount.toFixed(2)}` : 'N/A'}
                      </div>
                      <div className="text-xs text-text-secondary">Price</div>
                    </div>
                    <div className="text-center p-3 bg-neon-purple/10 rounded-xl border border-neon-purple/20">
                      <ArrowRight className="w-6 h-6 text-neon-purple mx-auto mb-2" />
                      <div className="text-xl font-bold text-neon-purple">
                        {formatTime(journey.legs[journey.legs.length - 1].arrival)}
                      </div>
                      <div className="text-xs text-text-secondary">Arrival</div>
                    </div>
                  </motion.div>

                  {/* Journey Legs */}
                  <div className="space-y-3">
                    {journey.legs.map((leg, legIndex) => {
                      const Icon = getTransportIcon(leg.mode);
                      const color = getTransportColor(leg.mode);
                      const duration = formatDuration(leg.departure, leg.arrival);
                      
                      return (
                        <motion.div
                          key={legIndex}
                          className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl"
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ 
                            delay: index * 0.1 + legIndex * 0.1 + 0.3,
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <motion.div 
                            className={`p-2 bg-${color}/10 rounded-lg border border-${color}/20`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className={`w-5 h-5 text-${color}`} />
                          </motion.div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-text-primary capitalize">
                                {leg.line?.name || leg.mode}
                              </span>
                              {leg.direction && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-text-muted" />
                                  <span className="text-sm text-text-secondary">{leg.direction}</span>
                                </>
                              )}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {leg.origin.name} → {leg.destination.name}
                            </div>
                            {leg.line?.product && (
                              <div className="text-xs text-text-muted capitalize">
                                {leg.line.product}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-text-primary">
                              {formatTime(leg.departure)} - {formatTime(leg.arrival)}
                            </div>
                            <div className="text-sm text-neon-blue">{duration}m</div>
                            {leg.distance && (
                              <div className="text-xs text-text-muted">
                                {(leg.distance / 1000).toFixed(1)}km
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VBBJourneyResults;