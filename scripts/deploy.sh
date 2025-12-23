#!/bin/bash

# Unified AI Frontend Deployment Script
# Supports multiple environments: local, development, staging, production

set -e  # Exit on any error

# Default values
ENVIRONMENT="${APP_ENV:-local}"
REGISTRY="${CICD_REGISTRY:-registry.brevo.com}"
IMAGE_TAG="${CICD_EXECUTION_SEQUENCE:-latest}"
NAMESPACE="unified-ai-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Unified AI Frontend to Kubernetes

OPTIONS:
    -e, --environment ENV     Target environment (local|development|staging|production)
    -r, --registry REGISTRY   Docker registry URL
    -t, --tag TAG            Image tag
    -n, --namespace NS       Kubernetes namespace
    -h, --help               Show this help message

EXAMPLES:
    $0 -e staging
    $0 -e production -t v1.2.3
    $0 --environment development --registry my-registry.com

ENVIRONMENT VARIABLES:
    APP_ENV                  Target environment
    CICD_REGISTRY           Docker registry URL
    CICD_EXECUTION_SEQUENCE Image tag/build number
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
case $ENVIRONMENT in
    local|development|staging|production)
        log_info "Deploying to environment: $ENVIRONMENT"
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        log_error "Must be one of: local, development, staging, production"
        exit 1
        ;;
esac

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        log_error "Please check your kubectl configuration"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Validate environment configuration
validate_environment() {
    log_info "Validating environment configuration..."
    
    if ! node scripts/validate-env.js $ENVIRONMENT; then
        log_error "Environment validation failed"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    IMAGE_NAME="${REGISTRY}/unified-ai-frontend:${IMAGE_TAG}"
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "Dockerfile" ]; then
        log_info "Creating Dockerfile..."
        cat > Dockerfile << 'EOF'
# Multi-stage build for Unified AI Frontend
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

# Build application
RUN npm run build:${APP_ENV}

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["server.js"]
EOF
    fi
    
    # Build image
    docker build \
        --build-arg APP_ENV=$ENVIRONMENT \
        -t $IMAGE_NAME \
        .
    
    # Push image if not local
    if [ "$ENVIRONMENT" != "local" ]; then
        log_info "Pushing image to registry..."
        docker push $IMAGE_NAME
    fi
    
    log_success "Docker image built: $IMAGE_NAME"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    # Set environment-specific variables
    case $ENVIRONMENT in
        local)
            API_URL="http://localhost:3000"
            PUBLIC_URL="http://localhost:3001"
            INGRESS_HOST="unified-ai-local.brevo.dev"
            ENABLE_ANALYTICS="false"
            SENTRY_DSN=""
            GTM_ID="GTM-local-test"
            ;;
        development)
            API_URL="https://unified-ai-api-dev.brevo.com"
            PUBLIC_URL="https://unified-ai-dev.brevo.com"
            INGRESS_HOST="unified-ai-dev.brevo.com"
            ENABLE_ANALYTICS="true"
            SENTRY_DSN="${SENTRY_DSN_DEV}"
            GTM_ID="GTM-DEV123"
            ;;
        staging)
            API_URL="https://unified-ai-api-staging.brevo.com"
            PUBLIC_URL="https://unified-ai-staging.brevo.com"
            INGRESS_HOST="unified-ai-staging.brevo.com"
            ENABLE_ANALYTICS="true"
            SENTRY_DSN="${SENTRY_DSN_STAGING}"
            GTM_ID="GTM-STAGING123"
            ;;
        production)
            API_URL="https://unified-ai-api.brevo.com"
            PUBLIC_URL="https://unified-ai.brevo.com"
            INGRESS_HOST="unified-ai.brevo.com"
            ENABLE_ANALYTICS="true"
            SENTRY_DSN="${SENTRY_DSN_PROD}"
            GTM_ID="GTM-PROD123"
            ;;
    esac
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply deployment with environment variables
    envsubst << 'EOF' | kubectl apply -f -
$(cat rancher-deploy.yml)
EOF
    
    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/unified-ai-frontend -n $NAMESPACE --timeout=300s
    
    # Get service information
    log_info "Service information:"
    kubectl get services -n $NAMESPACE
    
    if [ "$ENVIRONMENT" != "local" ]; then
        log_info "Ingress information:"
        kubectl get ingress -n $NAMESPACE
    fi
    
    log_success "Deployment completed successfully!"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Get service URL
    if [ "$ENVIRONMENT" == "local" ]; then
        SERVICE_URL="http://localhost:3001"
    else
        SERVICE_URL="https://${INGRESS_HOST}"
    fi
    
    # Wait for service to be healthy
    for i in {1..30}; do
        if curl -sf "${SERVICE_URL}/health" > /dev/null 2>&1; then
            log_success "Health check passed: $SERVICE_URL"
            return 0
        fi
        log_info "Waiting for service to be healthy... (attempt $i/30)"
        sleep 10
    done
    
    log_error "Health check failed after 5 minutes"
    return 1
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    kubectl rollout undo deployment/unified-ai-frontend -n $NAMESPACE
    kubectl rollout status deployment/unified-ai-frontend -n $NAMESPACE
    log_success "Rollback completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment of Unified AI Frontend"
    log_info "Environment: $ENVIRONMENT"
    log_info "Registry: $REGISTRY"
    log_info "Image Tag: $IMAGE_TAG"
    log_info "Namespace: $NAMESPACE"
    
    check_prerequisites
    validate_environment
    
    if [ "$ENVIRONMENT" != "local" ]; then
        build_image
    fi
    
    deploy_to_kubernetes
    
    if ! health_check; then
        log_error "Deployment failed health check"
        rollback
        exit 1
    fi
    
    log_success "Deployment completed successfully!"
    log_info "Application is available at: ${SERVICE_URL:-$PUBLIC_URL}"
}

# Handle script termination
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Execute main function
main "$@"