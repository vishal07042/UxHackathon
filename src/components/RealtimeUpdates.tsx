import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, RefreshCw, X } from 'lucide-react';
import { RealtimeUpdate } from '../types';

interface RealtimeUpdatesProps {
  updates: RealtimeUpdate[];
}

const RealtimeUpdates: React.FC<RealtimeUpdatesProps> = ({ updates }) => {
  const getIcon = (type: RealtimeUpdate['type']) => {
    switch (type) {
      case 'delay': return AlertTriangle;
      case 'closure': return X;
      case 'alternative': return Info;
      case 'replanning': return RefreshCw;
      case 'complete': return CheckCircle;
      default: return Info;
    }
  };

  const getColor = (severity: RealtimeUpdate['severity']) => {
    switch (severity) {
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'success': return 'green';
      default: return 'blue';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const updateVariants = {
    hidden: { opacity: 0, x: 100, scale: 0.8 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        <motion.div 
          className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg relative"
          whileHover={{ scale: 1.1 }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Bell className="w-5 h-5 text-white" />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Real-time Updates</h3>
          <p className="text-sm text-gray-600">Live transport coordination</p>
        </div>
      </motion.div>

      <motion.div className="space-y-3">
        <AnimatePresence>
          {updates.slice(-5).reverse().map((update, index) => {
            const Icon = getIcon(update.type);
            const color = getColor(update.severity);
            
            return (
              <motion.div
                key={update.id}
                className={`p-4 rounded-xl border-l-4 border-${color}-500 bg-gradient-to-r from-${color}-50 to-white shadow-md`}
                variants={updateVariants}
                layout
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex items-start gap-3">
                  <motion.div 
                    className={`p-2 bg-${color}-100 rounded-lg shrink-0`}
                    animate={{ 
                      rotate: update.type === 'replanning' ? 360 : 0 
                    }}
                    transition={{ 
                      duration: update.type === 'replanning' ? 1 : 0,
                      repeat: update.type === 'replanning' ? Infinity : 0,
                      ease: "linear"
                    }}
                  >
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.span 
                        className={`px-3 py-1 bg-${color}-500 text-white text-xs font-semibold rounded-full`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {update.agent}
                      </motion.span>
                      <span className="text-xs text-gray-500 capitalize">
                        {update.type}
                      </span>
                      <motion.span 
                        className="text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </motion.span>
                    </div>
                    
                    <motion.p 
                      className="text-gray-700 font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {update.message}
                    </motion.p>
                  </div>
                  
                  <motion.div
                    className={`w-3 h-3 bg-${color}-500 rounded-full shrink-0 mt-3`}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {updates.length === 0 && (
          <motion.div 
            className="text-center py-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-2"
            >
              <Bell className="w-8 h-8 text-gray-400" />
            </motion.div>
            <p>Real-time updates will appear here</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RealtimeUpdates;