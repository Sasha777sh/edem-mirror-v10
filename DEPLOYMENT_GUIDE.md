# 🚀 EDEM Deployment Guide

This guide explains how to deploy the EDEM psychological self-help platform to Vercel.

## Prerequisites

1. Node.js 18+ installed
2. Vercel CLI installed (`npm install -g vercel`)
3. Upstash Redis database created
4. Supabase project set up
5. All environment variables configured

## Environment Variables

Before deploying, ensure you have the following environment variables in your `.env` file:

```bash
# Database
DATABASE_URL=your_postgresql_database_url

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Integration
OPENAI_API_KEY=your_openai_api_key

# Upstash Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# NOWPayments (Crypto)
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_IPN_SECRET=your_nowpayments_ipn_secret

# YooKassa (Russia)
YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_SECRET_KEY=your_yookassa_secret_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_telegram_bot_username

# Application
NEXT_PUBLIC_APP_URL=your_application_url
NEXTAUTH_SECRET=your_nextauth_secret

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host

# Development
NODE_ENV=production
CRON_SECRET=your_cron_secret
```

## Deployment Steps

### 1. Manual Deployment via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. Automated Deployment

```bash
# Use the deployment script
npm run deploy:vercel
```

### 3. GitHub Integration (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel project settings
4. Enable automatic deployments on push

## Post-Deployment Setup

### 1. Database Migrations

After deployment, run database migrations:

```bash
# Run all migrations
npm run db:migrate

# Run specific migrations
npm run db:migrate:dialogue
npm run db:migrate:rag
npm run db:migrate:onboarding-mirror
npm run db:migrate:edem-living-llm
```

### 2. RAG Setup

Set up the RAG (Retrieval-Augmented Generation) system:

```bash
# Generate embeddings
npm run generate-embeddings

# Set up RAG embeddings
npm run db:setup-rag-embeddings
```

### 3. Cron Jobs

Set up cron jobs for daily operations:

```bash
npm run setup-cron-jobs
```

## Environment-Specific Configuration

### Production Environment

For production deployments, ensure the following:

1. `NODE_ENV` is set to `production`
2. All API keys are production keys
3. Database connections use production credentials
4. Redis is configured for production use

### Environment Variables in Vercel

When using Vercel, set the environment variables in the Vercel project settings:

1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add all required environment variables from the list above

## Monitoring and Maintenance

### Health Checks

Monitor the application health:

```bash
# Run health check
npm run health
```

### Logs

View application logs through Vercel dashboard:

1. Go to your Vercel project
2. Navigate to Analytics > Logs
3. Monitor for any errors or issues

### Updates

To update the deployed application:

1. Push changes to your GitHub repository
2. Vercel will automatically deploy if GitHub integration is set up
3. Or manually deploy using `vercel --prod`

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all environment variables are correctly set
2. **Database Connection**: Verify DATABASE_URL and Supabase credentials
3. **Redis Connection**: Ensure UPSTASH_REDIS_REST_URL and token are correct
4. **API Key Errors**: Confirm all API keys are valid and have proper permissions

### Support

For deployment issues, contact:

- Technical Support: <support@edem.app>
- Infrastructure Team: <infra@edem.app>

## Security Considerations

1. Never commit sensitive environment variables to version control
2. Use Vercel's environment variable encryption
3. Regularly rotate API keys
4. Monitor access logs for suspicious activity

## Scaling

The EDEM platform is designed to scale automatically on Vercel:

- Serverless functions scale automatically
- Database connections are managed by connection pooling
- Redis handles rate limiting at scale
- CDN serves static assets efficiently

For high-traffic scenarios:

1. Monitor Vercel metrics
2. Upgrade database tier if needed
3. Consider Redis Enterprise for high-throughput scenarios
4. Implement additional caching layers if necessary
