# RAG Embeddings Documentation

## Overview

This document describes how to set up and use vector embeddings for the RAG (Retrieval-Augmented Generation) system in EDEM. The embeddings enable semantic search functionality to find relevant psychological patterns based on user input.

## Setup Process

### 1. Database Preparation

Run the database setup script to create the necessary table structure and indexes:

```bash
npm run db:setup-rag-embeddings
```

This script:

- Enables the pgvector extension
- Adds the embedding column to the rag_chunks table
- Creates indexes for fast similarity search

### 2. Environment Configuration

Create a `.env` file in the scripts directory with your API keys:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJI...  # сервисный ключ (не публиковать на клиенте!)
EMBED_MODEL=text-embedding-3-large
BATCH_SIZE=64
```

### 3. Generate Embeddings

Run the embedding generation script to populate the embedding column:

```bash
npm run embed-rag-chunks
```

This script:

- Fetches all RAG chunks without embeddings
- Generates vector embeddings using OpenAI API
- Updates each chunk with its corresponding embedding

## API Endpoints

### RAG Search Endpoint

`POST /api/rag/search`

Search for relevant RAG chunks based on a query:

```json
{
  "query": "I'm having trouble sleeping and feeling anxious",
  "limit": 5,
  "filters": {
    "lang": "ru",
    "stage": ["shadow", "truth"],
    "symptom": ["anxiety", "sleep"]
  }
}
```

### RAG Chat Endpoint

`POST /api/chat/rag`

Chat with the AI assistant using RAG context:

```json
{
  "message": "I'm having trouble sleeping and feeling anxious",
  "sessionId": "session-uuid",
  "stage": "shadow",
  "symptom": ["anxiety", "sleep"],
  "lang": "ru"
}
```

## Testing

### Test RAG Search

Run the test script to verify the search functionality:

```bash
npm run test-rag-search
```

## Integration with Chat System

To integrate RAG with the chat system:

1. Before calling the LLM:
   - Generate embedding for the user's query
   - Retrieve 3-6 relevant chunks from rag_chunks using filters (stage + symptom + lang)
   - Insert them into the CONTEXT of the prompt

2. After the LLM response:
   - Save the stage transition in session_state
   - If stage==='integration', insert the task into practices

## Best Practices

1. Insert RAG cards first, then run the embedding script, and only then create the IVFFLAT index
2. Start with text-embedding-3-small (cheaper) and change vector size to 1536 if needed
3. Log chunk IDs during updates to see progress
4. Add pauses between batches if processing many chunks (rate limiting)
