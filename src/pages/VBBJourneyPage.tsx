import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VBBJourneyPlanner from '../components/VBBJourneyPlanner';
import VBBJourneyResults from '../components/VBBJourneyResults';
import JourneyMap from '../components/JourneyMap';
import ErrorBoundary from '../components/ErrorBoundary';
import { VBBJourney, VBBLocation, vbbApi } from '../services/vbbApi';
import { AlertTriangle } from 'lucide-react';

const VBBJourneyPageContent = () => {
  const [journeys, setJourneys] = useState<VBBJourney[]>([]);
  const [origin, setOrigin] = useState<VBBLocation | undefined>();
  const [destination, setDestination] = useState<VBBLocation | undefined>();
  const [selectedJourney, setSelectedJourney] = useState<VBBJourney | undefined>();
  const [nearbyStops, setNearbyStops] = useState<VBBLocation[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's location and nearby stops on mount
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Always try to load some data, even if it's mock data
        try {
          let userLat = 52.5200; // Berlin center default
          let userLng = 13.4050;
          
          // Try to get user location with a timeout
          if (navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                const timeoutId = setTimeout(() => reject(new Error('Geolocation timeout')), 5000);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    clearTimeout(timeoutId);
                    resolve(pos);
                  },
                  (err) => {
                    clearTimeout(timeoutId);
                    reject(err);
                  }
                );
              });
              
              userLat = position.coords.latitude;
              userLng = position.coords.longitude;
            } catch (geoError) {
              console.log('Using Berlin center as fallback location');
            }
          }
          
          // Try to get nearby stops, but don't fail if it doesn't work
          try {
            const stops = await vbbApi.getNearbyLocations(userLat, userLng, 1000);
            setNearbyStops(stops);
          } catch (apiError) {
            console.log('VBB API not available, using mock data');
            // Set some mock nearby stops for demo
            setNearbyStops([
              {
                type: 'station',
                id: 'demo-stop-1',
                name: 'Demo Station 1',
                latitude: userLat + 0.001,
                longitude: userLng + 0.001,
                distance: 100
              },
              {
                type: 'station', 
                id: 'demo-stop-2',
                name: 'Demo Station 2',
                latitude: userLat - 0.001,
                longitude: userLng - 0.001,
                distance: 200
              }
            ]);
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Initialization error:', error);
          // Even if everything fails, show the interface
          setNearbyStops([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Critical initialization failure:', error);
        setError('Failed to initialize. The app will work in demo mode.');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  const handleJourneyPlan = async (
    plannedJourneys: VBBJourney[], 
    planOrigin: VBBLocation, 
    planDestination: VBBLocation
  ) => {
    setIsPlanning(true);
    
    try {
      setJourneys(plannedJourneys);
      setOrigin(planOrigin);
      setDestination(planDestination);
      setSelectedJourney(plannedJourneys[0]); // Select first journey by default
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Journey planning failed:', error);
      setError('Journey planning failed. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleLocationSearch = async (query: string, isDestination: boolean) => {
    // This could be used to show search results on the map
    // For now, we'll just log it
    console.log(`Searching for ${isDestination ? 'destination' : 'origin'}: ${query}`);
  };

  const handleJourneySelect = (journey: VBBJourney) => {
    setSelectedJourney(journey);
  };

  const handleLocationSelect = (location: VBBLocation) => {
    // This will be called when user clicks on a map marker
    if (!origin) {
      setOrigin(location);
    } else if (!destination) {
      setDestination(location);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  // Error boundary component
  if (error) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen"
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="bg-surface-overlay/70 backdrop-blur-lg rounded-3xl shadow-xl p-12 border border-border-secondary text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertTriangle className="w-16 h-16 text-neon-orange mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Service Unavailable</h3>
            <p className="text-text-muted mb-4">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-bg-primary font-bold rounded-xl shadow-glow-neon-blue hover:shadow-glow-neon-purple transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen"
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h3 className="text-xl font-semibold text-text-primary mb-2">Loading Berlin Transport</h3>
            <p className="text-text-muted">Connecting to VBB network...</p>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Left Column - Journey Planner and Results */}
          <motion.div 
            className="space-y-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <VBBJourneyPlanner 
              onJourneyPlan={handleJourneyPlan}
              onLocationSearch={handleLocationSearch}
              isPlanning={isPlanning}
            />
            
            <VBBJourneyResults
              journeys={journeys}
              origin={origin}
              destination={destination}
              isLoading={isPlanning}
              onJourneySelect={handleJourneySelect}
              selectedJourney={selectedJourney}
            />
          </motion.div>

          {/* Right Column - Map */}
          <motion.div 
            className="lg:sticky lg:top-8"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          >
            <motion.div 
              className="bg-surface-overlay/90 backdrop-blur-lg rounded-3xl shadow-elevation-high p-4 border border-border-secondary"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div 
                className="flex items-center justify-between mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Interactive Map</h3>
                  <p className="text-sm text-text-secondary">Berlin public transport network</p>
                </div>
                <motion.div 
                  className="px-3 py-1 bg-gradient-to-r from-neon-green/10 to-neon-blue/10 rounded-full border border-border-primary"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xs font-medium text-neon-blue">
                    Live Data
                  </span>
                </motion.div>
              </motion.div>
              
              <div className="h-96 lg:h-[600px] rounded-2xl overflow-hidden">
                <JourneyMap
                  origin={origin}
                  destination={destination}
                  journeys={journeys}
                  selectedJourney={selectedJourney}
                  nearbyStops={nearbyStops}
                  onLocationSelect={handleLocationSelect}
                  className="h-full w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Journey Details Panel */}
        <AnimatePresence>
          {selectedJourney && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="mt-8"
            >
              <motion.div 
                className="bg-surface-overlay/90 backdrop-blur-lg rounded-3xl shadow-elevation-high p-6 border border-border-secondary"
                whileHover={{ scale: 1.01 }}
              >
                <motion.h3 
                  className="text-xl font-bold text-text-primary mb-4"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                >
                  Selected Journey Details
                </motion.h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    className="text-center p-4 bg-neon-blue/10 rounded-xl border border-neon-blue/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-neon-blue mb-1">
                      {selectedJourney.legs.length}
                    </div>
                    <div className="text-sm text-text-secondary">Segments</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center p-4 bg-neon-green/10 rounded-xl border border-neon-green/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-neon-green mb-1">
                      {selectedJourney.price ? `€${selectedJourney.price.amount.toFixed(2)}` : 'N/A'}
                    </div>
                    <div className="text-sm text-text-secondary">Total Cost</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center p-4 bg-neon-purple/10 rounded-xl border border-neon-purple/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-neon-purple mb-1">
                      {Math.round((new Date(selectedJourney.legs[selectedJourney.legs.length - 1].arrival).getTime() - 
                        new Date(selectedJourney.legs[0].departure).getTime()) / (1000 * 60))}m
                    </div>
                    <div className="text-sm text-text-secondary">Duration</div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

const VBBJourneyPage = () => {
  return (
    <ErrorBoundary>
      <VBBJourneyPageContent />
    </ErrorBoundary>
  );
};

export default VBBJourneyPage;