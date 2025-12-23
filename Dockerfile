# Multi-stage Dockerfile for Unified AI Frontend
# Optimized for different environments: local, development, staging, production

# Base image with Node.js
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat git curl
WORKDIR /app

# Install dependencies based on lock file
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Development stage - includes dev dependencies and source code
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose development port
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Development command with hot reload
CMD ["npm", "run", "dev"]

# Build stage - compiles the application
FROM base AS builder
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment configuration
ARG APP_ENV=production
ARG API_URL
ARG PUBLIC_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_ENABLE_ANALYTICS
ARG NEXT_PUBLIC_DEBUG_MODE
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_GTM_ID

# Set environment variables for build
ENV APP_ENV=${APP_ENV}
ENV API_URL=${API_URL}
ENV PUBLIC_URL=${PUBLIC_URL}
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=${NEXT_PUBLIC_ENABLE_ANALYTICS}
ENV NEXT_PUBLIC_DEBUG_MODE=${NEXT_PUBLIC_DEBUG_MODE}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with environment configuration
RUN npm run build

# Production runner stage - minimal image for production
FROM base AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production build
COPY --from=builder /app/public ./public

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Create necessary directories with correct permissions
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next
RUN mkdir -p /tmp && chown -R nextjs:nodejs /tmp

# Copy health check script
COPY --chown=nextjs:nodejs health-check.js /app/health-check.js

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node /app/health-check.js

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]

# Development target for local development with debugging
FROM development AS local
ENV NODE_ENV=development
ENV NEXT_PUBLIC_DEBUG_MODE=true
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Install additional development tools
USER root
RUN npm install -g @next/bundle-analyzer nodemon
USER nextjs

# Enable source maps and debugging
ENV GENERATE_SOURCEMAP=true
ENV NEXT_DEBUG=true

# Override command for local development
CMD ["npm", "run", "dev:local"]

# Staging target - production-like but with additional debugging
FROM production AS staging
ENV NEXT_PUBLIC_DEBUG_MODE=false
ENV NEXT_PUBLIC_LOG_LEVEL=warn

# Add staging-specific configurations
ENV NEXT_PUBLIC_APP_ENV=staging