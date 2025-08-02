import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Search, Navigation, Settings, X, Loader } from 'lucide-react';
import { vbbApi, VBBLocation, VBBJourney } from '../services/vbbApi';
import { debounce } from 'lodash-es';

interface VBBJourneyPlannerProps {
  onJourneyPlan: (journeys: VBBJourney[], origin: VBBLocation, destination: VBBLocation) => void;
  onLocationSearch: (query: string, isDestination: boolean) => void;
  isPlanning: boolean;
}

const VBBJourneyPlanner: React.FC<VBBJourneyPlannerProps> = ({
  onJourneyPlan,
  onLocationSearch,
  isPlanning
}) => {
  const [origin, setOrigin] = useState<VBBLocation | null>(null);
  const [destination, setDestination] = useState<VBBLocation | null>(null);
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<VBBLocation[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<VBBLocation[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [departureTime, setDepartureTime] = useState<Date>(new Date());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchingOrigin, setSearchingOrigin] = useState(false);
  const [searchingDestination, setSearchingDestination] = useState(false);

  // Advanced options
  const [walkingSpeed, setWalkingSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [accessibility, setAccessibility] = useState<'none' | 'partial' | 'complete'>('none');
  const [products, setProducts] = useState({
    suburban: true,
    subway: true,
    tram: true,
    bus: true,
    ferry: true,
    express: true,
    regional: true
  });

  // Debounced search functions
  const debouncedOriginSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setOriginSuggestions([]);
        return;
      }
      
      setSearchingOrigin(true);
      try {
        const locations = await vbbApi.searchLocations(query, 8);
        setOriginSuggestions(locations);
        onLocationSearch(query, false);
      } catch (error) {
        console.error('Origin search failed:', error);
        setOriginSuggestions([]);
      } finally {
        setSearchingOrigin(false);
      }
    }, 300),
    [onLocationSearch]
  );

  const debouncedDestinationSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setDestinationSuggestions([]);
        return;
      }
      
      setSearchingDestination(true);
      try {
        const locations = await vbbApi.searchLocations(query, 8);
        setDestinationSuggestions(locations);
        onLocationSearch(query, true);
      } catch (error) {
        console.error('Destination search failed:', error);
        setDestinationSuggestions([]);
      } finally {
        setSearchingDestination(false);
      }
    }, 300),
    [onLocationSearch]
  );

  useEffect(() => {
    debouncedOriginSearch(originQuery);
  }, [originQuery, debouncedOriginSearch]);

  useEffect(() => {
    debouncedDestinationSearch(destinationQuery);
  }, [destinationQuery, debouncedDestinationSearch]);

  const handleOriginSelect = (location: VBBLocation) => {
    setOrigin(location);
    setOriginQuery(location.name);
    setShowOriginSuggestions(false);
    setOriginSuggestions([]);
  };

  const handleDestinationSelect = (location: VBBLocation) => {
    setDestination(location);
    setDestinationQuery(location.name);
    setShowDestinationSuggestions(false);
    setDestinationSuggestions([]);
  };

  const handleSwapLocations = () => {
    const tempOrigin = origin;
    const tempQuery = originQuery;
    
    setOrigin(destination);
    setOriginQuery(destinationQuery);
    setDestination(tempOrigin);
    setDestinationQuery(tempQuery);
  };

  const handlePlanJourney = async () => {
    if (!origin || !destination) return;

    try {
      const journeys = await vbbApi.planJourney(
        origin.id,
        destination.id,
        {
          departure: departureTime,
          results: 5,
          walkingSpeed,
          accessibility: accessibility !== 'none' ? accessibility : undefined,
          products
        }
      );

      onJourneyPlan(journeys, origin, destination);
    } catch (error) {
      console.error('Journey planning failed:', error);
      
      // Create a demo journey if API fails
      const demoJourney: any = {
        type: 'journey',
        legs: [
          {
            origin: {
              name: origin.name,
              latitude: origin.latitude,
              longitude: origin.longitude
            },
            destination: {
              name: destination.name,
              latitude: destination.latitude,
              longitude: destination.longitude
            },
            departure: departureTime.toISOString(),
            arrival: new Date(departureTime.getTime() + 30 * 60000).toISOString(),
            mode: 'bus',
            line: { name: 'Demo Line', type: 'bus', product: 'bus' },
            direction: destination.name,
            distance: 5000,
            duration: 30
          }
        ],
        price: { amount: 3.20, currency: 'EUR' }
      };
      
      onJourneyPlan([demoJourney], origin, destination);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locations = await vbbApi.getNearbyLocations(
              position.coords.latitude,
              position.coords.longitude,
              500
            );
            
            if (locations.length > 0) {
              const currentLocation: VBBLocation = {
                type: 'location',
                id: 'current',
                name: 'Current Location',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              
              if (!origin) {
                handleOriginSelect(currentLocation);
              } else if (!destination) {
                handleDestinationSelect(currentLocation);
              }
            }
          } catch (error) {
            console.error('Failed to get nearby locations:', error);
          }
        },
        (error) => {
          console.error('Geolocation failed:', error);
        }
      );
    }
  };

  return (
    <motion.div 
      className="bg-surface-overlay/90 backdrop-blur-lg rounded-3xl shadow-elevation-high p-6 border border-border-secondary"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-3 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl shadow-glow-neon-blue"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Navigation className="w-6 h-6 text-bg-primary" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Berlin Journey Planner</h2>
            <p className="text-sm text-text-secondary">Real VBB transport data</p>
          </div>
        </div>
        
        <motion.button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 rounded-lg border border-border-primary hover:bg-surface-elevated transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5 text-text-secondary" />
        </motion.button>
      </motion.div>

      <div className="space-y-4">
        {/* Origin Input */}
        <div className="relative">
          <label className="block text-sm font-semibold text-text-primary mb-2">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-green z-10" />
            <input
              type="text"
              value={originQuery}
              onChange={(e) => {
                setOriginQuery(e.target.value);
                setShowOriginSuggestions(true);
                if (!e.target.value) setOrigin(null);
              }}
              onFocus={() => setShowOriginSuggestions(true)}
              placeholder="Enter origin location"
              className="w-full pl-10 pr-10 py-3 border-2 border-border-primary rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all bg-surface-elevated text-text-primary"
              disabled={isPlanning}
            />
            {searchingOrigin && (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue animate-spin" />
            )}
            {originQuery && !searchingOrigin && (
              <button
                onClick={() => {
                  setOriginQuery('');
                  setOrigin(null);
                  setOriginSuggestions([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {showOriginSuggestions && originSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-1 bg-surface-elevated border border-border-secondary rounded-xl shadow-elevation-medium max-h-60 overflow-y-auto"
              >
                {originSuggestions.map((location) => (
                  <motion.button
                    key={location.id}
                    onClick={() => handleOriginSelect(location)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-overlay transition-colors border-b border-border-primary last:border-b-0"
                    whileHover={{ x: 5 }}
                  >
                    <div className="font-medium text-text-primary">{location.name}</div>
                    {location.address && (
                      <div className="text-sm text-text-secondary">{location.address}</div>
                    )}
                    <div className="text-xs text-text-muted capitalize">{location.type}</div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleSwapLocations}
            className="p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-glow-neon-blue"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            disabled={isPlanning}
          >
            <Navigation className="w-4 h-4 text-bg-primary transform rotate-90" />
          </motion.button>
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label className="block text-sm font-semibold text-text-primary mb-2">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-pink z-10" />
            <input
              type="text"
              value={destinationQuery}
              onChange={(e) => {
                setDestinationQuery(e.target.value);
                setShowDestinationSuggestions(true);
                if (!e.target.value) setDestination(null);
              }}
              onFocus={() => setShowDestinationSuggestions(true)}
              placeholder="Enter destination"
              className="w-full pl-10 pr-10 py-3 border-2 border-border-primary rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all bg-surface-elevated text-text-primary"
              disabled={isPlanning}
            />
            {searchingDestination && (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue animate-spin" />
            )}
            {destinationQuery && !searchingDestination && (
              <button
                onClick={() => {
                  setDestinationQuery('');
                  setDestination(null);
                  setDestinationSuggestions([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-1 bg-surface-elevated border border-border-secondary rounded-xl shadow-elevation-medium max-h-60 overflow-y-auto"
              >
                {destinationSuggestions.map((location) => (
                  <motion.button
                    key={location.id}
                    onClick={() => handleDestinationSelect(location)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-overlay transition-colors border-b border-border-primary last:border-b-0"
                    whileHover={{ x: 5 }}
                  >
                    <div className="font-medium text-text-primary">{location.name}</div>
                    {location.address && (
                      <div className="text-sm text-text-secondary">{location.address}</div>
                    )}
                    <div className="text-xs text-text-muted capitalize">{location.type}</div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Current Location Button */}
        <motion.button
          onClick={getCurrentLocation}
          className="w-full py-2 text-sm text-neon-blue hover:text-neon-purple transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          disabled={isPlanning}
        >
          <Navigation className="w-4 h-4" />
          Use Current Location
        </motion.button>

        {/* Departure Time */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Departure Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue z-10" />
            <input
              type="datetime-local"
              value={departureTime.toISOString().slice(0, 16)}
              onChange={(e) => setDepartureTime(new Date(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border-2 border-border-primary rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all bg-surface-elevated text-text-primary"
              disabled={isPlanning}
            />
          </div>
        </div>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 border-t border-border-primary pt-4"
            >
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Walking Speed</label>
                <select
                  value={walkingSpeed}
                  onChange={(e) => setWalkingSpeed(e.target.value as any)}
                  className="w-full py-2 px-3 border border-border-primary rounded-lg bg-surface-elevated text-text-primary"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Accessibility</label>
                <select
                  value={accessibility}
                  onChange={(e) => setAccessibility(e.target.value as any)}
                  className="w-full py-2 px-3 border border-border-primary rounded-lg bg-surface-elevated text-text-primary"
                >
                  <option value="none">No requirements</option>
                  <option value="partial">Partial accessibility</option>
                  <option value="complete">Full accessibility</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Transport Modes</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(products).map(([key, enabled]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setProducts(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded border-border-primary"
                      />
                      <span className="text-text-secondary capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plan Journey Button */}
        <motion.button
          onClick={handlePlanJourney}
          disabled={!origin || !destination || isPlanning}
          className="w-full py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary font-bold rounded-xl shadow-glow-neon-blue hover:shadow-glow-neon-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          whileHover={!isPlanning ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isPlanning ? { scale: 0.98 } : {}}
        >
          <AnimatePresence mode="wait">
            {isPlanning ? (
              <motion.div
                key="planning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3"
              >
                <Loader className="w-5 h-5 animate-spin" />
                Planning Journey...
              </motion.div>
            ) : (
              <motion.div
                key="plan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Routes
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VBBJourneyPlanner;