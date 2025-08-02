import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Shield, Clock, DollarSign, Heart, Info, Star } from 'lucide-react';
import { JourneyTip } from '../services/geminiApi';

interface JourneyTipsProps {
  tips: JourneyTip[];
  isLoading: boolean;
  journey?: {
    source: string;
    destination: string;
    preference: string;
  };
}

const getCategoryIcon = (category: JourneyTip['category']) => {
  switch (category) {
    case 'safety': return Shield;
    case 'efficiency': return Clock;
    case 'cost': return DollarSign;
    case 'comfort': return Heart;
    default: return Info;
  }
};

const getCategoryColor = (category: JourneyTip['category']) => {
  switch (category) {
    case 'safety': return 'neon-pink';
    case 'efficiency': return 'neon-blue';
    case 'cost': return 'neon-green';
    case 'comfort': return 'neon-purple';
    default: return 'neon-orange';
  }
};

const getPriorityBadge = (priority: JourneyTip['priority']) => {
  switch (priority) {
    case 'high': return { color: 'bg-red-500', text: 'High' };
    case 'medium': return { color: 'bg-yellow-500', text: 'Medium' };
    case 'low': return { color: 'bg-green-500', text: 'Low' };
    default: return { color: 'bg-gray-500', text: 'Info' };
  }
};

const JourneyTips: React.FC<JourneyTipsProps> = ({ tips, isLoading, journey }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const tipVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
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
        className="bg-surface-overlay/80 backdrop-blur-lg rounded-2xl shadow-elevation-medium p-6 border border-border-secondary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            className="p-2 bg-gradient-to-br from-neon-orange to-neon-yellow rounded-lg shadow-glow-neon-orange"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Lightbulb className="w-5 h-5 text-bg-primary" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">AI Journey Tips</h3>
            <p className="text-sm text-text-secondary">Getting personalized advice...</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-16 bg-surface-elevated rounded-xl animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (tips.length === 0 && !isLoading) {
    return (
      <motion.div 
        className="bg-surface-overlay/80 backdrop-blur-lg rounded-2xl shadow-elevation-medium p-6 border border-border-secondary text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Lightbulb className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-text-secondary mb-2">No Tips Available</h3>
        <p className="text-text-muted">Plan a journey to get personalized travel tips</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-surface-overlay/80 backdrop-blur-lg rounded-2xl shadow-elevation-medium p-6 border border-border-secondary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2 bg-gradient-to-br from-neon-orange to-neon-yellow rounded-lg shadow-glow-neon-orange"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Lightbulb className="w-5 h-5 text-bg-primary" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">AI Journey Tips</h3>
            <p className="text-sm text-text-secondary">
              {journey ? `For ${journey.source} → ${journey.destination}` : 'Personalized travel advice'}
            </p>
          </div>
        </div>
        
        <motion.div 
          className="flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Star className="w-4 h-4 text-neon-yellow" />
          <span className="text-sm font-medium text-neon-yellow">AI Powered</span>
        </motion.div>
      </motion.div>

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tips.map((tip, index) => {
          const Icon = getCategoryIcon(tip.category);
          const color = getCategoryColor(tip.category);
          const priority = getPriorityBadge(tip.priority);
          
          return (
            <motion.div
              key={tip.id}
              className="p-4 bg-surface-elevated rounded-xl border border-border-primary"
              variants={tipVariants}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <div className="flex items-start gap-3">
                <motion.div 
                  className={`p-2 bg-${color}/10 rounded-lg border border-${color}/20 shrink-0`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`w-4 h-4 text-${color}`} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-text-primary">{tip.title}</h4>
                    <motion.span 
                      className={`px-2 py-1 ${priority.color} text-white text-xs rounded-full`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {priority.text}
                    </motion.span>
                  </div>
                  
                  <p className="text-sm text-text-secondary leading-relaxed mb-2">
                    {tip.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted capitalize">
                      {tip.category}
                    </span>
                    {tip.transportMode.length > 0 && (
                      <>
                        <span className="text-xs text-text-muted">•</span>
                        <div className="flex gap-1">
                          {tip.transportMode.map((mode) => (
                            <span 
                              key={mode}
                              className="px-2 py-1 bg-bg-secondary text-text-muted text-xs rounded-full capitalize"
                            >
                              {mode}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {tips.length > 0 && (
        <motion.div 
          className="mt-4 pt-4 border-t border-border-primary text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-text-muted">
            Tips generated by AI based on your journey preferences
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JourneyTips;