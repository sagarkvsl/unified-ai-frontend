'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Activity,
  BarChart3,
  Target,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  MessageSquare,
  PieChart,
  Settings,
  UserCheck,
  GitBranch
} from 'lucide-react';
import DataVisualization from '@/components/DataVisualization';
import WorkflowAnalytics from '@/components/WorkflowAnalytics';
import StuckContactAnalysis from '@/components/StuckContactAnalysis';
import ClientAnalytics from '@/components/ClientAnalytics';
import AutomationEngineLogs from '@/components/AutomationEngineLogs';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  status?: 'success' | 'error';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  gradient: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'stats',
    label: 'Execution Statistics',
    icon: <BarChart3 className="w-4 h-4" />,
    prompt: 'For client 4694108, how many contacts entered workflow 413?',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'path',
    label: 'Path Analysis',
    icon: <Target className="w-4 h-4" />,
    prompt: 'Why did contact 300199 follow the NO path in workflow 413 step 15 for client 4694108?',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'analytics',
    label: 'Event Analytics',
    icon: <TrendingUp className="w-4 h-4" />,
    prompt: 'What are the different types of events we are receiving in the last 7 days for client 4694108?',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'trends',
    label: 'Event Trends',
    icon: <Activity className="w-4 h-4" />,
    prompt: 'Show me event trends for client 4694108 in the last 24 hours',
    gradient: 'from-orange-500 to-red-500'
  }
];

export default function ChatInterface() {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualization' | 'workflows' | 'stuck-analysis' | 'client-analytics' | 'automation-logs'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `👋 **Welcome to the Brevo Debugging AI Assistant!**

I'm your AI-powered debugging assistant for Brevo platform. I help developers, QA, tech support, CX, and all internal Brevo teams debug issues across various Brevo features using natural language queries.

**What I can help you with:**
• 🔄 **Workflows** - Debug automation workflows, execution paths, and contact flows
• 👥 **Contacts** - Analyze contact behavior and stuck contacts
• 📊 **Events** - Track event analytics and trends
• 🔍 **And much more** - Ask questions about any Brevo feature!

**Example questions:**
📊 **"For client 4694108, how many contacts entered workflow 413?"**
🔍 **"Have we received any events from client 4694108 in the last few days?"**
🔍 **"Why did contact 300199 follow the NO path in workflow 413 step 15 for client 4694108?"**
⚙️ **"Show me execution statistics for workflow 139 for client 4694108"**

✨ *I use OpenAI to understand your questions and automatically query the required databases to provide detailed analysis and insights!*`,
      type: 'ai',
      timestamp: new Date(),
      status: 'success'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check API connection
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/../health');
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
      console.error('API connection failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, customPrompt?: string) => {
    e.preventDefault();
    const messageContent = customPrompt || inputValue.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          conversation_id: conversationId,
          userId: 'ui-user-' + Date.now()
        })
      });

      const data = await response.json();
      
      // Store conversation ID for session memory
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }
      
      // Extract detailed response content
      let responseContent = '';
      if (data.success) {
        if (data.results && data.results.formattedMessage) {
          // Use the formatted message which includes contact examples
          responseContent = data.results.formattedMessage;
        } else if (data.tool_executed === 'get_event_trends' && data.results && data.results.trends) {
          // Handle event trends response format
          responseContent = `📈 **Event Trends**\n\n`;
          responseContent += data.message + `\n\n`;
          
          responseContent += `**Summary:**\n`;
          responseContent += `• Organization ID: ${data.results.organization_id}\n`;
          responseContent += `• Timeframe: ${data.results.timeframe}\n`;
          responseContent += `• Total Data Points: ${data.results.total_rows}\n\n`;
          
          // Group trends by event name for better display
          const eventGroups: { [key: string]: { source: string, count: number, hours: number[] } } = {};
          data.results.trends.forEach((trend: any) => {
            const key = trend.event_name;
            if (!eventGroups[key]) {
              eventGroups[key] = { source: trend.event_source, count: 0, hours: [] };
            }
            eventGroups[key].count += trend.event_count;
            eventGroups[key].hours.push(trend.hour);
          });
          
          responseContent += `**Event Breakdown:**\n`;
          Object.entries(eventGroups).forEach(([eventName, data]: [string, any], index: number) => {
            responseContent += `${index + 1}. **${eventName}** (${data.source})\n`;
            responseContent += `   • Total Events: ${data.count.toLocaleString()}\n`;
            responseContent += `   • Data Points: ${data.hours.length}\n\n`;
          });
          
          responseContent += `*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
        } else if (data.tool_executed === 'get_event_analytics' && data.results && data.results.analytics) {
          // Handle event analytics response format
          responseContent = `📊 **Event Analytics Results**\n\n`;
          responseContent += data.message + `\n\n`;
          
          // Add summary statistics
          const totalEvents = data.results.analytics.reduce((sum: number, item: any) => sum + item.total_events, 0);
          const totalContacts = data.results.analytics.reduce((sum: number, item: any) => sum + item.unique_contacts, 0);
          
          responseContent += `**Summary:**\n`;
          responseContent += `• Organization ID: ${data.results.organization_id}\n`;
          responseContent += `• Timeframe: ${data.results.timeframe}\n`;
          responseContent += `• Total Event Types: ${data.results.total_event_types}\n`;
          responseContent += `• Total Events: ${totalEvents.toLocaleString()}\n`;
          responseContent += `• Total Unique Contacts: ${totalContacts.toLocaleString()}\n\n`;
          
          // Add detailed event breakdown
          responseContent += `**Event Breakdown:**\n`;
          data.results.analytics.forEach((event: any, index: number) => {
            const firstDate = new Date(event.first_event).toLocaleDateString();
            const lastDate = new Date(event.last_event).toLocaleDateString();
            responseContent += `${index + 1}. **${event.event_name}** (${event.event_source})\n`;
            responseContent += `   • Total Events: ${event.total_events.toLocaleString()}\n`;
            responseContent += `   • Unique Contacts: ${event.unique_contacts.toLocaleString()}\n`;
            responseContent += `   • Date Range: ${firstDate} - ${lastDate}\n\n`;
          });
          
          // Add timestamp
          responseContent += `*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
          
          // Also update WorkflowAnalytics component if available
          if (typeof window !== 'undefined' && (window as any).handleEventAnalyticsResponse) {
            setTimeout(() => {
              (window as any).handleEventAnalyticsResponse(data);
            }, 100);
          }
        } else if (data.results && data.results.answer && data.results.answer.summary) {
          // For detailed analysis responses, show the comprehensive summary
          responseContent = data.results.answer.summary;
          
          // Add statistics if available
          if (data.results.answer.statistics) {
            const stats = data.results.answer.statistics;
            responseContent += `\n\n**Statistics:**\n`;
            if (stats.total_events !== undefined) responseContent += `• Total Events: ${stats.total_events}\n`;
            if (stats.unique_event_types !== undefined) responseContent += `• Unique Event Types: ${stats.unique_event_types}\n`;
            if (stats.unique_sources !== undefined) responseContent += `• Unique Sources: ${stats.unique_sources}\n`;
            if (stats.data_points !== undefined) responseContent += `• Data Points: ${stats.data_points}\n`;
          }
          
          // Add analytics data if available
          if (data.results.analyticsData && data.results.analyticsData.length > 0) {
            responseContent += `\n\n**Event Types Found:**\n`;
            data.results.analyticsData.forEach((item: any) => {
              if (item.raw_data) {
                responseContent += `• ${item.raw_data}\n`;
              }
            });
          }
          
          // Add trends data if available
          if (data.results.trendsData && data.results.trendsData.length > 0) {
            responseContent += `\n\n**Trend Data Points:** ${data.results.trendsData.length} entries`;
          }
          
          // Add processing time
          if (data.results.processingTimeHuman) {
            responseContent += `\n\n*Processing time: ${data.results.processingTimeHuman}*`;
          }
        } else if (data.tool_executed === 'get_workflow_execution_statistics' && data.results) {
          // Handle workflow execution statistics response
          const results = data.results;
          responseContent = `📊 **Workflow Execution Statistics**\n\n`;
          responseContent += data.message + `\n\n`;
          
          responseContent += `**Details:**\n`;
          responseContent += `• Organization ID: ${results.organization_id}\n`;
          responseContent += `• Workflow ID: ${results.workflow_id}\n`;
          if (results.execution_type) responseContent += `• Execution Type: ${results.execution_type}\n`;
          if (results.timeframe) responseContent += `• Timeframe: ${results.timeframe}\n`;
          responseContent += `\n**Results:**\n`;
          responseContent += `• Total Logs: ${results.total_logs?.toLocaleString() || 0}\n`;
          responseContent += `• Unique Contacts: ${results.unique_contacts?.toLocaleString() || 0}\n`;
          if (results.entry_events !== undefined) responseContent += `• Entry Events: ${results.entry_events?.toLocaleString() || 0}\n`;
          
          if (results.summary) {
            responseContent += `\n**Summary:** ${results.summary}`;
          }
          
          responseContent += `\n\n*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
        } else if (data.results && data.results.summary) {
          // Generic handler for any tool response with a summary field
          responseContent = `📊 **${data.tool_executed ? data.tool_executed.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Analysis'} Results**\n\n`;
          responseContent += data.message + `\n\n`;
          responseContent += `**Summary:** ${data.results.summary}\n\n`;
          
          // Display other relevant fields from results
          const excludeKeys = ['tool', 'summary'];
          Object.entries(data.results).forEach(([key, value]) => {
            if (!excludeKeys.includes(key) && value !== null && value !== undefined) {
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
              if (typeof value === 'number') {
                responseContent += `• ${formattedKey}: ${value.toLocaleString()}\n`;
              } else if (typeof value === 'string' || typeof value === 'boolean') {
                responseContent += `• ${formattedKey}: ${value}\n`;
              }
            }
          });
          
          responseContent += `\n*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
        } else {
          // Fallback to other response formats
          responseContent = data.result || data.response || data.message;
        }
      } else {
        responseContent = `❌ **Error**: ${data.error}`;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        type: 'ai',
        timestamp: new Date(),
        status: data.success ? 'success' : 'error'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ **Connection Error**: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'ai',
        timestamp: new Date(),
        status: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmitMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageContent,
          conversation_id: conversationId,
          userId: 'ui-user-' + Date.now()
        }),
      });

      const data = await response.json();
      
      // Store conversation ID for session memory
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }
      
      // Extract detailed response content
      let responseContent = '';
      if (data.success) {
        if (data.results && data.results.formattedMessage) {
          // Use the formatted message which includes contact examples
          responseContent = data.results.formattedMessage;
        } else if (data.tool_executed === 'get_event_trends' && data.results && data.results.trends) {
          // Handle event trends response format
          responseContent = `📈 **Event Trends**\n\n`;
          responseContent += data.message + `\n\n`;
          
          responseContent += `**Summary:**\n`;
          responseContent += `• Organization ID: ${data.results.organization_id}\n`;
          responseContent += `• Timeframe: ${data.results.timeframe}\n`;
          responseContent += `• Total Data Points: ${data.results.total_rows}\n\n`;
          
          // Group trends by event name for better display
          const eventGroups: { [key: string]: { source: string, count: number, hours: number[] } } = {};
          data.results.trends.forEach((trend: any) => {
            const key = trend.event_name;
            if (!eventGroups[key]) {
              eventGroups[key] = { source: trend.event_source, count: 0, hours: [] };
            }
            eventGroups[key].count += trend.event_count;
            eventGroups[key].hours.push(trend.hour);
          });
          
          responseContent += `**Event Breakdown:**\n`;
          Object.entries(eventGroups).forEach(([eventName, eventData]: [string, any], index: number) => {
            responseContent += `${index + 1}. **${eventName}** (${eventData.source})\n`;
            responseContent += `   • Total Events: ${eventData.count.toLocaleString()}\n`;
            responseContent += `   • Data Points: ${eventData.hours.length}\n\n`;
          });
          
          responseContent += `*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
        } else if (data.tool_executed === 'get_event_analytics' && data.results && data.results.analytics) {
          // Handle event analytics response format
          responseContent = `📊 **Event Analytics Results**\n\n`;
          responseContent += data.message + `\n\n`;
          
          // Add summary statistics
          const totalEvents = data.results.analytics.reduce((sum: number, item: any) => sum + item.total_events, 0);
          const totalContacts = data.results.analytics.reduce((sum: number, item: any) => sum + item.unique_contacts, 0);
          
          responseContent += `**Summary:**\n`;
          responseContent += `• Organization ID: ${data.results.organization_id}\n`;
          responseContent += `• Timeframe: ${data.results.timeframe}\n`;
          responseContent += `• Total Event Types: ${data.results.total_event_types}\n`;
          responseContent += `• Total Events: ${totalEvents.toLocaleString()}\n`;
          responseContent += `• Total Unique Contacts: ${totalContacts.toLocaleString()}\n\n`;
          
          // Add detailed event breakdown
          responseContent += `**Event Breakdown:**\n`;
          data.results.analytics.forEach((event: any, index: number) => {
            const firstDate = new Date(event.first_event).toLocaleDateString();
            const lastDate = new Date(event.last_event).toLocaleDateString();
            responseContent += `${index + 1}. **${event.event_name}** (${event.event_source})\n`;
            responseContent += `   • Total Events: ${event.total_events.toLocaleString()}\n`;
            responseContent += `   • Unique Contacts: ${event.unique_contacts.toLocaleString()}\n`;
            responseContent += `   • Date Range: ${firstDate} - ${lastDate}\n\n`;
          });
          
          responseContent += `*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
        } else if (data.results && data.results.answer && data.results.answer.summary) {
          // For detailed analysis responses, show the comprehensive summary
          responseContent = data.results.answer.summary;
          
          // Add statistics if available
          if (data.results.answer.statistics) {
            const stats = data.results.answer.statistics;
            responseContent += `\n\n**Statistics:**\n`;
            if (stats.total_events !== undefined) responseContent += `• Total Events: ${stats.total_events}\n`;
            if (stats.unique_event_types !== undefined) responseContent += `• Unique Event Types: ${stats.unique_event_types}\n`;
            if (stats.unique_sources !== undefined) responseContent += `• Unique Sources: ${stats.unique_sources}\n`;
            if (stats.data_points !== undefined) responseContent += `• Data Points: ${stats.data_points}\n`;
          }
          
          // Add analytics data if available
          if (data.results.analyticsData && data.results.analyticsData.length > 0) {
            responseContent += `\n\n**Event Types Found:**\n`;
            data.results.analyticsData.forEach((item: any) => {
              if (item.raw_data) {
                responseContent += `• ${item.raw_data}\n`;
              }
            });
          }
          
          // Add trends data if available
          if (data.results.trendsData && data.results.trendsData.length > 0) {
            responseContent += `\n\n**Trend Data Points:** ${data.results.trendsData.length} entries`;
          }
          
          // Add processing time
          if (data.results.processingTimeHuman) {
            responseContent += `\n\n*Processing time: ${data.results.processingTimeHuman}*`;
          }
        } else if (data.tool_executed === 'get_workflow_execution_statistics' && data.results) {
          // Handle workflow execution statistics response
          const results = data.results;
          responseContent = `📊 **Workflow Execution Statistics**\n\n`;
          responseContent += data.message + `\n\n`;
          
          responseContent += `**Details:**\n`;
          responseContent += `• Organization ID: ${results.organization_id}\n`;
          responseContent += `• Workflow ID: ${results.workflow_id}\n`;
          if (results.execution_type) responseContent += `• Execution Type: ${results.execution_type}\n`;
          if (results.timeframe) responseContent += `• Timeframe: ${results.timeframe}\n`;
          responseContent += `\n**Results:**\n`;
          responseContent += `• Total Logs: ${results.total_logs?.toLocaleString() || 0}\n`;
          responseContent += `• Unique Contacts: ${results.unique_contacts?.toLocaleString() || 0}\n`;
          if (results.entry_events !== undefined) responseContent += `• Entry Events: ${results.entry_events?.toLocaleString() || 0}\n`;
          
          if (results.summary) {
            responseContent += `\n**Summary:** ${results.summary}`;
          }
          
          responseContent += `\n\n*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
        } else if (data.results && data.results.summary) {
          // Generic handler for any tool response with a summary field
          responseContent = `📊 **${data.tool_executed ? data.tool_executed.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Analysis'} Results**\n\n`;
          responseContent += data.message + `\n\n`;
          responseContent += `**Summary:** ${data.results.summary}\n\n`;
          
          // Display other relevant fields from results
          const excludeKeys = ['tool', 'summary'];
          Object.entries(data.results).forEach(([key, value]) => {
            if (!excludeKeys.includes(key) && value !== null && value !== undefined) {
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
              if (typeof value === 'number') {
                responseContent += `• ${formattedKey}: ${value.toLocaleString()}\n`;
              } else if (typeof value === 'string' || typeof value === 'boolean') {
                responseContent += `• ${formattedKey}: ${value}\n`;
              }
            }
          });
          
          responseContent += `\n*Analysis generated: ${new Date(data.timestamp).toLocaleString()}*`;
        } else {
          // Fallback to other response formats
          responseContent = data.result || data.response || data.message;
        }
      } else {
        responseContent = `❌ **Error**: ${data.error}`;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        type: 'ai',
        timestamp: new Date(),
        status: data.success ? 'success' : 'error'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ **Connection Error**: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'ai',
        timestamp: new Date(),
        status: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 py-4 px-2"
        >
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl blur opacity-75 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold gradient-text">
                    Brevo Debugging AI Assistant
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Debug Brevo platform issues • Get instant analysis • Support for workflows, contacts, events & more
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isConnected 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Tab Navigation */}
        <div className="px-2 mb-3">
          <div className="flex items-center space-x-1 glass-strong rounded-xl p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'visualization'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Event Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'workflows'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Workflow Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('stuck-analysis')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'stuck-analysis'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Stuck Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('client-analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'client-analytics'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Client Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('automation-logs')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'automation-logs'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Automation Engine Logs</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden px-2" style={{ minHeight: '75vh' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full glass rounded-2xl flex flex-col"
                style={{ minHeight: '70vh' }}
              >
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-96">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : message.status === 'error'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500'
                          : 'bg-gradient-to-r from-primary-500 to-emerald-500'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : message.status === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : message.status === 'error'
                            ? 'glass border-red-500/30 bg-red-500/5'
                            : 'glass'
                        } ${message.type === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                          <div className="prose prose-invert prose-sm max-w-none text-sm">
                            <ReactMarkdown
                              components={{
                                code({node, className, children, ...props}) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return match ? (
                                    <SyntaxHighlighter
                                      style={oneDark as any}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-lg"
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className="bg-dark-800 px-1 py-0.5 rounded text-xs" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                          <span suppressHydrationWarning>{message.timestamp.toLocaleTimeString()}</span>
                          {message.status === 'success' && <CheckCircle className="w-3 h-3 text-green-400" />}
                          {message.status === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="glass p-4 rounded-2xl rounded-bl-md">
                        <div className="flex items-center space-x-2 text-primary-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              {/* Quick Actions */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium text-gray-300">Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickAction(action.prompt)}
                      className={`glass p-2 rounded-xl text-left transition-all hover:bg-white/10 group`}
                    >
                      <div className={`w-6 h-6 bg-gradient-to-r ${action.gradient} rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
                        <span className="text-xs">
                          {action.icon}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-white mb-1">{action.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about Brevo in natural language... (e.g., 'For client 4694108, how many contacts entered workflow 413?' or 'Show me events for client 4694108')"
                    className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-3 py-2 pr-12 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[50px] max-h-24"
                    rows={2}
                  />
                  <motion.button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-3 bottom-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary-500/25"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </form>
            </div>
              </motion.div>
            ) : activeTab === 'visualization' ? (
              <motion.div
                key="visualization" 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <DataVisualization onSendMessage={handleSubmitMessage} isLoading={isLoading} />
              </motion.div>
            ) : activeTab === 'workflows' ? (
              <motion.div
                key="workflows"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <WorkflowAnalytics />
              </motion.div>
            ) : activeTab === 'stuck-analysis' ? (
              <motion.div
                key="stuck-analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                <div className="p-6">
                  <StuckContactAnalysis />
                </div>
              </motion.div>
            ) : activeTab === 'client-analytics' ? (
              <motion.div
                key="client-analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                <div className="p-6">
                  <ClientAnalytics />
                </div>
              </motion.div>
            ) : activeTab === 'automation-logs' ? (
              <motion.div
                key="automation-logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                <AutomationEngineLogs />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-shrink-0 py-2 px-2"
        >
          <div className="text-center text-xs text-gray-500">
            AI-Powered Brevo Debugging Assistant • Built with ❤️ for Brevo Platform.
          </div>
        </motion.footer>
      </div>
    </div>
  );
}