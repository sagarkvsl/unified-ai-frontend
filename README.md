# Unified AI Frontend

A modern, production-ready React frontend for the Brevo Debugging AI Assistant. Built with Next.js 14, TypeScript, and Tailwind CSS with comprehensive multi-environment deployment support.

An AI-powered debugging system for internal Brevo teams (developers, QA, tech support, CX) to debug issues across various Brevo features including workflows, contacts, events, and more.

## 🚀 Features

- **Multi-Environment Support**: Seamless deployment across local, development, staging, and production environments
- **Environment-Aware Configuration**: Dynamic API URL switching based on deployment environment
- **Production-Ready**: Docker support, Kubernetes deployment, health checks, and monitoring
- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, and modern React patterns
- **Comprehensive Debugging**: Multi-feature debugging including workflows, contacts, events, and real-time monitoring
- **Deployment Automation**: Automated build, test, and deployment pipelines

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Building & Deployment](#building--deployment)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Docker & Kubernetes](#docker--kubernetes)
- [Scripts & Automation](#scripts--automation)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

## 📁 Project Structure

```
unified-ai-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── health/            # Health check endpoint
│   │   └── page.tsx           # Main dashboard
│   ├── components/            # Reusable React components
│   │   ├── StuckContactAnalysis.tsx
│   │   ├── WorkflowAnalytics.tsx
│   │   └── DataVisualization.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts            # API client with environment awareness
│   │   ├── env.ts            # Environment management
│   │   └── utils.ts          # General utilities
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── scripts/                  # Deployment and utility scripts
│   ├── deploy.sh            # Automated deployment script
│   └── validate-env.js      # Environment validation
├── .env.*                   # Environment configuration files
├── Dockerfile               # Multi-stage Docker build
├── rancher-deploy.yml       # Kubernetes deployment config
├── next.config.js          # Next.js configuration
└── package.json           # Dependencies and scripts
```

## � Quick Start

### Prerequisites

- Node.js 20.15.0 or later
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd unified-ai-frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your local configuration

# Start development server
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) to view the application.

## 🔧 Environment Configuration

### Environment Files

The application supports multiple environments with dedicated configuration files:

- **`.env.local`** - Local development
- **`.env.development`** - Development environment  
- **`.env.staging`** - Staging environment
- **`.env.production`** - Production environment

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_ENV` | Current environment | `local`, `development`, `staging`, `production` |
| `API_URL` | Backend API base URL | `http://localhost:3000` |
| `PUBLIC_URL` | Frontend public URL | `http://localhost:3001` |
| `NEXT_PUBLIC_DEBUG_MODE` | Enable debug logging | `true`, `false` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | `true`, `false` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager ID | `GTM-XXXXXX` |

### Environment Validation

```bash
# Validate current environment configuration
npm run env:validate

# Validate specific environment
node scripts/validate-env.js production
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev                    # Start local development server
npm run dev:local             # Start with explicit local environment
npm run dev:development       # Start with development environment

# Building
npm run build                 # Build for current environment
npm run build:local          # Build for local environment
npm run build:development    # Build for development environment
npm run build:staging        # Build for staging environment
npm run build:production     # Build for production environment

# Testing & Quality
npm run lint                  # Run ESLint
npm run type-check           # TypeScript type checking
npm run env:validate         # Validate environment configuration

# Deployment
npm run deploy:staging       # Deploy to staging
npm run deploy:production    # Deploy to production
```

### Development Guidelines

1. **Environment Setup**: Always validate your environment before development
2. **Code Quality**: Use TypeScript, follow linting rules, and add proper types
3. **Component Structure**: Follow the established component patterns in `src/components/`
4. **API Integration**: Use the centralized API utilities in `src/lib/api.ts`
5. **Environment Awareness**: Use environment utilities from `src/lib/env.ts`

## 🏗️ Building & Deployment

### Local Build

```bash
# Build for local environment
npm run build:local

# Start production server locally
npm run start:local
```

### Environment-Specific Builds

```bash
# Development
npm run build:development

# Staging
npm run build:staging

# Production
npm run build:production
```

### Deployment Script

```bash
# Deploy to staging with automated validation
./scripts/deploy.sh -e staging

# Deploy to production
./scripts/deploy.sh -e production -t v1.2.3

# Get help
./scripts/deploy.sh --help
```

## 🔌 API Integration

### Environment-Aware API Client

The application uses an intelligent API client that automatically switches endpoints based on the current environment:

```typescript
import { getApiUrl, isDebugMode } from '@/lib/env';
import { apiRequest } from '@/lib/api';

// Automatically uses correct API URL for current environment
const response = await apiRequest<StuckContactResult>('/api/stuck-contacts', {
  method: 'POST',
  body: JSON.stringify(requestData),
});
```

### API Endpoints by Environment

| Environment | API Base URL |
|-------------|--------------|
| Local | `http://localhost:3000` |
| Development | `https://unified-ai-api-dev.brevo.com` |
| Staging | `https://unified-ai-api-staging.brevo.com` |
| Production | `https://unified-ai-api.brevo.com` |

## 🐳 Docker & Kubernetes

### Docker Build

```bash
# Build for local development
docker build --target development -t unified-ai-frontend:local .

# Build for staging
docker build --target staging \
  --build-arg APP_ENV=staging \
  --build-arg API_URL=https://unified-ai-api-staging.brevo.com \
  -t unified-ai-frontend:staging .

# Build for production
docker build --target production \
  --build-arg APP_ENV=production \
  --build-arg API_URL=https://unified-ai-api.brevo.com \
  -t unified-ai-frontend:production .
```

### Kubernetes Deployment

The application includes comprehensive Kubernetes configuration:

- **Deployment**: Scalable pod management with health checks
- **Service**: Internal service discovery
- **Ingress**: External traffic routing with SSL
- **ConfigMap**: Configuration management
- **HPA**: Horizontal Pod Autoscaling

```bash
# Deploy to Kubernetes
kubectl apply -f rancher-deploy.yml

# Check deployment status
kubectl get pods -n unified-ai-frontend
kubectl get services -n unified-ai-frontend
```

## 📜 Scripts & Automation

### Environment Validation

```bash
# Validate all environments
for env in local development staging production; do
  node scripts/validate-env.js $env
done
```

### Deployment Automation

```bash
# Full deployment pipeline
./scripts/deploy.sh \
  --environment production \
  --registry registry.brevo.com \
  --tag v1.0.0
```

### Health Checks

```bash
# Check application health
curl -s http://localhost:3001/health | jq .

# Check specific environment
curl -s https://unified-ai-staging.brevo.com/health | jq .
```

## 🔍 Monitoring & Health Checks

### Health Endpoint

The application exposes a comprehensive health check endpoint at `/health`:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-23T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "rss": 156123456,
    "heapTotal": 89654321,
    "heapUsed": 67890123
  },
  "configuration": {
    "isValid": true,
    "errors": 0
  },
  "services": {
    "api": {
      "url": "https://unified-ai-api.brevo.com",
      "accessible": true
    }
  }
}
```

### Monitoring Integration

- **Kubernetes Health Checks**: Liveness and readiness probes
- **Prometheus Metrics**: Application metrics endpoint
- **Sentry Error Tracking**: Automated error reporting
- **Google Tag Manager**: Analytics and user tracking

## 📚 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Validate environment
npm run env:validate
```

#### Environment Configuration Issues

```bash
# Check environment loading
node -e "console.log(process.env)" | grep -E "(APP_ENV|API_URL|PUBLIC_URL)"

# Validate specific environment
node scripts/validate-env.js production
```

#### API Connection Issues

```bash
# Test API connectivity
curl -I $API_URL/health

# Check proxy configuration (local development)
curl -I http://localhost:3001/api/health
```

#### Docker Build Issues

```bash
# Build with no cache
docker build --no-cache .

# Check build logs
docker build . 2>&1 | tee build.log
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug mode in environment
export NEXT_PUBLIC_DEBUG_MODE=true

# Or in .env file
NEXT_PUBLIC_DEBUG_MODE=true
```

### Support

For additional support:

1. Check the [Deployment Integration Plan](DEPLOYMENT_INTEGRATION_PLAN.md)
2. Review environment validation output
3. Check application health endpoint
4. Review deployment logs in Kubernetes

## 📝 License

This project is part of the Brevo ecosystem and follows internal licensing guidelines.

## 🤝 Contributing

1. Follow the established development guidelines
2. Validate environment configurations before committing
3. Test all environment builds before deployment
4. Update documentation for new features or changes

---

**Built with ❤️ by the Brevo Engineering Team**

- React Developer Tools
- Redux DevTools (if using Redux)

## 📝 Contributing

### Code Style

- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind classes over custom CSS
- Implement proper error handling

### Component Guidelines

```typescript
// Example component template
'use client'

import { useState, useEffect } from 'react'
import { analyzeStuckContact } from '@/lib/api'
import type { StuckContactRequest, AnalysisResult } from '@/types'

interface ComponentProps {
  // Define props here
}

export function ComponentName({ prop }: ComponentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalysisResult | null>(null)

  // Component logic here

  return (
    <div className="component-container">
      {/* JSX here */}
    </div>
  )
}
```

---

**Ready to develop!** 🎯

Start the development server with `npm run dev` and visit http://localhost:3001 to see the application in action.