'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
  Globe,
  Building,
  Play,
  Pause,
  Square,
  Trash2,
  Calendar,
  Hash,
  Clock,
  Database
} from 'lucide-react';
import { EventAnalyticsData, EventAnalyticsResult, AIEventAnalyticsResponse } from '../types';

interface WorkflowData {
  scope: 'organization' | 'global';
  organization_id?: string;
  total_workflows: number;
  active_workflows: number;
  inactive_workflows: number;
  paused_workflows: number;
  deleted_workflows: number;
  recent_workflows: Array<{ id: string; name: string; created_at: string; is_active: boolean }>;
}

interface TriggerData {
  scope: 'organization' | 'global';
  organization_id?: string;
  total_triggers: number;
  active_triggers: number;
  inactive_triggers: number;
  event_distribution: Array<{ event_name: string; count: number; active_count: number }>;
}

interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'doughnut';
  title: string;
  description: string;
}

const CHART_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', 
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
];

const WORKFLOW_STATUS_COLORS = {
  'Active': '#10B981',    // Green
  'Inactive': '#6B7280',  // Gray
  'Paused': '#F59E0B',    // Amber
  'Deleted': '#EF4444'    // Red
};

const chartConfigs: ChartConfig[] = [
  { type: 'bar', title: 'Bar Chart', description: 'Compare workflow counts' },
  { type: 'pie', title: 'Pie Chart', description: 'Workflow distribution' },
  { type: 'doughnut', title: 'Doughnut Chart', description: 'Compact distribution' },
  { type: 'line', title: 'Line Chart', description: 'Trend visualization' }
];

export default function WorkflowAnalytics() {
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [triggerData, setTriggerData] = useState<TriggerData | null>(null);
  const [eventAnalyticsData, setEventAnalyticsData] = useState<EventAnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<'bar' | 'pie' | 'line' | 'doughnut'>('bar');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'workflows' | 'triggers' | 'events'>('workflows');

  const fetchWorkflowAnalytics = async (orgId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = orgId ? 
        `/api/analytics/workflows?organizationId=${orgId}` : 
        '/api/analytics/workflows';
      
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      if (result.status === 'success') {
        setWorkflowData(result.data);
      } else {
        setError(result.message || 'Failed to fetch workflow analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTriggerAnalytics = async (orgId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = orgId ? 
        `/api/analytics/triggers?organizationId=${orgId}` : 
        '/api/analytics/triggers';
      
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      if (result.status === 'success') {
        setTriggerData(result.data);
      } else {
        setError(result.message || 'Failed to fetch trigger analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventAnalytics = async (orgId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would fetch from your AI chat endpoint that provides event analytics
      const apiUrl = `/api/analytics/events?organizationId=${orgId || ''}&timeframe=7d`;
      
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      if (result.success && result.results) {
        setEventAnalyticsData(result.results);
      } else {
        setError(result.message || 'Failed to fetch event analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Method to handle AI chat response for event analytics
  const handleEventAnalyticsResponse = (response: AIEventAnalyticsResponse) => {
    if (response.success && response.results) {
      setEventAnalyticsData(response.results);
      setError(null);
      setActiveSection('events'); // Switch to events tab
    } else {
      setError(response.message || 'Failed to process event analytics');
    }
  };

  // Expose the method to parent components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleEventAnalyticsResponse = handleEventAnalyticsResponse;
      
      // Also expose a test method for development
      (window as any).testEventAnalytics = () => {
        const sampleResponse: AIEventAnalyticsResponse = {
          success: true,
          message: "Analyze event types and sources from unified_events_out_router for last 7 days for organization 8431862.",
          tool_executed: "get_event_analytics",
          parameters_used: {
            organizationId: 8431862,
            timeframe: "7d"
          },
          results: {
            success: true,
            organization_id: 8431862,
            timeframe: "7d",
            analytics: [
              {
                event_name: "added_to_lists",
                event_source: "contacts",
                total_events: 86,
                unique_contacts: 79,
                first_event: 1769109186962,
                last_event: 1769620371133
              },
              {
                event_name: "email_unsubscribed", 
                event_source: "email",
                total_events: 38,
                unique_contacts: 35,
                first_event: 1769111334000,
                last_event: 1769690387000
              },
              {
                event_name: "removed_from_lists",
                event_source: "contacts", 
                total_events: 1,
                unique_contacts: 1,
                first_event: 1769590446266,
                last_event: 1769590446266
              }
            ],
            total_event_types: 3
          },
          conversation_id: "wf_1769704344786_00d6b8d1",
          timestamp: "2026-01-29T16:33:12.717205",
          ai_powered: true
        };
        handleEventAnalyticsResponse(sampleResponse);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).handleEventAnalyticsResponse;
        delete (window as any).testEventAnalytics;
      }
    };
  }, []);

  const handleFetchData = () => {
    const orgId = organizationId.trim() || undefined;
    if (activeSection === 'workflows') {
      fetchWorkflowAnalytics(orgId);
    } else if (activeSection === 'triggers') {
      fetchTriggerAnalytics(orgId);
    } else if (activeSection === 'events') {
      fetchEventAnalytics(orgId);
    }
  };

  useEffect(() => {
    // Load data for the active section by default
    if (activeSection === 'workflows') {
      fetchWorkflowAnalytics();
    } else if (activeSection === 'triggers') {
      fetchTriggerAnalytics();
    } else if (activeSection === 'events') {
      fetchEventAnalytics();
    }
  }, [activeSection]);

  const downloadCSV = () => {
    if (!workflowData && !triggerData && !eventAnalyticsData) return;
    
    let csvContent = '';
    
    if (activeSection === 'workflows' && workflowData) {
      csvContent = 'Type,Count\n';
      csvContent += `Active,${workflowData.active_workflows}\n`;
      csvContent += `Inactive,${workflowData.inactive_workflows}\n`;
      csvContent += `Paused,${workflowData.paused_workflows}\n`;
      csvContent += `Deleted,${workflowData.deleted_workflows}\n`;
    } else if (activeSection === 'triggers' && triggerData && triggerData.event_distribution) {
      csvContent = 'Event Name,Total Count,Active Count\n';
      triggerData.event_distribution.forEach(item => {
        csvContent += `${item.event_name},${item.count},${item.active_count}\n`;
      });
    } else if (activeSection === 'events' && eventAnalyticsData && eventAnalyticsData.analytics) {
      csvContent = 'Event Name,Event Source,Total Events,Unique Contacts,First Event,Last Event\n';
      eventAnalyticsData.analytics.forEach(item => {
        const firstEventDate = new Date(item.first_event).toISOString();
        const lastEventDate = new Date(item.last_event).toISOString();
        csvContent += `${item.event_name},${item.event_source},${item.total_events},${item.unique_contacts},${firstEventDate},${lastEventDate}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSection}_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderWorkflowChart = () => {
    if (!workflowData) return null;

    // Generate chart data from workflow counts
    const chartData = [
      { type: 'Active', count: workflowData.active_workflows, fill: WORKFLOW_STATUS_COLORS['Active'] },
      { type: 'Inactive', count: workflowData.inactive_workflows, fill: WORKFLOW_STATUS_COLORS['Inactive'] },
      { type: 'Paused', count: workflowData.paused_workflows, fill: WORKFLOW_STATUS_COLORS['Paused'] },
      { type: 'Deleted', count: workflowData.deleted_workflows, fill: WORKFLOW_STATUS_COLORS['Deleted'] }
    ];


    switch (selectedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="type" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count, percent }: any) => `${type}: ${count} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.type}: ${entry.count}`}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="type" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const renderTriggerChart = () => {
    if (!triggerData || !triggerData.event_distribution) return null;

    const chartData = triggerData.event_distribution.slice(0, 15); // Top 15 events

    switch (selectedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="event_name" 
                stroke="#9CA3AF" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Total Triggers" />
              <Bar dataKey="active_count" fill="#10B981" name="Active Triggers" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.map((item, index) => ({ ...item, fill: CHART_COLORS[index % CHART_COLORS.length] }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.event_name}: ${entry.count}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return renderWorkflowChart(); // Fallback to workflow chart rendering
    }
  };

  const renderEventAnalyticsChart = () => {
    if (!eventAnalyticsData || !eventAnalyticsData.analytics) return null;

    const chartData = eventAnalyticsData.analytics.map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length],
      first_event_formatted: new Date(item.first_event).toLocaleDateString(),
      last_event_formatted: new Date(item.last_event).toLocaleDateString()
    }));

    switch (selectedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="event_name" 
                stroke="#9CA3AF" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value, name, props: any) => {
                  if (name === 'total_events') return [value?.toLocaleString() ?? '0', 'Total Events'];
                  if (name === 'unique_contacts') return [value?.toLocaleString() ?? '0', 'Unique Contacts'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Event: ${label}`}
              />
              <Legend />
              <Bar dataKey="total_events" fill="#3B82F6" name="Total Events" />
              <Bar dataKey="unique_contacts" fill="#10B981" name="Unique Contacts" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ event_name, total_events, percent }: any) => 
                  `${event_name}: ${total_events.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="total_events"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any, name: string | undefined, props: any) => {
                  const data = props.payload;
                  return [
                    <div key="tooltip" className="space-y-1">
                      <div>Total Events: {value?.toLocaleString() ?? '0'}</div>
                      <div>Unique Contacts: {data?.unique_contacts?.toLocaleString() ?? '0'}</div>
                      <div>Source: {data?.event_source ?? 'Unknown'}</div>
                      <div>Period: {data?.first_event_formatted ?? 'N/A'} - {data?.last_event_formatted ?? 'N/A'}</div>
                    </div>,
                    ''
                  ];
                }}
                labelFormatter={(label) => `${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.event_name}: ${entry.total_events.toLocaleString()}`}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="total_events"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="event_name" 
                stroke="#9CA3AF" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_events" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }} 
                name="Total Events"
              />
              <Line 
                type="monotone" 
                dataKey="unique_contacts" 
                stroke="#10B981" 
                strokeWidth={3} 
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} 
                name="Unique Contacts"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full glass rounded-2xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span>Workflow, Trigger & Event Analytics</span>
            </h2>
            <p className="text-gray-400 mt-1">
              Comprehensive analysis of workflow configurations, trigger distributions, and event analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadCSV}
              disabled={!workflowData && !triggerData && !eventAnalyticsData}
              className="glass px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-white/10 space-y-4">
        {/* Section Toggle */}
        <div className="flex items-center space-x-1 glass-subtle rounded-lg p-1">
          <button
            onClick={() => setActiveSection('workflows')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSection === 'workflows'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Workflows</span>
          </button>
          <button
            onClick={() => setActiveSection('triggers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSection === 'triggers'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Triggers</span>
          </button>
          <button
            onClick={() => setActiveSection('events')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSection === 'events'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Events</span>
          </button>
        </div>

        {/* Organization Input and Fetch Button */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Organization ID (leave empty for global analytics)"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleFetchData}
            disabled={isLoading}
            className="bg-gradient-to-r from-primary-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            <span>Fetch Analytics</span>
          </button>
        </div>

        {/* Chart Type Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400 mr-2">Chart Type:</span>
          {chartConfigs.map((config) => (
            <button
              key={config.type}
              onClick={() => setSelectedChart(config.type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedChart === config.type
                  ? 'bg-primary-500 text-white'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {config.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                <p className="text-gray-400">Loading analytics data...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center h-64"
            >
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 font-medium">Error loading analytics</p>
                <p className="text-gray-400 text-sm mt-2">{error}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Statistics Cards */}
              {activeSection === 'workflows' && workflowData && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Active</p>
                        <p className="text-xl font-bold text-white">{workflowData?.active_workflows?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                        <Square className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Inactive</p>
                        <p className="text-xl font-bold text-white">{workflowData?.inactive_workflows?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Pause className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Paused</p>
                        <p className="text-xl font-bold text-white">{workflowData?.paused_workflows?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Deleted</p>
                        <p className="text-xl font-bold text-white">{workflowData?.deleted_workflows?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total</p>
                        <p className="text-xl font-bold text-white">{workflowData?.total_workflows?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'triggers' && triggerData && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Active Triggers</p>
                        <p className="text-xl font-bold text-white">{triggerData?.active_triggers?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                        <Square className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Inactive Triggers</p>
                        <p className="text-xl font-bold text-white">{triggerData?.inactive_triggers?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Triggers</p>
                        <p className="text-xl font-bold text-white">{triggerData?.total_triggers?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {activeSection === 'workflows' ? 'Workflow' : activeSection === 'triggers' ? 'Trigger' : 'Event'} Distribution
                    </h3>
                    <p className="text-sm text-gray-400">
                      {activeSection === 'events' && eventAnalyticsData 
                        ? `Organization ${eventAnalyticsData.organization_id} - ${eventAnalyticsData.timeframe}`
                        : (workflowData?.scope === 'organization' || triggerData?.scope === 'organization') 
                          ? `Organization ${workflowData?.organization_id || triggerData?.organization_id}` 
                          : 'Global Analytics'
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {workflowData?.scope === 'global' || triggerData?.scope === 'global' ? (
                      <Globe className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Building className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>
                
                <div className="h-96">
                  {activeSection === 'workflows' 
                    ? renderWorkflowChart() 
                    : activeSection === 'triggers' 
                      ? renderTriggerChart() 
                      : renderEventAnalyticsChart()
                  }
                </div>
              </div>

              {/* Recent Workflows Table (only for workflows) */}
              {activeSection === 'workflows' && workflowData && workflowData.recent_workflows && workflowData.recent_workflows.length > 0 && (
                <div className="glass p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Recent Workflows</span>
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workflowData.recent_workflows.map((workflow, index) => (
                          <tr key={workflow.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-sm text-gray-300 font-mono">
                              {workflow.id.slice(-8)}...
                            </td>
                            <td className="py-3 px-4 text-sm text-white">
                              {workflow.name}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                workflow.is_active 
                                  ? 'bg-green-100/10 text-green-400 border border-green-500/20'
                                  : 'bg-gray-100/10 text-gray-400 border border-gray-500/20'
                              }`}>
                                {workflow.is_active ? (
                                  <><Play className="w-3 h-3 mr-1" /> Active</>
                                ) : (
                                  <><Square className="w-3 h-3 mr-1" /> Inactive</>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {workflow.created_at !== 'Unknown' 
                                ? new Date(workflow.created_at).toLocaleDateString()
                                : 'Unknown'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Event Analytics Table (only for events) */}
              {activeSection === 'events' && eventAnalyticsData && eventAnalyticsData.analytics && eventAnalyticsData.analytics.length > 0 && (
                <div className="glass p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Event Analytics Details</span>
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Event Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Source</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Total Events</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Unique Contacts</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">First Event</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Event</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventAnalyticsData.analytics.map((event, index) => (
                          <tr key={`${event.event_name}-${event.event_source}-${index}`} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-sm text-white font-medium">
                              {event.event_name}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/10 text-blue-400 border border-blue-500/20">
                                {event.event_source}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-300">
                              {event.total_events.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-300">
                              {event.unique_contacts.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {new Date(event.first_event).toLocaleDateString()} {new Date(event.first_event).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {new Date(event.last_event).toLocaleDateString()} {new Date(event.last_event).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}