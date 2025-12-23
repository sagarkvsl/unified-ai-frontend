# Unified AI Frontend - Deployment Integration Plan

## Overview
This document outlines the integration of deployment and environment configuration patterns from the existing workflow-frontend into the Unified AI Frontend application. The goal is to implement a robust, multi-environment deployment system that supports local development, staging, and production deployments.

## Current Workflow-Frontend Architecture Analysis

### Environment Configuration Pattern
The workflow-frontend uses a sophisticated environment management system:

1. **Multiple Environment Files**:
   - `.env.local` - Local development
   - `.env.development` - Development environment
   - `.env.staging` - Staging environment  
   - `.env.production` - Production environment
   - `.env.production.brevo` - Production Brevo-specific configuration

2. **Environment Variables Structure**:
   ```env
   API_URL=<environment-specific-api-url>
   APP_ENV=<environment-name>
   PUBLIC_URL=<frontend-public-url>
   GTM_ID=<google-tag-manager-id>
   SIB_DOMAIN_1-5=<service-domain-urls>
   CORPORATE_WEBSITE=<website-url>
   SIDEBAR_API_URL=<sidebar-api-url>
   APPLICATION_NAME=<app-name>
   ```

3. **Environment Management Logic**:
   - **EnvSingleton Pattern**: Centralized environment configuration management
   - **Dynamic URL Resolution**: Uses `@dtsl/url-fetch` for environment-based URL switching
   - **Bootstrap Integration**: Environment override capability in application bootstrap

### Build and Deployment System

1. **Webpack Configuration**:
   - Environment-specific builds via `webpack.prod.js`, `webpack.dev.js`
   - Module federation support
   - Asset optimization and compression
   - Bundle analysis capabilities

2. **Package.json Scripts**:
   ```json
   {
     "start:workflowapp": "APP_ENV=local PUBLIC_PATH=workflowapp PORT=8093 webpack serve",
     "build:prod": "webpack --config webpack/webpack.prod.js",
     "build:dev": "webpack --config webpack/webpack.dev.js"
   }
   ```

3. **Rancher Deployment**:
   - Kubernetes deployment configuration
   - Container image management with registry variables
   - Service discovery and networking
   - Host aliases for development environments

## Integration Plan for Unified AI Frontend

### Phase 1: Environment Configuration Setup

1. **Create Environment Files**:
   - `.env.local` - Local development with localhost APIs
   - `.env.development` - Development environment APIs
   - `.env.staging` - Staging environment APIs
   - `.env.production` - Production environment APIs

2. **Environment Variables for Unified AI**:
   ```env
   API_URL=<backend-api-endpoint>
   APP_ENV=<environment>
   PUBLIC_URL=<frontend-url>
   CHAT_API_URL=<chat-service-endpoint>
   ANALYTICS_API_URL=<analytics-endpoint>
   HEALTH_CHECK_URL=<health-endpoint>
   APPLICATION_NAME=unified-ai-frontend
   ```

### Phase 2: Environment Management Implementation

1. **Environment Singleton Pattern**:
   - Create `lib/env.ts` with environment management logic
   - Implement URL switching based on APP_ENV
   - Integration with existing API utilities in `lib/api.ts`

2. **Bootstrap Integration**:
   - Update Next.js configuration to load environment-specific variables
   - Implement environment validation and fallback logic

### Phase 3: Build and Deployment Configuration

1. **Next.js Environment Integration**:
   - Configure `next.config.js` for environment-specific builds
   - Setup public runtime configuration
   - Implement build-time environment validation

2. **Package.json Script Updates**:
   ```json
   {
     "dev": "APP_ENV=local next dev",
     "build:dev": "APP_ENV=development next build",
     "build:staging": "APP_ENV=staging next build", 
     "build:prod": "APP_ENV=production next build"
   }
   ```

3. **Rancher Deployment Configuration**:
   - Create `rancher-deploy.yml` for Kubernetes deployment
   - Configure container registry integration
   - Setup service discovery and ingress rules

### Phase 4: Testing and Validation

1. **Environment Testing**:
   - Verify correct API URL resolution per environment
   - Test environment variable loading and validation
   - Validate build processes for each environment

2. **Deployment Testing**:
   - Test local development setup
   - Validate staging deployment process
   - Verify production deployment configuration

## Implementation Checklist

- [ ] Create environment configuration files
- [ ] Implement environment management utilities
- [ ] Update Next.js configuration for multi-environment support
- [ ] Create Rancher deployment configuration
- [ ] Update package.json with environment-specific scripts
- [ ] Implement environment validation and error handling
- [ ] Create deployment documentation
- [ ] Test all environments and deployment processes
- [ ] Update project README with deployment instructions

## Key Benefits

1. **Consistent Environment Management**: Standardized approach across all environments
2. **Easy Environment Switching**: Simplified configuration management
3. **Deployment Automation**: Streamlined build and deploy processes
4. **Development Efficiency**: Clear separation between environments
5. **Production Readiness**: Robust configuration for production deployment

## Next Steps

1. Begin implementation with environment file creation
2. Implement environment management utilities
3. Test local development setup
4. Progress through staging and production configuration
5. Comprehensive testing and validation