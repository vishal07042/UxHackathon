import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JourneyPlanner from '../components/JourneyPlanner';
import JourneyResults from '../components/JourneyResults';
import AgentLogs from '../components/AgentLogs';
import RealtimeUpdates from '../components/RealtimeUpdates';
import LoadingOverlay from '../components/LoadingOverlay';
import { PlannerAgent } from '../agents/plannerAgent';
import { Journey, JourneyPlan, AgentLog, RealtimeUpdate } from '../types';

const JourneyPage = () => {
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isPlanning && <LoadingOverlay />}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Journey Planner */}
          <motion.div 
            className="xl:col-span-1 space-y-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
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
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
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
};

export default JourneyPage;
