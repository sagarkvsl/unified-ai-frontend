'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Clock,
  Database,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Users,
  Zap,
  GitBranch,
  ChevronRight,
  ChevronDown,
  Eye,
  Calendar
} from 'lucide-react';

interface AutomationEngineLogsProps {
  organizationId?: string;
  onBack?: () => void;
}

interface AutomationLogEntry {
  datetime?: string;
  time?: string;
  organization_id: number;
  contact_id?: string;
  email_id?: string;
  email?: string;
  workflow_id?: number;
  step_id?: number;
  event_name?: string;
  event_type?: string;
  source?: string;
  destination?: string;
  event_matched?: number;
  status_code?: number;
  internal_action_id?: number;
  prev_step_id?: number;
  Email?: string;
  [key: string]: any;
}

interface AutomationEngineLogsData {
  organizationId: string;
  contactId: string;
  workflowId: string;
  timePeriod: string;
  timeframeDays: number;
  limit: number;
  generatedAt: string;
  processingTimeMs: number;
  logs: {
    summary: {
      organizationId: number;
      contactId: string;
      timeframeDays: number;
      totalLogEntries: number;
    };
    pipeline: {
      unified_events_out_router: AutomationLogEntry[];
      workflow_unified_filter: AutomationLogEntry[];
      workflow_match_engine: AutomationLogEntry[];
      workflow_action_processor: AutomationLogEntry[];
      unified_action_builder: AutomationLogEntry[];
      workflow_callback_consumer: AutomationLogEntry[];
    };
  };
  dataSource: {
    server: string;
    tables: string[];
    retentionPolicy: string;
    actualTimeframe: string;
  };
}

const PIPELINE_STAGES = [
  {
    key: 'unified_events_out_router',
    name: 'Event Router',
    description: 'Raw events from various sources',
    icon: <Zap className="w-4 h-4" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    key: 'workflow_unified_filter',
    name: 'Event Filter', 
    description: 'Filters events for workflow processing',
    icon: <Filter className="w-4 h-4" />,
    color: 'from-green-500 to-green-600'
  },
  {
    key: 'workflow_match_engine',
    name: 'Match Engine',
    description: 'Matches events to workflow triggers',
    icon: <Search className="w-4 h-4" />,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    key: 'workflow_action_processor',
    name: 'Action Processor',
    description: 'Processes workflow actions and steps',
    icon: <Activity className="w-4 h-4" />,
    color: 'from-purple-500 to-purple-600'
  },
  {
    key: 'unified_action_builder',
    name: 'Action Builder',
    description: 'Builds concrete actions for execution',
    icon: <GitBranch className="w-4 h-4" />,
    color: 'from-pink-500 to-pink-600'
  },
  {
    key: 'workflow_callback_consumer',
    name: 'Callback Consumer',
    description: 'Handles action callbacks and results',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'from-indigo-500 to-indigo-600'
  }
];

const AutomationEngineLogs: React.FC<AutomationEngineLogsProps> = ({ 
  organizationId: propOrganizationId, 
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logsData, setLogsData] = useState<AutomationEngineLogsData | null>(null);
  const [organizationId, setOrganizationId] = useState(propOrganizationId || '');
  const [contactId, setContactId] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [limit, setLimit] = useState('50');
  const [timePeriod, setTimePeriod] = useState('7d');
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const fetchAutomationLogs = async () => {
    if (!organizationId) {
      setError('Organization ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        organizationId: organizationId.trim(),
        ...(contactId.trim() && { contactId: contactId.trim() }),
        ...(workflowId.trim() && { workflowId: workflowId.trim() }),
        timePeriod: timePeriod,
        limit: parseInt(limit) || 50
      };

      const response = await fetch('/api/automation-engine-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response Text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      if (data.success) {
        setLogsData(data.data);
        // Auto-expand stages that have data
        const stagesWithData = new Set<string>();
        Object.entries(data.data.logs.pipeline).forEach(([stage, entries]) => {
          if (Array.isArray(entries) && entries.length > 0) {
            stagesWithData.add(stage);
          }
        });
        setExpandedStages(stagesWithData);
      } else {
        setError(data.error || 'Failed to fetch automation logs');
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStageExpansion = (stageKey: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageKey)) {
      newExpanded.delete(stageKey);
    } else {
      newExpanded.add(stageKey);
    }
    setExpandedStages(newExpanded);
  };

  const formatTimestamp = (timestamp: string | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getStageEntries = (stageKey: string): AutomationLogEntry[] => {
    if (!logsData) return [];
    return logsData.logs.pipeline[stageKey as keyof typeof logsData.logs.pipeline] || [];
  };

  const renderLogEntry = (entry: AutomationLogEntry, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-lg p-3 mb-2 text-xs"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">
              {formatTimestamp(entry.datetime || entry.time)}
            </span>
          </div>
          {entry.contact_id && (
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-green-400" />
              <span className="text-gray-400">Contact: {entry.contact_id}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          {entry.workflow_id && (
            <div className="text-purple-400">Workflow: {entry.workflow_id}</div>
          )}
          {entry.step_id !== undefined && (
            <div className="text-yellow-400">Step: {entry.step_id}</div>
          )}
          {entry.event_name && (
            <div className="text-cyan-400">Event: {entry.event_name}</div>
          )}
          {entry.event_type && (
            <div className="text-orange-400">Type: {entry.event_type}</div>
          )}
        </div>

        <div className="space-y-1">
          {entry.status_code !== undefined && (
            <div className={`${entry.status_code === 0 || entry.status_code === 204 ? 'text-green-400' : 'text-red-400'}`}>
              Status: {entry.status_code}
            </div>
          )}
          {entry.event_matched !== undefined && (
            <div className={`${entry.event_matched ? 'text-green-400' : 'text-gray-400'}`}>
              Matched: {entry.event_matched ? 'Yes' : 'No'}
            </div>
          )}
          {(entry.email_id || entry.email || entry.Email) && (
            <div className="text-blue-300 truncate">
              {entry.email_id || entry.email || entry.Email}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderPipelineStage = (stage: typeof PIPELINE_STAGES[0]) => {
    const entries = getStageEntries(stage.key);
    const isExpanded = expandedStages.has(stage.key);
    const hasData = entries.length > 0;

    return (
      <motion.div
        key={stage.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 mb-4"
      >
        {/* Stage Header */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleStageExpansion(stage.key)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${stage.color} rounded-lg flex items-center justify-center`}>
              {stage.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{stage.name}</h3>
              <p className="text-sm text-gray-400">{stage.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm px-3 py-1 rounded-full ${
              hasData ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Stage Content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            {entries.length > 0 ? (
              <div className="space-y-2">
                {entries.slice(0, 10).map((entry, index) => renderLogEntry(entry, index))}
                {entries.length > 10 && (
                  <div className="text-center text-sm text-gray-400 mt-2">
                    ... and {entries.length - 10} more entries
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No log entries found for this stage</p>
                <p className="text-xs mt-1">This is normal if no events reached this stage</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              Automation Engine Logs
            </h1>
          </div>
          <p className="text-gray-300">
            Trace contact flow through the automation pipeline across microservices with custom time periods
          </p>
        </div>

        {/* Controls */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="e.g., 4694108"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact ID (Optional)
              </label>
              <input
                type="text"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                placeholder="e.g., 300224"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Workflow ID (Optional)
              </label>
              <input
                type="text"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                placeholder="e.g., 214"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Period
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2h">Last 2 Hours</option>
                <option value="6h">Last 6 Hours</option>
                <option value="12h">Last 12 Hours</option>
                <option value="1d">Last 1 Day</option>
                <option value="2d">Last 2 Days</option>
                <option value="3d">Last 3 Days</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Limit (Custom)
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="e.g., 50"
                min="1"
                max="1000"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAutomationLogs}
                disabled={isLoading || !organizationId.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Fetch Logs</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {!organizationId.trim() && (
            <div className="text-sm text-amber-400 mb-2">
              Please enter an Organization ID to fetch logs
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-1">Error</h3>
                <p className="text-gray-300">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {logsData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="glass rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Total Entries</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {logsData.logs.summary.totalLogEntries}
                </div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Processing Time</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {(logsData.processingTimeMs / 1000).toFixed(1)}s
                </div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Timeframe</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {logsData.dataSource.actualTimeframe || `${logsData.logs.summary.timeframeDays} days`}
                </div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-gray-400">Active Stages</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {Object.values(logsData.logs.pipeline).filter(entries => entries.length > 0).length}/6
                </div>
              </div>
            </div>

            {/* Pipeline Visualization */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>Automation Pipeline Flow</span>
              </h2>
              
              {PIPELINE_STAGES.map((stage, index) => (
                <div key={stage.key} className="relative">
                  {renderPipelineStage(stage)}
                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className="flex justify-center mb-2">
                      <ArrowRight className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Data Source Info */}
            <div className="glass rounded-xl p-4 text-sm text-gray-400">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong className="text-white">Data Source:</strong> {logsData.dataSource.server}
                </div>
                <div>
                  <strong className="text-white">Tables:</strong> {logsData.dataSource.tables.length} microservices
                </div>
                <div>
                  <strong className="text-white">Retention:</strong> {logsData.dataSource.retentionPolicy}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AutomationEngineLogs;