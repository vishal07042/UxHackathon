import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JourneyPlanner from './components/JourneyPlanner';
import JourneyResults from './components/JourneyResults';
import AgentLogs from './components/AgentLogs';
import RealtimeUpdates from './components/RealtimeUpdates';
import LoadingOverlay from './components/LoadingOverlay';
import { PlannerAgent } from './agents/plannerAgent';
import { Journey, JourneyPlan, AgentLog, RealtimeUpdate } from './types';

function App() {
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
  const [journeyPlans, setJourneyPlans] = useState<JourneyPlan[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);

  const plannerAgent = new PlannerAgent();

  const handleJourneyPlan = async (journey: Journey) => {
    setIsPlanning(true);
    setCurrentJourney(journey);
    setJourneyPlans([]);
    setAgentLogs([]);
    setRealtimeUpdates([]);

    try {
      const result = await plannerAgent.planJourney(journey, {
        onAgentLog: (log) => setAgentLogs(prev => [...prev, log]),
        onRealtimeUpdate: (update) => setRealtimeUpdates(prev => [...prev, update])
      });

      setJourneyPlans(result.plans);
      
      // Simulate real-time updates after initial planning
      setTimeout(() => simulateRealtimeUpdates(result.plans), 3000);
    } catch (error) {
      console.error('Journey planning failed:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  const simulateRealtimeUpdates = async (plans: JourneyPlan[]) => {
    // Simulate metro delay
    const delayUpdate: RealtimeUpdate = {
      id: Date.now().toString(),
      type: 'delay',
      agent: 'Metro',
      message: 'Metro Line 2 experiencing 5-minute delay',
      timestamp: new Date(),
      severity: 'warning'
    };
    
    setRealtimeUpdates(prev => [...prev, delayUpdate]);

    // Trigger re-planning
    if (currentJourney) {
      setTimeout(async () => {
        const replanUpdate: RealtimeUpdate = {
          id: (Date.now() + 1).toString(),
          type: 'replanning',
          agent: 'Planner',
          message: 'Re-calculating optimal routes due to metro delay...',
          timestamp: new Date(),
          severity: 'info'
        };
        
        setRealtimeUpdates(prev => [...prev, replanUpdate]);

        const result = await plannerAgent.replanJourney(currentJourney, delayUpdate, {
          onAgentLog: (log) => setAgentLogs(prev => [...prev, log]),
          onRealtimeUpdate: (update) => setRealtimeUpdates(prev => [...prev, update])
        });

        setJourneyPlans(result.plans);
      }, 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50"
        variants={headerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            className="flex items-center justify-between"
            layout
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UXplorer 2025
              </h1>
              <p className="text-sm text-gray-600 font-medium">Agentic AI Urban Mobility Coordination</p>
            </motion.div>
            <motion.div 
              className="text-right"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="text-sm text-gray-700 font-semibold">Smart Cities Hackathon</div>
              <div className="text-xs text-gray-500">Multi-Agent Transport System</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isPlanning && <LoadingOverlay />}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {/* Left Column - Journey Planner */}
          <motion.div 
            className="xl:col-span-1 space-y-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          >
            <JourneyPlanner onPlan={handleJourneyPlan} isPlanning={isPlanning} />
            
            {/* Agent Logs */}
            <AnimatePresence>
              {agentLogs.length > 0 && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <AgentLogs logs={agentLogs} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Columns - Results and Updates */}
          <motion.div 
            className="xl:col-span-2 space-y-8"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          >
            {/* Real-time Updates */}
            <AnimatePresence>
              {realtimeUpdates.length > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <RealtimeUpdates updates={realtimeUpdates} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Journey Results */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <JourneyResults 
                plans={journeyPlans} 
                isLoading={isPlanning}
                journey={currentJourney}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default App;