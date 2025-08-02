import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Zap, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Brain,
  Target
} from 'lucide-react';
import { Button } from './ui/Button';
import { Journey, JourneyPlan } from '../types';

interface SmartSuggestion {
  id: string;
  type: 'route' | 'timing' | 'mode' | 'alternative';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  reason: string;
  action?: {
    label: string;
    data: any;
  };
}

interface SmartSuggestionsProps {
  journey?: Journey;
  currentPlans: JourneyPlan[];
  onApplySuggestion: (suggestion: SmartSuggestion) => void;
  isVisible?: boolean;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  journey,
  currentPlans,
  onApplySuggestion,
  isVisible = true
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  // Generate smart suggestions based on current context
  useEffect(() => {
    if (!journey || !isVisible) return;

    const generateSuggestions = async () => {
      setIsLoading(true);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSuggestions: SmartSuggestion[] = [];

      // Time-based suggestions
      const currentHour = new Date().getHours();
      if (currentHour >= 7 && currentHour <= 9) {
        newSuggestions.push({
          id: 'rush-hour-timing',
          type: 'timing',
          title: 'Avoid Rush Hour',
          description: 'Consider departing 30 minutes earlier to avoid peak traffic congestion.',
          confidence: 85,
          impact: 'high',
          reason: 'Historical data shows 40% longer travel times during 8-9 AM',
          action: {
            label: 'Adjust Departure Time',
            data: { departureOffset: -30 }
          }
        });
      }

      // Route optimization suggestions
      if (currentPlans.length > 0) {
        const fastestPlan = currentPlans.reduce((prev, current) => 
          prev.duration < current.duration ? prev : current
        );

        if (fastestPlan.duration > 45) {
          newSuggestions.push({
            id: 'alternative-route',
            type: 'route',
            title: 'Faster Alternative Route',
            description: 'AI detected a potentially faster route using express lanes.',
            confidence: 78,
            impact: 'medium',
            reason: 'Real-time traffic analysis suggests 15% time savings',
            action: {
              label: 'Explore Alternative',
              data: { routeType: 'express' }
            }
          });
        }
      }

      // Mode suggestions based on journey characteristics
      if (journey.preference === 'fastest') {
        newSuggestions.push({
          id: 'multimodal-suggestion',
          type: 'mode',
          title: 'Multimodal Journey',
          description: 'Combine bike + metro for optimal speed and cost efficiency.',
          confidence: 72,
          impact: 'medium',
          reason: 'Weather conditions favorable, metro running on schedule',
          action: {
            label: 'Try Multimodal',
            data: { modes: ['bike', 'metro'] }
          }
        });
      }

      // Weather-based suggestions
      const isRainy = Math.random() > 0.7; // Simulate weather check
      if (isRainy) {
        newSuggestions.push({
          id: 'weather-alternative',
          type: 'alternative',
          title: 'Weather-Optimized Route',
          description: 'Rain detected. Prioritize covered transport options.',
          confidence: 90,
          impact: 'high',
          reason: 'Current weather conditions affect outdoor transport modes',
          action: {
            label: 'Adjust for Weather',
            data: { weatherOptimized: true }
          }
        });
      }

      // Predictive suggestions
      newSuggestions.push({
        id: 'predictive-delay',
        type: 'timing',
        title: 'Predicted Delay Alert',
        description: 'AI predicts potential 10-minute delay on your preferred route.',
        confidence: 65,
        impact: 'medium',
        reason: 'Pattern analysis of similar journeys and current conditions',
        action: {
          label: 'Add Buffer Time',
          data: { bufferMinutes: 10 }
        }
      });

      setSuggestions(newSuggestions);
      setIsLoading(false);
    };

    generateSuggestions();
  }, [journey, currentPlans, isVisible]);

  const getImpactColor = (impact: SmartSuggestion['impact']) => {
    switch (impact) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-info';
      default: return 'text-text-secondary';
    }
  };

  const getTypeIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'route': return MapPin;
      case 'timing': return Clock;
      case 'mode': return TrendingUp;
      case 'alternative': return Target;
      default: return Lightbulb;
    }
  };

  if (!isVisible || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  return (
    <motion.div
      className="bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="p-2 bg-gradient-to-br from-neon-purple-accessible to-neon-blue-accessible rounded-lg"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Brain className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-text-primary">AI Smart Suggestions</h3>
          <p className="text-sm text-text-secondary">
            Personalized recommendations for your journey
          </p>
        </div>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <motion.div
              className="flex items-center gap-3 text-text-secondary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-5 h-5 text-neon-blue-accessible" />
              <span>AI analyzing optimal routes...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => {
            const TypeIcon = getTypeIcon(suggestion.type);
            const isExpanded = expandedSuggestion === suggestion.id;

            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden"
              >
                <motion.div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neon-blue-accessible/20 rounded-lg flex-shrink-0">
                      <TypeIcon className="w-4 h-4 text-neon-blue-accessible" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-text-primary">{suggestion.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full bg-opacity-20 ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{suggestion.description}</p>
                      
                      {/* Confidence indicator */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-border-primary rounded-full h-1">
                          <motion.div
                            className="h-full bg-neon-green-accessible rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${suggestion.confidence}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-xs text-text-muted">{suggestion.confidence}% confidence</span>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4 text-text-secondary" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border-primary"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-2 mb-4">
                          <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-text-secondary">{suggestion.reason}</p>
                        </div>
                        
                        {suggestion.action && (
                          <Button
                            onClick={() => onApplySuggestion(suggestion)}
                            size="sm"
                            variant="primary"
                            leftIcon={<CheckCircle className="w-4 h-4" />}
                            className="w-full"
                          >
                            {suggestion.action.label}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SmartSuggestions;
