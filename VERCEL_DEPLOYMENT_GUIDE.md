# Vercel Deployment Guide for EDEM Living LLM

## Current Deployment Status

The project has been built successfully locally, but there are deployment issues with Vercel due to Git author permissions.

## Manual Deployment Steps

1. **Log in to Vercel Dashboard**
   - Go to <https://vercel.com/dashboard>
   - Log in with your credentials

2. **Navigate to the Project**
   - Find the "qoder" project in your project list
   - Click on the project to open it

3. **Trigger a New Deployment**
   - In the project dashboard, click on "Deployments" tab
   - Click the "Redeploy" button for the latest deployment
   - Or click "Import Project" if you need to reconnect the GitHub repository

4. **Check Environment Variables**
   - Go to the "Settings" tab
   - Click on "Environment Variables" in the sidebar
   - Make sure all required environment variables are set:
     - DATABASE_URL
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
     - OPENAI_API_KEY
     - UPSTASH_REDIS_REST_URL (optional)
     - UPSTASH_REDIS_REST_TOKEN (optional)
     - NEXT_PUBLIC_POSTHOG_KEY
     - NEXT_PUBLIC_POSTHOG_HOST
     - TELEGRAM_BOT_TOKEN (if using Telegram)
     - NEXT_PUBLIC_TELEGRAM_BOT_USERNAME (if using Telegram)
     - NOWPAYMENTS_API_KEY (for crypto payments)
     - NOWPAYMENTS_IPN_SECRET (for crypto payments)
     - YOOKASSA_SHOP_ID (for Russian payments)
     - YOOKASSA_SECRET_KEY (for Russian payments)

5. **Verify Build Settings**
   - Go to the "Settings" tab
   - Click on "General" in the sidebar
   - Under "Build & Development Settings", make sure:
     - Framework Preset is set to "Next.js"
     - Build Command is "next build"
     - Output Directory is ".next"

6. **Monitor Deployment**
   - Go to the "Deployments" tab
   - Watch the deployment progress
   - Check the logs if there are any errors

## Troubleshooting

If you encounter any issues during deployment:

1. **Dependency Conflicts**
   - The project has been updated to use @supabase/supabase-js version 2.58.0 to resolve conflicts
   - If you still see dependency issues, try adding `--legacy-peer-deps` to the build command

2. **Environment Variables**
   - Make sure all required environment variables are set in the Vercel project settings
   - Check that the values are correct and have the proper permissions

3. **Build Issues**
   - If the build fails, check the logs for specific error messages
   - Common issues include missing dependencies or incorrect Node.js versions

4. **Runtime Issues**
   - After successful deployment, test all functionality
   - Check the browser console and Vercel logs for any runtime errors

## Post-Deployment Verification

After deployment is complete, verify that the following features work correctly:

1. User authentication with Supabase
2. EDEM Living LLM chat functionality
3. Access control system (public/registered/guardian roles)
4. Payment processing (crypto and YooKassa)
5. Telegram integration (if configured)
6. Analytics tracking with PostHog
7. Rate limiting with Redis (if configured)

## Support

If you continue to experience issues with deployment:

1. Check the Vercel documentation: <https://vercel.com/docs>
2. Visit the Vercel community forum: <https://github.com/vercel/community/discussions>
3. Contact Vercel support through the dashboard
