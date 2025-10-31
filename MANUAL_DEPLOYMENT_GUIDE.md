# 🚀 Manual Deployment Guide for EDEM Living LLM

This guide explains how to manually deploy the EDEM psychological self-help platform to Vercel.

## Prerequisites

1. Node.js 18+ installed
2. Vercel account
3. GitHub account
4. All required API keys and service accounts

## Step-by-Step Deployment Process

### 1. Create a Vercel Account

If you don't have a Vercel account:

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Verify your email address

### 2. Connect GitHub Repository to Vercel

1. Log in to your Vercel dashboard
2. Click "New Project"
3. Select "Import Git Repository"
4. Connect to GitHub if not already connected
5. Find and select the `edem-living-llm` repository
6. Click "Import"

### 3. Configure Project Settings

In the Vercel project configuration:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Root Directory**: Leave empty (default)

### 4. Set Environment Variables

In the Vercel project settings, go to "Environment Variables" and add the following:

#### Database Configuration

```
DATABASE_URL=your_postgresql_database_url
```

#### Supabase Authentication

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### AI Integration

```
OPENAI_API_KEY=your_openai_api_key
```

#### Upstash Redis for Rate Limiting

```
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

#### NOWPayments (Crypto)

```
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_IPN_SECRET=your_nowpayments_ipn_secret
```

#### YooKassa (Russia)

```
YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_SECRET_KEY=your_yookassa_secret_key
```

#### Telegram Bot

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_telegram_bot_username
```

#### Application Configuration

```
NEXT_PUBLIC_APP_URL=your_application_url
NEXTAUTH_SECRET=your_nextauth_secret
```

#### PostHog Analytics

```
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
```

#### Development

```
NODE_ENV=production
CRON_SECRET=your_cron_secret
```

### 5. Deploy the Project

1. After setting environment variables, click "Deploy"
2. Vercel will automatically build and deploy your project
3. Wait for the deployment to complete (usually 5-10 minutes)

### 6. Post-Deployment Setup

#### Run Database Migrations

After deployment, you'll need to run database migrations. You can do this in two ways:

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project
vercel link

# Run migrations
vercel dev --script "npm run db:migrate"
```

**Option B: Manual Database Setup**

1. Connect to your PostgreSQL database
2. Run the migration scripts from `src/migrations/` directory
3. Apply the SQL scripts in numerical order

#### Set Up RAG Embeddings

```bash
# Generate embeddings
npm run generate-embeddings

# Set up RAG embeddings in database
npm run db:setup-rag-embeddings
```

#### Configure Cron Jobs

Set up cron jobs for daily operations:

```bash
npm run setup-cron-jobs
```

### 7. Verify Deployment

1. Visit your deployed URL
2. Test the main features:
   - Shadow onboarding flow
   - Chat functionality
   - Payment processing
   - Telegram bot integration
3. Check the admin dashboard
4. Verify analytics tracking

## Troubleshooting Common Issues

### Build Failures

- Check that all environment variables are correctly set
- Verify Node.js version compatibility
- Ensure all dependencies are properly installed

### Database Connection Issues

- Verify DATABASE_URL format and credentials
- Check firewall settings for database access
- Confirm database is accessible from Vercel

### Redis Connection Issues

- Verify UPSTASH_REDIS_REST_URL and token
- Check Redis database is active
- Confirm network access from Vercel

### API Key Errors

- Confirm all API keys are valid
- Check API key permissions
- Verify rate limits are not exceeded

## Monitoring and Maintenance

### Health Checks

Regularly monitor:

- Application performance
- Database connections
- API response times
- Error logs

### Updates

To update the deployed application:

1. Push changes to your GitHub repository
2. Vercel will automatically deploy if GitHub integration is set up
3. Or manually trigger a new deployment from Vercel dashboard

## Support

For deployment issues, contact:

- Technical Support: <support@edem.app>
- Infrastructure Team: <infra@edem.app>

---

**EDEM - Честное зеркало психики**  
*Empowering psychological well-being through innovative AI technology*
