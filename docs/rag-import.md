# RAG Cards Import Documentation

## Overview

This document describes how to import the RAG (Retrieval-Augmented Generation) cards into the EDEM system. There are two methods available for importing the cards:

1. Direct SQL import using `import-rag-cards.sql`
2. JSON import using `import-rag-json.ts` script
3. Embedding generation using `generate-embeddings.ts` script

## Method 1: SQL Import

### File Location

`/scripts/import-rag-cards.sql`

### Usage

```bash
# Run the SQL script directly against your Supabase database
psql $DATABASE_URL -f scripts/import-rag-cards.sql
```

### What it does

- Creates the `rag_chunks` table if it doesn't exist
- Inserts 10 RAG cards into the `rag_chunks` table
- Each card contains Shadow, Truth, and Integration stages in JSONB format
- Cards cover various psychological themes (anxiety, relationships, self-worth, etc.)
- All cards are in Russian language (lang: 'ru')
- Embeddings are initially set to NULL and can be generated later

## Method 2: JSON Import Script

### File Location

`/scripts/import-rag-json.ts`

### Usage

```bash
# Run the import script
npm run import-rag-json
```

### What it does

- Reads RAG cards from `/scripts/seed_rag.json`
- Connects to Supabase using environment variables
- Clears existing data (optional)
- Inserts cards in batches to avoid timeouts
- Verifies the import by counting records

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

## Method 3: Embedding Generation Script

### File Location

`/scripts/generate-embeddings.ts`

### Usage

```bash
# Run the embedding generation script
npm run generate-embeddings
```

### What it does

- Generates vector embeddings for RAG chunks using OpenAI API
- Updates the `embedding` field in the `rag_chunks` table
- Processes chunks in batches to avoid rate limits
- Uses `text-embedding-ada-002` model (1536 dimensions)

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key

### How it works

1. Fetches all RAG chunks that don't have embeddings yet
2. Combines title and text content for embedding generation
3. Calls OpenAI embeddings API to generate vector representations
4. Updates each chunk with its corresponding embedding
5. Provides progress feedback during processing

## RAG Card Structure

Each RAG card contains the following fields:

- `title`: The title of the card
- `stage`: Array of stages (shadow, truth, integration)
- `symptom`: Array of relevant symptoms
- `archetype`: Array of psychological archetypes
- `modality`: Array of therapeutic modalities
- `lang`: Language code ('ru' for Russian)
- `text`: The content of the card with stage-specific information

## Card Themes

The 20 cards cover these psychological themes:

1. Anxiety and sleep issues
2. Relationship dynamics and jealousy
3. Self-esteem and self-worth
4. Anger and aggression
5. Perfectionism
6. Procrastination
7. Fear of abandonment
8. Guilt and shame
9. Social anxiety
10. Need for approval
11. Family relationships and parental issues
12. Low energy and burnout
13. Control issues in relationships
14. Self-criticism
15. Fear of the future
16. Loneliness
17. Envy and comparison
18. Financial anxiety
19. Perceived injustice
20. Fear of death and existential concerns

## Verification

After importing, you can verify the data with this SQL query:

```sql
SELECT COUNT(*) as total_cards FROM rag_chunks;
SELECT title, symptom FROM rag_chunks ORDER BY id LIMIT 5;
```

Or using the Supabase dashboard to browse the `rag_chunks` table.
