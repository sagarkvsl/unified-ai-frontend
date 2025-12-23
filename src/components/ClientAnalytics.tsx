'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  Calendar,
  Target,
  Zap,
  Database,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  UserCheck,
  GitBranch
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from 'recharts';

interface ClientAnalyticsProps {
  // Props if needed
}

interface AnalyticsData {
  organizationId: string;
  timeframe: string;
  workflowAnalytics: {
    activeWorkflows: number;
    inactiveWorkflows: number;
    pausedWorkflows: number;
    deletedWorkflows: number;
    totalWorkflows: number;
    workflowsByType: Array<{ type: string; count: number }>;
    recentWorkflows: Array<{ id: number; name: string; created_at: string; is_active: boolean }>;
  };
  eventAnalytics: {
    totalEvents: number;
    dailyEventCounts: Array<{ date: string; count: number; unique_contacts: number }>;
    eventTypeDistribution: Array<{ event_name: string; count: number; percentage: number }>;
    sourceDistribution: Array<{ source: string; count: number; percentage: number }>;
    timeRange: { start: string; end: string };
  };
  executionStatistics: {
    totalContactEntries: number;
    workflowExecutionCounts: Array<{ workflow_id: number; workflow_name: string; contact_entries: number; completion_rate: number }>;
    dailyExecutionTrends: Array<{ date: string; started: number; completed: number; failed: number }>;
    topPerformingWorkflows: Array<{ workflow_id: number; workflow_name: string; success_rate: number; total_executions: number }>;
    topActionTypes: Array<{ action_type: string; execution_count: number; percentage: number; workflows_using: number }>;
  };
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}> = ({ title, value, subtitle, icon, gradient, trend, trendValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-xl p-4"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-xs ${
          trend === 'up' ? 'text-green-400' : 
          trend === 'down' ? 'text-red-400' : 'text-gray-400'
        }`}>
          {trend === 'up' ? <ArrowUp className="w-3 h-3" /> :
           trend === 'down' ? <ArrowDown className="w-3 h-3" /> : 
           <Minus className="w-3 h-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400">{title}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </motion.div>
);

const ClientAnalytics: React.FC<ClientAnalyticsProps> = () => {
  const [organizationId, setOrganizationId] = useState<string>('');
  const [timeframeDays, setTimeframeDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'workflows' | 'events' | 'execution'>('overview');

  const handleFetchAnalytics = async () => {
    if (!organizationId.trim()) {
      setError('Please enter an Organization ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/client-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: organizationId.trim(),
          timeframeDays: timeframeDays
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.analytics);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverview = () => {
    if (!analyticsData) return null;

    const { workflowAnalytics, eventAnalytics, executionStatistics } = analyticsData;
    
    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Workflows"
            value={workflowAnalytics.totalWorkflows}
            subtitle={`${workflowAnalytics.activeWorkflows} active`}
            icon={<Target className="w-5 h-5 text-white" />}
            gradient="from-blue-500 to-cyan-500"
            trend="neutral"
          />
          <StatCard
            title="Events (7 days)"
            value={eventAnalytics.totalEvents.toLocaleString()}
            subtitle="Total events received"
            icon={<Zap className="w-5 h-5 text-white" />}
            gradient="from-green-500 to-emerald-500"
            trend="neutral"
          />
          <StatCard
            title="Contact Entries"
            value={executionStatistics.totalContactEntries.toLocaleString()}
            subtitle={`${timeframeDays} day${timeframeDays !== 1 ? 's' : ''}`}
            icon={<Users className="w-5 h-5 text-white" />}
            gradient="from-purple-500 to-pink-500"
            trend="neutral"
          />
          <StatCard
            title="Active Workflows"
            value={workflowAnalytics.activeWorkflows}
            subtitle={`${((workflowAnalytics.activeWorkflows / Math.max(workflowAnalytics.totalWorkflows, 1)) * 100).toFixed(1)}% active`}
            icon={<Activity className="w-5 h-5 text-white" />}
            gradient="from-orange-500 to-red-500"
            trend="up"
            trendValue={`${workflowAnalytics.activeWorkflows}/${workflowAnalytics.totalWorkflows}`}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workflow Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              <span>Workflow Status Distribution</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={workflowAnalytics.workflowsByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, value }: any) => `${name}: ${value}`}
                  >
                    {workflowAnalytics.workflowsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Daily Event Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Daily Event Trends (7 days)</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventAnalytics.dailyEventCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderWorkflows = () => {
    if (!analyticsData?.workflowAnalytics) return null;

    const { workflowAnalytics } = analyticsData;
    
    return (
      <div className="space-y-6">
        {/* Workflow Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Workflows"
            value={workflowAnalytics.activeWorkflows}
            icon={<CheckCircle className="w-5 h-5 text-white" />}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Inactive Workflows"
            value={workflowAnalytics.inactiveWorkflows}
            icon={<Clock className="w-5 h-5 text-white" />}
            gradient="from-gray-500 to-slate-500"
          />
          <StatCard
            title="Paused Workflows"
            value={workflowAnalytics.pausedWorkflows}
            icon={<Minus className="w-5 h-5 text-white" />}
            gradient="from-yellow-500 to-orange-500"
          />
          <StatCard
            title="Deleted Workflows"
            value={workflowAnalytics.deletedWorkflows}
            icon={<AlertCircle className="w-5 h-5 text-white" />}
            gradient="from-red-500 to-pink-500"
          />
        </div>

        {/* Workflow Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Workflow Status Overview</span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workflowAnalytics.workflowsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Workflows Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Workflows</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-gray-400">ID</th>
                  <th className="text-left py-3 px-2 text-gray-400">Name</th>
                  <th className="text-left py-3 px-2 text-gray-400">Status</th>
                  <th className="text-left py-3 px-2 text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {workflowAnalytics.recentWorkflows.map((workflow, index) => (
                  <tr key={workflow.id} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                    <td className="py-3 px-2 text-white font-mono">{workflow.id}</td>
                    <td className="py-3 px-2 text-white max-w-xs truncate">{workflow.name}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.is_active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400 text-xs">
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
        </motion.div>
      </div>
    );
  };

  const renderEvents = () => {
    if (!analyticsData?.eventAnalytics) return null;

    const { eventAnalytics } = analyticsData;
    
    return (
      <div className="space-y-6">
        {/* Event Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Events (7 days)"
            value={eventAnalytics.totalEvents.toLocaleString()}
            subtitle="All event types"
            icon={<Zap className="w-5 h-5 text-white" />}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Event Types"
            value={eventAnalytics.eventTypeDistribution.length}
            subtitle="Unique event names"
            icon={<Database className="w-5 h-5 text-white" />}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Event Sources"
            value={eventAnalytics.sourceDistribution.length}
            subtitle="Unique sources"
            icon={<Target className="w-5 h-5 text-white" />}
            gradient="from-green-500 to-emerald-500"
          />
        </div>

        {/* Daily Event Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Daily Event Volume (Last 7 Days)</span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventAnalytics.dailyEventCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unique_contacts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Event Type Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Event Type Distribution</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {eventAnalytics.eventTypeDistribution.slice(0, 10).map((event, index) => (
                <div key={event.event_name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1 mr-2">{event.event_name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-400"
                        style={{ width: `${event.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">{event.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Source Distribution</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {eventAnalytics.sourceDistribution.slice(0, 10).map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1 mr-2">{source.source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-400"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">{source.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderExecution = () => {
    if (!analyticsData?.executionStatistics) return null;

    const { executionStatistics } = analyticsData;
    
    return (
      <div className="space-y-6">
        {/* Execution Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Contact Entries"
            value={executionStatistics.totalContactEntries.toLocaleString()}
            subtitle={`${timeframeDays} day${timeframeDays !== 1 ? 's' : ''}`}
            icon={<Users className="w-5 h-5 text-white" />}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Active Workflows"
            value={executionStatistics.workflowExecutionCounts.length}
            subtitle="With executions"
            icon={<Activity className="w-5 h-5 text-white" />}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Top Performer"
            value={
              executionStatistics.topPerformingWorkflows[0]?.success_rate 
                ? `${executionStatistics.topPerformingWorkflows[0].success_rate.toFixed(1)}%`
                : 'N/A'
            }
            subtitle="Success rate"
            icon={<Target className="w-5 h-5 text-white" />}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Workflow Execution Counts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Workflow Execution Counts ({timeframeDays} days)</span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={executionStatistics.workflowExecutionCounts.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="workflow_id" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Workflow ID', position: 'insideBottom', offset: -5 }}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value, name) => [value, name === 'contact_entries' ? 'Contact Entries' : name]}
                />
                <Bar dataKey="contact_entries" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Daily Execution Trends */}
        {executionStatistics.dailyExecutionTrends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Daily Execution Trends</span>
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={executionStatistics.dailyExecutionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="started" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Started"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="failed" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Failed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Top Action Types */}
        {executionStatistics.topActionTypes && executionStatistics.topActionTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Top Action Types ({timeframeDays} days)</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Action Types Bar Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executionStatistics.topActionTypes.slice(0, 10)} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="action_type" 
                      stroke="#9CA3AF" 
                      fontSize={10}
                      width={100}
                      tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value, name) => [
                        name === 'execution_count' ? `${value} executions` : value,
                        name === 'execution_count' ? 'Total Executions' : name
                      ]}
                    />
                    <Bar dataKey="execution_count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Action Types Table */}
              <div className="overflow-y-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-dark-800/80 backdrop-blur">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-2 text-gray-400">Action Type</th>
                      <th className="text-left py-2 px-2 text-gray-400">Executions</th>
                      <th className="text-left py-2 px-2 text-gray-400">%</th>
                      <th className="text-left py-2 px-2 text-gray-400">Workflows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionStatistics.topActionTypes.slice(0, 15).map((action, index) => (
                      <tr key={action.action_type} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                        <td className="py-2 px-2 text-white font-mono text-xs max-w-xs">
                          <div className="truncate" title={action.action_type}>
                            {action.action_type}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-gray-300">{action.execution_count.toLocaleString()}</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="h-1.5 rounded-full bg-yellow-400"
                                style={{ width: `${Math.min(action.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-300">{action.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-gray-300">{action.workflows_using}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              <span className="inline-flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Action types represent different workflow actions like send_email, wait_for, conditional_split, etc.</span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Top Performing Workflows Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Performing Workflows</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-gray-400">Workflow ID</th>
                  <th className="text-left py-3 px-2 text-gray-400">Name</th>
                  <th className="text-left py-3 px-2 text-gray-400">Success Rate</th>
                  <th className="text-left py-3 px-2 text-gray-400">Total Executions</th>
                </tr>
              </thead>
              <tbody>
                {executionStatistics.topPerformingWorkflows.slice(0, 10).map((workflow, index) => (
                  <tr key={workflow.workflow_id} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                    <td className="py-3 px-2 text-white font-mono">{workflow.workflow_id}</td>
                    <td className="py-3 px-2 text-white max-w-xs truncate">
                      {workflow.workflow_name || `Workflow ${workflow.workflow_id}`}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-400"
                            style={{ width: `${workflow.success_rate}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">{workflow.success_rate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-300">{workflow.total_executions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-xl p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-2">Client Analytics</h1>
            <p className="text-gray-400 text-sm">
              Comprehensive analysis of workflows, events, and execution statistics for a specific organization
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Organization ID Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Organization ID"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="bg-dark-800/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-40"
              />
            </div>
            
            {/* Days Selector */}
            <div className="relative">
              <select
                value={timeframeDays}
                onChange={(e) => setTimeframeDays(Number(e.target.value))}
                className="bg-dark-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none w-full sm:w-32"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Fetch Button */}
            <motion.button
              onClick={handleFetchAnalytics}
              disabled={isLoading || !organizationId.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Fetching...' : 'Fetch Analytics'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-red-500/30 bg-red-500/5 rounded-xl p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-300">{error}</span>
        </motion.div>
      )}

      {/* Content */}
      {analyticsData && !isLoading && (
        <>
          {/* View Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-1 flex flex-wrap gap-1"
          >
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'workflows', label: 'Workflows', icon: <Target className="w-4 h-4" /> },
              { id: 'events', label: 'Events', icon: <Zap className="w-4 h-4" /> },
              { id: 'execution', label: 'Execution Stats', icon: <Activity className="w-4 h-4" /> },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {view.icon}
                <span>{view.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Analytics Content */}
          <AnimatePresence mode="wait">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'workflows' && renderWorkflows()}
            {activeView === 'events' && renderEvents()}
            {activeView === 'execution' && renderExecution()}
          </AnimatePresence>
        </>
      )}

      {/* No Data State */}
      {!analyticsData && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-12 text-center"
        >
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-gray-400 mb-6">
            Enter an Organization ID and click "Fetch Analytics" to view comprehensive client analytics including 
            workflow statistics, event trends, and execution performance.
          </p>
          <div className="bg-dark-800/50 rounded-lg p-4 text-left space-y-2 text-sm text-gray-300">
            <p><strong>• Workflow Analytics:</strong> Active/inactive/paused workflow counts and recent workflows</p>
            <p><strong>• Event Analytics:</strong> Daily event trends and type distribution (7-day window)</p>
            <p><strong>• Execution Statistics:</strong> Contact entry counts and performance metrics (up to 30 days)</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ClientAnalytics;