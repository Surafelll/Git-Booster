#!/bin/bash

echo "🚀 Gitboster 2.0 Setup Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your credentials:"
    echo "   - GITHUB_CLIENT_ID=your_github_client_id"
    echo "   - GITHUB_CLIENT_SECRET=your_github_client_secret"
    echo "   - JWT_SECRET=your_jwt_secret"
    echo ""
    echo "📋 To create GitHub OAuth App:"
    echo "   1. Go to GitHub Settings > Developer settings > OAuth Apps"
    echo "   2. Click 'New OAuth App'"
    echo "   3. Homepage URL: http://localhost:3001"
    echo "   4. Authorization callback URL: http://localhost:3000/api/auth/github/callback"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Build backend
echo "🏗️  Building backend..."
npm run build

# Setup frontend if directory exists
if [ -d "frontend" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "Backend (API Server):"
echo "  npm run start:dev     # Development mode"
echo "  npm run start:prod    # Production mode"
echo ""
if [ -d "frontend" ]; then
    echo "Frontend (React App):"
    echo "  cd frontend && npm start"
    echo ""
    echo "🌐 Application URLs:"
    echo "  - Backend API: http://localhost:3000/api"
    echo "  - Frontend App: http://localhost:3001"
else
    echo "🌐 Backend API: http://localhost:3000/api"
fi
echo ""
echo "📊 Features available:"
echo "  - JWT & GitHub OAuth authentication"
echo "  - Advanced commit scheduling"
echo "  - Comprehensive analytics dashboard"
echo "  - User management & CRUD operations"