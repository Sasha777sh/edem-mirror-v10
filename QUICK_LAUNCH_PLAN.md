# EDEM Living LLM Quick Launch Plan

## Overview

This document provides a streamlined 50-minute path to getting your EDEM Living LLM application live. This quick launch approach focuses on the essential steps needed to deploy a functional version of the platform with minimal configuration.

## Prerequisites (5 minutes)

Before beginning the quick launch process, ensure you have:

1. **GitHub account** ready
2. **Vercel account** ready
3. **Node.js 18+** installed locally
4. **This repository** cloned to your local machine

## Step 1: Set up GitHub Repository (5 minutes)

### 1.1 Create New Repository

1. Go to GitHub and create a new private repository named `edem-living-llm`
2. Do not initialize with README, .gitignore, or license

### 1.2 Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/edem-living-llm.git
git push -u origin main
```

## Step 2: Configure Environment Variables (10 minutes)

### 2.1 Create Environment File

```bash
cp .env.example .env.local
```

### 2.2 Set Essential Variables

For a quick launch, you'll need these minimum variables:

```env
# Application URL (will update after deployment)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For development, you can use placeholder values for now
NEXTAUTH_SECRET=your_nextauth_secret_here_32_characters_min

# These can be added later in Vercel
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# OPENAI_API_KEY=
```

## Step 3: Run Database Migrations (15 minutes)

### 3.1 Set Up Local Database

For quick launch, you can use a local PostgreSQL database or Supabase free tier:

1. Sign up for [Supabase](https://supabase.com/)
2. Create a new project
3. Get your project credentials

### 3.2 Configure Database Connection

Update your `.env.local` with Supabase credentials:

```env
DATABASE_URL=your_supabase_database_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.3 Run Migrations

```bash
npm run db:migrate
npm run db:migrate:edem-living-llm
```

Note: For quick launch, we're only running the essential migrations. You can run additional migrations later.

## Step 4: Import Content and Generate Embeddings (10 minutes)

### 4.1 Import Sample Content

```bash
npm run import-rag-data
```

### 4.2 Generate Embeddings

For quick launch, you can skip this step initially and add embeddings later:

```bash
# Optional for quick launch
# npm run generate-embeddings
```

## Step 5: Deploy to Vercel (5 minutes)

### 5.1 Connect to Vercel

1. Go to [Vercel](https://vercel.com/) and sign in
2. Click "New Project"
3. Import your GitHub repository

### 5.2 Configure Project

1. Set the project name to `edem-living-llm`
2. Framework preset should be Next.js
3. Build command: `npm run build`
4. Output directory: `.next`

### 5.3 Deploy

Click "Deploy" and wait for the build to complete.

## Step 6: Verify Deployment (5 minutes)

### 6.1 Check Health Endpoint

Once deployed, visit:

```
https://your-vercel-url.vercel.app/api/health
```

You should see:

```json
{
  "status": "ok",
  "timestamp": "2023-...",
  "service": "EDEM Living LLM"
}
```

### 6.2 Test Main Page

Visit your deployed URL and verify:

1. The main page loads correctly
2. The demo chat section is visible
3. Navigation works properly

## Post-Quick Launch Steps

After your quick launch, you should complete these steps:

### 1. Add Full Environment Variables

In Vercel project settings, add all environment variables:

- OpenAI API key for full functionality
- Stripe keys for payments
- NOWPayments and YooKassa keys
- Telegram bot token
- PostHog analytics keys

### 2. Run Full Database Migrations

```bash
npm run db:migrate:dialogue
npm run db:migrate:rag
npm run db:migrate:onboarding-mirror
npm run db:migrate:user-preferences
npm run db:migrate:user-feedback
```

### 3. Generate All Embeddings

```bash
npm run generate-embeddings
```

### 4. Test All Features

- Verify chat functionality with all voice personalities
- Test payment integration
- Check user registration and login
- Validate the three-stage dialogue system

### 5. Set Up Webhooks

Configure webhooks for:

- Stripe payment processing
- NOWPayments IPN
- YooKassa notifications

## Time-Saving Tips

### Use Supabase Free Tier

For initial deployment, the Supabase free tier provides sufficient resources.

### Placeholder Content

You can deploy with sample content and replace with real content later.

### Gradual Feature Rollout

Deploy core functionality first, then gradually add advanced features.

## Troubleshooting Quick Launch Issues

### Build Failures

- Check Node.js version (must be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

### Environment Variables

- Ensure all required variables are set in Vercel
- Check for typos in variable names
- Restart deployment after updating variables

### Database Connection

- Verify Supabase credentials
- Check database URL format
- Ensure pgvector extension is enabled

## Conclusion

This quick launch plan allows you to deploy the EDEM Living LLM application in approximately 50 minutes. The approach focuses on getting a functional version live quickly, with the option to enhance and expand features after the initial deployment.

The key to a successful quick launch is focusing on the essentials:

1. Repository setup
2. Basic environment configuration
3. Core database migrations
4. Vercel deployment

After your quick launch, you can gradually add more features, content, and integrations to create a fully-featured production environment.
