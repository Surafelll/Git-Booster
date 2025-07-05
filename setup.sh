#!/bin/bash

echo "🚀 Gitboster Setup Script"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+ first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your GitHub OAuth credentials:"
    echo "   - GITHUB_CLIENT_ID=your_github_client_id"
    echo "   - GITHUB_CLIENT_SECRET=your_github_client_secret"
    echo "   - SESSION_SECRET=your_session_secret"
    echo ""
    echo "📋 To create GitHub OAuth App:"
    echo "   1. Go to GitHub Settings > Developer settings > OAuth Apps"
    echo "   2. Click 'New OAuth App'"
    echo "   3. Homepage URL: http://localhost:3000"
    echo "   4. Authorization callback URL: http://localhost:3000/auth/github/callback"
    echo ""
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "For development with auto-reload:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000"