#!/bin/bash

echo "🚀 Setting up Language Detection Microservice..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Build the project
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the service:"
echo "  npm run dev    # Development mode with hot reload"
echo "  npm start      # Production mode"
echo ""
echo "To run with Docker:"
echo "  docker-compose up -d"
echo ""
echo "API will be available at: http://localhost:3001"
echo "Health check: http://localhost:3001/health"
echo "API docs: http://localhost:3001/api/v1/languages"
echo ""
