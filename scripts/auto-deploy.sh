#!/bin/bash

# EDEM Mirror v10 Auto Deployment Script

echo "🚀 Starting EDEM Mirror v10 Auto Deployment..."

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN environment variable is not set"
  echo "Please set it with: export VERCEL_TOKEN=your_vercel_token"
  exit 1
fi

# Check if project is already linked
if [ ! -d ".vercel" ]; then
  echo "🔗 Linking to Vercel project..."
  vercel link --token=$VERCEL_TOKEN --yes
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel deploy --prod --token=$VERCEL_TOKEN --yes

echo "🎉 Deployment completed!"