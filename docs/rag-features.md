# EDEM RAG Features Documentation

## Overview

This document describes the new RAG (Retrieval Augmented Generation) features implemented for the EDEM psychological self-help platform.

## New Features

### 1. Enhanced Validation Script

The `validate-rag-json.ts` script now includes comprehensive validation:

- Checks for empty fields
- Detects duplicate symptoms
- Validates stage order (shadow → truth → integration)
- Ensures integration stage is not present without truth stage

### 2. Improved Embeddings Generation

The `generate-embeddings.ts` script now includes:

- Retry logic for rate limits and timeouts
- Progress checkpointing to resume interrupted processes
- Better error handling and reporting

### 3. RAG API Endpoint

A new API endpoint `/api/mirror_rag` provides RAG-based responses:

- Accepts user query, stage, symptom, and language
- Generates embeddings for the query
- Searches RAG chunks using cosine similarity
- Returns the most relevant response with context

### 4. RAG Generator GPT Script

The `rag_generator_gpt.ts` script allows generating new RAG cards using GPT:

- Takes a simple prompt (e.g., "panic attack after betrayal")
- Generates a complete RAG card with shadow/truth/integration stages
- Outputs structured JSON for easy import

### 5. RAG Push Cron Job

The `cron-rag-push.ts` script is designed for daily RAG card distribution:

- Selects random RAG cards
- Can be integrated with Telegram or other messaging platforms
- Designed to run as a cron job for daily distribution

## Usage

### Validating RAG JSON

```bash
npm run validate-rag-json
```

### Generating Embeddings

```bash
npm run generate-embeddings
```

### Testing RAG Search

```bash
npm run test-rag-search
```

### Generating RAG Cards with GPT

```bash
npm run rag-generator -- "your prompt here"
```

Example:

```bash
npm run rag-generator -- "panic attack after betrayal"
```

### Running RAG Push Cron Job

```bash
npm run cron-rag-push
```

## API Endpoints

### POST /api/mirror_rag

Get a RAG-based response for a user query.

**Request Body:**

```json
{
  "query": "string (required)",
  "stage": "shadow|truth|integration (optional)",
  "symptom": "string (optional)",
  "lang": "ru|en (optional, default: ru)"
}
```

**Response:**

```json
{
  "response": "string",
  "stage": "shadow|truth|integration",
  "context": {
    "title": "string",
    "similarity": "number",
    "id": "string"
  }
}
```

## Frontend Components

### RAG Test Page

A test page at `/rag-test` allows manual testing of the RAG API endpoint.

### Demo Chat Section

A component at `/components/DemoChatSection.tsx` provides a demonstration of the EDEM chat functionality with mock data, showing all three stages (Shadow, Truth, Integration). It includes:

- Mock conversation showing all three stages
- Modal registration form with social login options (Google, Apple, Telegram)
- Email/password registration form
- Close button and "Already have an account? Sign in" link

### Telegram Login Button

A component at `/components/TelegramLoginButton.tsx` that implements Telegram Login Widget integration:

- Uses Telegram's official login widget
- Verifies authentication with server-side signature validation
- Creates/updates users in Supabase with virtual email addresses
- Generates magic links for seamless authentication

### ChatEdemWidget

A full-featured chat widget at `/components/ChatEdemWidget.tsx` that can work in both demo mode and with the real API. It includes:

- Symptom filtering (anxiety, sleep, breakup, anger, jealousy)
- Language switching (RU/EN)
- Stage visualization (Shadow, Truth, Integration)
- Responsive design with Tailwind CSS

## API Endpoints

### POST /api/auth/telegram/verify

Verifies Telegram authentication and creates/updates user in Supabase.

**Request Body:**

```json
{
  "id": "Telegram user ID",
  "first_name": "User's first name",
  "username": "Telegram username (optional)",
  "auth_date": "Authentication timestamp",
  "hash": "Telegram signature hash"
}
```

**Response:**

```json
{
  "ok": true,
  "action_link": "Supabase magic link for session creation"
}
```

## Test Pages

- `/test-demo-chat` - Test page for the demo chat section
- `/test-demo-chat-social` - Test page for the demo chat with social login
- `/test-demo-chat-modal` - Test page for the demo chat with modal registration (legacy)
- `/test-full-chat` - Test page for the full ChatEdemWidget
- `/rag-test` - Test page for RAG functionality

## Environment Variables

The following environment variables are required for authentication features:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Future Enhancements

1. Integration with Telegram bot for automatic RAG card distribution
2. Web interface for editing RAG cards
3. Monetization features for premium RAG content
4. Audio generation for RAG cards using SUNO or similar services
