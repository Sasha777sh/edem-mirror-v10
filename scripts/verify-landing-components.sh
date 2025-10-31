#!/bin/bash

echo "Verifying landing page components implementation..."

# Check if DemoChatSection is imported and used in the landing page
if grep -q "DemoChatSection" src/app/page.tsx; then
  echo "✅ DemoChatSection is imported in the landing page"
else
  echo "❌ DemoChatSection is not imported in the landing page"
fi

# Check if TelegramLoginButton uses environment variable
if grep -q "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" src/components/DemoChatSection.tsx; then
  echo "✅ TelegramLoginButton uses environment variable for bot username"
else
  echo "❌ TelegramLoginButton does not use environment variable for bot username"
fi

# Check if environment variables are defined
if grep -q "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" .env.example; then
  echo "✅ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is defined in .env.example"
else
  echo "❌ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not defined in .env.example"
fi

if grep -q "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" .env; then
  echo "✅ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is defined in .env"
else
  echo "❌ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not defined in .env"
fi

echo ""
echo "Verification complete!"