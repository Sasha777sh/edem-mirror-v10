# RAG Cards Implementation Summary

## Overview

This document summarizes the implementation of the RAG (Retrieval-Augmented Generation) cards system for the EDEM Mirror platform. The implementation includes 20 psychological pattern cards covering various themes, each with three stages (Shadow, Truth, Integration).

## Implementation Details

### Card Creation

We have created 20 RAG cards covering these psychological themes:

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

### Card Structure

Each card follows a consistent structure:

- **Title**: Descriptive name of the psychological pattern
- **Stages**: All cards include Shadow, Truth, and Integration stages
- **Symptoms**: Relevant psychological symptoms
- **Archetypes**: Jungian archetypes associated with the pattern
- **Modalities**: Therapeutic modalities (body, breath, cognitive)
- **Language**: Russian (ru)
- **Text**: Stage-specific content with practical integration steps

### Implementation Files

1. **`/scripts/seed_rag.json`** - JSON file containing all 20 RAG cards
2. **`/scripts/import-rag-cards.sql`** - SQL script for direct database import
3. **`/scripts/import-rag-json.ts`** - TypeScript script for JSON import
4. **`/scripts/generate-embeddings.ts`** - TypeScript script for generating vector embeddings
5. **`/scripts/embed_rag_chunks.ts`** - TypeScript script for embedding RAG chunks using OpenAI API
6. **`/scripts/test-rag-search.ts`** - TypeScript script for testing RAG search functionality
7. **`/scripts/validate-rag-json.ts`** - Validation script for JSON format
8. **`/src/app/api/rag/search/route.ts`** - API endpoint for RAG search
9. **`/src/app/api/chat/rag/route.ts`** - API endpoint for RAG chat

### Validation

The JSON file has been validated and confirmed to:

- Be syntactically correct
- Contain all required fields for each card
- Have consistent structure across all cards
- Cover a diverse range of psychological themes

### Import Methods

Five methods are provided for importing and processing the cards:

1. **Direct SQL Import**:

   ```bash
   psql $DATABASE_URL -f scripts/import-rag-cards.sql
   ```

2. **JSON Import Script**:

   ```bash
   npm run import-rag-json
   ```

3. **Embedding Generation**:

   ```bash
   npm run generate-embeddings
   ```

4. **RAG Chunk Embedding**:

   ```bash
   npm run embed-rag-chunks
   ```

5. **RAG Search Testing**:

   ```bash
   npm run test-rag-search
   ```

### Usage

The RAG cards are designed to be used with the EDEM Mirror system's three-stage dialogue flow:

- **Shadow Stage**: Recognition and acknowledgment of patterns
- **Truth Stage**: Deeper understanding of underlying needs
- **Integration Stage**: Practical steps for embodiment and change

## Sample Card

```json
{
  "title": "Тревога перед сном",
  "stage": ["shadow","truth","integration"],
  "symptom": ["anxiety","sleep"],
  "archetype": ["victim"],
  "modality": ["body","breath"],
  "lang": "ru",
  "text": "Shadow: Твоё тело хочет спать, но ум гонит тебя в будущее. Цена: усталость и раздражительность. Truth: Ты хочешь безопасности, но ищешь её в контроле мыслей. Integration: 2 минуты дыхания 4-6, внимание в стопы."
}
```

## Next Steps

1. Import the cards into the database using either method
2. Test RAG search functionality with the new cards
3. Expand the corpus with additional cards as needed
4. Monitor usage and effectiveness of different card types

The implementation is complete and ready for integration with the EDEM Mirror system.
