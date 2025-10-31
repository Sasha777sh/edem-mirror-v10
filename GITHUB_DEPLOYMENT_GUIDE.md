# GitHub and Vercel Deployment Guide for EDEM

This guide will help you deploy your EDEM application to GitHub and Vercel.

## Prerequisites

1. GitHub account
2. Vercel account
3. Git installed
4. GitHub CLI installed (`brew install gh`)
5. Vercel CLI installed (`npm install -g vercel`)

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "edem-psychological-assistant")
3. Don't initialize with a README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/edem-psychological-assistant.git`)

## Step 2: Connect Local Repository to GitHub

Run these commands in your terminal:

```bash
cd /Users/sanecek/qoder
git remote add origin https://github.com/yourusername/edem-psychological-assistant.git
git branch -M main
git push -u origin main
```

If you have two-factor authentication enabled, you'll need to use a personal access token instead of your password.

## Step 3: Deploy to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. Authenticate with Vercel:
   ```bash
   vercel login
   ```

2. Deploy the project:
   ```bash
   vercel --prod
   ```

### Option 2: Connect GitHub Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework: Next.js
   - Root Directory: Leave empty
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables (see next section)
6. Deploy

## Step 4: Configure Environment Variables

In Vercel, you need to add the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key
- `POSTHOG_API_KEY` - Your PostHog API key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key

## Step 5: Run Database Migrations

After deployment, you need to run database migrations:

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Link your local project to the Vercel project:
   ```bash
   vercel link
   ```

3. Run the migrations using Vercel's serverless functions:
   ```bash
   vercel dev
   ```

Or run them manually by accessing your deployed API endpoints.

## Step 6: Import Initial Data

After setting up the database, import the initial RAG data:

1. Generate embeddings:
   ```bash
   npm run generate-embeddings
   ```

2. Import corpus data:
   ```bash
   npm run import-corpus
   ```

## Automated Deployment Script

You can use the provided deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This script will:
1. Install dependencies
2. Build the application
3. Run tests
4. Deploy to Vercel

## Post-Deployment Checklist

- [ ] Verify the application is running at your Vercel URL
- [ ] Test the main features (chat, authentication, payments)
- [ ] Check that database migrations ran successfully
- [ ] Verify environment variables are correctly set
- [ ] Test the RAG functionality
- [ ] Confirm analytics are working
- [ ] Test social authentication (Google, Apple, Telegram)

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all environment variables are set correctly in Vercel
2. **Database Connection**: Verify Supabase credentials
3. **Authentication Issues**: Check OAuth configurations for Google, Apple, and Telegram
4. **Payment Processing**: Verify Stripe keys are correct

### Getting Help

If you encounter issues:
1. Check the Vercel deployment logs
2. Review the GitHub Actions workflow (if set up)
3. Verify all environment variables
4. Check the README.md for additional setup instructions

## Next Steps

After successful deployment:
1. Set up monitoring and error tracking
2. Configure custom domain
3. Set up SSL certificates
4. Configure CDN for better performance
5. Set up backup strategies
6. Monitor usage and performance metrics