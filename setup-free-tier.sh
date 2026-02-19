#!/bin/bash

# SecureStack Free Tier Setup Script
# This script helps you set up the platform on free tier services

set -e

echo "=========================================="
echo "  SecureStack Free Tier Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Install from: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git installed${NC}"

echo ""
echo "=========================================="
echo "  Step 1: Install Dependencies"
echo "=========================================="
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "=========================================="
echo "  Step 2: Build TypeScript"
echo "=========================================="
npm run build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo "=========================================="
echo "  Step 3: Run Tests"
echo "=========================================="
npm test
echo -e "${GREEN}✓ Tests passed${NC}"
echo ""

echo "=========================================="
echo "  Step 4: Setup Environment Variables"
echo "=========================================="
echo ""

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env and add your credentials:${NC}"
    echo "  - DATABASE_URL (from Neon)"
    echo "  - REDIS_URL (from Upstash)"
    echo "  - RABBITMQ_URL (from CloudAMQP)"
    echo ""
    echo "Press Enter when done..."
    read
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

echo "=========================================="
echo "  Step 5: Install Railway CLI (Optional)"
echo "=========================================="
echo ""
echo "Do you want to install Railway CLI for deployment? (y/n)"
read -r install_railway

if [ "$install_railway" = "y" ]; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
    echo -e "${GREEN}✓ Railway CLI installed${NC}"
    echo ""
    echo "Login to Railway:"
    railway login
    echo ""
    echo "Initialize project:"
    railway init
else
    echo "Skipped Railway CLI installation"
fi
echo ""

echo "=========================================="
echo "  ✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Create free accounts:"
echo "   - Railway.app: https://railway.app"
echo "   - Neon DB: https://neon.tech"
echo "   - Upstash Redis: https://upstash.com"
echo "   - CloudAMQP: https://www.cloudamqp.com"
echo ""
echo "2. Update .env with your credentials"
echo ""
echo "3. Deploy:"
echo "   - Via Railway CLI: railway up"
echo "   - Via GitHub: git push origin main"
echo ""
echo "📚 Read FREE-TIER-SETUP.md for detailed instructions"
echo ""
