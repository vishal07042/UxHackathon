import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, DollarSign, Heart, Navigation, ArrowRight } from 'lucide-react';
import { Journey } from '../types';

interface JourneyPlannerProps {
  onPlan: (journey: Journey) => void;
  isPlanning: boolean;
}

const JourneyPlanner: React.FC<JourneyPlannerProps> = ({ onPlan, isPlanning }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [preference, setPreference] = useState<Journey['preference']>('fastest');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source.trim() && destination.trim()) {
      onPlan({
        source: source.trim(),
        destination: destination.trim(),
        preference,
        departureTime: new Date()
      });
    }
  };

  const preferences = [
    { id: 'fastest', label: 'Fastest Route', icon: Clock, color: 'neon-blue', description: 'Minimize travel time' },
    { id: 'cheapest', label: 'Most Affordable', icon: DollarSign, color: 'neon-green', description: 'Save on costs' },
    { id: 'comfortable', label: 'Most Comfortable', icon: Heart, color: 'neon-purple', description: 'Premium experience' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="bg-surface-overlay/90 backdrop-blur-lg rounded-3xl shadow-elevation-high p-8 border border-border-secondary"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div 
        className="flex items-center gap-4 mb-8"
        variants={itemVariants}
      >
        <motion.div 
          className="p-3 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl shadow-glow-neon-blue"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Navigation className="w-7 h-7 text-bg-primary" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Plan Your Journey</h2>
          <p className="text-sm text-text-secondary">Smart AI-powered route optimization</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Input */}
        <motion.div variants={itemVariants}>
          <label htmlFor="source" className="block text-sm font-semibold text-text-primary mb-3">
            From
          </label>
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }}
          >
            <motion.div
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              animate={{ rotate: source ? 360 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <MapPin className="w-5 h-5 text-neon-blue" />
            </motion.div>
            <input
              id="source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter starting location"
              className="w-full pl-12 pr-4 py-4 border-2 border-border-primary rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 bg-surface-elevated backdrop-blur-sm font-medium placeholder-text-muted text-text-primary"
              required
              disabled={isPlanning}
            />
          </motion.div>
        </motion.div>

        {/* Arrow Connector */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <motion.div
            className="p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-glow-neon-blue"
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <ArrowRight className="w-5 h-5 text-bg-primary" />
          </motion.div>
        </motion.div>

        {/* Destination Input */}
        <motion.div variants={itemVariants}>
          <label htmlFor="destination" className="block text-sm font-semibold text-text-primary mb-3">
            To
          </label>
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }}
          >
            <motion.div
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              animate={{ rotate: destination ? 360 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <MapPin className="w-5 h-5 text-neon-pink" />
            </motion.div>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
              className="w-full pl-12 pr-4 py-4 border-2 border-border-primary rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 bg-surface-elevated backdrop-blur-sm font-medium placeholder-text-muted text-text-primary"
              required
              disabled={isPlanning}
            />
          </motion.div>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-text-primary mb-4">
            Travel Preference
          </label>
          <div className="space-y-3">
            <AnimatePresence>
              {preferences.map((pref, index) => {
                const Icon = pref.icon;
                const isSelected = preference === pref.id;
                
                return (
                  <motion.button
                    key={pref.id}
                    type="button"
                    onClick={() => setPreference(pref.id as Journey['preference'])}
                    disabled={isPlanning}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `border-${pref.color} bg-surface-elevated shadow-glow-${pref.color}`
                        : 'border-border-primary hover:border-border-secondary bg-surface-elevated hover:shadow-elevation-low'
                    } ${isPlanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={!isPlanning ? { scale: 1.02, x: 5 } : {}}
                    whileTap={!isPlanning ? { scale: 0.98 } : {}}
                  >
                    <motion.div
                      className={`p-2 rounded-lg ${
                        isSelected ? `bg-${pref.color}` : 'bg-bg-secondary'
                      }`}
                      animate={{ rotate: isSelected ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-5 h-5 ${
                        isSelected ? 'text-bg-primary' : `text-${pref.color}`
                      }`} />
                    </motion.div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${
                        isSelected ? `text-${pref.color}` : 'text-text-secondary'
                      }`}>
                        {pref.label}
                      </div>
                      <div className="text-sm text-text-muted">{pref.description}</div>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className={`w-6 h-6 rounded-full bg-${pref.color} flex items-center justify-center`}
                        >
                          <div className="w-2 h-2 bg-bg-primary rounded-full" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isPlanning || !source.trim() || !destination.trim()}
          className="w-full py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary font-bold rounded-xl shadow-glow-neon-blue hover:shadow-glow-neon-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          whileHover={!isPlanning ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isPlanning ? { scale: 0.98 } : {}}
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            {isPlanning ? (
              <motion.div
                key="planning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-3"
              >
                <motion.div
                  className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Planning Your Journey...
              </motion.div>
            ) : (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Find Best Route
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </motion.div>
  );
};

export default JourneyPlanner;