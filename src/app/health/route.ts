import { NextRequest, NextResponse } from 'next/server';
import { 
  getEnvironmentConfig, 
  validateConfiguration, 
  isProduction, 
  isDebugMode 
} from '@/lib/env';

/**
 * Health check endpoint for Kubernetes liveness and readiness probes
 * Returns application status and environment information
 */
export async function GET(request: NextRequest) {
  try {
    const config = getEnvironmentConfig();
    const validation = validateConfiguration();
    
    // Basic health check data
    const healthData: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.APP_ENV,
      version: process.env.BUILD_ID || '1.0.0',
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      configuration: {
        isValid: validation.isValid,
        errors: validation.errors.length,
        warnings: validation.errors.length > 0 ? validation.errors : undefined,
      },
      services: {
        api: {
          url: config.API_URL,
          accessible: await checkServiceHealth(config.API_URL + '/health'),
        },
      },
    };

    // Add debug information in non-production environments
    if (!isProduction()) {
      healthData.debug = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        config: config,
      };
    }

    // Return appropriate status code based on health
    const statusCode = validation.isValid && healthData.services.api.accessible ? 200 : 503;
    
    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'unified-ai-frontend',
        'X-Environment': config.APP_ENV,
      }
    });

  } catch (error) {
    console.error('[Health Check] Error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'unified-ai-frontend',
      }
    });
  }
}

/**
 * Check if a service endpoint is accessible
 */
async function checkServiceHealth(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'User-Agent': 'unified-ai-frontend-health-check',
      },
    });

    clearTimeout(timeoutId);
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    // Log error in debug mode
    if (isDebugMode()) {
      console.debug(`[Health Check] Service check failed for ${url}:`, error);
    }
    return false;
  }
}