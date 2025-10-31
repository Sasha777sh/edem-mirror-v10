#!/bin/bash

# EDEM GitHub Setup Script

echo "🚀 Setting up GitHub repository for EDEM..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI not found. Installing..."
  brew install gh
fi

echo "Please follow the prompts to authenticate with GitHub:"
gh auth login

echo "Creating GitHub repository..."
REPO_NAME="edem-psychological-assistant"
gh repo create $REPO_NAME --public --source=. --remote=origin

echo "Pushing code to GitHub..."
git push -u origin main

echo "✅ GitHub repository setup complete!"
echo "🔗 Repository URL: https://github.com/$USER/$REPO_NAME"