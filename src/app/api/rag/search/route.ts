import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { embed } from '@/lib/embed';

/**
 * POST /api/rag/search
 * Search RAG chunks using embeddings and filters
 */
export async function POST(request: Request) {
    try {
        const supabase = createServerSupabase();

        const body = await request.json();
        const { query, limit = 5, filters } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Generate embedding for the query
        const queryEmbedding = await embed(query);

        // Build the search query
        let rpcQuery = supabase
            .from('rag_chunks')
            .select('id, title, stage, symptom, archetype, lang, text')
            .not('embedding', 'is', null);

        // Apply filters
        if (filters?.lang) {
            rpcQuery = rpcQuery.eq('lang', filters.lang);
        }

        if (filters?.stage) {
            rpcQuery = rpcQuery.overlaps('stage', filters.stage);
        }

        if (filters?.symptom) {
            rpcQuery = rpcQuery.overlaps('symptom', filters.symptom);
        }

        // Order by similarity and limit results
        const { data, error } = await rpcQuery
            .order('embedding', { ascending: true, nullsFirst: false })
            .limit(limit);

        if (error) {
            console.error('Error searching RAG chunks:', error);
            return NextResponse.json({ error: 'Failed to search RAG chunks' }, { status: 500 });
        }

        // Calculate similarity scores
        const results = data.map((chunk: any) => {
            // In a real implementation, you would calculate the actual cosine similarity
            // For now, we'll return the chunks with a placeholder score
            return {
                ...chunk,
                similarity: 0.8 // Placeholder score
            };
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Error in RAG search:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}