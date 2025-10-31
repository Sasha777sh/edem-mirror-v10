#!/bin/bash

# EDEM Deployment Script for Vercel

echo "🚀 Starting EDEM Deployment Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if build succeeds
echo "🏗️ Building the application..."
if npm run build; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed. Please check the errors above."
  exit 1
fi

# Run tests
echo "🧪 Running tests..."
if npm test; then
  echo "✅ All tests passed!"
else
  echo "❌ Tests failed. Please check the errors above."
  exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
  vercel --prod
else
  echo "⚠️ Vercel CLI not found. Installing..."
  npm install -g vercel
  vercel --prod
fi

echo "🎉 Deployment completed successfully!"
echo "🔗 Your application is now live on Vercel."
