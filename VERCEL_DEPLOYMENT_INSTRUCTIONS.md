# EDEM Mirror v10 - Vercel Deployment Instructions

## Prerequisites

1. Vercel account
2. GitHub account with access to the repository
3. All required API keys and service credentials

## Deployment Steps

### 1. Create Vercel Project

1. Go to <https://vercel.com/dashboard>
2. Click "New Project"
3. Import Git Repository "Sasha777sh/edem-mirror-v10"
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### 2. Environment Variables Setup

Add the following environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Database Configuration

- `DATABASE_URL` - PostgreSQL connection string

#### Supabase Configuration

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

#### AI Integration

- `OPENAI_API_KEY` - Your OpenAI API key

#### Caching & Rate Limiting

- `UPSTASH_REDIS_REST_URL` - Your Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Your Upstash Redis REST token

#### Payments - Crypto (NOWPayments)

- `NOWPAYMENTS_API_KEY` - Your NOWPayments API key
- `NOWPAYMENTS_IPN_SECRET` - Your NOWPayments IPN secret

#### Payments - YooKassa (Russia)

- `YOOKASSA_SHOP_ID` - Your YooKassa shop ID
- `YOOKASSA_SECRET_KEY` - Your YooKassa secret key

#### Telegram Bot

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your Telegram bot username

#### Application Configuration

- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL
- `NEXTAUTH_SECRET` - Random string for NextAuth

#### Analytics & Tracking

- `NEXT_PUBLIC_POSTHOG_KEY` - Your PostHog key
- `NEXT_PUBLIC_POSTHOG_HOST` - Your PostHog host

#### Security

- `CRON_SECRET` - Random string for cron job authentication

### 3. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Verify the deployment is successful

### 4. Post-Deployment Setup

1. Configure custom domain (if needed)
2. Test all API endpoints
3. Verify all three communication modes work (Mirror, Shadow, Resonator)
4. Test payment integrations
5. Verify Telegram authentication

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all environment variables are properly set
2. **Database Connection**: Verify DATABASE_URL is correct and database is accessible
3. **API Key Issues**: Ensure all API keys are valid and have proper permissions

### Environment Variable Placeholders

If you see errors about placeholder variables like `${{ VAR_NAME }}`, make sure to replace them with actual values in the Vercel Dashboard.

## Required Services Setup

### Supabase

1. Create a new Supabase project
2. Enable pgvector extension for RAG system
3. Set up authentication providers
4. Configure database schema

### OpenAI

1. Create an OpenAI account
2. Generate an API key
3. Ensure sufficient quota for usage

### Upstash Redis

1. Create an Upstash Redis database
2. Get REST URL and token

### NOWPayments

1. Create a NOWPayments account
2. Get API key and IPN secret
3. Configure webhook URL

### YooKassa

1. Create a YooKassa account
2. Get shop ID and secret key

### Telegram Bot

1. Create a Telegram bot via BotFather
2. Get bot token
3. Configure webhook URL

## Testing Checklist

- [ ] Main application loads
- [ ] Chat functionality works
- [ ] All three modes accessible (Mirror, Shadow, Resonator)
- [ ] Wave Encoder analyzes messages
- [ ] Resonance Feedback system calculates scores
- [ ] Breathing Visualization UI displays correctly
- [ ] Database connections work
- [ ] Authentication functions
- [ ] Payment systems process transactions
- [ ] Telegram integration works
