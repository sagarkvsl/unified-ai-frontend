'use client';

import { useState, useEffect } from 'react';
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
  Hash
} from 'lucide-react';

interface WorkflowData {
  scope: 'organization' | 'global';
  organizationId?: string;
  activeWorkflows: number;
  inactiveWorkflows: number;
  pausedWorkflows: number;
  deletedWorkflows: number;
  totalWorkflows: number;
  workflowsByType: Array<{ type: string; count: number }>;
  recentWorkflows: Array<{ id: string; name: string; created_at: string; is_active: boolean }>;
}

interface TriggerData {
  scope: 'organization' | 'global';
  organizationId?: string;
  activeTriggers: number;
  inactiveTriggers: number;
  totalTriggers: number;
  triggersByEvent: Array<{ event_name: string; count: number; active_count: number }>;
  triggersByType: Array<{ type: string; count: number }>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<'bar' | 'pie' | 'line' | 'doughnut'>('bar');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'workflows' | 'triggers'>('workflows');

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

  const handleFetchData = () => {
    const orgId = organizationId.trim() || undefined;
    if (activeSection === 'workflows') {
      fetchWorkflowAnalytics(orgId);
    } else {
      fetchTriggerAnalytics(orgId);
    }
  };

  useEffect(() => {
    // Load global workflow data by default
    fetchWorkflowAnalytics();
    fetchTriggerAnalytics();
  }, []);

  const downloadCSV = () => {
    if (!workflowData && !triggerData) return;
    
    const data = activeSection === 'workflows' ? workflowData : triggerData;
    if (!data) return;
    
    let csvContent = '';
    
    if (activeSection === 'workflows' && workflowData) {
      csvContent = 'Type,Count\n';
      workflowData.workflowsByType.forEach(item => {
        csvContent += `${item.type},${item.count}\n`;
      });
    } else if (activeSection === 'triggers' && triggerData) {
      csvContent = 'Event Name,Total Count,Active Count\n';
      triggerData.triggersByEvent.forEach(item => {
        csvContent += `${item.event_name},${item.count},${item.active_count}\n`;
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

    const chartData = workflowData.workflowsByType.map(item => ({
      ...item,
      fill: WORKFLOW_STATUS_COLORS[item.type as keyof typeof WORKFLOW_STATUS_COLORS] || CHART_COLORS[0]
    }));

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
    if (!triggerData) return null;

    const chartData = triggerData.triggersByEvent.slice(0, 15); // Top 15 events

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

  return (
    <div className="h-full glass rounded-2xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span>Workflow & Trigger Analytics</span>
            </h2>
            <p className="text-gray-400 mt-1">
              Comprehensive analysis of workflow configurations and trigger distributions
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadCSV}
              disabled={!workflowData && !triggerData}
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
                        <p className="text-xl font-bold text-white">{workflowData.activeWorkflows.toLocaleString()}</p>
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
                        <p className="text-xl font-bold text-white">{workflowData.inactiveWorkflows.toLocaleString()}</p>
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
                        <p className="text-xl font-bold text-white">{workflowData.pausedWorkflows.toLocaleString()}</p>
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
                        <p className="text-xl font-bold text-white">{workflowData.deletedWorkflows.toLocaleString()}</p>
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
                        <p className="text-xl font-bold text-white">{workflowData.totalWorkflows.toLocaleString()}</p>
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
                        <p className="text-xl font-bold text-white">{triggerData.activeTriggers.toLocaleString()}</p>
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
                        <p className="text-xl font-bold text-white">{triggerData.inactiveTriggers.toLocaleString()}</p>
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
                        <p className="text-xl font-bold text-white">{triggerData.totalTriggers.toLocaleString()}</p>
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
                      {activeSection === 'workflows' ? 'Workflow' : 'Trigger'} Distribution
                    </h3>
                    <p className="text-sm text-gray-400">
                      {workflowData?.scope === 'organization' || triggerData?.scope === 'organization' 
                        ? `Organization ${workflowData?.organizationId || triggerData?.organizationId}` 
                        : 'Global Analytics'}
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
                  {activeSection === 'workflows' ? renderWorkflowChart() : renderTriggerChart()}
                </div>
              </div>

              {/* Recent Workflows Table (only for workflows) */}
              {activeSection === 'workflows' && workflowData && workflowData.recentWorkflows.length > 0 && (
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
                        {workflowData.recentWorkflows.map((workflow, index) => (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}