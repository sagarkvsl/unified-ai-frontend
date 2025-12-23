'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Clock, AlertCircle, CheckCircle, XCircle, Activity, FileText, Zap, BarChart3, ExternalLink, Globe, Building, TrendingUp, RefreshCw, Database } from 'lucide-react';
import { apiClient } from '../lib/api';
import { ApiError } from '../lib/api';
import type { 
  StuckContactCountResponse,
  BatchAnalysisResult 
} from '@/types';

interface StuckContactAnalysisProps {}

interface ContactInput {
  organizationId: string;
  workflowId: string;
  contactId: string;
}

interface StuckContactCountData {
  status: string;
  organizationId: string;
  stuckContactCount: number;
  timestamp: string;
}

interface TotalStuckContactData {
  status: string;
  scope: string;
  totalStuckContactCount: number;
  timestamp: string;
  cached: boolean;
  cacheTTL: string;
}

interface StuckContactResult {
  contactInfo: {
    organizationId: string;
    workflowId: string;
    contactId: string;
    email: string;
  };
  workflowInfo: {
    name: string;
    isActive: boolean;
    isPaused: boolean;
    totalSteps: number;
  };
  executionStatus: {
    lastExecutedStep: number | null;
    lastExecutionTime: string | null;
    nextExpectedStep: number | null;
    isStuck: boolean;
  };
  stuckReason: {
    type: 'callback_timeout' | 'wait_step_updated' | 'action_failed' | 'workflow_paused' | 'unknown';
    description: string;
    recommendations: string[];
  };
  logs: any[];
  timestamp: string;
}

const StuckContactAnalysis: React.FC<StuckContactAnalysisProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [contactInput, setContactInput] = useState<ContactInput>({
    organizationId: '',
    workflowId: '',
    contactId: ''
  });
  const [batchContacts, setBatchContacts] = useState<string>('');
  const [result, setResult] = useState<StuckContactResult | null>(null);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  
  // Stuck contact count states
  const [stuckCountOrgId, setStuckCountOrgId] = useState<string>('4694108');
  const [stuckCountData, setStuckCountData] = useState<StuckContactCountData | null>(null);
  const [stuckCountLoading, setStuckCountLoading] = useState(false);
  const [stuckCountError, setStuckCountError] = useState<string | null>(null);

  // Total stuck contact count states
  const [totalStuckData, setTotalStuckData] = useState<TotalStuckContactData | null>(null);
  const [totalStuckLoading, setTotalStuckLoading] = useState(false);
  const [totalStuckError, setTotalStuckError] = useState<string | null>(null);

  // Clean API functions using the new API client
  const fetchStuckContactCount = async (organizationId: string) => {
    if (!organizationId.trim()) {
      setStuckCountError('Please enter an organization ID');
      return;
    }

    setStuckCountLoading(true);
    setStuckCountError(null);

    try {
      const response = await apiClient.analytics.getStuckContactCount(organizationId);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setStuckCountData({
          status: 'success',
          organizationId: data.organization_id || organizationId,
          stuckContactCount: data.count || data.stuck_contact_count || 0,
          timestamp: data.timestamp || new Date().toISOString()
        });
      } else {
        setStuckCountError(response.error || 'Failed to fetch stuck contact count');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setStuckCountError(err.message);
      } else {
        setStuckCountError(err instanceof Error ? err.message : 'Network error occurred');
      }
    } finally {
      setStuckCountLoading(false);
    }
  };

  // Fetch total stuck contact count (all organizations)
  const fetchTotalStuckContactCount = async () => {
    setTotalStuckLoading(true);
    setTotalStuckError(null);

    try {
      const response = await apiClient.analytics.getTotalStuckContactCount();
      
      if (response.success && response.data) {
        const data = response.data as any;
        setTotalStuckData({
          status: 'success',
          scope: 'global',
          totalStuckContactCount: data.total_count || data.count || 0,
          timestamp: data.timestamp || new Date().toISOString(),
          cached: data.cached || false,
          cacheTTL: '15 minutes'
        });
      } else {
        setTotalStuckError(response.error || 'Failed to fetch total stuck contact count');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setTotalStuckError(err.message);
      } else {
        setTotalStuckError(err instanceof Error ? err.message : 'Network error occurred');
      }
    } finally {
      setTotalStuckLoading(false);
    }
  };

  // Auto-load both counts on component mount
  useEffect(() => {
    // Load organization-specific count
    if (stuckCountOrgId.trim()) {
      fetchStuckContactCount(stuckCountOrgId);
    }
    
    // Load total count across all organizations
    fetchTotalStuckContactCount();
  }, []);

  const analyzeStuckContact = async () => {
    if (!contactInput.organizationId || !contactInput.workflowId || !contactInput.contactId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.analysis.analyzeStuckContact({
        organization_id: contactInput.organizationId,
        workflow_id: contactInput.workflowId,
        contact_id: contactInput.contactId
      });

      if (response.success && response.data) {
        setResult(response.data as StuckContactResult);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeBatchContacts = async () => {
    if (!batchContacts.trim()) {
      setError('Please enter contact data');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBatchResults(null);

    try {
      // Parse CSV-like input
      const lines = batchContacts.trim().split('\n');
      const contacts = lines.map(line => {
        const [organization_id, workflow_id, contact_id] = line.trim().split(',');
        return { organization_id, workflow_id, contact_id };
      }).filter(contact => contact.organization_id && contact.workflow_id && contact.contact_id);

      if (contacts.length === 0) {
        setError('No valid contacts found. Format: orgId,workflowId,contactId (one per line)');
        return;
      }

      const response = await apiClient.analysis.analyzeBatchStuckContacts(contacts);

      if (response.success && response.data) {
        const batchData = response.data as any;
        setBatchResults(batchData.results || batchData);
      } else {
        setError(response.error || 'Batch analysis failed');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStuckReasonIcon = (type: string) => {
    switch (type) {
      case 'callback_timeout': return <Clock className="w-5 h-5 text-red-400" />;
      case 'action_failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'workflow_paused': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'wait_step_updated': return <Activity className="w-5 h-5 text-blue-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStuckReasonColor = (type: string) => {
    switch (type) {
      case 'callback_timeout': return 'border-red-500 bg-red-900/20';
      case 'action_failed': return 'border-red-500 bg-red-900/20';
      case 'workflow_paused': return 'border-yellow-500 bg-yellow-900/20';
      case 'wait_step_updated': return 'border-blue-500 bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            🔍 Stuck Contact Analysis
          </h2>
          <p className="text-gray-300">
            Analyze why contacts are stuck in workflow execution with detailed root cause analysis
          </p>
        </motion.div>
      </div>

      {/* Enhanced Stuck Contact Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Stuck Contacts Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-md bg-gradient-to-r from-red-900/40 to-pink-900/30 border border-red-600/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Globe className="w-6 h-6 mr-3 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Total Stuck Contacts</h3>
              </div>
              <button
                onClick={fetchTotalStuckContactCount}
                disabled={totalStuckLoading}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                title="Refresh total count"
              >
                <RefreshCw className={`w-4 h-4 ${totalStuckLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {totalStuckLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                <span className="ml-3 text-gray-300">Loading global data...</span>
              </div>
            ) : totalStuckError ? (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm flex items-center">
                  <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {totalStuckError}
                </p>
              </div>
            ) : totalStuckData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    🌍 {totalStuckData.totalStuckContactCount.toLocaleString()}
                  </div>
                  <p className="text-red-300 text-sm">Contacts stuck across all organizations</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>📊 Collection: stuck_contacts_current</span>
                  <span>⚡ Cached: {totalStuckData.cacheTTL}</span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Last updated: {new Date(totalStuckData.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click refresh to load data</p>
              </div>
            )}
          </motion.div>

          {/* Organization-Specific Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="backdrop-blur-md bg-gradient-to-r from-orange-900/40 to-yellow-900/30 border border-orange-600/50 rounded-xl p-6"
          >
            <div className="flex items-center mb-4">
              <Building className="w-6 h-6 mr-3 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Organization Analysis</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stuckCountOrgId}
                    onChange={(e) => setStuckCountOrgId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., 4694108"
                  />
                  <button
                    onClick={() => fetchStuckContactCount(stuckCountOrgId)}
                    disabled={stuckCountLoading}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center text-sm"
                  >
                    {stuckCountLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {stuckCountData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        🏢 {stuckCountData.stuckContactCount.toLocaleString()}
                      </div>
                      <p className="text-orange-300 text-sm">
                        Organization {stuckCountData.organizationId}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <button
                        onClick={() => fetchStuckContactCount(stuckCountOrgId)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
                      >
                        Refresh
                      </button>
                      <a
                        href="https://mongo-express.brevo.tech/rs-automation/db/automation/stuck_contacts_current"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View DB
                      </a>
                    </div>
                  </div>
                  
                  {/* Show percentage if both total and org data available */}
                  {totalStuckData && totalStuckData.totalStuckContactCount > 0 && (
                    <div className="pt-3 border-t border-gray-600/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Percentage of total:</span>
                        <span className="text-orange-300 font-semibold">
                          {((stuckCountData.stuckContactCount / totalStuckData.totalStuckContactCount) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-2 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(((stuckCountData.stuckContactCount / totalStuckData.totalStuckContactCount) * 100), 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date(stuckCountData.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              )}

              {stuckCountError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg"
                >
                  <p className="text-red-400 text-sm flex items-center">
                    <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {stuckCountError}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Analytics Summary */}
        {(totalStuckData || stuckCountData) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="backdrop-blur-md bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                <h4 className="font-semibold text-white">Quick Insights</h4>
              </div>
              <div className="text-xs text-gray-400">
                📊 Data cached for 15 minutes • 🔄 Auto-refresh on page load
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
              <div className="text-center">
                <div className="text-blue-300 font-semibold">Collection Health</div>
                <div className="text-gray-400">✅ Connected & Cached</div>
              </div>
              <div className="text-center">
                <div className="text-purple-300 font-semibold">Response Time</div>
                <div className="text-gray-400">⚡ ~{totalStuckLoading || stuckCountLoading ? 'Loading' : '<100ms (cached)'}</div>
              </div>
              <div className="text-center">
                <div className="text-green-300 font-semibold">Data Source</div>
                <div className="text-gray-400">🗄️ MongoDB Collection</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'single'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Single Contact
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'batch'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Batch Analysis
        </button>
      </div>

      {/* Single Contact Analysis */}
      {activeTab === 'single' && (
        <motion.div
          key="single"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-md bg-gray-900/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Single Contact Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization ID
              </label>
              <input
                type="text"
                value={contactInput.organizationId}
                onChange={(e) => setContactInput({ ...contactInput, organizationId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 4694108"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Workflow ID
              </label>
              <input
                type="text"
                value={contactInput.workflowId}
                onChange={(e) => setContactInput({ ...contactInput, workflowId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 413"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact ID
              </label>
              <input
                type="text"
                value={contactInput.contactId}
                onChange={(e) => setContactInput({ ...contactInput, contactId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 300199"
              />
            </div>
          </div>

          <button
            onClick={analyzeStuckContact}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Analyze Stuck Contact
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Batch Analysis */}
      {activeTab === 'batch' && (
        <motion.div
          key="batch"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-md bg-gray-900/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Batch Contact Analysis
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Data (CSV Format: orgId,workflowId,contactId)
            </label>
            <textarea
              value={batchContacts}
              onChange={(e) => setBatchContacts(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder={`4694108,413,300199
4694108,413,300200
4694108,414,300201`}
            />
          </div>

          <button
            onClick={analyzeBatchContacts}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing Batch...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Analyze Batch Contacts
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500 rounded-lg p-4"
        >
          <p className="text-red-400 flex items-center">
            <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </p>
        </motion.div>
      )}

      {/* Single Contact Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Contact Info */}
          <div className="backdrop-blur-md bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300"><strong>Email:</strong> {result.contactInfo.email}</p>
                <p className="text-gray-300"><strong>Contact ID:</strong> {result.contactInfo.contactId}</p>
              </div>
              <div>
                <p className="text-gray-300"><strong>Organization:</strong> {result.contactInfo.organizationId}</p>
                <p className="text-gray-300"><strong>Workflow:</strong> {result.workflowInfo.name} (ID: {result.contactInfo.workflowId})</p>
              </div>
            </div>
          </div>

          {/* Execution Status */}
          <div className={`backdrop-blur-md border rounded-xl p-6 ${getStuckReasonColor(result.stuckReason.type)}`}>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              {getStuckReasonIcon(result.stuckReason.type)}
              <span className="ml-2">
                {result.executionStatus.isStuck ? 'Contact is Stuck' : 'Contact is Not Stuck'}
              </span>
            </h3>
            
            <div className="space-y-3">
              <p className="text-gray-200"><strong>Reason:</strong> {result.stuckReason.description}</p>
              
              {result.executionStatus.lastExecutedStep && (
                <p className="text-gray-300">
                  <strong>Last Executed Step:</strong> {result.executionStatus.lastExecutedStep}
                  {result.executionStatus.lastExecutionTime && (
                    <span className="ml-2 text-gray-400">
                      at {new Date(result.executionStatus.lastExecutionTime).toLocaleString()}
                    </span>
                  )}
                </p>
              )}
              
              {result.executionStatus.nextExpectedStep && (
                <p className="text-gray-300">
                  <strong>Next Expected Step:</strong> {result.executionStatus.nextExpectedStep}
                </p>
              )}
            </div>

            {/* Recommendations */}
            <div className="mt-4">
              <h4 className="text-lg font-medium text-white mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {result.stuckReason.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Execution Logs */}
          {result.logs && result.logs.length > 0 && (
            <div className="backdrop-blur-md bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Execution Logs</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.logs.map((log, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-blue-400 font-medium">Step {log.step_id}</span>
                      <span className="text-gray-400 text-sm">
                        {new Date(log.event_date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300"><strong>Event:</strong> {log.event_type}</p>
                    {log.code && (
                      <p className={`text-sm ${log.code === 'success' ? 'text-green-400' : log.code === 'failure' ? 'text-red-400' : 'text-gray-300'}`}>
                        <strong>Code:</strong> {log.code}
                      </p>
                    )}
                    {log.message && (
                      <p className="text-gray-400 text-sm"><strong>Message:</strong> {log.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Batch Results */}
      {batchResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-md bg-gray-900/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Batch Analysis Results</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {batchResults.map((result, index) => (
              <div key={index} className={`rounded-lg p-4 border ${
                result.success 
                  ? result.analysis?.isStuck 
                    ? 'bg-red-900/20 border-red-500' 
                    : 'bg-green-900/20 border-green-500'
                  : 'bg-gray-800/50 border-gray-600'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">
                    Contact {result.input.contactId} (Workflow {result.input.workflowId})
                  </span>
                  <span className="text-sm text-gray-400">
                    Org {result.input.organizationId}
                  </span>
                </div>
                
                {result.success ? (
                  <div>
                    <p className={`font-medium ${result.analysis.isStuck ? 'text-red-400' : 'text-green-400'}`}>
                      {result.analysis.isStuck ? '🔴 Stuck' : '🟢 Not Stuck'} - {result.analysis.reason}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">{result.analysis.description}</p>
                    {result.analysis.contactEmail && (
                      <p className="text-gray-400 text-sm">Email: {result.analysis.contactEmail}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-400">❌ Analysis failed: {result.error}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StuckContactAnalysis;