import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Route, 
  Clock, 
  Euro, 
  Leaf, 
  Zap, 
  Users,
  MapPin,
  ArrowRight,
  Bus,
  Train,
  Car,
  Bike,
  Accessibility,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
  transportationOrchestrator, 
  JourneyPlan, 
  LocationPoint, 
  UserPreferences,
  RealTimeUpdate
} from '../agents/transportationOrchestrator';
import BerlinPublicTransportAgent from '../agents/berlinPublicTransportAgent';
import RideHailingAgent from '../agents/rideHailingAgent';
import BikeSharingAgent from '../agents/bikeSharingAgent';

interface MultiModalPlannerProps {
  initialOrigin?: string;
  initialDestination?: string;
  onJourneySelected?: (journey: JourneyPlan) => void;
}

export const MultiModalPlanner: React.FC<MultiModalPlannerProps> = ({
  initialOrigin = '',
  initialDestination = '',
  onJourneySelected
}) => {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [isPlanning, setIsPlanning] = useState(false);
  const [journeyPlans, setJourneyPlans] = useState<JourneyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<JourneyPlan | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    maxWalkingDistance: 1000,
    preferredModes: [],
    avoidModes: [],
    maxCost: 50,
    prioritizeSpeed: true,
    prioritizeCost: false,
    prioritizeComfort: false,
    prioritizeEnvironment: false,
    accessibilityNeeds: [],
    realTimeUpdatesRequired: true
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
  const [agentsInitialized, setAgentsInitialized] = useState(false);

  useEffect(() => {
    initializeAgents();
  }, []);

  useEffect(() => {
    // Listen for real-time updates
    const handleJourneyUpdate = (data: any) => {
      setRealTimeUpdates(prev => [...prev, data.update]);
    };

    transportationOrchestrator.on('journeyUpdate', handleJourneyUpdate);
    
    return () => {
      transportationOrchestrator.off('journeyUpdate', handleJourneyUpdate);
    };
  }, []);

  const initializeAgents = async () => {
    try {
      // Initialize all transportation agents
      const publicTransportAgent = new BerlinPublicTransportAgent();
      const rideHailingAgent = new RideHailingAgent();
      const bikeSharingAgent = new BikeSharingAgent();

      // Register agents with orchestrator
      transportationOrchestrator.registerAgent(publicTransportAgent);
      transportationOrchestrator.registerAgent(rideHailingAgent);
      transportationOrchestrator.registerAgent(bikeSharingAgent);

      // Initialize agents
      await Promise.all([
        publicTransportAgent.initialize(),
        rideHailingAgent.initialize(),
        bikeSharingAgent.initialize()
      ]);

      setAgentsInitialized(true);
      console.log('All transportation agents initialized');
    } catch (error) {
      console.error('Failed to initialize agents:', error);
    }
  };

  const planJourney = async () => {
    if (!origin || !destination || !agentsInitialized) return;

    setIsPlanning(true);
    setRealTimeUpdates([]);

    try {
      // Convert addresses to coordinates (simplified)
      const originPoint: LocationPoint = {
        latitude: 52.5200 + (Math.random() - 0.5) * 0.1,
        longitude: 13.4050 + (Math.random() - 0.5) * 0.1,
        name: origin,
        type: 'address'
      };

      const destinationPoint: LocationPoint = {
        latitude: 52.5200 + (Math.random() - 0.5) * 0.1,
        longitude: 13.4050 + (Math.random() - 0.5) * 0.1,
        name: destination,
        type: 'address'
      };

      const plans = await transportationOrchestrator.planJourney(
        originPoint,
        destinationPoint,
        preferences
      );

      setJourneyPlans(plans);
    } catch (error) {
      console.error('Journey planning failed:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  const selectJourney = (plan: JourneyPlan) => {
    setSelectedPlan(plan);
    if (onJourneySelected) {
      onJourneySelected(plan);
    }
  };

  const bookJourney = async (plan: JourneyPlan) => {
    try {
      const bookingResults = await transportationOrchestrator.bookJourney(plan.id);
      console.log('Journey booked successfully:', bookingResults);
      // Handle successful booking
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const getModeIcon = (category: string) => {
    switch (category) {
      case 'bus':
      case 'metro':
      case 'tram':
      case 'train':
        return <Bus className="w-4 h-4" />;
      case 'ridehail':
        return <Car className="w-4 h-4" />;
      case 'bikeshare':
        return <Bike className="w-4 h-4" />;
      default:
        return <Route className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCost = (cost: number) => {
    return `€${cost.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="p-2 bg-gradient-to-br from-neon-blue-accessible to-neon-purple-accessible rounded-lg"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Route className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-text-primary">Multi-Modal Journey Planner</h3>
          <p className="text-sm text-text-secondary">
            AI-powered collaborative transportation planning
          </p>
        </div>
      </div>

      {/* Agent Status */}
      {!agentsInitialized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-warning border-t-transparent rounded-full"
            />
            <span className="text-sm text-warning">Initializing transportation agents...</span>
          </div>
        </motion.div>
      )}

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="From"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter origin"
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="To"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant={preferences.prioritizeSpeed ? "default" : "outline"}
            size="sm"
            onClick={() => setPreferences(prev => ({ 
              ...prev, 
              prioritizeSpeed: !prev.prioritizeSpeed,
              prioritizeCost: false,
              prioritizeComfort: false,
              prioritizeEnvironment: false
            }))}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            Speed
          </Button>
          <Button
            variant={preferences.prioritizeCost ? "default" : "outline"}
            size="sm"
            onClick={() => setPreferences(prev => ({ 
              ...prev, 
              prioritizeCost: !prev.prioritizeCost,
              prioritizeSpeed: false,
              prioritizeComfort: false,
              prioritizeEnvironment: false
            }))}
            leftIcon={<Euro className="w-4 h-4" />}
          >
            Cost
          </Button>
          <Button
            variant={preferences.prioritizeComfort ? "default" : "outline"}
            size="sm"
            onClick={() => setPreferences(prev => ({ 
              ...prev, 
              prioritizeComfort: !prev.prioritizeComfort,
              prioritizeSpeed: false,
              prioritizeCost: false,
              prioritizeEnvironment: false
            }))}
            leftIcon={<Users className="w-4 h-4" />}
          >
            Comfort
          </Button>
          <Button
            variant={preferences.prioritizeEnvironment ? "default" : "outline"}
            size="sm"
            onClick={() => setPreferences(prev => ({ 
              ...prev, 
              prioritizeEnvironment: !prev.prioritizeEnvironment,
              prioritizeSpeed: false,
              prioritizeCost: false,
              prioritizeComfort: false
            }))}
            leftIcon={<Leaf className="w-4 h-4" />}
          >
            Eco
          </Button>
        </div>

        <Button
          onClick={planJourney}
          loading={isPlanning}
          loadingText="Planning journey..."
          disabled={!origin || !destination || !agentsInitialized}
          className="w-full"
          leftIcon={<Route className="w-4 h-4" />}
        >
          Plan Multi-Modal Journey
        </Button>
      </div>

      {/* Real-time Updates */}
      <AnimatePresence>
        {realTimeUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-3 bg-warning/10 border border-warning/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">Real-time Updates</span>
            </div>
            <div className="space-y-1">
              {realTimeUpdates.slice(-3).map((update, index) => (
                <p key={index} className="text-xs text-text-secondary">
                  {update.message}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journey Plans */}
      <AnimatePresence>
        {journeyPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h4 className="font-medium text-text-primary">
              {journeyPlans.length} journey options found
            </h4>

            {journeyPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedPlan?.id === plan.id
                    ? 'border-neon-blue-accessible bg-neon-blue-accessible/10'
                    : 'border-border-primary bg-surface-elevated hover:border-neon-blue-accessible/50'
                }`}
                onClick={() => selectJourney(plan)}
              >
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {plan.segments.map((segment, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <ArrowRight className="w-3 h-3 text-text-muted" />}
                        <div className="flex items-center gap-1 px-2 py-1 bg-surface-overlay rounded-lg">
                          {getModeIcon(segment.mode.category)}
                          <span className="text-xs text-text-primary">{segment.mode.name}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-xs text-success">
                      {Math.round(plan.multiModalScore * 100)}% match
                    </span>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <Clock className="w-4 h-4 text-text-secondary mx-auto mb-1" />
                    <p className="text-xs text-text-secondary">Duration</p>
                    <p className="text-sm font-medium text-text-primary">
                      {formatDuration(plan.totalDuration)}
                    </p>
                  </div>
                  <div className="text-center">
                    <Euro className="w-4 h-4 text-text-secondary mx-auto mb-1" />
                    <p className="text-xs text-text-secondary">Cost</p>
                    <p className="text-sm font-medium text-text-primary">
                      {formatCost(plan.totalCost)}
                    </p>
                  </div>
                  <div className="text-center">
                    <Leaf className="w-4 h-4 text-text-secondary mx-auto mb-1" />
                    <p className="text-xs text-text-secondary">CO₂</p>
                    <p className="text-sm font-medium text-text-primary">
                      {Math.round(plan.totalCo2)}g
                    </p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-4 h-4 text-text-secondary mx-auto mb-1" />
                    <p className="text-xs text-text-secondary">Reliability</p>
                    <p className="text-sm font-medium text-text-primary">
                      {Math.round(plan.reliability * 100)}%
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedPlan?.id === plan.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 border-t border-border-secondary"
                  >
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          bookJourney(plan);
                        }}
                        className="flex-1"
                      >
                        Book Journey
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show detailed view
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isPlanning && journeyPlans.length === 0 && origin && destination && agentsInitialized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Route className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h4 className="font-medium text-text-primary mb-2">No journeys found</h4>
          <p className="text-text-secondary">
            Try adjusting your preferences or locations
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MultiModalPlanner;
