#!/bin/bash

# Workflow Debugging MCP Server - React UI Startup Script
# This script installs dependencies and starts the React UI

echo "🚀 Starting Workflow Debugging React UI..."

# Change to the React UI directory
cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${BLUE}🏗️  Building the application...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Application built successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Build failed, but continuing with development mode...${NC}"
fi

echo -e "${BLUE}🌟 Starting React development server...${NC}"
echo -e "${YELLOW}📱 React UI will be available at: http://localhost:3001${NC}"
echo -e "${YELLOW}🔗 Make sure your API server is running on: http://localhost:3000${NC}"
echo -e "${BLUE}🎯 Press Ctrl+C to stop the server${NC}"
echo ""

# Start the development server
npm run dev