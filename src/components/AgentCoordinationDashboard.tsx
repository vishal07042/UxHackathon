import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Wifi,
  WifiOff,
  Bus,
  Train,
  Car,
  Bike,
  Route,
  MessageSquare,
  Share2,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/Button';
import { transportationOrchestrator } from '../agents/transportationOrchestrator';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate: Date;
  activeConnections: number;
  messagesProcessed: number;
  responseTime: number;
  reliability: number;
}

interface CoordinationEvent {
  id: string;
  timestamp: Date;
  type: 'collaboration' | 'data_share' | 'route_optimization' | 'real_time_update';
  agents: string[];
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export const AgentCoordinationDashboard: React.FC = () => {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [coordinationEvents, setCoordinationEvents] = useState<CoordinationEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [totalJourneys, setTotalJourneys] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);

  useEffect(() => {
    initializeDashboard();
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, []);

  const initializeDashboard = () => {
    // Initialize with mock agent statuses
    const mockStatuses: AgentStatus[] = [
      {
        id: 'berlin-public-transport',
        name: 'Berlin Public Transport',
        status: 'active',
        lastUpdate: new Date(),
        activeConnections: 12,
        messagesProcessed: 1247,
        responseTime: 120,
        reliability: 0.94
      },
      {
        id: 'ride-hailing',
        name: 'Ride-Hailing Services',
        status: 'active',
        lastUpdate: new Date(),
        activeConnections: 8,
        messagesProcessed: 892,
        responseTime: 340,
        reliability: 0.89
      },
      {
        id: 'bike-sharing',
        name: 'Bike Sharing',
        status: 'active',
        lastUpdate: new Date(),
        activeConnections: 15,
        messagesProcessed: 634,
        responseTime: 80,
        reliability: 0.96
      }
    ];

    setAgentStatuses(mockStatuses);
    setTotalJourneys(2847);
    setSuccessRate(0.92);
    setAvgResponseTime(180);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateAgentStatuses();
      generateCoordinationEvent();
    }, 3000);

    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const updateAgentStatuses = () => {
    setAgentStatuses(prev => prev.map(agent => ({
      ...agent,
      lastUpdate: new Date(),
      activeConnections: agent.activeConnections + Math.floor(Math.random() * 3) - 1,
      messagesProcessed: agent.messagesProcessed + Math.floor(Math.random() * 5),
      responseTime: agent.responseTime + Math.floor(Math.random() * 20) - 10,
      reliability: Math.min(1, Math.max(0.8, agent.reliability + (Math.random() - 0.5) * 0.02))
    })));
  };

  const generateCoordinationEvent = () => {
    if (Math.random() < 0.3) { // 30% chance of new event
      const eventTypes = ['collaboration', 'data_share', 'route_optimization', 'real_time_update'] as const;
      const descriptions = [
        'Agents collaborated to find optimal multi-modal route',
        'Real-time traffic data shared between transport agents',
        'Route optimization triggered by service disruption',
        'Live vehicle positions synchronized across agents',
        'Booking coordination between ride-hailing and public transport',
        'Bike availability data integrated with journey planning'
      ];

      const newEvent: CoordinationEvent = {
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        agents: agentStatuses.slice(0, Math.floor(Math.random() * 3) + 1).map(a => a.name),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
      };

      setCoordinationEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'berlin-public-transport':
        return <Bus className="w-5 h-5" />;
      case 'ride-hailing':
        return <Car className="w-5 h-5" />;
      case 'bike-sharing':
        return <Bike className="w-5 h-5" />;
      default:
        return <Route className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success';
      case 'inactive':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-text-secondary';
      default:
        return 'text-text-secondary';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-gradient-to-br from-neon-blue-accessible to-neon-purple-accessible rounded-lg"
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(59, 130, 246, 0.4)',
                '0 0 0 10px rgba(59, 130, 246, 0)',
                '0 0 0 0 rgba(59, 130, 246, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-text-primary">Agent Coordination Dashboard</h3>
            <p className="text-sm text-text-secondary">
              Real-time multi-modal transportation collaboration
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${isMonitoring ? 'text-success' : 'text-error'}`}>
            {isMonitoring ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-xs">{isMonitoring ? 'Live' : 'Offline'}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-surface-elevated rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neon-blue-accessible" />
            <span className="text-sm font-medium text-text-primary">Active Agents</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{agentStatuses.length}</p>
        </div>
        
        <div className="p-4 bg-surface-elevated rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-text-primary">Total Journeys</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{totalJourneys.toLocaleString()}</p>
        </div>
        
        <div className="p-4 bg-surface-elevated rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-text-primary">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{Math.round(successRate * 100)}%</p>
        </div>
        
        <div className="p-4 bg-surface-elevated rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-text-primary">Avg Response</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{avgResponseTime}ms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Status */}
        <div>
          <h4 className="font-medium text-text-primary mb-4">Agent Status</h4>
          <div className="space-y-3">
            {agentStatuses.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-surface-elevated rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface-overlay rounded-lg">
                      {getAgentIcon(agent.id)}
                    </div>
                    <div>
                      <h5 className="font-medium text-text-primary">{agent.name}</h5>
                      <p className={`text-xs ${getStatusColor(agent.status)}`}>
                        {agent.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">Last Update</p>
                    <p className="text-xs text-text-primary">{formatTime(agent.lastUpdate)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-text-secondary">Connections</p>
                    <p className="font-medium text-text-primary">{agent.activeConnections}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Messages</p>
                    <p className="font-medium text-text-primary">{agent.messagesProcessed}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Reliability</p>
                    <p className="font-medium text-success">{Math.round(agent.reliability * 100)}%</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coordination Events */}
        <div>
          <h4 className="font-medium text-text-primary mb-4">Coordination Events</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {coordinationEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-3 bg-surface-elevated rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {event.type === 'collaboration' && <Share2 className="w-3 h-3 text-neon-blue-accessible" />}
                        {event.type === 'data_share' && <MessageSquare className="w-3 h-3 text-success" />}
                        {event.type === 'route_optimization' && <TrendingUp className="w-3 h-3 text-warning" />}
                        {event.type === 'real_time_update' && <Zap className="w-3 h-3 text-neon-purple-accessible" />}
                      </div>
                      <span className={`text-xs font-medium ${getImpactColor(event.impact)}`}>
                        {event.impact.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">{formatTime(event.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-text-primary mb-2">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {event.agents.map((agent, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-surface-overlay rounded text-xs text-text-secondary"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentCoordinationDashboard;
