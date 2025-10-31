#!/bin/bash

# Quick Launch Script for EDEM Living LLM
# This script helps you launch the application as quickly as possible

echo "🚀 EDEM Living LLM Quick Launch"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

echo "✅ Project directory verified"

# Check dependencies
echo "📦 Checking dependencies..."
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install Node.js and npm."
  exit 1
fi

if ! command -v git &> /dev/null; then
  echo "❌ git not found. Please install git."
  exit 1
fi

echo "✅ Dependencies verified"

# Check if GitHub CLI is installed
echo "🔧 Checking GitHub CLI..."
if ! command -v gh &> /dev/null; then
  echo "⚠️ GitHub CLI not found. Installing..."
  brew install gh
fi

# Check if Vercel CLI is installed
echo "🔧 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
  echo "⚠️ Vercel CLI not found. Installing..."
  npm install -g vercel
fi

echo "✅ CLI tools verified"

# Install project dependencies
echo "📥 Installing project dependencies..."
npm install

# Verify deployment readiness
echo "🔍 Verifying deployment readiness..."
npm run verify-deployment

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Create a Supabase project at https://supabase.com/"
echo "2. Get your Supabase credentials (Project URL and API keys)"
echo "3. Create .env.local and .env.production files with your credentials"
echo "4. Run database migrations: npm run db:migrate:all"
echo "5. Import content: npm run import-corpus"
echo "6. Generate embeddings: npm run generate-embeddings"
echo "7. Deploy to Vercel: npm run deploy"
echo ""
echo "For detailed instructions, see QUICK_LAUNCH_PLAN.md"
echo ""