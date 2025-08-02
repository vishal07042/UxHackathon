import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Zap,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { aiBookingAssistant, BookingCommand } from '../services/aiBookingAssistant';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

interface AIBookingChatProps {
  onBookingComplete?: (bookingDetails: any) => void;
  initialContext?: {
    source?: string;
    destination?: string;
    date?: string;
  };
}

export const AIBookingChat: React.FC<AIBookingChatProps> = ({
  onBookingComplete,
  initialContext
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI booking assistant. I can help you book bus tickets using natural language. Try saying something like "Book me a window seat on the earliest bus to Delhi tomorrow"',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialContext?.source && initialContext?.destination) {
      const contextMessage = `I see you're planning a journey from ${initialContext.source} to ${initialContext.destination}${initialContext.date ? ` on ${initialContext.date}` : ''}. Would you like me to search for available buses?`;
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: contextMessage,
        timestamp: new Date()
      }]);
    }
  }, [initialContext]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Process the natural language command
      const command = await aiBookingAssistant.processBookingCommand(
        inputValue,
        'demo-user',
        initialContext
      );

      // Generate assistant response based on command
      const response = await processBookingCommand(command);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        data: response.data
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If booking was completed, notify parent
      if (response.data?.bookingComplete && onBookingComplete) {
        onBookingComplete(response.data.bookingDetails);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or be more specific.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processBookingCommand = async (command: BookingCommand): Promise<{ message: string; data?: any }> => {
    if (command.type === 'search') {
      if (!command.source || !command.destination) {
        return {
          message: 'I need both source and destination cities to search for buses. Could you please specify both?'
        };
      }

      return {
        message: `Searching for buses from ${command.source} to ${command.destination} on ${command.date} for ${command.passengers} passenger(s)...`,
        data: { searchInitiated: true, command }
      };
    }

    if (command.type === 'book') {
      if (!command.source || !command.destination) {
        return {
          message: 'I need both source and destination cities to book tickets. Could you please specify both?'
        };
      }

      try {
        const result = await aiBookingAssistant.autoBook(
          command.source,
          command.destination,
          command.date,
          command.passengers,
          command.preferences || {
            seatPreference: 'any',
            timePreference: 'any',
            pricePreference: 'any',
            operatorPreferences: [],
            amenityPreferences: []
          },
          'demo-user',
          true
        );

        if (result.success) {
          return {
            message: `Great! I've successfully booked your tickets. Your PNR is ${result.pnr}. Total amount: ₹${result.totalAmount}`,
            data: { 
              bookingComplete: true, 
              bookingDetails: result 
            }
          };
        } else {
          return {
            message: `I couldn't complete the booking: ${result.error}. Would you like me to show you available alternatives?`
          };
        }
      } catch (error) {
        return {
          message: 'I encountered an issue while booking. Please try again or use the manual booking interface.'
        };
      }
    }

    return {
      message: 'I understand you want to ' + command.type + '. Let me help you with that.'
    };
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-overlay/95 backdrop-blur-lg rounded-2xl shadow-elevation-medium border border-border-secondary h-[500px] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border-secondary">
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
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Booking Assistant</h3>
            <p className="text-sm text-text-secondary">
              Natural language bus booking
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-neon-blue-accessible to-neon-purple-accessible rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-neon-blue-accessible text-white ml-auto'
                      : 'bg-surface-elevated text-text-primary'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-text-muted mt-1 px-3">
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-neon-blue-accessible to-neon-purple-accessible rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-elevated p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-neon-blue-accessible border-t-transparent rounded-full"
                />
                <span className="text-sm text-text-primary">Processing...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-secondary">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your booking request..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={startVoiceInput}
            disabled={isProcessing || isListening}
            className={isListening ? 'bg-error/20 border-error' : ''}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            size="sm"
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-text-muted">
          Try: "Book 2 window seats to Mumbai tomorrow morning" or "Find cheapest bus to Delhi"
        </div>
      </div>
    </motion.div>
  );
};

export default AIBookingChat;
