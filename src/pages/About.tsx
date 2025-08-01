import React from 'react';
import { motion } from 'framer-motion';
import { Bus, Train, Bike, Car, Brain, Cpu, Network, Globe } from 'lucide-react';

const About = () => {
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

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const agents = [
    {
      icon: Brain,
      name: 'Journey Planner Agent',
      role: 'Master Orchestrator',
      description: 'The brain of the operation, coordinating all transport agents to find your perfect journey',
      capabilities: ['Route optimization', 'Multi-modal planning', 'Real-time adaptation', 'Preference learning'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Bus,
      name: 'Bus Agent',
      role: 'Public Transit Expert',
      description: 'Manages all bus routes, schedules, and real-time locations across the city',
      capabilities: ['Live bus tracking', 'Schedule management', 'Delay predictions', 'Route suggestions'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Train,
      name: 'Metro Agent',
      role: 'Rapid Transit Specialist',
      description: 'Handles metro and subway systems for fastest cross-city transportation',
      capabilities: ['Station connections', 'Line status updates', 'Peak hour optimization', 'Transfer timing'],
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Car,
      name: 'Ride-hailing Agent',
      role: 'On-Demand Transport',
      description: 'Connects you with taxis and ride-sharing services for door-to-door convenience',
      capabilities: ['Real-time availability', 'Price estimation', 'Driver matching', 'ETA calculation'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Bike,
      name: 'Bike-sharing Agent',
      role: 'Eco-Friendly Option',
      description: 'Manages bike-sharing services for healthy and sustainable last-mile connectivity',
      capabilities: ['Dock availability', 'Bike reservations', 'Route planning', 'Weather adaptation'],
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">UXplorer 2025</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A revolutionary multi-agent system that brings together all urban transportation 
              services into one intelligent, coordinated platform for seamless city navigation.
            </p>
          </motion.div>

          {/* Vision Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            variants={staggerContainer}
          >
            {[
              {
                icon: Network,
                title: 'Connected Ecosystem',
                description: 'All transport services working together as one unified system'
              },
              {
                icon: Cpu,
                title: 'AI-Powered Intelligence',
                description: 'Smart agents that learn and adapt to provide better journeys'
              },
              {
                icon: Globe,
                title: 'Smart City Integration',
                description: 'Built for the cities of tomorrow, available today'
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Agents Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl font-bold text-center mb-16"
          >
            Meet Our Intelligent Agents
          </motion.h2>

          <div className="space-y-12">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.name}
                variants={fadeInUp}
                className="relative"
              >
                <motion.div
                  className="bg-white rounded-3xl shadow-xl overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                    {/* Agent Icon and Info */}
                    <div className="flex items-center space-x-6">
                      <motion.div
                        className={`w-24 h-24 bg-gradient-to-r ${agent.color} rounded-2xl flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <agent.icon className="w-12 h-12 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold">{agent.name}</h3>
                        <p className={`text-lg font-medium bg-gradient-to-r ${agent.color} bg-clip-text text-transparent`}>
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 space-y-4">
                      <p className="text-gray-600 text-lg">{agent.description}</p>
                      <div>
                        <h4 className="font-semibold mb-2">Key Capabilities:</h4>
                        <div className="flex flex-wrap gap-2">
                          {agent.capabilities.map((capability, capIndex) => (
                            <motion.span
                              key={capIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ delay: capIndex * 0.1 }}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                            >
                              {capability}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Animated Background Gradient */}
                  <motion.div
                    className={`h-1 bg-gradient-to-r ${agent.color}`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="py-20">
        <motion.div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            To revolutionize urban mobility by creating an intelligent, interconnected 
            transportation ecosystem that adapts to each traveler's needs, reduces 
            commute stress, and builds more sustainable, livable cities for everyone.
          </p>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default About;
