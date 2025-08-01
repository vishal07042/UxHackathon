import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Search, Brain, Route, Bell, CheckCircle, ArrowRight, Layers, Zap, Shield } from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

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

  const steps = [
    {
      icon: MapPin,
      title: 'Enter Your Journey',
      description: 'Simply input your starting point and destination. Our system handles the complexity.',
      details: 'Choose your preferences: fastest route, cheapest option, or most comfortable journey. Set your departure time or arrival deadline.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Search,
      title: 'Agents Spring Into Action',
      description: 'Multiple AI agents simultaneously search their respective transport networks.',
      details: 'Bus, Metro, Ride-hailing, and Bike-sharing agents work in parallel to find all possible options for your journey.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'Intelligent Coordination',
      description: 'The Planner Agent orchestrates and optimizes all transport options.',
      details: 'Using advanced algorithms, it combines different transport modes, minimizes transfers, and ensures smooth connections.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Route,
      title: 'Personalized Routes',
      description: 'Receive multiple journey options tailored to your preferences.',
      details: 'Each route is optimized for your specific needs, whether that\'s speed, cost, comfort, or environmental impact.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Bell,
      title: 'Real-Time Updates',
      description: 'Stay informed with live updates throughout your journey.',
      details: 'Get instant notifications about delays, better alternatives, or any changes that affect your trip.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: CheckCircle,
      title: 'Seamless Travel',
      description: 'Enjoy stress-free navigation across all transport modes.',
      details: 'Our system ensures you never miss a connection and always have the best route available.',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const flowDiagram = [
    { from: 'User', to: 'Planner Agent', label: 'Journey Request' },
    { from: 'Planner Agent', to: 'Transport Agents', label: 'Parallel Queries' },
    { from: 'Transport Agents', to: 'Real-time Data', label: 'Live Updates' },
    { from: 'Real-time Data', to: 'Planner Agent', label: 'Current Status' },
    { from: 'Planner Agent', to: 'User', label: 'Optimized Routes' }
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">
              How <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">UXplorer 2025</span> Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the magic behind our multi-agent system that makes urban 
              transportation seamless, intelligent, and stress-free.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Interactive Steps */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Your Journey in 6 Simple Steps
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Steps Timeline */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveStep(index)}
                  className="cursor-pointer"
                >
                  <motion.div
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      activeStep === index 
                        ? 'border-blue-500 bg-white shadow-xl' 
                        : 'border-gray-200 bg-gray-50 hover:bg-white hover:shadow-lg'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}
                        animate={{ rotate: activeStep === index ? 360 : 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                      {activeStep === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-blue-500"
                        >
                          <ArrowRight className="w-6 h-6" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Step Details */}
            <div className="relative">
              <motion.div
                className="sticky top-32"
                layout
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl shadow-2xl p-8"
                  >
                    <motion.div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center mb-6`}
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 1 }}
                    >
                      {React.createElement(steps[activeStep].icon, { className: "w-10 h-10 text-white" })}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">
                      Step {activeStep + 1}: {steps[activeStep].title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {steps[activeStep].details}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Behind the Scenes
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: 'Multi-Agent Architecture',
                description: 'Independent agents work together, each specialized in their transport domain',
                features: ['Parallel processing', 'Domain expertise', 'Scalable system']
              },
              {
                icon: Zap,
                title: 'Real-Time Processing',
                description: 'Lightning-fast responses with live data integration from all transport services',
                features: ['Instant updates', 'Dynamic routing', 'Live tracking']
              },
              {
                icon: Shield,
                title: 'Reliable & Secure',
                description: 'Built with redundancy and security to ensure your journey is always smooth',
                features: ['99.9% uptime', 'Data encryption', 'Privacy first']
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <ul className="space-y-2">
                  {item.features.map((feature, fIndex) => (
                    <motion.li
                      key={fIndex}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 + fIndex * 0.1 }}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <motion.div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join the smart mobility revolution and transform your daily commute
          </p>
          <Link to="/journey-planner">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Your Journey
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default HowItWorks;
