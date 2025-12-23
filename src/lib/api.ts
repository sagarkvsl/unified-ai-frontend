/**
 * Clean API utilities for communicating with Unified AI Engine backend
 * Centralized API configuration and error handling with environment management
 */

import { 
  APIResponse, 
  StuckContactRequest, 
  BatchStuckContactRequest,
  StuckContactCountResponse,
  TotalStuckContactCountResponse,
  StuckContactResult,
  BatchAnalysisResult,
  WorkflowQueryRequest,
  WorkflowQueryResponse,
  ApiError 
} from '@/types';
import { getExternalConfig, getEnvironment, isDebugMode } from './env';

/**
 * API response interface (keeping for backward compatibility)
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Custom API error class (keeping for backward compatibility)
 */
class ApiErrorLegacy extends Error {
  constructor(public status: number, message: string, public response?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request function with timeout and error handling using environment configuration
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const config = getExternalConfig();
  const url = `${config.api.baseUrl}${endpoint}`;
  
  const requestConfig: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Environment': getEnvironment(),
      ...options.headers,
    },
  };

  // Add timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
  requestConfig.signal = controller.signal;

  try {
    if (isDebugMode()) {
      console.debug(`[API] ${options.method || 'GET'} ${url}`, {
        environment: getEnvironment(),
        headers: requestConfig.headers,
        body: options.body
      });
    }

    const response = await fetch(url, requestConfig);
    clearTimeout(timeoutId);

    // Parse response
    const data = await response.json();

    if (isDebugMode()) {
      console.debug(`[API] Response ${response.status}:`, data);
    }

    if (!response.ok) {
      throw new ApiError(response.status, data.error || response.statusText, data);
    }

    return data as ApiResponse<T>;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      if (isDebugMode()) {
        console.error(`[API] Error ${error.status}:`, error.message, error.response);
      }
      throw error;
    }
    
    if ((error as any)?.name === 'AbortError') {
      const timeoutError = new ApiError(408, 'Request timeout - please try again');
      if (isDebugMode()) {
        console.error('[API] Timeout error:', timeoutError);
      }
      throw timeoutError;
    }
    
    const networkError = new ApiError(500, (error as any)?.message || 'Network error occurred');
    if (isDebugMode()) {
      console.error('[API] Network error:', networkError);
    }
    throw networkError;
  }
}

/**
 * API client with organized endpoints
 */
export const apiClient = {
  
  // Analytics endpoints
  analytics: {
    /**
     * Get stuck contact count for organization
     */
    getStuckContactCount: async (organizationId: string): Promise<APIResponse<StuckContactCountResponse>> => {
      if (!organizationId) throw new Error('Organization ID is required');
      return apiRequest(`/api/analytics/stuck-contacts-count?organizationId=${organizationId}`);
    },

    /**
     * Get total stuck contact count across all organizations
     */
    getTotalStuckContactCount: async (): Promise<APIResponse<TotalStuckContactCountResponse>> => {
      return apiRequest('/api/analytics/total-stuck-contacts-count');
    },
  },

  // Analysis endpoints
  analysis: {
    /**
     * Analyze single stuck contact
     */
    analyzeStuckContact: async (contactData: {
      organization_id: string;
      workflow_id: string;
      contact_id: string;
    }) => {
      if (!contactData.organization_id || !contactData.workflow_id || !contactData.contact_id) {
        throw new Error('Organization ID, Workflow ID, and Contact ID are required');
      }
      
      return apiRequest('/api/analyze/stuck-contact', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });
    },

    /**
     * Analyze multiple stuck contacts in batch
     */
    analyzeBatchStuckContacts: async (contacts: Array<{
      organization_id: string;
      workflow_id: string;
      contact_id: string;
    }>) => {
      if (!contacts || contacts.length === 0) {
        throw new Error('At least one contact is required');
      }

      return apiRequest('/api/analyze/batch-stuck-contacts', {
        method: 'POST',
        body: JSON.stringify({ contacts }),
      });
    },
  },

  // System endpoints
  system: {
    /**
     * Health check
     */
    healthCheck: async () => {
      return apiRequest('/health');
    },

    /**
     * Get cache statistics
     */
    getCacheStats: async () => {
      return apiRequest('/cache/stats');
    },

    /**
     * Clear cache
     */
    clearCache: async () => {
      return apiRequest('/cache/clear', { method: 'POST' });
    },
  },
};

// Export error class for handling
export { ApiError };
export type { ApiResponse };