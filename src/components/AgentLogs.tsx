import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, CheckCircle, AlertTriangle, Info, XCircle, Clock } from 'lucide-react';
import { AgentLog } from '../types';

interface AgentLogsProps {
  logs: AgentLog[];
}

const AgentLogs: React.FC<AgentLogsProps> = ({ logs }) => {
  const getIcon = (type: AgentLog['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getColor = (type: AgentLog['type']) => {
    switch (type) {
      case 'success': return 'neon-green';
      case 'warning': return 'neon-yellow';
      case 'error': return 'neon-pink';
      default: return 'neon-blue';
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent.toLowerCase()) {
      case 'metro': return 'neon-blue';
      case 'bus': return 'neon-green';
      case 'ride': return 'neon-purple';
      case 'bike': return 'neon-orange';
      case 'planner': return 'neon-purple';
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

  const logVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: 50,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="bg-surface-overlay/80 backdrop-blur-lg rounded-2xl shadow-elevation-medium p-6 border border-border-secondary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        <motion.div 
          className="p-2 bg-gradient-to-br from-neon-purple to-neon-blue rounded-lg shadow-glow-neon-purple"
          whileHover={{ scale: 1.1, rotate: 5 }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bot className="w-5 h-5 text-bg-primary" />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Agent Activity</h3>
          <p className="text-sm text-text-secondary">Real-time collaboration logs</p>
        </div>
      </motion.div>

      <motion.div 
        className="space-y-3 max-h-80 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {logs.slice(-10).map((log, index) => {
            const Icon = getIcon(log.type);
            const color = getColor(log.type);
            const agentColor = getAgentColor(log.agent);
            
            return (
              <motion.div
                key={log.id}
                className="flex gap-3 p-3 bg-surface-elevated rounded-xl"
                variants={logVariants}
                layout
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <motion.div 
                  className={`p-1.5 bg-${color}/10 rounded-lg shrink-0 mt-1 border border-${color}/20`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon className={`w-4 h-4 text-${color}`} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span 
                      className={`px-2 py-1 bg-${agentColor}/10 text-${agentColor} text-xs font-medium rounded-full border border-${agentColor}/20`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {log.agent}
                    </motion.span>
                    <motion.div 
                      className="flex items-center gap-1 text-xs text-text-muted"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                    >
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </motion.div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{log.message}</p>
                  
                  {log.data && (
                    <motion.div 
                      className="mt-2 p-2 bg-bg-secondary/50 rounded-lg text-xs text-text-muted border border-border-primary"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                    >
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <motion.div 
            className="text-center py-8 text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-2"
            >
              <Bot className="w-8 h-8 text-text-muted" />
            </motion.div>
            <p>Agents will appear here during journey planning</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AgentLogs;