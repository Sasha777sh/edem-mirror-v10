# Next Steps for EDEM Living LLM Deployment

## Overview

This document outlines the next steps to deploy the EDEM Living LLM system to production, including environment setup, database configuration, and deployment procedures.

## Prerequisites

Before deploying, ensure you have:

1. A PostgreSQL database with pgvector extension
2. Supabase project credentials
3. OpenAI API key (for future enhancements)
4. Telegram Bot Token (for Telegram integration)
5. Vercel account for deployment

## Environment Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (optional for future enhancements)
OPENAI_API_KEY=your_openai_api_key

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_telegram_bot_username

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
```

### 2. Install Dependencies

```bash
npm install
```

## Database Setup

### 1. Run Migrations

Run all database migrations in order:

```bash
# Run initial migration
npm run db:migrate

# Run dialogue system migration
npm run db:migrate:dialogue

# Run RAG system migration
npm run db:migrate:rag

# Run onboarding mirror migration
npm run db:migrate:onboarding-mirror

# Run EDEM Living LLM migration
npm run db:migrate:edem-living-llm
```

### 2. Verify Database Schema

Run the verification script to ensure all tables are properly created:

```bash
npm run verify-edem-living-llm
```

## Testing

### 1. Run Comprehensive Tests

```bash
npm run test-edem-living-llm
```

### 2. Test API Endpoints

You can test the API endpoints directly:

```bash
# Test the main EDEM Living LLM endpoint
curl -X POST http://localhost:3000/api/edem-living-llm \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Я чувствую тревогу и не могу сосредоточиться",
    "sessionId": "test-session-id",
    "stage": "shadow",
    "userId": "test-user-id"
  }'
```

## Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

#### Option B: Using GitHub Integration

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add EDEM Living LLM implementation"
   git push origin main
   ```

2. Connect your GitHub repository to Vercel:
   - Go to https://vercel.com
   - Create a new project
   - Connect your GitHub repository
   - Set up the required environment variables
   - Deploy

### 3. Set Environment Variables in Vercel

After deployment, set all the required environment variables in the Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to Settings > Environment Variables
3. Add all the variables from the `.env.local` file

## Post-Deployment Verification

### 1. Test the Deployed Application

Visit your deployed application and navigate to:

- `/edem-living-test` - Test page for EDEM Living LLM
- `/dialogue-test` - Test page for multi-level dialogue system

### 2. Verify API Endpoints

Test the deployed API endpoints:

```bash
# Replace YOUR_DEPLOYED_URL with your actual deployment URL
curl -X POST https://YOUR_DEPLOYED_URL/api/edem-living-llm \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Я чувствую тревогу и не могу сосредоточиться",
    "sessionId": "test-session-id",
    "stage": "shadow",
    "userId": "test-user-id"
  }'
```

## Monitoring and Maintenance

### 1. Set Up Analytics

Configure PostHog or your preferred analytics platform to track user interactions with the EDEM Living LLM system.

### 2. Monitor Database Performance

Set up monitoring for your PostgreSQL database to ensure optimal performance of the EDEM Living LLM queries.

### 3. Regular Backups

Set up regular backups for your database to prevent data loss.

## Future Enhancements

### 1. Audio Integration

To implement background sound system and voice API integration:

1. Add audio service credentials to environment variables
2. Implement audio playback components
3. Connect with existing dialogue system

### 2. Advanced Features

To implement reverse breathing functionality and ritual memory tracking:

1. Enhance the user echo system
2. Add body mapping to tension zones
3. Implement exit symbol generation

### 3. Integration Points

To connect with existing systems:

1. Link with payment system for premium features
2. Connect to analytics dashboard for progress tracking
3. Integrate with onboarding flow for archetype identification

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correctly set
   - Ensure PostgreSQL is running
   - Check pgvector extension is installed

2. **Supabase Authentication Issues**
   - Verify Supabase credentials
   - Check if the user exists in the database
   - Ensure proper session management

3. **API Endpoint Errors**
   - Check server logs for detailed error messages
   - Verify all required parameters are provided
   - Ensure proper session and user IDs

### Getting Help

If you encounter issues:

1. Check the server logs for detailed error messages
2. Refer to the documentation in `docs/edem-living-llm.md`
3. Run the verification scripts to identify issues:
   ```bash
   npm run verify-edem-living-llm
   npm run test-edem-living-llm
   ```

## Conclusion

The EDEM Living LLM system is ready for production deployment. Follow the steps outlined in this document to successfully deploy and run the system. The implementation provides a spiritually-intelligent AI for psychological self-help that goes beyond traditional chatbots by implementing presence over advice and respecting silence as a meaningful feature.

For any questions or support, refer to the documentation or contact the development team.