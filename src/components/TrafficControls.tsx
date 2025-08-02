import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Traffic, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button, IconButton } from './ui/Button';

interface TrafficControlsProps {
  onToggleTraffic: (enabled: boolean) => void;
  onToggleIncidents: (enabled: boolean) => void;
  onToggleConditions: (enabled: boolean) => void;
  onRefresh: () => void;
  trafficEnabled: boolean;
  incidentsEnabled: boolean;
  conditionsEnabled: boolean;
  isLoading?: boolean;
  lastUpdate?: Date | null;
}

export const TrafficControls: React.FC<TrafficControlsProps> = ({
  onToggleTraffic,
  onToggleIncidents,
  onToggleConditions,
  onRefresh,
  trafficEnabled,
  incidentsEnabled,
  conditionsEnabled,
  isLoading = false,
  lastUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerVariants = {
    collapsed: {
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    expanded: {
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const contentVariants = {
    collapsed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    },
    expanded: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, delay: 0.1 }
    }
  };

  return (
    <motion.div
      className="bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary overflow-hidden"
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={containerVariants}
    >
      {/* Header */}
      <div className="p-4 border-b border-border-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 bg-gradient-to-br from-traffic-light to-traffic-moderate rounded-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Traffic className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-text-primary">Traffic Layer</h3>
              <p className="text-xs text-text-secondary">
                {trafficEnabled ? 'Active' : 'Inactive'}
                {lastUpdate && (
                  <span className="ml-2">
                    • Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <IconButton
              icon={
                <motion.div
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ 
                    duration: 1, 
                    repeat: isLoading ? Infinity : 0,
                    ease: "linear"
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              }
              onClick={onRefresh}
              disabled={isLoading}
              size="sm"
              variant="ghost"
              aria-label="Refresh traffic data"
            />

            {/* Master Toggle */}
            <Button
              onClick={() => onToggleTraffic(!trafficEnabled)}
              size="sm"
              variant={trafficEnabled ? "primary" : "outline"}
              leftIcon={trafficEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            >
              {trafficEnabled ? 'Hide' : 'Show'}
            </Button>

            {/* Expand/Collapse */}
            <IconButton
              icon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="ghost"
              aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
            />
          </div>
        </div>
      </div>

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Traffic Conditions Toggle */}
              <motion.div
                className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl border border-border-primary"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-traffic-light/20 rounded-lg">
                    <Clock className="w-4 h-4 text-traffic-light" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Traffic Conditions</h4>
                    <p className="text-xs text-text-secondary">Show real-time traffic flow</p>
                  </div>
                </div>
                <Button
                  onClick={() => onToggleConditions(!conditionsEnabled)}
                  size="sm"
                  variant={conditionsEnabled ? "primary" : "outline"}
                  disabled={!trafficEnabled}
                >
                  {conditionsEnabled ? 'On' : 'Off'}
                </Button>
              </motion.div>

              {/* Traffic Incidents Toggle */}
              <motion.div
                className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl border border-border-primary"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-error" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Traffic Incidents</h4>
                    <p className="text-xs text-text-secondary">Show accidents & closures</p>
                  </div>
                </div>
                <Button
                  onClick={() => onToggleIncidents(!incidentsEnabled)}
                  size="sm"
                  variant={incidentsEnabled ? "primary" : "outline"}
                  disabled={!trafficEnabled}
                >
                  {incidentsEnabled ? 'On' : 'Off'}
                </Button>
              </motion.div>

              {/* Traffic Legend */}
              <div className="p-3 bg-surface-elevated rounded-xl border border-border-primary">
                <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Traffic Legend
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-traffic-free rounded-full"></div>
                    <span className="text-text-secondary">Free Flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-traffic-light rounded-full"></div>
                    <span className="text-text-secondary">Light Traffic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-traffic-moderate rounded-full"></div>
                    <span className="text-text-secondary">Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-traffic-heavy rounded-full"></div>
                    <span className="text-text-secondary">Heavy Traffic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-traffic-blocked rounded-full"></div>
                    <span className="text-text-secondary">Blocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-error" />
                    <span className="text-text-secondary">Incidents</span>
                  </div>
                </div>
              </div>

              {/* Auto-refresh Settings */}
              <div className="p-3 bg-surface-elevated rounded-xl border border-border-primary">
                <h4 className="font-medium text-text-primary mb-2">Auto-refresh</h4>
                <p className="text-xs text-text-secondary">
                  Traffic data updates automatically every 30 seconds
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TrafficControls;
