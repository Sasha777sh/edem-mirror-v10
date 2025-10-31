# Embedding Generation Documentation

## Overview

This document describes how to generate vector embeddings for RAG (Retrieval-Augmented Generation) chunks using the OpenAI API. The embeddings are used to enable semantic search functionality in the EDEM Mirror system.

## How It Works

The embedding generation process:

1. Fetches all RAG chunks from the database that don't have embeddings yet
2. Combines the title and text content of each chunk
3. Sends the combined text to the OpenAI embeddings API
4. Updates each chunk with its corresponding vector embedding

## Script Location

`/scripts/generate-embeddings.ts`

## Usage

```bash
npm run generate-embeddings
```

## Prerequisites

Before running the script, ensure you have:

1. A Supabase database with the `rag_chunks` table
2. RAG chunks imported into the database
3. An OpenAI API key

## Environment Variables

The script requires these environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

## Technical Details

### Model Used

The script uses the `text-embedding-ada-002` model which generates 1536-dimensional vectors.

### Text Processing

For each RAG chunk:

- If the text field is a JSON object, it combines the title with all stage texts (shadow, truth, integration)
- If the text field is a string, it combines the title with the text

### Batch Processing

To avoid rate limits, the script processes chunks in batches of 5 with a 1-second delay between batches.

### Error Handling

The script includes error handling for:

- Missing environment variables
- API errors from OpenAI
- Database update errors
- Individual chunk processing errors

## Verification

After running the script, you can verify the embeddings were generated with this SQL query:

```sql
SELECT COUNT(*) as chunks_with_embeddings 
FROM rag_chunks 
WHERE embedding IS NOT NULL;
```

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `OPENAI_API_KEY` is set in your environment
2. **Database Connection**: Verify Supabase credentials are correct
3. **Rate Limits**: If you hit rate limits, reduce the batch size or increase delays

### Checking Progress

You can monitor the progress with this query:

```sql
SELECT 
  (SELECT COUNT(*) FROM rag_chunks WHERE embedding IS NOT NULL) as processed,
  (SELECT COUNT(*) FROM rag_chunks) as total,
  ROUND(
    (SELECT COUNT(*) FROM rag_chunks WHERE embedding IS NOT NULL) * 100.0 / 
    (SELECT COUNT(*) FROM rag_chunks), 2
  ) as percentage;
```
