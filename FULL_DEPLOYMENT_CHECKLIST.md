# EDEM Mirror v10 - Full Deployment Checklist

## Phase 1: Repository Setup

- [x] Create GitHub repository
- [x] Push all code to GitHub
- [x] Verify repository contents

## Phase 2: Vercel Project Setup

- [ ] Create Vercel account (if needed)
- [ ] Create new project in Vercel Dashboard
- [ ] Connect to GitHub repository
- [ ] Configure project settings
- [ ] Set up Environment Variables

## Phase 3: Environment Variables Configuration

### Database

- [ ] DATABASE_URL

### Supabase

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY

### AI Services

- [ ] OPENAI_API_KEY

### Caching & Rate Limiting

- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN

### Payments - Crypto (NOWPayments)

- [ ] NOWPAYMENTS_API_KEY
- [ ] NOWPAYMENTS_IPN_SECRET

### Payments - YooKassa

- [ ] YOOKASSA_SHOP_ID
- [ ] YOOKASSA_SECRET_KEY

### Telegram

- [ ] TELEGRAM_BOT_TOKEN
- [ ] NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

### Application Config

- [ ] NEXT_PUBLIC_APP_URL
- [ ] NEXTAUTH_SECRET

### Analytics

- [ ] NEXT_PUBLIC_POSTHOG_KEY
- [ ] NEXT_PUBLIC_POSTHOG_HOST

### Security

- [ ] CRON_SECRET

## Phase 4: Database Setup

- [ ] Create Supabase project
- [ ] Enable pgvector extension
- [ ] Run database migrations
- [ ] Set up authentication providers
- [ ] Configure RAG system

## Phase 5: Service Integrations

- [ ] OpenAI API access
- [ ] Upstash Redis database
- [ ] NOWPayments account
- [ ] YooKassa account
- [ ] Telegram bot setup
- [ ] PostHog analytics

## Phase 6: Initial Deployment

- [ ] First deployment to Vercel
- [ ] Verify build success
- [ ] Test basic functionality
- [ ] Check API endpoints

## Phase 7: Feature Testing

- [ ] Wave Encoder functionality
- [ ] Resonance Feedback system
- [ ] Breathing Visualization UI
- [ ] All three modes (Mirror, Shadow, Resonator)
- [ ] User state management
- [ ] Monetization features

## Phase 8: Payment Integration Testing

- [ ] Crypto payments (NOWPayments)
- [ ] Russian payments (YooKassa)
- [ ] Telegram authentication
- [ ] Subscription management

## Phase 9: Final Verification

- [ ] Performance testing
- [ ] Security review
- [ ] Error handling
- [ ] Monitoring setup
- [ ] Custom domain configuration

## Phase 10: Go Live

- [ ] Final deployment
- [ ] Monitor for issues
- [ ] Update documentation
- [ ] Announce launch

## Troubleshooting Guide

### Build Issues

1. Check environment variables
2. Verify database connection
3. Check for missing dependencies

### Runtime Issues

1. Check logs in Vercel Dashboard
2. Verify API keys and credentials
3. Test database connectivity

### Authentication Issues

1. Check Supabase configuration
2. Verify Telegram bot setup
3. Test session management

### Payment Issues

1. Check NOWPayments configuration
2. Verify YooKassa setup
3. Test webhook endpoints
