/**
 * TypeScript type definitions for Unified AI Frontend
 * Shared interfaces and types for API responses and components
 */

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Stuck Contact Analysis Types
export interface StuckContactRequest {
  organization_id: string;
  workflow_id: string;
  contact_id: string;
}

export interface BatchStuckContactRequest {
  contacts: StuckContactRequest[];
}

export interface StuckReason {
  primary_reason: string;
  details: string;
  recommendations: string[];
}

export interface ContactInfo {
  organization_id: string;
  workflow_id: string;
  contact_id: string;
  email?: string;
}

export interface WorkflowInfo {
  name: string;
  is_active: boolean;
  is_paused: boolean;
  total_steps: number;
}

export interface ExecutionStatus {
  last_executed_step?: string;
  last_execution_time?: string;
  next_expected_step?: string;
  is_stuck: boolean;
}

export interface StuckContactResult {
  contact_info: ContactInfo;
  workflow_info: WorkflowInfo;
  execution_status: ExecutionStatus;
  stuck_reason: StuckReason;
}

// Analytics Types
export interface StuckContactCountResponse {
  organization_id?: string;
  count: number;
  stuck_contact_count?: number;
  timestamp?: string;
}

export interface TotalStuckContactCountResponse {
  total_count: number;
  timestamp: string;
}

// Workflow Query Types (for new AI endpoint)
export interface WorkflowQueryRequest {
  message: string;
  conversation_id?: string;
  user_id?: string;
}

export interface WorkflowQueryResponse {
  response_type: 'conversational' | 'tool_analysis' | 'analysis_only';
  message?: string;
  follow_up_suggestions?: string[];
  tool_name?: string;
  parameters?: Record<string, any>;
  analysis?: string;
  result?: any;
  conversation_id: string;
}

// Component State Types
export interface StuckCountData {
  status: 'loading' | 'success' | 'error';
  organizationId?: string;
  stuckContactCount?: number;
  timestamp?: string;
}

export interface AnalysisResult {
  status: 'success' | 'error';
  data?: StuckContactResult;
  error?: string;
  timestamp: string;
}

export interface BatchAnalysisResult {
  results: Array<StuckContactResult | { error: string }>;
  total_processed: number;
}

// Event Analytics Types
export interface EventAnalyticsData {
  event_name: string;
  event_source: string;
  total_events: number;
  unique_contacts: number;
  first_event: number;
  last_event: number;
}

export interface EventAnalyticsResult {
  success: boolean;
  organization_id: number;
  timeframe: string;
  analytics: EventAnalyticsData[];
  total_event_types: number;
}

export interface AIEventAnalyticsResponse {
  success: boolean;
  message: string;
  tool_executed: string;
  parameters_used: {
    organizationId: number;
    timeframe: string;
  };
  results: EventAnalyticsResult;
  conversation_id: string;
  timestamp: string;
  ai_powered: boolean;
}

// API Error Type
export class ApiError extends Error {
  constructor(
    public status: number, 
    message: string, 
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}