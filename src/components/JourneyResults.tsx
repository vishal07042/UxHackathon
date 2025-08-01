import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, DollarSign, Star, Navigation, Train, Bus, Car, Bike, MapPin, ArrowRight } from 'lucide-react';
import { JourneyPlan, Journey, TransportStep } from '../types';

interface JourneyResultsProps {
  plans: JourneyPlan[];
  isLoading: boolean;
  journey: Journey | null;
}

const JourneyResults: React.FC<JourneyResultsProps> = ({ plans, isLoading, journey }) => {
  const getTransportIcon = (mode: TransportStep['mode']) => {
    switch (mode) {
      case 'metro': return Train;
      case 'bus': return Bus;
      case 'ride': return Car;
      case 'bike': return Bike;
      case 'walk': return Navigation;
      default: return Navigation;
    }
  };

  const getTransportColor = (mode: TransportStep['mode']) => {
    switch (mode) {
      case 'metro': return 'neon-blue';
      case 'bus': return 'neon-green';
      case 'ride': return 'neon-purple';
      case 'bike': return 'neon-orange';
      case 'walk': return 'text-secondary';
      default: return 'text-secondary';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const planVariants = {
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

  if (!journey && plans.length === 0) {
    return (
      <motion.div 
        className="bg-surface-overlay/70 backdrop-blur-lg rounded-3xl shadow-xl p-12 border border-border-secondary text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Navigation className="w-16 h-16 text-text-muted" />
        </motion.div>
        <h3 className="text-xl font-semibold text-text-secondary mb-2">Ready to Plan Your Journey</h3>
        <p className="text-text-muted">Enter your source and destination to see optimized routes</p>
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
      {journey && (
        <motion.div 
          className="bg-surface-overlay/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-border-secondary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg shadow-glow-neon-blue"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <MapPin className="w-5 h-5 text-bg-primary" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-text-primary">{journey.source}</h3>
                <p className="text-sm text-text-muted">to {journey.destination}</p>
              </div>
            </div>
            <motion.div 
              className="px-4 py-2 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-full border border-border-primary"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm font-medium text-neon-blue capitalize">
                {journey.preference} Route
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {plans.length > 0 && (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
          >
            <motion.h2 
              className="text-2xl font-bold text-text-primary mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Journey Options ({plans.length})
            </motion.h2>
            
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className="bg-surface-overlay/80 backdrop-blur-lg rounded-2xl shadow-elevation-high p-6 border border-border-secondary overflow-hidden"
                variants={planVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {/* Plan Header */}
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
                      {index === 0 ? 'Recommended' : `Option ${index + 1}`}
                    </div>
                    <span className="text-sm text-text-secondary">
                      Optimized for {plan.optimizedFor}
                    </span>
                  </motion.div>
                  <motion.div 
                    className="text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <div className="text-sm text-text-muted">Confidence</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 + i * 0.1 }}
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              i < Math.floor(plan.confidence * 5) 
                                ? 'text-neon-yellow fill-current' 
                                : 'text-text-muted'
                            }`} 
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Plan Summary */}
                <motion.div 
                  className="grid grid-cols-3 gap-4 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <div className="text-center p-3 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
                    <Clock className="w-6 h-6 text-neon-blue mx-auto mb-2" />
                    <div className="text-xl font-bold text-neon-blue">{plan.totalDuration}m</div>
                    <div className="text-xs text-text-secondary">Total Time</div>
                  </div>
                  <div className="text-center p-3 bg-neon-green/10 rounded-xl border border-neon-green/20">
                    <DollarSign className="w-6 h-6 text-neon-green mx-auto mb-2" />
                    <div className="text-xl font-bold text-neon-green">${plan.totalCost}</div>
                    <div className="text-xs text-text-secondary">Total Cost</div>
                  </div>
                  <div className="text-center p-3 bg-neon-purple/10 rounded-xl border border-neon-purple/20">
                    <Star className="w-6 h-6 text-neon-purple mx-auto mb-2" />
                    <div className="text-xl font-bold text-neon-purple">{plan.comfortScore}/5</div>
                    <div className="text-xs text-text-secondary">Comfort</div>
                  </div>
                </motion.div>

                {/* Journey Steps */}
                <div className="space-y-3">
                  {plan.steps.map((step, stepIndex) => {
                    const Icon = getTransportIcon(step.mode);
                    const color = getTransportColor(step.mode);
                    
                    return (
                      <motion.div
                        key={step.id}
                        className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ 
                          delay: index * 0.1 + stepIndex * 0.1 + 0.3,
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
                            <span className="font-medium text-text-primary capitalize">{step.mode}</span>
                            <ArrowRight className="w-3 h-3 text-text-muted" />
                            <span className="text-sm text-text-secondary">{step.from} → {step.to}</span>
                          </div>
                          <div className="text-xs text-text-muted">{step.details}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-text-primary">{step.duration}m</div>
                          <div className="text-sm text-neon-green">${step.cost}</div>
                          {step.delay && (
                            <motion.div 
                              className="text-xs text-neon-pink font-medium"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              +{step.delay}m delay
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default JourneyResults;